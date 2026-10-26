import crypto from "crypto";
import { OrderStatus, PaymentStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { CartService } from "./cart.service";
import { PaymentService } from "./payment.service";
import { CheckoutInput } from "../validations/cart.validation";

export class OrderService {
  static async checkout(input: CheckoutInput, userId?: string, sessionId?: string) {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      saveAddress,
      paymentMethod,
      idempotencyKey,
    } = input;

    // 1. Idempotency Check
    if (idempotencyKey) {
      const existingOrder = await prisma.order.findUnique({
        where: { idempotencyKey },
        include: { items: true },
      });
      if (existingOrder) {
        return existingOrder;
      }
    }

    // 2. Resolve Cart
    const cart = await CartService.getOrCreateCart(userId, sessionId);
    if (!cart.items || cart.items.length === 0) {
      throw new AppError("Your shopping cart is empty.", 400, "CART_EMPTY");
    }

    // 3. Execute Transaction for Inventory Validation, Order Creation & Payment
    const createdOrder = await prisma.$transaction(async (tx) => {
      let subtotalInCents = 0;
      const orderItemsToCreate: {
        productId: string;
        productName: string;
        productSku: string;
        unitPriceInCents: number;
        quantity: number;
        totalPriceInCents: number;
        productImageUrl: string | null;
      }[] = [];

      // Validate stock & calculate trusted amounts from database
      for (const cartItem of cart.items) {
        const product = await tx.product.findUnique({
          where: { id: cartItem.productId },
          include: { images: { orderBy: { displayOrder: "asc" } } },
        });

        if (!product || !product.isActive) {
          throw new AppError(
            `Product "${cartItem.product.name}" is no longer available.`,
            400,
            "PRODUCT_UNAVAILABLE"
          );
        }

        if (product.stock < cartItem.quantity) {
          throw new AppError(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${cartItem.quantity}.`,
            400,
            "INSUFFICIENT_STOCK"
          );
        }

        // Trusted line total
        const lineTotalInCents = product.priceInCents * cartItem.quantity;
        subtotalInCents += lineTotalInCents;

        // Atomically decrement inventory to prevent overselling
        await tx.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: cartItem.quantity,
            },
          },
        });

        const primaryImage =
          product.images.find((img) => img.isPrimary)?.url ||
          product.images[0]?.url ||
          null;

        orderItemsToCreate.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          unitPriceInCents: product.priceInCents,
          quantity: cartItem.quantity,
          totalPriceInCents: lineTotalInCents,
          productImageUrl: primaryImage,
        });
      }

      // Compute shipping & taxes
      const shippingInCents = subtotalInCents >= 10000 ? 0 : 999;
      const taxInCents = Math.round(subtotalInCents * 0.08);
      const totalInCents = subtotalInCents + shippingInCents + taxInCents;

      // Process Simulated Payment
      const paymentResult = await PaymentService.processPayment({
        amountInCents: totalInCents,
        customerEmail,
        paymentMethod,
        idempotencyKey,
      });

      if (!paymentResult.success) {
        throw new AppError(
          paymentResult.errorMessage || "Payment authorization failed.",
          400,
          "PAYMENT_FAILED"
        );
      }

      // Handle saved shipping address for logged-in user
      let savedAddressId: string | undefined;
      if (userId && saveAddress) {
        const address = await tx.address.create({
          data: {
            userId,
            fullName: shippingAddress.fullName,
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
            phone: shippingAddress.phone || customerPhone,
            isDefault: false,
          },
        });
        savedAddressId = address.id;
      }

      // Generate Order Number: KZ-ORD-YYYYMMDD-XXXX
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
      const orderNumber = `KZ-ORD-${datePart}-${randomSuffix}`;

      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: userId || null,
          customerEmail,
          customerName,
          customerPhone: customerPhone || null,
          shippingAddressId: savedAddressId || null,
          shippingAddressSnapshot: shippingAddress,
          subtotalInCents,
          shippingInCents,
          taxInCents,
          totalInCents,
          status: OrderStatus.PROCESSING,
          paymentStatus: PaymentStatus.COMPLETED,
          paymentReference: paymentResult.paymentReference,
          paymentProvider: paymentResult.provider,
          idempotencyKey: idempotencyKey || null,
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: true,
        },
      });

      // Clear Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    return createdOrder;
  }

  static async getCustomerOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });
  }

  static async getOrderByNumber(orderNumber: string, userId?: string, role?: Role) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
    }

    // Ownership Enforcement
    if (order.userId && order.userId !== userId && role !== Role.ADMIN) {
      throw new AppError(
        "You do not have permission to view this order.",
        403,
        "FORBIDDEN_ORDER_ACCESS"
      );
    }

    return order;
  }
}

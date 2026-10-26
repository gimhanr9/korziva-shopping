import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export class CartService {
  static async getOrCreateCart(userId?: string, sessionId?: string) {
    if (userId) {
      // Find existing user cart
      let userCart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { orderBy: { displayOrder: "asc" } }, category: true },
              },
            },
          },
        },
      });

      if (!userCart) {
        userCart = await prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                product: {
                  include: { images: { orderBy: { displayOrder: "asc" } }, category: true },
                },
              },
            },
          },
        });
      }

      // If guest session has a cart, merge it into the user's cart
      if (sessionId) {
        const guestCart = await prisma.cart.findUnique({
          where: { sessionId },
          include: { items: true },
        });

        if (guestCart && guestCart.items.length > 0) {
          for (const guestItem of guestCart.items) {
            const existingUserItem = userCart.items.find(
              (item) => item.productId === guestItem.productId
            );

            if (existingUserItem) {
              await prisma.cartItem.update({
                where: { id: existingUserItem.id },
                data: { quantity: existingUserItem.quantity + guestItem.quantity },
              });
            } else {
              await prisma.cartItem.create({
                data: {
                  cartId: userCart.id,
                  productId: guestItem.productId,
                  quantity: guestItem.quantity,
                },
              });
            }
          }

          // Delete merged guest cart
          await prisma.cart.delete({ where: { id: guestCart.id } });

          // Re-fetch updated user cart
          userCart = await prisma.cart.findUnique({
            where: { id: userCart.id },
            include: {
              items: {
                include: {
                  product: {
                    include: { images: { orderBy: { displayOrder: "asc" } }, category: true },
                  },
                },
              },
            },
          });
        }
      }

      return userCart!;
    }

    if (sessionId) {
      let guestCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: { images: { orderBy: { displayOrder: "asc" } }, category: true },
              },
            },
          },
        },
      });

      if (!guestCart) {
        guestCart = await prisma.cart.create({
          data: { sessionId },
          include: {
            items: {
              include: {
                product: {
                  include: { images: { orderBy: { displayOrder: "asc" } }, category: true },
                },
              },
            },
          },
        });
      }

      return guestCart;
    }

    throw new AppError("No session or user identifier provided", 400);
  }

  static async getCartDetails(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    let subtotalInCents = 0;
    let itemCount = 0;

    const formattedItems = cart.items.map((item) => {
      const lineTotalInCents = item.product.priceInCents * item.quantity;
      subtotalInCents += lineTotalInCents;
      itemCount += item.quantity;

      const primaryImage =
        item.product.images.find((img) => img.isPrimary)?.url ||
        item.product.images[0]?.url ||
        "";

      return {
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku,
        unitPriceInCents: item.product.priceInCents,
        quantity: item.quantity,
        lineTotalInCents,
        stockAvailable: item.product.stock,
        isOutOfStock: item.product.stock < item.quantity,
        imageUrl: primaryImage,
        categoryName: item.product.category?.name,
      };
    });

    // Shipping calculation: Free over $100 (10000 cents), else $9.99 (999 cents)
    const shippingInCents = subtotalInCents >= 10000 || subtotalInCents === 0 ? 0 : 999;
    // Estimated tax: 8%
    const taxInCents = Math.round(subtotalInCents * 0.08);
    const totalInCents = subtotalInCents + shippingInCents + taxInCents;

    return {
      cartId: cart.id,
      items: formattedItems,
      itemCount,
      subtotalInCents,
      shippingInCents,
      taxInCents,
      totalInCents,
    };
  }

  static async addItem(
    productId: string,
    quantity = 1,
    userId?: string,
    sessionId?: string
  ) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      throw new AppError("Product is currently unavailable", 404, "PRODUCT_NOT_FOUND");
    }

    if (product.stock < quantity) {
      throw new AppError(
        `Only ${product.stock} units are currently in stock.`,
        400,
        "INSUFFICIENT_STOCK"
      );
    }

    const cart = await this.getOrCreateCart(userId, sessionId);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new AppError(
          `Cannot add ${quantity} more. Maximum available stock is ${product.stock}.`,
          400,
          "STOCK_LIMIT_REACHED"
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return this.getCartDetails(userId, sessionId);
  }

  static async updateItemQuantity(
    itemId: string,
    quantity: number,
    userId?: string,
    sessionId?: string
  ) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const item = await prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!item) {
      throw new AppError("Cart item not found", 404, "ITEM_NOT_FOUND");
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      if (quantity > item.product.stock) {
        throw new AppError(
          `Only ${item.product.stock} units are currently in stock.`,
          400,
          "INSUFFICIENT_STOCK"
        );
      }

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    return this.getCartDetails(userId, sessionId);
  }

  static async removeItem(itemId: string, userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    await prisma.cartItem.deleteMany({
      where: { id: itemId, cartId: cart.id },
    });

    return this.getCartDetails(userId, sessionId);
  }

  static async clearCart(userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCartDetails(userId, sessionId);
  }
}

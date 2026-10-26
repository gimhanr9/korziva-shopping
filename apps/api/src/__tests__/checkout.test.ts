import { describe, it, expect } from "vitest";
import request from "supertest";
import crypto from "crypto";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";

const app = createApp();

describe("Transactional Checkout & Inventory Management", () => {
  const sessionId = `test_session_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  let testProduct: { id: string; name: string; priceInCents: number; stock: number };
  let initialStock: number;

  it("should reject checkout on an empty cart (400 Bad Request)", async () => {
    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Cookie", [`korziva_cart_session=${sessionId}`])
      .send({
        customerName: "Dineth Tester",
        customerEmail: "dineth.tester@korziva.dev",
        shippingAddress: {
          fullName: "Dineth Tester",
          street: "123 Innovation Way",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "US",
        },
        paymentMethod: "demo_card",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("CART_EMPTY");
  });

  it("should process transactional checkout, create order snapshot, and atomically decrement stock", async () => {
    // 1. Pick a product and record initial stock
    const product = await prisma.product.findFirst({
      where: { stock: { gte: 10 } },
    });
    if (!product) throw new Error("No suitable product found for checkout test");
    testProduct = product;
    initialStock = product.stock;

    // 2. Add 2 units of the product to the test cart
    const addRes = await request(app)
      .post("/api/cart/items")
      .set("Cookie", [`korziva_cart_session=${sessionId}`])
      .send({
        productId: testProduct.id,
        quantity: 2,
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.data.itemCount).toBe(2);

    // 3. Execute checkout
    const checkoutRes = await request(app)
      .post("/api/orders/checkout")
      .set("Cookie", [`korziva_cart_session=${sessionId}`])
      .send({
        customerName: "Dineth Tester",
        customerEmail: "dineth.tester@korziva.dev",
        customerPhone: "+1 (555) 987-6543",
        shippingAddress: {
          fullName: "Dineth Tester",
          street: "123 Innovation Way",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "US",
        },
        paymentMethod: "demo_card",
      });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.success).toBe(true);

    const order = checkoutRes.body.data.order;
    expect(order).toBeDefined();
    expect(order.orderNumber).toMatch(/^KZ-ORD-\d{8}-[A-F0-9]{6}$/);
    expect(order.status).toBe("PROCESSING");
    expect(order.paymentStatus).toBe("COMPLETED");
    expect(order.items.length).toBe(1);
    expect(order.items[0].productName).toBe(testProduct.name);
    expect(order.items[0].quantity).toBe(2);
    expect(order.items[0].unitPriceInCents).toBe(testProduct.priceInCents);

    // 4. Verify in PostgreSQL that product stock decreased by exactly 2
    const updatedProduct = await prisma.product.findUnique({
      where: { id: testProduct.id },
    });
    expect(updatedProduct?.stock).toBe(initialStock - 2);

    // 5. Verify that the session cart was cleared after checkout
    const cartRes = await request(app)
      .get("/api/cart")
      .set("Cookie", [`korziva_cart_session=${sessionId}`]);
    expect(cartRes.body.data.itemCount).toBe(0);
  });
});

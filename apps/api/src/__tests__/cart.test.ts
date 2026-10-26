import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app";
import { prisma } from "../lib/prisma";

const app = createApp();

describe("Cart Management & Session Persistence", () => {
  let sampleProduct: { id: string; priceInCents: number; stock: number };
  let cartSessionId: string;
  let addedItemId: string;

  it("should initialize a guest cart and return session cookie", async () => {
    // Find a valid seeded product
    const product = await prisma.product.findFirst({
      where: { stock: { gt: 5 } },
    });
    if (!product) throw new Error("No available product found in database");
    sampleProduct = product;

    const res = await request(app).get("/api/cart");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.itemCount).toBe(0);

    // Check cookie
    const rawCookies = res.headers["set-cookie"];
    expect(rawCookies).toBeDefined();
    const cookieList = Array.isArray(rawCookies) ? rawCookies : [rawCookies as string];
    const sessionCookie = cookieList.find((c) => c.startsWith("korziva_cart_session="));
    expect(sessionCookie).toBeDefined();

    const match = sessionCookie?.match(/korziva_cart_session=([^;]+)/);
    cartSessionId = match ? match[1] : "";
    expect(cartSessionId.length).toBeGreaterThan(0);
  });

  it("should add an item to the persistent cart", async () => {
    const res = await request(app)
      .post("/api/cart/items")
      .set("Cookie", [`korziva_cart_session=${cartSessionId}`])
      .send({
        productId: sampleProduct.id,
        quantity: 2,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.itemCount).toBe(2);
    expect(res.body.data.subtotalInCents).toBe(sampleProduct.priceInCents * 2);
    expect(res.body.data.items.length).toBe(1);

    addedItemId = res.body.data.items[0].id;
  });

  it("should reject adding quantity that exceeds product stock", async () => {
    const res = await request(app)
      .post("/api/cart/items")
      .set("Cookie", [`korziva_cart_session=${cartSessionId}`])
      .send({
        productId: sampleProduct.id,
        quantity: 99999, // Impossible quantity
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("INSUFFICIENT_STOCK");
  });

  it("should update quantity of an existing cart item", async () => {
    const res = await request(app)
      .patch(`/api/cart/items/${addedItemId}`)
      .set("Cookie", [`korziva_cart_session=${cartSessionId}`])
      .send({ quantity: 3 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.itemCount).toBe(3);
    expect(res.body.data.subtotalInCents).toBe(sampleProduct.priceInCents * 3);
  });

  it("should remove item from cart", async () => {
    const res = await request(app)
      .delete(`/api/cart/items/${addedItemId}`)
      .set("Cookie", [`korziva_cart_session=${cartSessionId}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.itemCount).toBe(0);
  });
});

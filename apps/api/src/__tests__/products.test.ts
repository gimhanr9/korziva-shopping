import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("Product Catalog & Category Endpoints", () => {
  it("should fetch all categories with nested product counts", async () => {
    const res = await request(app).get("/api/categories");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.categories).toBeDefined();
    expect(Array.isArray(res.body.data.categories)).toBe(true);
    expect(res.body.data.categories.length).toBeGreaterThanOrEqual(4);
    expect(res.body.data.categories[0]).toHaveProperty("slug");
    expect(res.body.data.categories[0]).toHaveProperty("_count");
  });

  it("should fetch paginated products with metadata", async () => {
    const res = await request(app)
      .get("/api/products")
      .query({ page: 1, limit: 4 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBeLessThanOrEqual(4);
    expect(res.body.data.meta).toBeDefined();
    expect(res.body.data.meta.page).toBe(1);
    expect(res.body.data.meta.limit).toBe(4);
    expect(res.body.data.meta.total).toBeGreaterThanOrEqual(9);
  });

  it("should filter products by category slug", async () => {
    const res = await request(app)
      .get("/api/products")
      .query({ category: "audio-acoustics" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThan(0);
    for (const p of res.body.data.products) {
      expect(p.category.slug).toBe("audio-acoustics");
    }
  });

  it("should search products by keyword", async () => {
    const res = await request(app)
      .get("/api/products")
      .query({ search: "Headphones" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.products.length).toBeGreaterThan(0);
    expect(res.body.data.products[0].name.toLowerCase()).toContain("headphones");
  });

  it("should fetch a single product by slug with complete details", async () => {
    const res = await request(app).get("/api/products/aerotune-spatial-anc-headphones");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product).toBeDefined();
    expect(res.body.data.product.slug).toBe("aerotune-spatial-anc-headphones");
    expect(res.body.data.product.priceInCents).toBe(24900);
    expect(res.body.data.product.sku).toBe("KZ-AUD-001");
    expect(res.body.data.product.images.length).toBeGreaterThan(0);
    expect(res.body.data.product.category).toBeDefined();
  });

  it("should return 404 for unknown product slug", async () => {
    const res = await request(app).get("/api/products/unknown-phantom-gadget-xyz");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("PRODUCT_NOT_FOUND");
  });
});

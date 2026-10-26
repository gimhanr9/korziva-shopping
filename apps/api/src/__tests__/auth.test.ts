import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("Authentication & Authorization Endpoints", () => {
  const testUser = {
    email: `test_${Date.now()}@korziva.dev`,
    password: "Password123!",
    firstName: "Test",
    lastName: "Runner",
  };

  it("should register a new customer account successfully", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.role).toBe("CUSTOMER");
    expect(res.body.data.accessToken).toBeDefined();
  });

  it("should reject registration with already taken email (409 Conflict)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("should reject registration with invalid password (422 Unprocessable Entity)", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "short@korziva.dev",
        password: "123",
        firstName: "Short",
        lastName: "Pass",
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("should authenticate customer with valid credentials and return access token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "customer@korziva.dev",
        password: "Customer123!",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe("customer@korziva.dev");
    expect(res.body.data.user.role).toBe("CUSTOMER");
  });

  it("should reject login with wrong password (401 Unauthorized)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "customer@korziva.dev",
        password: "WrongPassword!",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should access /api/auth/me with valid Bearer token", async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "customer@korziva.dev",
        password: "Customer123!",
      });

    const token = loginRes.body.data.accessToken;

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe("customer@korziva.dev");
  });

  it("should reject /api/auth/me without Bearer token (401 Unauthorized)", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should enforce RBAC: deny customer access to admin metrics (403 Forbidden)", async () => {
    const customerLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: "customer@korziva.dev",
        password: "Customer123!",
      });

    const customerToken = customerLogin.body.data.accessToken;

    const res = await request(app)
      .get("/api/admin/metrics")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should enforce RBAC: permit administrator access to admin metrics (200 OK)", async () => {
    const adminLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@korziva.dev",
        password: "Admin123!",
      });

    const adminToken = adminLogin.body.data.accessToken;

    const res = await request(app)
      .get("/api/admin/metrics")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalRevenueInCents).toBeGreaterThanOrEqual(0);
    expect(res.body.data.totalOrders).toBeGreaterThanOrEqual(0);
  });
});

import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "../app";

const app = createApp();

describe("GET /api/health", () => {
  it("should return 200 OK with healthy status, service name, and PostgreSQL metrics", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.service).toBe("Korziva API");
    expect(res.body.data.status).toBe("ok");
    expect(res.body.data.database.status).toBe("connected");
    expect(res.body.data.database.provider).toBe("PostgreSQL");
    expect(typeof res.body.data.database.counts.users).toBe("number");
    expect(typeof res.body.data.database.counts.products).toBe("number");
  });
});

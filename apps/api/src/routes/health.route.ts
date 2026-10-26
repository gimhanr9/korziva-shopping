import { Router, Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";

export const healthRouter = Router();

healthRouter.get("/", async (_req: Request, res: Response) => {
  try {
    // Check PostgreSQL connection
    await prisma.$queryRaw`SELECT 1`;
    const [userCount, productCount, categoryCount, orderCount] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.category.count(),
      prisma.order.count(),
    ]);

    const healthData = {
      status: "ok",
      service: "ShopFlow API",
      version: "0.1.0",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database: {
        status: "connected",
        provider: "PostgreSQL",
        counts: {
          users: userCount,
          products: productCount,
          categories: categoryCount,
          orders: orderCount,
        },
      },
    };

    sendSuccess(res, healthData, "ShopFlow API and Database are operating normally");
  } catch (err: unknown) {
    sendError(
      res,
      `Database connection error: ${err instanceof Error ? err.message : "Unknown error"}`,
      503,
      "DATABASE_UNAVAILABLE"
    );
  }
});


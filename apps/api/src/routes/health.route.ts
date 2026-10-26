import { Router, Request, Response } from "express";
import { sendSuccess } from "../utils/response";
import { env } from "../config/env";

export const healthRouter = Router();

healthRouter.get("/", (_req: Request, res: Response) => {
  const healthData = {
    status: "ok",
    service: "ShopFlow API",
    version: "0.1.0",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  };

  sendSuccess(res, healthData, "ShopFlow API is running smoothly");
});

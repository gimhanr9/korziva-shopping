import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/response";
import { env } from "../config/env";

export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: unknown;

  constructor(message: string, statusCode = 500, code?: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.code, err.details);
    return;
  }

  if (err instanceof ZodError) {
    sendError(res, "Validation Error", 422, "VALIDATION_ERROR", err.errors);
    return;
  }

  console.error("Unhandled Error:", err);
  const message = env.NODE_ENV === "production" ? "Internal Server Error" : err.message;
  sendError(
    res,
    message,
    500,
    "INTERNAL_SERVER_ERROR",
    env.NODE_ENV === "development" ? { stack: err.stack } : undefined
  );
}

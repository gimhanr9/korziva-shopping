import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { env } from "../config/env";

declare global {
  namespace Express {
    interface Request {
      cartSessionId?: string;
    }
  }
}

export function cartSessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let sessionId =
    req.cookies?.korziva_cart_session ||
    req.cookies?.shopflow_cart_session ||
    (req.headers["x-cart-session"] as string | undefined);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    res.cookie("korziva_cart_session", sessionId, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  req.cartSessionId = sessionId;
  next();
}

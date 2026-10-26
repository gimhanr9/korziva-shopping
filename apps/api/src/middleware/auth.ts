import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { verifyAccessToken } from "../utils/token";
import { AppError } from "./errorHandler";
import { prisma } from "../lib/prisma";

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;

    // 1. Check Authorization Header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      // 2. Check Cookie
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw new AppError("Authentication required. Please log in.", 401, "UNAUTHORIZED");
    }

    const payload = verifyAccessToken(token);

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new AppError("User account no longer exists", 401, "USER_NOT_FOUND");
    }

    req.user = user;
    next();
  } catch (err: unknown) {
    if (err instanceof AppError) {
      next(err);
      return;
    }
    next(new AppError("Invalid or expired session. Please log in again.", 401, "INVALID_TOKEN"));
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Authentication required", 401, "UNAUTHORIZED"));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new AppError(
          "Access denied. You do not have permissions for this action.",
          403,
          "FORBIDDEN"
        )
      );
      return;
    }

    next();
  };
}

export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true },
      });
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Silently continue without user
  }
  next();
}

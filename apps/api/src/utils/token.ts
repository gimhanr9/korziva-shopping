import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { AuthenticatedUser } from "../types/express";

interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export function generateAccessToken(user: AuthenticatedUser): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: "15m" }
  );
}

export function generateRefreshToken(user: AuthenticatedUser): string {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
}

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/token";
import { AuthenticatedUser } from "../types/express";

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class AuthService {
  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError("An account with this email already exists", 409, "EMAIL_EXISTS");
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        role: Role.CUSTOMER,
        cart: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    // Persist refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return { user, accessToken, refreshToken };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
    }

    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    const userProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
    };

    return { user: userProfile, accessToken, refreshToken };
  }

  static async refreshTokens(rawToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(rawToken);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH_TOKEN");
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: rawToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new AppError("Refresh token has expired or been revoked", 401, "REVOKED_REFRESH_TOKEN");
    }

    // Revoke current refresh token (token rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const authUser: AuthenticatedUser = {
      id: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    };

    const newAccessToken = generateAccessToken(authUser);
    const newRefreshToken = generateRefreshToken(authUser);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: authUser.id,
        expiresAt,
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        firstName: storedToken.user.firstName,
        lastName: storedToken.user.lastName,
        role: storedToken.user.role,
      },
    };
  }

  static async logout(token?: string) {
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { revoked: true },
      });
    }
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: "desc" },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return user;
  }
}

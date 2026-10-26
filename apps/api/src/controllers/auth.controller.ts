import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { sendSuccess } from "../utils/response";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import { env } from "../config/env";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await AuthService.register(validatedData);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, { user, accessToken }, "Registration successful", 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await AuthService.login(email, password);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, { user, accessToken }, "Login successful");
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        res.status(401).json({ success: false, error: { message: "No refresh token provided" } });
        return;
      }

      const result = await AuthService.refreshTokens(token);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendSuccess(res, { user: result.user, accessToken: result.accessToken }, "Tokens refreshed");
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      await AuthService.logout(token);

      res.clearCookie("refreshToken");
      sendSuccess(res, null, "Logged out successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.getCurrentUser(req.user!.id);
      sendSuccess(res, { user }, "User profile retrieved");
    } catch (error) {
      next(error);
    }
  }
}

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth";

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_AUTH_ATTEMPTS",
      message: "Too many authentication attempts. Please try again after 15 minutes.",
    },
  },
});

authRouter.post("/register", authLimiter, AuthController.register);
authRouter.post("/login", authLimiter, AuthController.login);
authRouter.post("/refresh", AuthController.refresh);
authRouter.post("/logout", AuthController.logout);
authRouter.get("/me", authenticate, AuthController.getMe);

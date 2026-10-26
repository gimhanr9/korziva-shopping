import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { optionalAuth } from "../middleware/auth";
import { cartSessionMiddleware } from "../middleware/cartSession";

export const cartRouter = Router();

// Apply cart session resolver and optional auth to all cart routes
cartRouter.use(cartSessionMiddleware);
cartRouter.use(optionalAuth);

cartRouter.get("/", CartController.getCart);
cartRouter.post("/items", CartController.addItem);
cartRouter.patch("/items/:id", CartController.updateQuantity);
cartRouter.delete("/items/:id", CartController.removeItem);
cartRouter.delete("/", CartController.clearCart);

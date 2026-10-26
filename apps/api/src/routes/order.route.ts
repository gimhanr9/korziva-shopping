import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authenticate, optionalAuth } from "../middleware/auth";
import { cartSessionMiddleware } from "../middleware/cartSession";

export const orderRouter = Router();

// Checkout route accepts both guest and authenticated users
orderRouter.post(
  "/checkout",
  cartSessionMiddleware,
  optionalAuth,
  OrderController.checkout
);

// Customer order history requires authentication
orderRouter.get("/my-orders", authenticate, OrderController.getMyOrders);

// Order lookup by orderNumber (with ownership security)
orderRouter.get("/:orderNumber", optionalAuth, OrderController.getOrderByNumber);

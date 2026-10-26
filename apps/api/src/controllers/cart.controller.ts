import { Request, Response, NextFunction } from "express";
import { CartService } from "../services/cart.service";
import { addCartItemSchema, updateCartItemSchema } from "../validations/cart.validation";
import { sendSuccess } from "../utils/response";

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await CartService.getCartDetails(req.user?.id, req.cartSessionId);
      sendSuccess(res, cart, "Cart retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, quantity } = addCartItemSchema.parse(req.body);
      const cart = await CartService.addItem(
        productId,
        quantity,
        req.user?.id,
        req.cartSessionId
      );
      sendSuccess(res, cart, "Item added to cart", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const { quantity } = updateCartItemSchema.parse(req.body);
      const cart = await CartService.updateItemQuantity(
        req.params.id,
        quantity,
        req.user?.id,
        req.cartSessionId
      );
      sendSuccess(res, cart, "Cart item updated");
    } catch (error) {
      next(error);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await CartService.removeItem(
        req.params.id,
        req.user?.id,
        req.cartSessionId
      );
      sendSuccess(res, cart, "Item removed from cart");
    } catch (error) {
      next(error);
    }
  }

  static async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await CartService.clearCart(req.user?.id, req.cartSessionId);
      sendSuccess(res, cart, "Cart cleared successfully");
    } catch (error) {
      next(error);
    }
  }
}

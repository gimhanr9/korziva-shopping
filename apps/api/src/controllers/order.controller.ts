import { Request, Response, NextFunction } from "express";
import { OrderService } from "../services/order.service";
import { checkoutSchema } from "../validations/cart.validation";
import { sendSuccess } from "../utils/response";

export class OrderController {
  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = checkoutSchema.parse(req.body);
      const order = await OrderService.checkout(
        validatedInput,
        req.user?.id,
        req.cartSessionId
      );
      sendSuccess(res, { order }, "Order successfully placed and paid", 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.getCustomerOrders(req.user!.id);
      sendSuccess(res, { orders }, "Customer orders retrieved");
    } catch (error) {
      next(error);
    }
  }

  static async getOrderByNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.getOrderByNumber(
        req.params.orderNumber,
        req.user?.id,
        req.user?.role
      );
      sendSuccess(res, { order }, "Order details retrieved");
    } catch (error) {
      next(error);
    }
  }
}

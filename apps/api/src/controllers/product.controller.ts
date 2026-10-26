import { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { productQuerySchema } from "../validations/product.validation";
import { sendSuccess } from "../utils/response";

export class ProductController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedQuery = productQuerySchema.parse(req.query);
      const result = await ProductService.getProducts(validatedQuery);
      sendSuccess(res, result, "Products retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getFeatured(_req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.getFeaturedProducts();
      sendSuccess(res, { products }, "Featured products retrieved");
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductBySlug(req.params.slug);
      sendSuccess(res, { product }, "Product retrieved successfully");
    } catch (error) {
      next(error);
    }
  }
}

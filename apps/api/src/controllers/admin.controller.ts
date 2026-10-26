import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service";
import {
  createProductSchema,
  updateProductSchema,
  updateStockSchema,
  createCategorySchema,
  updateCategorySchema,
  updateOrderStatusSchema,
} from "../validations/admin.validation";
import { sendSuccess } from "../utils/response";
import { OrderStatus } from "@prisma/client";

export class AdminController {
  // --- Dashboard Metrics ---
  static async getMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await AdminService.getMetrics();
      sendSuccess(res, metrics, "Admin metrics retrieved");
    } catch (error) {
      next(error);
    }
  }

  // --- Products CRUD ---
  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string | undefined;
      const categoryId = req.query.categoryId as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await AdminService.listProducts(search, categoryId, page, limit);
      sendSuccess(res, result, "Admin products retrieved");
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createProductSchema.parse(req.body);
      const product = await AdminService.createProduct(validated);
      sendSuccess(res, { product }, "Product created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateProductSchema.parse(req.body);
      const product = await AdminService.updateProduct(req.params.id, validated);
      sendSuccess(res, { product }, "Product updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { stock } = updateStockSchema.parse(req.body);
      const product = await AdminService.updateStock(req.params.id, stock);
      sendSuccess(res, { product }, "Stock level updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      await AdminService.deleteProduct(req.params.id);
      sendSuccess(res, null, "Product deactivated successfully");
    } catch (error) {
      next(error);
    }
  }

  // --- Categories CRUD ---
  static async listCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await AdminService.listCategories();
      sendSuccess(res, { categories }, "Categories retrieved");
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCategorySchema.parse(req.body);
      const category = await AdminService.createCategory(validated);
      sendSuccess(res, { category }, "Category created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateCategorySchema.parse(req.body);
      const category = await AdminService.updateCategory(req.params.id, validated);
      sendSuccess(res, { category }, "Category updated successfully");
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      await AdminService.deleteCategory(req.params.id);
      sendSuccess(res, null, "Category deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  // --- Orders Management ---
  static async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as OrderStatus | undefined;
      const search = req.query.search as string | undefined;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await AdminService.listOrders(status, search, page, limit);
      sendSuccess(res, result, "Admin orders retrieved");
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = updateOrderStatusSchema.parse(req.body);
      const order = await AdminService.updateOrderStatus(req.params.id, status);
      sendSuccess(res, { order }, "Order status updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";
import { sendSuccess } from "../utils/response";

export class CategoryController {
  static async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryService.getAllCategories();
      sendSuccess(res, { categories }, "Categories retrieved successfully");
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryService.getCategoryBySlug(req.params.slug);
      sendSuccess(res, { category }, "Category details retrieved");
    } catch (error) {
      next(error);
    }
  }
}

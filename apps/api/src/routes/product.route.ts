import { Router } from "express";
import { ProductController } from "../controllers/product.controller";

export const productRouter = Router();

productRouter.get("/", ProductController.list);
productRouter.get("/featured", ProductController.getFeatured);
productRouter.get("/:slug", ProductController.getBySlug);

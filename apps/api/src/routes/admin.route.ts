import { Router } from "express";
import { Role } from "@prisma/client";
import { AdminController } from "../controllers/admin.controller";
import { authenticate, requireRole } from "../middleware/auth";

export const adminRouter = Router();

// Strict security: enforce authentication and ADMIN role on all /api/admin routes
adminRouter.use(authenticate, requireRole(Role.ADMIN));

// Dashboard metrics & date-based sales
adminRouter.get("/metrics", AdminController.getMetrics);

// Product & Inventory CRUD
adminRouter.get("/products", AdminController.listProducts);
adminRouter.post("/products", AdminController.createProduct);
adminRouter.patch("/products/:id", AdminController.updateProduct);
adminRouter.patch("/products/:id/stock", AdminController.updateStock);
adminRouter.delete("/products/:id", AdminController.deleteProduct);

// Category CRUD
adminRouter.get("/categories", AdminController.listCategories);
adminRouter.post("/categories", AdminController.createCategory);
adminRouter.patch("/categories/:id", AdminController.updateCategory);
adminRouter.delete("/categories/:id", AdminController.deleteCategory);

// Orders Management
adminRouter.get("/orders", AdminController.listOrders);
adminRouter.patch("/orders/:id/status", AdminController.updateOrderStatus);

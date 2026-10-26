import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required").max(150),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  priceInCents: z.coerce.number().int().min(1, "Price must be at least 1 cent"),
  compareAtPriceInCents: z.coerce.number().int().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(0),
  sku: z.string().min(2, "SKU is required").max(50),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  categoryId: z.string().min(1, "Category is required"),
  imageUrls: z.array(z.string().url("Must be valid URL")).optional().default([]),
});

export const updateProductSchema = createProductSchema.partial();

export const updateStockSchema = z.object({
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(100),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url("Must be valid URL").optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

import { z } from "zod";

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "featured"]).optional().default("newest"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  featured: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
});

export type ProductQueryParams = z.infer<typeof productQuerySchema>;

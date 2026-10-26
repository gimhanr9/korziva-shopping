import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import { ProductQueryParams } from "../validations/product.validation";

export class ProductService {
  static async getProducts(params: ProductQueryParams) {
    const { search, category, sort, page = 1, limit = 12, featured } = params;

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (search && search.trim() !== "") {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      where.category = {
        slug: category,
      };
    }

    if (featured !== undefined) {
      where.isFeatured = featured;
    }

    // Determine sort ordering
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { priceInCents: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { priceInCents: "desc" };
    } else if (sort === "featured") {
      orderBy = { isFeatured: "desc" };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { displayOrder: "asc" },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (!product || !product.isActive) {
      throw new AppError("Product not found or currently unavailable", 404, "PRODUCT_NOT_FOUND");
    }

    return product;
  }

  static async getFeaturedProducts(limit = 6) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        images: {
          orderBy: { displayOrder: "asc" },
        },
      },
    });
  }
}

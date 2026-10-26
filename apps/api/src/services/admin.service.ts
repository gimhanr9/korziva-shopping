import { OrderStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export class AdminService {
  /**
   * Generates live administrative metrics strictly from PostgreSQL data
   */
  static async getMetrics() {
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
      revenueResult,
      recentOrders,
      allOrdersForSales,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: Role.CUSTOMER } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 20 }, isActive: true } }),
      prisma.order.aggregate({
        _sum: { totalInCents: true },
        where: { status: { not: OrderStatus.CANCELLED } },
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      }),
      prisma.order.findMany({
        where: {
          status: { not: OrderStatus.CANCELLED },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
          },
        },
        select: {
          createdAt: true,
          totalInCents: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Group sales by day for chart / metrics display
    const salesByDayMap = new Map<string, { date: string; revenueInCents: number; orderCount: number }>();

    for (const order of allOrdersForSales) {
      const dayKey = order.createdAt.toISOString().slice(0, 10);
      const existing = salesByDayMap.get(dayKey) || { date: dayKey, revenueInCents: 0, orderCount: 0 };
      existing.revenueInCents += order.totalInCents;
      existing.orderCount += 1;
      salesByDayMap.set(dayKey, existing);
    }

    const salesHistory = Array.from(salesByDayMap.values());

    // Low stock items list
    const lowStockItems = await prisma.product.findMany({
      where: { stock: { lte: 20 }, isActive: true },
      take: 6,
      orderBy: { stock: "asc" },
      include: {
        category: true,
        images: { orderBy: { displayOrder: "asc" }, take: 1 },
      },
    });

    return {
      totalRevenueInCents: revenueResult._sum.totalInCents || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      lowStockCount: lowStockProducts,
      recentOrders,
      salesHistory,
      lowStockItems,
    };
  }

  // --- Product Management ---

  static async listProducts(search?: string, categoryId?: string, page = 1, limit = 20) {
    const where: Prisma.ProductWhereInput = {};

    if (search && search.trim() !== "") {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { sku: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          images: { orderBy: { displayOrder: "asc" } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async createProduct(data: {
    name: string;
    slug: string;
    description: string;
    priceInCents: number;
    compareAtPriceInCents?: number | null;
    stock: number;
    sku: string;
    isFeatured?: boolean;
    isActive?: boolean;
    categoryId: string;
    imageUrls?: string[];
  }) {
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      throw new AppError("A product with this SKU already exists", 409, "SKU_EXISTS");
    }

    const existingSlug = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existingSlug) {
      throw new AppError("A product with this slug already exists", 409, "SLUG_EXISTS");
    }

    const { imageUrls = [], ...productInfo } = data;

    return prisma.product.create({
      data: {
        ...productInfo,
        images: {
          create: imageUrls.map((url, index) => ({
            url,
            isPrimary: index === 0,
            displayOrder: index,
          })),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
  }

  static async updateProduct(id: string, data: Prisma.ProductUpdateInput & { imageUrls?: string[] }) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    const { imageUrls, ...updateFields } = data;

    if (imageUrls && Array.isArray(imageUrls)) {
      // Re-link images
      await prisma.productImage.deleteMany({ where: { productId: id } });
      await prisma.productImage.createMany({
        data: imageUrls.map((url, index) => ({
          productId: id,
          url,
          isPrimary: index === 0,
          displayOrder: index,
        })),
      });
    }

    return prisma.product.update({
      where: { id },
      data: updateFields,
      include: {
        category: true,
        images: { orderBy: { displayOrder: "asc" } },
      },
    });
  }

  static async updateStock(id: string, stock: number) {
    return prisma.product.update({
      where: { id },
      data: { stock },
      include: { category: true },
    });
  }

  static async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
    }

    // Soft-deactivate to avoid breaking existing orders that reference it
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // --- Category Management ---

  static async listCategories() {
    return prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  static async createCategory(data: {
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    displayOrder?: number;
  }) {
    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing) {
      throw new AppError("A category with this slug already exists", 409, "SLUG_EXISTS");
    }

    return prisma.category.create({ data });
  }

  static async updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  static async deleteCategory(id: string) {
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw new AppError(
        `Cannot delete category with ${productCount} assigned products. Reassign products first.`,
        400,
        "CATEGORY_NOT_EMPTY"
      );
    }

    return prisma.category.delete({ where: { id } });
  }

  // --- Order Management ---

  static async listOrders(status?: OrderStatus, search?: string, page = 1, limit = 20) {
    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search && search.trim() !== "") {
      where.OR = [
        { orderNumber: { contains: search.trim(), mode: "insensitive" } },
        { customerEmail: { contains: search.trim(), mode: "insensitive" } },
        { customerName: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async updateOrderStatus(id: string, status: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
    }

    return prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }
}

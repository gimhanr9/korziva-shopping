import { prisma } from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";

export class CategoryService {
  static async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: { isActive: true },
            },
          },
        },
      },
    });
  }

  static async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: {
            images: {
              orderBy: { displayOrder: "asc" },
            },
          },
        },
      },
    });

    if (!category) {
      throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
    }

    return category;
  }
}

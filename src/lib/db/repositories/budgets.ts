import { prisma } from "@/lib/db/client"
import { Prisma } from "@prisma/client"

export class CategoryRepository {
  async findMany(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { transactions: true }
        }
      }
    })
  }

  async findById(id: string, userId: string) {
    return prisma.category.findFirst({
      where: { id, userId },
    })
  }

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    return prisma.category.create({ data })
  }

  async update(id: string, userId: string, data: Prisma.CategoryUpdateInput) {
    // Ensure user owns the category
    const category = await this.findById(id, userId)
    if (!category) throw new Error("Category not found or unauthorized")

    return prisma.category.update({
      where: { id },
      data,
    })
  }

  async delete(id: string, userId: string) {
    const category = await this.findById(id, userId)
    if (!category) throw new Error("Category not found or unauthorized")

    return prisma.category.delete({ where: { id } })
  }
}

export const categoryRepository = new CategoryRepository()

export class CategoryBudgetRepository {
  async upsert(data: Prisma.CategoryBudgetUncheckedCreateInput) {
    return prisma.categoryBudget.upsert({
      where: {
        categoryId_month: {
          categoryId: data.categoryId,
          month: data.month
        },
      },
      create: data,
      update: data,
    })
  }

  async findForMonth(userId: string, month: Date) {
    return prisma.categoryBudget.findMany({
      where: {
        month: month,
        category: { userId }
      },
      include: { category: true }
    })
  }

  async findByCategoryId(categoryId: string, month: Date) {
    return prisma.categoryBudget.findUnique({
      where: {
        categoryId_month: { categoryId, month }
      }
    })
  }
}

export const categoryBudgetRepository = new CategoryBudgetRepository()

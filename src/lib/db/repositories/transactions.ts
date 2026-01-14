import { prisma } from "@/lib/db/client"
import { Prisma } from "@prisma/client"

export type TransactionFilter = {
  userId: string
  startDate?: Date
  endDate?: Date
  accountId?: string
  categoryId?: string
  search?: string
  limit?: number
  offset?: number
}

export class TransactionRepository {
  async findMany({
    userId,
    startDate,
    endDate,
    accountId,
    categoryId,
    search,
    limit = 50,
    offset = 0,
  }: TransactionFilter) {
    const where: Prisma.TransactionWhereInput = {
      account: { userId },
      ...(startDate || endDate
        ? {
            date: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
      ...(accountId ? { accountId } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { description: { contains: search, mode: "insensitive" } },
              { merchant: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { date: "desc" },
        include: {
          category: { select: { id: true, name: true, color: true, icon: true } },
          account: { select: { id: true, name: true } },
        },
      }),
    ])

    return { total, transactions }
  }

  async create(data: Prisma.TransactionUncheckedCreateInput) {
    return prisma.transaction.create({ data })
  }

  async createMany(data: Prisma.TransactionCreateManyInput[]) {
    return prisma.transaction.createMany({ data })
  }

  async update(id: string, userId: string, data: Prisma.TransactionUpdateInput) {
    // Ensure user owns the transaction
    const transaction = await prisma.transaction.findFirst({
      where: { id, account: { userId } },
    })

    if (!transaction) throw new Error("Transaction not found or unauthorized")

    return prisma.transaction.update({
      where: { id },
      data,
    })
  }

  async delete(id: string, userId: string) {
    // Ensure user owns the transaction
    const transaction = await prisma.transaction.findFirst({
      where: { id, account: { userId } },
    })

    if (!transaction) throw new Error("Transaction not found or unauthorized")

    return prisma.transaction.delete({ where: { id } })
  }
}

export const transactionRepository = new TransactionRepository()

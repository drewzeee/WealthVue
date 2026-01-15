import { prisma } from "@/lib/db/client"
import { Prisma } from "@prisma/client"

export type TransactionFilter = {
  userId: string
  startDate?: Date
  endDate?: Date
  accountId?: string
  categoryId?: string
  search?: string
  type?: 'income' | 'expense' | 'all'
  amountMin?: number
  amountMax?: number
  merchant?: string
  isTransfer?: boolean
  uncategorized?: boolean
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
    type,
    amountMin,
    amountMax,
    merchant: merchantName,
    isTransfer,
    uncategorized,
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
      ...(uncategorized ? { categoryId: null } : {}),
      ...(type === 'income' ? { amount: { gt: 0 } } : {}),
      ...(type === 'expense' ? { amount: { lt: 0 } } : {}),
      ...(amountMin !== undefined || amountMax !== undefined
        ? {
          amount: {
            ...(amountMin !== undefined ? { gte: amountMin } : {}),
            ...(amountMax !== undefined ? { lte: amountMax } : {}),
          },
        }
        : {}),
      ...(merchantName
        ? { merchant: { contains: merchantName, mode: "insensitive" } }
        : {}),
      ...(isTransfer !== undefined ? { isTransfer } : {}),
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

  async getSummary({
    userId,
    startDate,
    endDate,
    accountId,
    categoryId,
    search,
    type,
    amountMin,
    amountMax,
    merchant: merchantName,
    isTransfer,
    uncategorized,
  }: Omit<TransactionFilter, 'limit' | 'offset'>) {
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
      ...(uncategorized ? { categoryId: null } : {}),
      ...(type === 'income' ? { amount: { gt: 0 } } : {}),
      ...(type === 'expense' ? { amount: { lt: 0 } } : {}),
      ...(amountMin !== undefined || amountMax !== undefined
        ? {
          amount: {
            ...(amountMin !== undefined ? { gte: amountMin } : {}),
            ...(amountMax !== undefined ? { lte: amountMax } : {}),
          },
        }
        : {}),
      ...(merchantName
        ? { merchant: { contains: merchantName, mode: "insensitive" } }
        : {}),
      ...(isTransfer !== undefined ? { isTransfer } : {}),
      ...(search
        ? {
          OR: [
            { description: { contains: search, mode: "insensitive" } },
            { merchant: { contains: merchantName || search, mode: "insensitive" } },
          ],
        }
        : {}),
    }

    const aggregations = await prisma.transaction.aggregate({
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    })

    // To get income vs expense separated, we need two parallel queries or use a groupby/custom query
    // Given Prisma's aggregate limits, doing another set of queries for separated totals is clearest
    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, amount: { gt: 0 } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, amount: { lt: 0 } },
        _sum: { amount: true },
      }),
    ])

    return {
      count: aggregations._count.id,
      totalIncome: incomeAgg._sum.amount || new Prisma.Decimal(0),
      totalExpenses: expenseAgg._sum.amount || new Prisma.Decimal(0),
    }
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

  async deleteMany(ids: string[], userId: string) {
    // 1. Verify all transactions belong to user
    const transactions = await prisma.transaction.findMany({
      where: {
        id: { in: ids },
        account: { userId },
      },
      select: { id: true },
    })

    const foundIds = transactions.map((t) => t.id)

    // Check if any requested IDs were not found (or don't belong to user)
    // We strictly only delete what we found. 
    // If checking for mismatch is important, we could throw an error, 
    // but silently ignoring invalid IDs is safer for "bulk delete" idempotency usually.
    // However, for user feedback, let's just proceed with valid ones.

    if (foundIds.length === 0) {
      return { count: 0 }
    }

    return prisma.transaction.deleteMany({
      where: {
        id: { in: foundIds },
      },
    })
  }
}

export const transactionRepository = new TransactionRepository()

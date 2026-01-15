import { prisma } from "@/lib/db/client"
import { Prisma, AssetClass } from "@prisma/client"

// ============================================================================
// INVESTMENT ACCOUNT REPOSITORY
// ============================================================================

export type InvestmentAccountFilter = {
    userId: string
}

export class InvestmentAccountRepository {
    async findMany({ userId }: InvestmentAccountFilter) {
        const accounts = await prisma.investmentAccount.findMany({
            where: { userId },
            include: {
                investments: {
                    select: {
                        id: true,
                        quantity: true,
                        costBasis: true,
                        currentPrice: true,
                    },
                },
            },
            orderBy: { name: "asc" },
        })

        // Calculate summary for each account
        return accounts.map((account) => {
            let totalValue = 0
            let totalCostBasis = 0

            account.investments.forEach((inv) => {
                const quantity = Number(inv.quantity)
                const costBasis = Number(inv.costBasis)
                const currentPrice = inv.currentPrice ? Number(inv.currentPrice) : costBasis / quantity

                totalCostBasis += costBasis
                totalValue += quantity * currentPrice
            })

            const totalGainLoss = totalValue - totalCostBasis
            const gainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0

            return {
                ...account,
                totalValue,
                totalCostBasis,
                totalGainLoss,
                gainLossPercent,
            }
        })
    }

    async findById(id: string, userId: string) {
        return prisma.investmentAccount.findFirst({
            where: { id, userId },
            include: {
                investments: true,
            },
        })
    }

    async create(userId: string, data: Prisma.InvestmentAccountCreateWithoutUserInput) {
        return prisma.investmentAccount.create({
            data: {
                ...data,
                userId,
            },
        })
    }

    async update(id: string, userId: string, data: Prisma.InvestmentAccountUpdateInput) {
        // Ensure user owns the account
        const account = await prisma.investmentAccount.findFirst({
            where: { id, userId },
        })

        if (!account) throw new Error("Investment account not found or unauthorized")

        return prisma.investmentAccount.update({
            where: { id },
            data,
        })
    }

    async delete(id: string, userId: string) {
        // Ensure user owns the account
        const account = await prisma.investmentAccount.findFirst({
            where: { id, userId },
        })

        if (!account) throw new Error("Investment account not found or unauthorized")

        // CASCADE will delete all investments in this account
        return prisma.investmentAccount.delete({ where: { id } })
    }
}

export const investmentAccountRepository = new InvestmentAccountRepository()

// ============================================================================
// INVESTMENT REPOSITORY
// ============================================================================

export type InvestmentFilter = {
    userId: string
    accountId?: string
    assetClass?: AssetClass
    search?: string
    limit?: number
    offset?: number
}

export class InvestmentRepository {
    async findMany({
        userId,
        accountId,
        assetClass,
        search,
        limit = 50,
        offset = 0,
    }: InvestmentFilter) {
        const where: Prisma.InvestmentWhereInput = {
            account: { userId },
            ...(accountId ? { accountId } : {}),
            ...(assetClass ? { assetClass } : {}),
            ...(search
                ? {
                    OR: [
                        { symbol: { contains: search, mode: "insensitive" } },
                        { name: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {}),
        }

        const [total, investments] = await Promise.all([
            prisma.investment.count({ where }),
            prisma.investment.findMany({
                where,
                take: limit,
                skip: offset,
                orderBy: [{ symbol: "asc" }],
                include: {
                    account: { select: { id: true, name: true, type: true } },
                },
            }),
        ])

        // Calculate current value and gains for each investment
        const investmentsWithCalculations = investments.map((inv) => {
            const quantity = Number(inv.quantity)
            const costBasis = Number(inv.costBasis)
            const currentPrice = inv.currentPrice ? Number(inv.currentPrice) : costBasis / quantity
            const currentValue = quantity * currentPrice
            const gainLoss = currentValue - costBasis
            const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0

            return {
                ...inv,
                currentValue,
                gainLoss,
                gainLossPercent,
                // Placeholder for day change - will be populated by price service
                dayChange: 0,
                dayChangePercent: 0,
            }
        })

        return { total, investments: investmentsWithCalculations }
    }

    async findById(id: string, userId: string) {
        const investment = await prisma.investment.findFirst({
            where: { id, account: { userId } },
            include: {
                account: { select: { id: true, name: true, type: true } },
                priceHistory: {
                    orderBy: { timestamp: "desc" },
                    take: 30, // Last 30 price points
                },
            },
        })

        if (!investment) return null

        // Calculate values
        const quantity = Number(investment.quantity)
        const costBasis = Number(investment.costBasis)
        const currentPrice = investment.currentPrice ? Number(investment.currentPrice) : costBasis / quantity
        const currentValue = quantity * currentPrice
        const gainLoss = currentValue - costBasis
        const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0

        return {
            ...investment,
            currentValue,
            gainLoss,
            gainLossPercent,
            dayChange: 0,
            dayChangePercent: 0,
        }
    }

    async create(data: Prisma.InvestmentUncheckedCreateInput) {
        return prisma.$transaction(async (tx) => {
            const investment = await tx.investment.create({
                data,
                include: {
                    account: { select: { id: true, name: true, type: true } },
                },
            })

            if (data.currentPrice) {
                await tx.assetPrice.create({
                    data: {
                        investmentId: investment.id,
                        price: data.currentPrice,
                        source: data.manualPrice ? "manual" : "initial",
                    },
                })
            }

            return investment
        })
    }

    async update(id: string, userId: string, data: Prisma.InvestmentUpdateInput) {
        // Ensure user owns the investment
        const investment = await prisma.investment.findFirst({
            where: { id, account: { userId } },
        })

        if (!investment) throw new Error("Investment not found or unauthorized")

        return prisma.investment.update({
            where: { id },
            data,
            include: {
                account: { select: { id: true, name: true, type: true } },
            },
        })
    }

    async delete(id: string, userId: string) {
        // Ensure user owns the investment
        const investment = await prisma.investment.findFirst({
            where: { id, account: { userId } },
        })

        if (!investment) throw new Error("Investment not found or unauthorized")

        return prisma.investment.delete({ where: { id } })
    }

    async deleteMany(ids: string[], userId: string) {
        // Verify all investments belong to user
        const investments = await prisma.investment.findMany({
            where: {
                id: { in: ids },
                account: { userId },
            },
            select: { id: true },
        })

        const foundIds = investments.map((i) => i.id)

        if (foundIds.length === 0) {
            return { count: 0 }
        }

        return prisma.investment.deleteMany({
            where: { id: { in: foundIds } },
        })
    }

    // Update price for a specific investment
    async updatePrice(id: string, price: number, source: string = "manual") {
        // Update current price and record in history
        await prisma.$transaction([
            prisma.investment.update({
                where: { id },
                data: {
                    currentPrice: price,
                    lastPriceUpdate: new Date(),
                },
            }),
            prisma.assetPrice.create({
                data: {
                    investmentId: id,
                    price,
                    source,
                },
            }),
        ])
    }

    // Bulk update prices for multiple investments
    async bulkUpdatePrices(updates: { id: string; price: number; source: string }[]) {
        const operations = updates.flatMap((update) => [
            prisma.investment.update({
                where: { id: update.id },
                data: {
                    currentPrice: update.price,
                    lastPriceUpdate: new Date(),
                },
            }),
            prisma.assetPrice.create({
                data: {
                    investmentId: update.id,
                    price: update.price,
                    source: update.source,
                },
            }),
        ])

        return prisma.$transaction(operations)
    }

    // Get all investments that need price updates
    async getInvestmentsForPriceUpdate(userId?: string) {
        const where: Prisma.InvestmentWhereInput = {
            manualPrice: false,
            ...(userId ? { account: { userId } } : {}),
        }

        return prisma.investment.findMany({
            where,
            select: {
                id: true,
                symbol: true,
                assetClass: true,
                lastPriceUpdate: true,
            },
        })
    }
}

export const investmentRepository = new InvestmentRepository()

import { prisma } from "@/lib/db/client"
import { AccountType } from "@prisma/client"

export class NetWorthService {
    static async calculateNetWorth(userId: string) {
        // 1. Sum Account Assets (Checking, Savings, Investment, Other)
        const accountAssets = await prisma.account.aggregate({
            where: {
                userId,
                type: {
                    in: [AccountType.CHECKING, AccountType.SAVINGS, AccountType.INVESTMENT, AccountType.OTHER]
                }
            },
            _sum: {
                currentBalance: true
            }
        })

        // 2. Sum Account Liabilities (Credit Card, Loan)
        const accountLiabilities = await prisma.account.aggregate({
            where: {
                userId,
                type: {
                    in: [AccountType.CREDIT_CARD, AccountType.LOAN]
                }
            },
            _sum: {
                currentBalance: true
            }
        })

        // 3. Sum InvestmentAccount Assets (Calculated from holdings)
        const investmentAccounts = await prisma.investmentAccount.findMany({
            where: { userId },
            include: {
                investments: true
            }
        })

        let investmentAssetsSum = 0
        for (const account of investmentAccounts) {
            for (const inv of account.investments) {
                const price = inv.currentPrice ? inv.currentPrice.toNumber() : inv.costBasis.toNumber()
                investmentAssetsSum += inv.quantity.toNumber() * price
            }
        }

        // 4. Sum Manual Assets
        const manualAssets = await prisma.asset.aggregate({
            where: { userId },
            _sum: { currentValue: true }
        })

        // 5. Sum Manual Liabilities
        const manualLiabilities = await prisma.liability.aggregate({
            where: { userId },
            _sum: { currentBalance: true }
        })

        // Aggregation
        const totalAccountAssets = accountAssets._sum.currentBalance?.toNumber() || 0
        const totalAccountLiabilities = accountLiabilities._sum.currentBalance?.toNumber() || 0
        // Note: investmentAssetsSum is already a number
        const totalManualAssets = manualAssets._sum.currentValue?.toNumber() || 0
        const totalManualLiabilities = manualLiabilities._sum.currentBalance?.toNumber() || 0

        const totalAssets = totalAccountAssets + investmentAssetsSum + totalManualAssets
        const totalLiabilities = totalAccountLiabilities + totalManualLiabilities

        // Plaid liabilities are positive numbers representing debt, so we subtract them.
        // Manual liabilities are also strictly positive numbers representing debt.
        const netWorth = totalAssets - totalLiabilities

        return {
            netWorth,
            totalAssets,
            totalLiabilities,
            breakdown: {
                accountAssets: totalAccountAssets,
                accountLiabilities: totalAccountLiabilities,
                investmentAssets: investmentAssetsSum,
                manualAssets: totalManualAssets,
                manualLiabilities: totalManualLiabilities
            }
        }
    }

    static async snapshotNetWorth(userId: string) {
        const data = await this.calculateNetWorth(userId)

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Check if snapshot exists for today
        const existing = await prisma.netWorthSnapshot.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: today
                }
            }
        })

        if (existing) {
            return await prisma.netWorthSnapshot.update({
                where: { id: existing.id },
                data: {
                    netWorth: data.netWorth,
                    totalAssets: data.totalAssets,
                    totalLiabilities: data.totalLiabilities,
                    allocation: data.breakdown as any
                }
            })
        } else {
            return await prisma.netWorthSnapshot.create({
                data: {
                    userId,
                    date: today,
                    netWorth: data.netWorth,
                    totalAssets: data.totalAssets,
                    totalLiabilities: data.totalLiabilities,
                    allocation: data.breakdown as any
                }
            })
        }
    }
}

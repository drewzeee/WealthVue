import { prisma } from "@/lib/db/client"
import { Transaction } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

export class TransferDetectionService {
    private readonly DATE_WINDOW_DAYS = 4

    /**
     * Identifies and links transfers within a list of transactions.
     * This should be called after a sync or import.
     */
    async detectAndLinkTransfers(userId: string, transactions?: Transaction[], lookbackDays: number | null = 30) {
        // 1. Fetch transactions if not provided
        const where: any = {
            account: { userId },
            isTransfer: false,
        }

        if (lookbackDays !== null) {
            where.date = {
                gte: new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000)
            }
        }

        const txns = transactions || await prisma.transaction.findMany({
            where,
            orderBy: { date: 'desc' }
        })

        if (txns.length < 2) return 0

        const matchedIds = new Set<string>()
        let linkedCount = 0

        // 2. Identify pairs
        for (let i = 0; i < txns.length; i++) {
            if (matchedIds.has(txns[i].id)) continue

            for (let j = i + 1; j < txns.length; j++) {
                if (matchedIds.has(txns[j].id)) continue

                if (this.isTransferPair(txns[i], txns[j])) {
                    const transferId = `tf_${txns[i].id}_${txns[j].id}`

                    await this.linkPair(txns[i].id, txns[j].id, transferId, userId)

                    matchedIds.add(txns[i].id)
                    matchedIds.add(txns[j].id)
                    linkedCount++
                    break
                }
            }
        }

        return linkedCount
    }

    /**
     * Checks if two transactions form a transfer pair based on amount, date, and accounts.
     */
    isTransferPair(a: Transaction, b: Transaction): boolean {
        // 1. Must be different accounts
        if (a.accountId === b.accountId) return false

        // 2. Amounts must be inverse
        // Standardize to number for comparison if needed, but Decimal is safer
        const amountA = new Decimal(a.amount)
        const amountB = new Decimal(b.amount)
        if (!amountA.add(amountB).isZero()) return false

        // 3. Must be within the date window
        const dateA = new Date(a.date).getTime()
        const dateB = new Date(b.date).getTime()
        const diffDays = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24)

        if (diffDays > this.DATE_WINDOW_DAYS) return false

        // 4. One must be an outflow, one must be an inflow
        // (Amount sum check already implies this if sum is 0 and they aren't both 0)
        if (amountA.isZero()) return false

        return true
    }

    /**
     * Atomic operation to link two transactions as a transfer.
     */
    private async linkPair(id1: string, id2: string, transferId: string, userId: string) {
        // Find or create the Transfers category for this user
        const transferCategory = await prisma.category.upsert({
            where: {
                userId_name: {
                    userId,
                    name: 'Transfers'
                }
            },
            update: {},
            create: {
                userId,
                name: 'Transfers',
                color: '#94a3b8',
                icon: '🔁'
            }
        })

        return prisma.$transaction([
            prisma.transaction.update({
                where: { id: id1 },
                data: {
                    isTransfer: true,
                    transferId,
                    categoryId: transferCategory.id
                }
            }),
            prisma.transaction.update({
                where: { id: id2 },
                data: {
                    isTransfer: true,
                    transferId,
                    categoryId: transferCategory.id
                }
            })
        ])
    }
}

export const transferDetectionService = new TransferDetectionService()

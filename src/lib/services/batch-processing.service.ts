import { prisma } from "@/lib/db/client"
import { categorizationEngine } from "./categorization.engine"
import { transferDetectionService } from "./transfer-detection.service"
import { ruleRepository } from "@/lib/db/repositories/rules"

export class BatchProcessingService {
    async processAllTransactions(userId: string) {
        // 1. Run Categorization Rules
        const transactions = await prisma.transaction.findMany({
            where: { account: { userId } },
        })

        const rules = await ruleRepository.findMany(userId)
        let categorizedCount = 0

        for (const transaction of transactions) {
            const newCategoryId = await categorizationEngine.categorize(
                {
                    description: transaction.description,
                    amount: transaction.amount,
                    merchant: transaction.merchant,
                },
                userId,
                rules
            )

            if (newCategoryId && newCategoryId !== transaction.categoryId) {
                await prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { categoryId: newCategoryId },
                })
                categorizedCount++
            }
        }

        // 2. Run Transfer Detection (full history)
        const transferCount = await transferDetectionService.detectAndLinkTransfers(userId, undefined, null)

        return {
            categorizedCount,
            transferCount,
        }
    }
}

export const batchProcessingService = new BatchProcessingService()

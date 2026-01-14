import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { transactionRepository } from "@/lib/db/repositories/transactions"
import { ruleRepository } from "@/lib/db/repositories/rules"
import { categorizationEngine } from "@/lib/services/categorization.engine"
import { createTransactionSchema } from "@/lib/validations/transaction"
import { z } from "zod"

const importSchema = z.object({
  transactions: z.array(createTransactionSchema),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await req.json()
    const { transactions } = importSchema.parse(json)

    // Batch create using Promise.all or transaction
    // Prisma createMany is supported but doesn't return created records (not needed here)
    // and doesn't support nested writes (not needed here).
    // createMany is efficient.

    // Fetch user rules once for batch processing
    const rules = await ruleRepository.findMany(session.user.id)

    // Apply categorization rules to transactions
    const categorizedTransactions = await Promise.all(
      transactions.map(async (tx) => {
        // If already categorized manually (e.g. from CSV column), skip rule engine?
        // Usually rules override or fill gaps. Let's assume fill gaps causing we don't want to override if user explicitly set it?
        // But for "Import", usually no category is set.
        // If categoryId is present and not null, keep it? Or rules override?
        // Let's assume rules fill gaps.
        if (tx.categoryId) return tx

        const categoryId = await categorizationEngine.categorize(
          {
            description: tx.description,
            amount: tx.amount as unknown as any, // Type cast for Prisma Decimal/number mismatch if needed, but schema is number
            merchant: tx.merchant || null
          },
          session.user.id,
          rules
        )

        return {
          ...tx,
          categoryId: categoryId || tx.categoryId
        }
      })
    )

    const created = await transactionRepository.createMany(categorizedTransactions)

    return NextResponse.json({ success: true, count: created.count }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: (error as z.ZodError<any>).issues },
        { status: 400 }
      )
    }
    console.error("Failed to import transactions:", error)
    return NextResponse.json(
      { success: false, error: "Failed to import transactions" },
      { status: 500 }
    )
  }
}

import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { transactionRepository } from "@/lib/db/repositories/transactions"
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
    
    // However, createTransactionSchema has 'date' as Date object. JSON has string.
    // Zod coerce handles it.
    
    const created = await transactionRepository.createMany(transactions) // Need to add createMany to repo

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

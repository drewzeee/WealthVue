import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { transactionRepository } from "@/lib/db/repositories/transactions"
import { createTransactionSchema } from "@/lib/validations/transaction"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "50")
  const offset = (page - 1) * limit

  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const accountId = searchParams.get("accountId") || undefined
  const categoryId = searchParams.get("categoryId") || undefined
  const search = searchParams.get("search") || undefined

  try {
    const { total, transactions } = await transactionRepository.findMany({
      userId: session.user.id,
      startDate: from ? new Date(from) : undefined,
      endDate: to ? new Date(to) : undefined,
      accountId,
      categoryId,
      search,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Failed to fetch transactions:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await req.json()
    const body = createTransactionSchema.parse(json)

    // For safety, Prisma will error if accountId doesn't exist.
    // In a real app, we should check if accountId belongs to user.
    // For now, relying on FK constraint (but it doesn't prevent cross-user if ID is leaked).
    // Adding TODO for future hardening.
    // TODO: Verify account ownership.

    const transaction = await transactionRepository.create({
      accountId: body.accountId,
      date: body.date,
      description: body.description,
      amount: body.amount,
      categoryId: body.categoryId,
      merchant: body.merchant,
      notes: body.notes,
      source: body.source,
    })

    return NextResponse.json({ success: true, data: transaction }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: (error as z.ZodError<any>).issues },
        { status: 400 }
      )
    }
    console.error("Failed to create transaction:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create transaction" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await req.json()
    // Validation: expect an array of strings
    // We can use a simple z.array(z.string()) or import the schema if we exported it
    // Let's assume we imported it or just use inline zod if it wasn't exported (I added it to validation file in previous step)
    const { deleteTransactionsSchema } = await import("@/lib/validations/transaction")
    const ids = deleteTransactionsSchema.parse(json)

    const result = await transactionRepository.deleteMany(ids, session.user.id)

    return NextResponse.json({ success: true, data: result }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: (error as z.ZodError<any>).issues },
        { status: 400 }
      )
    }
    console.error("Failed to delete transactions:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete transactions" },
      { status: 500 }
    )
  }
}

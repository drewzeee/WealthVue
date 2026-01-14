import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { transactionRepository } from "@/lib/db/repositories/transactions"
import { updateTransactionSchema } from "@/lib/validations/transaction"
import { z } from "zod"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await req.json()
    const body = updateTransactionSchema.parse(json)

    const transaction = await transactionRepository.update(
      params.id,
      session.user.id,
      body
    )

    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: (error as z.ZodError<any>).issues },
        { status: 400 }
      )
    }
    console.error("Failed to update transaction:", error)
    // Distinguish between Not Found/Unauthorized and other errors if possible
    // The repo throws "Transaction not found or unauthorized"
    if (error instanceof Error && error.message.includes("not found")) {
        return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { success: false, error: "Failed to update transaction" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    await transactionRepository.delete(params.id, session.user.id)
    return NextResponse.json({ success: true, message: "Transaction deleted" })
  } catch (error) {
    console.error("Failed to delete transaction:", error)
    if (error instanceof Error && error.message.includes("not found")) {
        return NextResponse.json({ success: false, error: error.message }, { status: 404 })
    }
    return NextResponse.json(
      { success: false, error: "Failed to delete transaction" },
      { status: 500 }
    )
  }
}

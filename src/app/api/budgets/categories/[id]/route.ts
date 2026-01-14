import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { categoryRepository } from "@/lib/db/repositories/budgets"
import { updateCategorySchema } from "@/lib/validations/budget"
import { z } from "zod"

interface Params {
  params: {
    id: string
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await req.json()
    const body = updateCategorySchema.parse(json)

    const category = await categoryRepository.update(params.id, session.user.id, body)

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }
    // Handle unique constraint violation (Category name)
    // @ts-ignore
    if (error.code === 'P2002') {
        return NextResponse.json(
            { success: false, error: "Category with this name already exists" },
            { status: 409 }
        )
    }
    
    // Handle "not found" or generic errors
    if (error instanceof Error && error.message.includes("not found")) {
        return NextResponse.json(
            { success: false, error: "Category not found" },
            { status: 404 }
        )
    }

    console.error("Failed to update category:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update category" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    await categoryRepository.delete(params.id, session.user.id)
    return NextResponse.json({ success: true, message: "Category deleted" })
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
         return NextResponse.json(
            { success: false, error: "Category not found" },
            { status: 404 }
        )
    }

    console.error("Failed to delete category:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete category" },
      { status: 500 }
    )
  }
}

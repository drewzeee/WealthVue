import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { categoryRepository } from "@/lib/db/repositories/budgets"
import { createCategorySchema } from "@/lib/validations/budget"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const categories = await categoryRepository.findMany(session.user.id)
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
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
    const body = createCategorySchema.parse(json)

    const category = await categoryRepository.create({
      userId: session.user.id,
      ...body
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
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

    console.error("Failed to create category:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    )
  }
}

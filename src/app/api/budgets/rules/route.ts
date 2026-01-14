import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { ruleRepository } from "@/lib/db/repositories/rules"
import { createRuleSchema } from "@/lib/validations/budget"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const rules = await ruleRepository.findMany(session.user.id)
    return NextResponse.json({ success: true, data: rules })
  } catch (error) {
    console.error("Failed to fetch rules:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch rules" },
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
    const body = createRuleSchema.parse(json)

    const rule = await ruleRepository.create({
      userId: session.user.id,
      ...body
    })

    return NextResponse.json({ success: true, data: rule }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Failed to create rule:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create rule" },
      { status: 500 }
    )
  }
}


import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { ruleRepository } from "@/lib/db/repositories/rules"
import { updateRuleSchema } from "@/lib/validations/budget"
import { z } from "zod"

interface RouteParams {
    params: {
        id: string
    }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const json = await req.json()
        const body = updateRuleSchema.parse(json)

        const rule = await ruleRepository.update(params.id, session.user.id, body)

        return NextResponse.json({ success: true, data: rule })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: "Validation error", details: error.issues },
                { status: 400 }
            )
        }

        console.error("Failed to update rule:", error)
        return NextResponse.json(
            { success: false, error: "Failed to update rule" },
            { status: 500 }
        )
    }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        await ruleRepository.delete(params.id, session.user.id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete rule:", error)
        return NextResponse.json(
            { success: false, error: "Failed to delete rule" },
            { status: 500 }
        )
    }
}

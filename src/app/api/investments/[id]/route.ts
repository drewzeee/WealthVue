import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { investmentRepository } from "@/lib/db/repositories/investments"
import { updateInvestmentSchema } from "@/lib/validations/investment"
import { z } from "zod"

interface Params {
    params: {
        id: string
    }
}

export async function GET(_req: NextRequest, { params }: Params) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const investment = await investmentRepository.findById(params.id, session.user.id)

        if (!investment) {
            return NextResponse.json(
                { success: false, error: "Investment not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: investment })
    } catch (error) {
        console.error("Failed to fetch investment:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch investment" },
            { status: 500 }
        )
    }
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const json = await req.json()
        const body = updateInvestmentSchema.parse(json)

        // If accountId is being changed, verify the new account belongs to user
        if (body.accountId) {
            const { investmentAccountRepository } = await import("@/lib/db/repositories/investments")
            const account = await investmentAccountRepository.findById(body.accountId, session.user.id)

            if (!account) {
                return NextResponse.json(
                    { success: false, error: "Investment account not found" },
                    { status: 404 }
                )
            }
        }

        const investment = await investmentRepository.update(params.id, session.user.id, body)

        return NextResponse.json({ success: true, data: investment })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: "Validation error", details: error.issues },
                { status: 400 }
            )
        }

        if (error instanceof Error && error.message.includes("not found")) {
            return NextResponse.json(
                { success: false, error: "Investment not found" },
                { status: 404 }
            )
        }

        console.error("Failed to update investment:", error)
        return NextResponse.json(
            { success: false, error: "Failed to update investment" },
            { status: 500 }
        )
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        await investmentRepository.delete(params.id, session.user.id)
        return NextResponse.json({ success: true, message: "Investment deleted" })
    } catch (error) {
        if (error instanceof Error && error.message.includes("not found")) {
            return NextResponse.json(
                { success: false, error: "Investment not found" },
                { status: 404 }
            )
        }

        console.error("Failed to delete investment:", error)
        return NextResponse.json(
            { success: false, error: "Failed to delete investment" },
            { status: 500 }
        )
    }
}

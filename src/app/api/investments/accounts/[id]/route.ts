import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { investmentAccountRepository } from "@/lib/db/repositories/investments"
import { updateInvestmentAccountSchema } from "@/lib/validations/investment"
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
        const account = await investmentAccountRepository.findById(params.id, session.user.id)

        if (!account) {
            return NextResponse.json(
                { success: false, error: "Investment account not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ success: true, data: account })
    } catch (error) {
        console.error("Failed to fetch investment account:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch investment account" },
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
        const body = updateInvestmentAccountSchema.parse(json)

        const account = await investmentAccountRepository.update(params.id, session.user.id, body)

        return NextResponse.json({ success: true, data: account })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: "Validation error", details: error.issues },
                { status: 400 }
            )
        }

        if (error instanceof Error && error.message.includes("not found")) {
            return NextResponse.json(
                { success: false, error: "Investment account not found" },
                { status: 404 }
            )
        }

        console.error("Failed to update investment account:", error)
        return NextResponse.json(
            { success: false, error: "Failed to update investment account" },
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
        await investmentAccountRepository.delete(params.id, session.user.id)
        return NextResponse.json({ success: true, message: "Investment account deleted" })
    } catch (error) {
        if (error instanceof Error && error.message.includes("not found")) {
            return NextResponse.json(
                { success: false, error: "Investment account not found" },
                { status: 404 }
            )
        }

        console.error("Failed to delete investment account:", error)
        return NextResponse.json(
            { success: false, error: "Failed to delete investment account" },
            { status: 500 }
        )
    }
}

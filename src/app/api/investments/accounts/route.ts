import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { investmentAccountRepository } from "@/lib/db/repositories/investments"
import { createInvestmentAccountSchema } from "@/lib/validations/investment"
import { z } from "zod"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const accounts = await investmentAccountRepository.findMany({ userId: session.user.id })
        return NextResponse.json({ success: true, data: accounts })
    } catch (error) {
        console.error("Failed to fetch investment accounts:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch investment accounts" },
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
        const body = createInvestmentAccountSchema.parse(json)

        const account = await investmentAccountRepository.create(session.user.id, body)

        return NextResponse.json({ success: true, data: account }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: "Validation error", details: error.issues },
                { status: 400 }
            )
        }

        console.error("Failed to create investment account:", error)
        return NextResponse.json(
            { success: false, error: "Failed to create investment account" },
            { status: 500 }
        )
    }
}

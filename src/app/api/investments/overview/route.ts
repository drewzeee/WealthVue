import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { investmentService } from "@/lib/services/investment.service"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const data = await investmentService.getOverview(session.user.id)
        return NextResponse.json({ success: true, data })
    } catch (error) {
        console.error("[INVESTMENT_OVERVIEW]", error)
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        )
    }
}

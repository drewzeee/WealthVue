import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { budgetService } from "@/lib/services/budget.service"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const monthParam = searchParams.get('month')

    const mode = (searchParams.get('mode') as 'personal' | 'household') || 'personal'

    let date = new Date()
    if (monthParam) {
        const parsed = new Date(monthParam)
        if (!isNaN(parsed.getTime())) {
            date = parsed
        }
    }

    try {
        const data = await budgetService.getBudgetOverview(session.user.id, date, mode)
        return NextResponse.json(data)
    } catch (error) {
        console.error("[BUDGET_OVERVIEW]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

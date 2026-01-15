import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { batchProcessingService } from "@/lib/services/batch-processing.service"

export async function POST() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const result = await batchProcessingService.processAllTransactions(session.user.id)

        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error("Failed to process transactions:", error)
        return NextResponse.json(
            { success: false, error: "Failed to process transactions" },
            { status: 500 }
        )
    }
}

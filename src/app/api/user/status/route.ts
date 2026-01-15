import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/client"

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                linkStatus: true,
                linkedUserId: true,
                linkedUser: {
                    select: {
                        name: true,
                        email: true,
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            linkStatus: user.linkStatus,
            linkedUser: user.linkedUser,
        })
    } catch (error) {
        console.error("User status error:", error)
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }
}

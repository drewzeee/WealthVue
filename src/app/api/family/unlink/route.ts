import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function POST() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { linkedUserId: true },
        })

        if (!currentUser?.linkedUserId) {
            return NextResponse.json({ error: "No link found" }, { status: 400 })
        }

        const linkedUserId = currentUser.linkedUserId

        await prisma.$transaction([
            prisma.user.update({
                where: { id: session.user.id },
                data: {
                    linkedUserId: null,
                    linkStatus: 'NONE',
                },
            }),
            prisma.user.update({
                where: { id: linkedUserId },
                data: {
                    linkedUserId: null,
                    linkStatus: 'NONE',
                },
            }),
        ])

        return NextResponse.json({ success: true, message: "Accounts unlinked" })
    } catch (error) {
        console.error("Unlink error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

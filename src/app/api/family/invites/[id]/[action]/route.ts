import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { NextResponse } from "next/server"

interface RouteParams {
    params: {
        id: string
        action: string
    }
}

export async function POST(_req: Request, { params }: RouteParams) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, action } = params

    try {
        const invite = await prisma.linkInvitation.findUnique({
            where: { id },
            include: { fromUser: true, toUser: true },
        })

        if (!invite || invite.toUserId !== session.user.id) {
            return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
        }

        if (invite.status !== 'PENDING') {
            return NextResponse.json({ error: "Invitation is no longer pending" }, { status: 400 })
        }

        if (action === 'accept') {
            // 1. Mark invite as accepted
            await prisma.linkInvitation.update({
                where: { id },
                data: { status: 'ACCEPTED' },
            })

            // 2. Link the users
            // Note: We update both to be thorough, though Prisma self-relation might be one-sided in the fields
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: invite.fromUserId },
                    data: {
                        linkedUserId: invite.toUserId,
                        linkStatus: 'LINKED',
                    },
                }),
                prisma.user.update({
                    where: { id: invite.toUserId! },
                    data: {
                        linkedUserId: invite.fromUserId,
                        linkStatus: 'LINKED',
                    },
                }),
                // Decline all other pending invites for both users
                prisma.linkInvitation.updateMany({
                    where: {
                        OR: [
                            { fromUserId: invite.fromUserId, status: 'PENDING' },
                            { toUserId: invite.fromUserId, status: 'PENDING' },
                            { fromUserId: invite.toUserId!, status: 'PENDING' },
                            { toUserId: invite.toUserId!, status: 'PENDING' },
                        ],
                        NOT: { id: invite.id },
                    },
                    data: { status: 'DECLINED' },
                })
            ])

            return NextResponse.json({ success: true, message: "Invitation accepted. Accounts linked." })
        } else if (action === 'decline') {
            await prisma.linkInvitation.update({
                where: { id },
                data: { status: 'DECLINED' },
            })
            return NextResponse.json({ success: true, message: "Invitation declined" })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (error) {
        console.error("Invite action error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { z } from "zod"
import { NextResponse } from "next/server"

const inviteSchema = z.object({
    email: z.string().email("Invalid email address"),
})

export async function POST(req: Request) {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { email } = inviteSchema.parse(body)

        if (email === session.user.email) {
            return NextResponse.json({ error: "You cannot invite yourself" }, { status: 400 })
        }

        // Check if target user exists
        const targetUser = await prisma.user.findUnique({
            where: { email },
        })

        if (!targetUser) {
            return NextResponse.json({ error: "User not found. They must register first." }, { status: 404 })
        }

        // Check if already linked
        if (targetUser.linkStatus === 'LINKED') {
            return NextResponse.json({ error: "This user is already linked to another account" }, { status: 400 })
        }

        // Check if current user is already linked
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (currentUser?.linkStatus === 'LINKED') {
            return NextResponse.json({ error: "You are already linked to an account. Unlink first." }, { status: 400 })
        }

        // Create or update invitation
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

        await prisma.linkInvitation.upsert({
            where: {
                // We'll use a unique constraint or just create new ones. 
                // Prisma schema doesn't have a unique constraint on fromUserId + toEmail yet, 
                // let's just create a new one for now to keep it simple, or check for existing.
                id: 'placeholder'
            },
            create: {
                fromUserId: session.user.id,
                toEmail: email,
                toUserId: targetUser.id,
                expiresAt,
            },
            update: {
                status: 'PENDING',
                expiresAt,
            }
        })

        return NextResponse.json({ success: true, message: "Invitation sent" })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
        }
        console.error("Invite error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function GET() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const sent = await prisma.linkInvitation.findMany({
            where: { fromUserId: session.user.id, status: 'PENDING' },
            include: { toUser: { select: { name: true, email: true } } },
        })

        const received = await prisma.linkInvitation.findMany({
            where: { toUserId: session.user.id, status: 'PENDING' },
            include: { fromUser: { select: { name: true, email: true } } },
        })

        return NextResponse.json({ success: true, invites: { sent, received } })
    } catch (error) {
        console.error("Fetch invites error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

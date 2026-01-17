import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conversations = await prisma.aiConversation.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
            _count: {
                select: { messages: true }
            }
        }
    });

    return NextResponse.json(conversations);
}

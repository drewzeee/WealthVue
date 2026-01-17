import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const conversation = await prisma.aiConversation.findUnique({
        where: {
            id: params.id,
            userId: session.user.id
        },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    if (!conversation) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    return NextResponse.json(conversation);
}

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.aiConversation.delete({
        where: {
            id: params.id,
            userId: session.user.id
        }
    });

    return NextResponse.json({ success: true });
}

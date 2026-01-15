import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { createAssetSchema } from "@/lib/validations/asset";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const assets = await prisma.asset.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: assets });
    } catch (error) {
        console.error("Failed to fetch assets:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch assets" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = createAssetSchema.parse(body);

        const asset = await prisma.asset.create({
            data: {
                name: validatedData.name,
                type: validatedData.type,
                currentValue: validatedData.currentValue,
                acquiredDate: validatedData.acquiredDate || undefined,
                notes: validatedData.notes,
                userId: session.user.id,
            },
        });

        return NextResponse.json({ success: true, data: asset }, { status: 201 });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
        }
        console.error("Failed to create asset:", error);
        return NextResponse.json({ success: false, error: "Failed to create asset" }, { status: 500 });
    }
}

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { updateAssetSchema } from "@/lib/validations/asset";

interface RouteParams {
    params: {
        id: string;
    };
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = updateAssetSchema.parse(body);

        // Verify ownership
        const existingAsset = await prisma.asset.findUnique({
            where: { id: params.id },
        });

        if (!existingAsset || existingAsset.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
        }

        const { acquiredDate, ...rest } = validatedData;

        const asset = await prisma.asset.update({
            where: { id: params.id },
            data: {
                ...rest,
                acquiredDate: acquiredDate || undefined,
            },
        });

        return NextResponse.json({ success: true, data: asset });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
        }
        console.error("Failed to update asset:", error);
        return NextResponse.json({ success: false, error: "Failed to update asset" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Verify ownership
        const existingAsset = await prisma.asset.findUnique({
            where: { id: params.id },
        });

        if (!existingAsset || existingAsset.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: "Asset not found" }, { status: 404 });
        }

        await prisma.asset.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true, message: "Asset deleted" });
    } catch (error) {
        console.error("Failed to delete asset:", error);
        return NextResponse.json({ success: false, error: "Failed to delete asset" }, { status: 500 });
    }
}

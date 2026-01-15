import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { updateLiabilitySchema } from "@/lib/validations/asset";

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
        const validatedData = updateLiabilitySchema.parse(body);

        // Verify ownership
        const existingLiability = await prisma.liability.findUnique({
            where: { id: params.id },
        });

        if (!existingLiability || existingLiability.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: "Liability not found" }, { status: 404 });
        }

        const { dueDate, interestRate, minimumPayment, ...rest } = validatedData;

        const liability = await prisma.liability.update({
            where: { id: params.id },
            data: {
                ...rest,
                dueDate: dueDate || undefined, // Use undefined to skip updating if null
                interestRate: interestRate === undefined ? undefined : interestRate,
                minimumPayment: minimumPayment === undefined ? undefined : minimumPayment,
            },
        });

        return NextResponse.json({ success: true, data: liability });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
        }
        console.error("Failed to update liability:", error);
        return NextResponse.json({ success: false, error: "Failed to update liability" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Verify ownership
        const existingLiability = await prisma.liability.findUnique({
            where: { id: params.id },
        });

        if (!existingLiability || existingLiability.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: "Liability not found" }, { status: 404 });
        }

        await prisma.liability.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true, message: "Liability deleted" });
    } catch (error) {
        console.error("Failed to delete liability:", error);
        return NextResponse.json({ success: false, error: "Failed to delete liability" }, { status: 500 });
    }
}

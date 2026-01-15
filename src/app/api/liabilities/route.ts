import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { createLiabilitySchema } from "@/lib/validations/asset";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const liabilities = await prisma.liability.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: liabilities });
    } catch (error) {
        console.error("Failed to fetch liabilities:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch liabilities" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = createLiabilitySchema.parse(body);

        const liability = await prisma.liability.create({
            data: {
                ...validatedData,
                userId: session.user.id,
                // dueDate and Decimal fields will be handled by Prisma
                currentBalance: validatedData.currentBalance,
                originalAmount: validatedData.originalAmount || 0,
                interestRate: validatedData.interestRate,
                minimumPayment: validatedData.minimumPayment,
            },
        });

        return NextResponse.json({ success: true, data: liability }, { status: 201 });
    } catch (error: any) {
        if (error.name === "ZodError") {
            return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
        }
        console.error("Failed to create liability:", error);
        return NextResponse.json({ success: false, error: "Failed to create liability" }, { status: 500 });
    }
}

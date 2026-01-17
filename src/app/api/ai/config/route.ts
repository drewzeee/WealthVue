import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { encrypt } from "@/lib/encryption";
import { z } from "zod";

const configSchema = z.object({
    activeProvider: z.enum(["OPENAI", "ANTHROPIC", "GEMINI", "OLLAMA"]).optional(),
    openaiApiKey: z.string().optional(),
    anthropicApiKey: z.string().optional(),
    geminiApiKey: z.string().optional(),
    ollamaEndpoint: z.string().url().optional(),
    ollamaModel: z.string().optional(),
    enabled: z.boolean().optional(),
    permissions: z.enum(["READ_ONLY", "SUGGEST", "WRITE"]).optional(),
});

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const config = await prisma.aiConfiguration.findUnique({
        where: { userId: session.user.id },
    });

    if (!config) {
        // Return default empty config if none exists
        return NextResponse.json({
            enabled: false,
            activeProvider: "OPENAI",
            permissions: "READ_ONLY",
            hasOpenaiKey: false,
            hasAnthropicKey: false,
            hasGeminiKey: false,
            ollamaEndpoint: "http://localhost:11434",
            ollamaModel: "llama3.2",
        });
    }

    // Mask keys but indicate presence
    return NextResponse.json({
        ...config,
        openaiApiKey: undefined,
        anthropicApiKey: undefined,
        geminiApiKey: undefined,
        hasOpenaiKey: !!config.openaiApiKey,
        hasAnthropicKey: !!config.anthropicApiKey,
        hasGeminiKey: !!config.geminiApiKey,
    });
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const validated = configSchema.parse(body);

        const updateData: any = { ...validated };

        // Encrypt keys if provided
        if (validated.openaiApiKey) updateData.openaiApiKey = encrypt(validated.openaiApiKey);
        if (validated.anthropicApiKey) updateData.anthropicApiKey = encrypt(validated.anthropicApiKey);
        if (validated.geminiApiKey) updateData.geminiApiKey = encrypt(validated.geminiApiKey);

        await prisma.aiConfiguration.upsert({
            where: { userId: session.user.id },
            update: updateData,
            create: {
                userId: session.user.id,
                ...updateData,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

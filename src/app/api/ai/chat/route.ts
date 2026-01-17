import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { aiRouterService } from "@/lib/services/ai/ai-router.service";
import { contextBuilderService } from "@/lib/services/ai/context-builder.service";
import { ChatMessage } from "@/lib/services/ai/providers/types";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { message, conversationId, contextLevel = 'summary' } = await req.json();
        const userId = session.user.id;

        // 1. Get or Create Conversation
        let activeConversationId = conversationId;
        if (!activeConversationId) {
            const conversation = await prisma.aiConversation.create({
                data: { userId, title: message.substring(0, 50) }
            });
            activeConversationId = conversation.id;
        }

        // 2. Fetch History
        const history = await prisma.aiMessage.findMany({
            where: { conversationId: activeConversationId },
            orderBy: { createdAt: 'asc' },
            take: 20
        });

        // 3. Build Context
        let context = "";
        if (contextLevel === 'summary') context = await contextBuilderService.buildSummaryContext(userId);
        else if (contextLevel === 'standard') context = await contextBuilderService.buildStandardContext(userId);
        else if (contextLevel === 'detailed') context = await contextBuilderService.buildDetailedContext(userId);

        const systemPrompt = `You are WealthVue AI, a premium personal financial assistant. 
Keep your responses concise, professional, and data-driven.
Users have three permission levels: READ_ONLY (you can only answer questions), 
SUGGEST (you can recommend actions like re-categorizing or budgeting), 
and WRITE (you can theoretically make changes, though this is currently handled by suggesting actions for the user to confirm).

Current Financial Context:
${context}

Focus on helping the user understand their net worth, spending habits, investments, and budget goals.`;

        const messages: ChatMessage[] = [
            { role: 'system', content: systemPrompt },
            ...history.map((m: any) => ({
                role: m.role.toLowerCase() as 'user' | 'assistant' | 'system',
                content: m.content
            })),
            { role: 'user', content: message }
        ];

        // 4. Persist User Message
        await prisma.aiMessage.create({
            data: {
                conversationId: activeConversationId,
                role: 'USER',
                content: message
            }
        });

        // 5. Stream Response
        const stream = aiRouterService.streamChat(userId, messages, { systemPrompt });

        let fullResponse = "";

        // Create a streaming response
        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    fullResponse += chunk;
                    controller.enqueue(new TextEncoder().encode(chunk));
                }

                // Persist Assistant Response after stream completes
                await prisma.aiMessage.create({
                    data: {
                        conversationId: activeConversationId,
                        role: 'ASSISTANT',
                        content: fullResponse
                    }
                });

                controller.close();
            }
        });

        return new Response(readable, {
            headers: { "Content-Type": "text/event-stream" }
        });

    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

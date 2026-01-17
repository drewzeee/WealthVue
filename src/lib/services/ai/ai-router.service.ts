import { prisma } from "@/lib/db/client";
import { OpenAIProvider } from "./providers/openai.provider";
import { AnthropicProvider } from "./providers/anthropic.provider";
import { GeminiProvider } from "./providers/gemini.provider";
import { OllamaProvider } from "./providers/ollama.provider";
import { AIProvider, ChatMessage, ChatOptions, ChatResponse } from "./providers/types";
import { decrypt } from "@/lib/encryption";

export class AIRouterService {
    async getProviderForUser(userId: string): Promise<AIProvider> {
        const config = await prisma.aiConfiguration.findUnique({
            where: { userId },
        });

        if (!config || !config.enabled) {
            throw new Error("AI is not enabled for this user.");
        }

        switch (config.activeProvider as string) {
            case "OPENAI":
                if (!config.openaiApiKey) throw new Error("OpenAI API key not configured.");
                return new OpenAIProvider(decrypt(config.openaiApiKey));
            case "ANTHROPIC":
                if (!config.anthropicApiKey) throw new Error("Anthropic API key not configured.");
                return new AnthropicProvider(decrypt(config.anthropicApiKey));
            case "GEMINI":
                if (!config.geminiApiKey) throw new Error("Gemini API key not configured.");
                return new GeminiProvider(decrypt(config.geminiApiKey));
            case "OLLAMA":
                return new OllamaProvider(config.ollamaEndpoint || undefined, config.ollamaModel || undefined);
            default:
                throw new Error(`Unsupported AI provider: ${config.activeProvider}`);
        }
    }

    async chat(userId: string, messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
        const provider = await this.getProviderForUser(userId);
        return provider.chat(messages, options);
    }

    async *streamChat(userId: string, messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
        const provider = await this.getProviderForUser(userId);
        for await (const chunk of provider.streamChat(messages, options)) {
            yield chunk;
        }
    }
}

export const aiRouterService = new AIRouterService();

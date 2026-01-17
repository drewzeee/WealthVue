import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from './base-provider';
import { ChatMessage, ChatOptions, ChatResponse } from './types';

export class GeminiProvider extends BaseAIProvider {
    name = 'Gemini';
    private client: GoogleGenerativeAI;

    constructor(apiKey: string) {
        super();
        this.client = new GoogleGenerativeAI(apiKey);
    }

    async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
        try {
            const model = this.client.getGenerativeModel({ model: 'gemini-1.5-pro' });

            // Separate system prompt if present
            const systemMessage = messages.find(m => m.role === 'system');
            const chatMessages = messages.filter(m => m.role !== 'system');

            const result = await model.generateContent({
                contents: chatMessages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }],
                })),
                generationConfig: {
                    temperature: options?.temperature,
                    maxOutputTokens: options?.maxTokens,
                },
                systemInstruction: systemMessage?.content,
            });

            const response = await result.response;
            const content = response.text();

            return {
                content,
                tokensUsed: {
                    prompt: response.usageMetadata?.promptTokenCount || 0,
                    completion: response.usageMetadata?.candidatesTokenCount || 0,
                    total: response.usageMetadata?.totalTokenCount || 0,
                },
                provider: this.name,
            };
        } catch (error) {
            this.handleError(error);
        }
    }

    async *streamChat(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
        try {
            const model = this.client.getGenerativeModel({ model: 'gemini-1.5-pro' });

            const systemMessage = messages.find(m => m.role === 'system');
            const chatMessages = messages.filter(m => m.role !== 'system');

            const result = await model.generateContentStream({
                contents: chatMessages.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }],
                })),
                generationConfig: {
                    temperature: options?.temperature,
                    maxOutputTokens: options?.maxTokens,
                },
                systemInstruction: systemMessage?.content,
            });

            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) yield text;
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    countTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }
}

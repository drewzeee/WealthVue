import OpenAI from 'openai';
import { BaseAIProvider } from './base-provider';
import { ChatMessage, ChatOptions, ChatResponse } from './types';

export class OpenAIProvider extends BaseAIProvider {
    name = 'OpenAI';
    private client: OpenAI;

    constructor(apiKey: string) {
        super();
        this.client = new OpenAI({ apiKey });
    }

    async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
        try {
            const response = await this.client.chat.completions.create({
                model: 'gpt-4o',
                messages: messages.map(m => ({
                    role: m.role as any,
                    content: m.content
                })),
                temperature: options?.temperature,
                max_tokens: options?.maxTokens,
            });

            const content = response.choices[0].message.content || '';

            return {
                content,
                tokensUsed: {
                    prompt: response.usage?.prompt_tokens || 0,
                    completion: response.usage?.completion_tokens || 0,
                    total: response.usage?.total_tokens || 0,
                },
                provider: this.name,
            };
        } catch (error) {
            this.handleError(error);
        }
    }

    async *streamChat(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
        try {
            const stream = await this.client.chat.completions.create({
                model: 'gpt-4o',
                messages: messages.map(m => ({
                    role: m.role as any,
                    content: m.content
                })),
                temperature: options?.temperature,
                max_tokens: options?.maxTokens,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) yield content;
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    countTokens(text: string): number {
        // Basic approximation (OpenAI uses tiktoken, but characters/4 is common placeholder)
        return Math.ceil(text.length / 4);
    }
}

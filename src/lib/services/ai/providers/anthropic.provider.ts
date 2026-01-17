import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider } from './base-provider';
import { ChatMessage, ChatOptions, ChatResponse } from './types';

export class AnthropicProvider extends BaseAIProvider {
    name = 'Anthropic';
    private client: Anthropic;

    constructor(apiKey: string) {
        super();
        this.client = new Anthropic({ apiKey });
    }

    async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
        try {
            const response = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: options?.maxTokens || 4096,
                temperature: options?.temperature,
                system: options?.systemPrompt,
                messages: messages.map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content
                })).filter(m => m.role !== 'system' as any), // Anthropic uses separate system param
            });

            const content = response.content[0].type === 'text' ? response.content[0].text : '';

            return {
                content,
                tokensUsed: {
                    prompt: response.usage.input_tokens,
                    completion: response.usage.output_tokens,
                    total: response.usage.input_tokens + response.usage.output_tokens,
                },
                provider: this.name,
            };
        } catch (error) {
            this.handleError(error);
        }
    }

    async *streamChat(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
        try {
            const stream = await this.client.messages.create({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: options?.maxTokens || 4096,
                temperature: options?.temperature,
                system: options?.systemPrompt,
                messages: messages.map(m => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content
                })).filter(m => m.role !== 'system' as any),
                stream: true,
            });

            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                    yield chunk.delta.text;
                }
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    countTokens(text: string): number {
        return Math.ceil(text.length / 3.5);
    }
}

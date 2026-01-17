import { AIProvider, ChatMessage, ChatOptions, ChatResponse } from './types';

export abstract class BaseAIProvider implements AIProvider {
    abstract name: string;

    abstract chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;

    async *streamChat(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
        const response = await this.chat(messages, { ...options, stream: false });
        yield response.content;
    }

    abstract countTokens(text: string): number;

    async isAvailable(): Promise<boolean> {
        return true;
    }

    protected handleError(error: any): never {
        console.error(`AI Provider Error [${this.name}]:`, error);
        throw new Error(`AI Provider ${this.name} failed: ${error.message || 'Unknown error'}`);
    }
}

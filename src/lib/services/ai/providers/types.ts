export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
    role: MessageRole;
    content: string;
}

export interface ChatOptions {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    stream?: boolean;
}

export interface TokenUsage {
    prompt: number;
    completion: number;
    total: number;
}

export interface ChatResponse {
    content: string;
    tokensUsed: TokenUsage;
    provider: string;
}

export interface AIProvider {
    name: string;
    chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;
    streamChat(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string>;
    countTokens(text: string): number;
    isAvailable(): Promise<boolean>;
}

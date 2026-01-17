import { BaseAIProvider } from './base-provider';
import { ChatMessage, ChatOptions, ChatResponse } from './types';

export class OllamaProvider extends BaseAIProvider {
    name = 'Ollama';
    private endpoint: string;
    private model: string;

    constructor(endpoint: string = 'http://localhost:11434', model: string = 'llama3.2') {
        super();
        this.endpoint = endpoint.replace(/\/$/, '');
        this.model = model;
    }

    async chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse> {
        try {
            const response = await fetch(`${this.endpoint}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages,
                    stream: false,
                    options: {
                        temperature: options?.temperature,
                        num_predict: options?.maxTokens,
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama error: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                content: data.message.content,
                tokensUsed: {
                    prompt: data.prompt_eval_count || 0,
                    completion: data.eval_count || 0,
                    total: (data.prompt_eval_count || 0) + (data.eval_count || 0),
                },
                provider: this.name,
            };
        } catch (error) {
            this.handleError(error);
        }
    }

    async *streamChat(messages: ChatMessage[], options?: ChatOptions): AsyncGenerator<string> {
        try {
            const response = await fetch(`${this.endpoint}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages,
                    stream: true,
                    options: {
                        temperature: options?.temperature,
                        num_predict: options?.maxTokens,
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama error: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);
                        if (data.message?.content) {
                            yield data.message.content;
                        }
                    } catch (e) {
                        console.warn('Failed to parse Ollama stream chunk', e);
                    }
                }
            }
        } catch (error) {
            this.handleError(error);
        }
    }

    countTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }
}

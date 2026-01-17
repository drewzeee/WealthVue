import { describe, it, expect, vi } from 'vitest';
import { OpenAIProvider } from '../providers/openai.provider';
import { OllamaProvider } from '../providers/ollama.provider';

// Mock the entire module using classes
vi.mock('openai', () => {
    class MockOpenAI {
        chat = {
            completions: {
                create: vi.fn().mockResolvedValue({
                    choices: [{ message: { content: 'Hello from AI' } }],
                    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
                }),
            },
        };
    }
    return { default: MockOpenAI, OpenAI: MockOpenAI };
});

describe('AI Providers', () => {
    describe('OpenAIProvider', () => {
        it('should call OpenAI chat completions', async () => {
            const provider = new OpenAIProvider('test-key');
            const response = await provider.chat([{ role: 'user', content: 'Hi' }]);

            expect(response.content).toBe('Hello from AI');
            expect(response.tokensUsed.total).toBe(15);
        });
    });

    describe('OllamaProvider', () => {
        it('should call local Ollama API', async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({
                    message: { content: 'Hello from Ollama' },
                    prompt_eval_count: 20,
                    eval_count: 10,
                }),
            });

            global.fetch = mockFetch;

            const provider = new OllamaProvider('http://localhost:11434', 'llama3.2');
            const response = await provider.chat([{ role: 'user', content: 'Hi' }]);

            expect(response.content).toBe('Hello from Ollama');
            expect(response.tokensUsed.total).toBe(30);
        });
    });
});

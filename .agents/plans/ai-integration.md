# AI Integration Foundation

## Overview
WealthVue AI is a multi-provider AI integration that provides context-aware financial insights to users. This foundation phase implements the core services, provider abstractions, and API endpoints required to build a conversational financial assistant.

## Goals
- Support multiple AI providers (OpenAI, Anthropic, Gemini, Ollama).
- Build a structured financial context for LLMs from user data.
- Securely store user-provided API keys using encryption.
- Provide a streaming chat API with message persistence and history.

## Data Model Changes
The following models were added to `prisma/schema.prisma`:
- **AIConfiguration:** Stores user settings, active provider, and encrypted API keys.
- **AIConversation:** Groups messages into distinct chat sessions.
- **AIMessage:** Stores individual chat messages with roles (USER, ASSISTANT, SYSTEM).

## API Endpoints
- `GET /api/ai/config`: Retrieve user AI configuration (keys masked).
- `PATCH /api/ai/config`: Update AI settings and API keys.
- `POST /api/ai/chat`: Streaming chat endpoint with context injection.
- `GET /api/ai/conversations`: List user chat sessions.
- `GET/DELETE /api/ai/conversations/[id]`: Manage specific sessions.

## Core Services
### ContextBuilderService
Aggregates data from `NetWorthService`, `InvestmentService`, and `BudgetService` into hierarchical contexts:
- **Summary:** Quick financial status.
- **Standard:** Account and budget details.
- **Detailed:** Holdings and recent transactions.

### AIRouterService
Routes chat requests to the active provider and handles secure decryption of API keys.

### Providers
- `OpenAIProvider`: Implements GPT-4o support.
- `AnthropicProvider`: Implements Claude 3.5 Sonnet support.
- `GeminiProvider`: Implements Gemini 1.5 Pro support.
- `OllamaProvider`: Implements local LLM support via HTTP.

## Implementation Status
- ✅ Database Schema & Migrations
- ✅ AI Provider Abstractions
- ✅ Context Builder Service
- ✅ API Key Encryption
- ✅ Multi-Provider Implementations
- ✅ AI Router Service
- ✅ AI API Endpoints
- ✅ Unit Tests for services and providers

## Future Work
- AI Chat Sidebar UI component.
- AI Settings UI for user configuration.
- Proactive AI financial insights on the Dashboard.

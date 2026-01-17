# AI Frontend & Polish Implementation Plan

## Overview
This plan covers Phases 6.5, 6.6, and 6.7 of the AI Integration, which implement the user-facing components for AI settings configuration and an interactive chat interface.

---

## Phase 6.5: Frontend - Settings

### Goal
Allow users to configure their AI provider, API keys, and permission levels from the Settings page.

### Implementation Steps

#### 1. Create AISettings Component
**File:** `src/components/ai/ai-settings.tsx`
- A client component (`'use client'`) using React Hook Form and Zod for validation.
- Fetch current AI config via `useSWR` from `/api/ai/config`.
- Display:
  - **Enable/Disable Toggle:** Master switch for AI features.
  - **Provider Selection:** Dropdown with status indicators (OpenAI, Anthropic, Gemini, Ollama).
  - **API Key Inputs:** Masked password fields for OpenAI, Anthropic, Gemini keys.
  - **Ollama Configuration:** Endpoint URL and model name fields (shown only when Ollama is selected).
  - **Permission Level:** Radio group for `READ_ONLY`, `SUGGEST`, `WRITE`.
- On save, `PATCH` to `/api/ai/config`.

#### 2. Integrate into Settings Page
**File:** `src/app/(auth)/settings/page.tsx`
- Add a new `TabsTrigger` for "AI" in the existing `<Tabs>` component.
- Add a `TabsContent` that renders the `<AISettings />` component.
- Conditionally fetch `AIConfiguration` for the user in the server component.

#### 3. Component Dependencies
- `src/components/ui/switch.tsx` (from shadcn/ui)
- `src/components/ui/select.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/radio-group.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/button.tsx`

---

## Phase 6.6: Frontend - Chat UI

### Goal
Provide an interactive chat panel where users can converse with the AI about their finances.

### Implementation Steps

#### 1. Create AI Components Directory
**Path:** `src/components/ai/`
- `ai-chat.tsx` (main panel)
- `ai-chat-message.tsx` (individual message bubbles)
- `ai-provider-status.tsx` (provider indicator)
- `ai-chat-input.tsx` (input field)
- `ai-conversation-list.tsx` (history sidebar)

#### 2. AIChat Panel Component
**File:** `src/components/ai/ai-chat.tsx`
- A floating panel component, initially hidden, toggled by a global FAB (floating action button).
- **State:**
  - `isOpen`: boolean for panel visibility.
  - `conversationId`: current conversation ID (null for new).
  - `messages`: array of chat messages.
  - `streamingMessage`: current AI response being streamed.
  - `contextLevel`: 'summary' | 'standard' | 'detailed'.
- **Behavior:**
  - On send, POST to `/api/ai/chat` with message, conversationId, and contextLevel.
  - Display streaming response in real-time using `ReadableStream`.
  - Append final response to messages array.

#### 3. AIChatMessage Component
**File:** `src/components/ai/ai-chat-message.tsx`
- Renders a single message bubble.
- Props: `role: 'user' | 'assistant'`, `content: string`, `timestamp?: Date`.
- Styling: User messages on the right (blue background), AI messages on the left (gray background).
- Supports markdown rendering using `react-markdown`.

#### 4. AIProviderStatus Component
**File:** `src/components/ai/ai-provider-status.tsx`
- Displays the currently active provider name and a colored status dot.
- Fetches status from `/api/ai/config` (or uses cached data).

#### 5. Conversation History Sidebar
**File:** `src/components/ai/ai-conversation-list.tsx`
- Fetches conversation list from `/api/ai/conversations`.
- Displays list of past conversations with titles and dates.
- Clicking a conversation loads its messages.

#### 6. Context Level Toggle
- Part of `AIChat` component.
- A segmented control or dropdown to select Summary / Standard / Detailed context.
- Passed to `/api/ai/chat` on each request.

#### 7. Floating Action Button (FAB)
**File:** Modify `src/app/(auth)/layout.tsx`
- Add a fixed-position button in the bottom-right corner.
- On click, opens/closes the `AIChat` panel.
- Button displays a chat icon (e.g., `MessageSquare` from `lucide-react`).

#### 8. Mobile Responsiveness
- On mobile, the chat panel should become full-screen.
- Use Tailwind responsive breakpoints (`md:`, `lg:`) to adapt layout.

---

## Phase 6.7: Polish & Testing

### Goal
Ensure the AI integration is robust, user-friendly, and well-documented.

### Implementation Steps

#### 1. Conversation Title Auto-Generation
- When creating a new conversation, automatically generate a title from the first user message (first 50 characters).
- Already partially implemented in `/api/ai/chat`; verify behavior.

#### 2. Token Usage Tracking
- Display token counts (prompt, completion, total) after each AI response.
- Modify `AIChat` to track and display usage from `/api/ai/chat` response headers or body.

#### 3. Rate Limiting
- Add rate limiting to `/api/ai/chat` (e.g., 10 requests per minute per user).
- Use `next-rate-limit` or a custom Redis-based solution.

#### 4. Error Handling & User Messages
- Handle API errors gracefully in the Chat UI (network errors, provider errors, rate limits).
- Display user-friendly toasts using `sonner` library.

#### 5. Integration Tests
- Write Playwright tests for:
  - Settings page: Configure provider, save keys, enable AI.
  - Chat UI: Open panel, send message, verify response appears.
  - Conversation history: Load past conversation.

#### 6. End-to-End Provider Testing
- Manually test each provider (OpenAI, Anthropic, Gemini, Ollama) with a real API key and a local Ollama instance.
- Document any provider-specific edge cases.

#### 7. Permission Level Testing
- Verify `READ_ONLY` mode only allows informational queries.
- Verify `SUGGEST` mode allows recommendations.
- Verify `WRITE` mode (future) can trigger actions.

#### 8. Mobile Responsiveness Testing
- Test Chat UI on various screen sizes (375px, 768px, 1024px).
- Ensure FAB, panel, and input are usable on touch devices.

#### 9. Documentation
- Add "AI Features" section to README.md.
- Include setup instructions for each provider.
- Document Ollama local setup requirements.

---

## File Structure Summary

```
src/components/ai/
├── ai-settings.tsx          # Settings form component
├── ai-chat.tsx              # Main chat panel
├── ai-chat-message.tsx      # Individual message bubble
├── ai-chat-input.tsx        # Chat input field
├── ai-provider-status.tsx   # Provider status indicator
└── ai-conversation-list.tsx # Conversation history sidebar
```

---

## Dependencies to Install
- `react-markdown` (for rendering AI responses)
- `remark-gfm` (for GitHub Flavored Markdown support)

---

## Verification Checklist
- [ ] AI Settings tab visible in Settings page
- [ ] Provider selection and key input works
- [ ] Chat FAB visible in bottom-right corner
- [ ] Chat panel opens/closes correctly
- [ ] Streaming responses display in real-time
- [ ] Conversation history loads correctly
- [ ] Context level toggle affects AI responses
- [ ] Mobile layout is usable
- [ ] All four providers work end-to-end
- [ ] Error messages are user-friendly

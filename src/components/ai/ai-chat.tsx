"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
    X,
    Maximize2,
    Minimize2,
    History,
    Sparkles,
    ChevronLeft,
    LayoutDashboard,
    Zap,
    LineChart,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIChatMessage } from "./ai-chat-message"
import { AIChatInput } from "./ai-chat-input"
import { AIConversationList } from "./ai-conversation-list"
import { AIProviderStatus } from "./ai-provider-status"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    createdAt: string
}

interface AIChatProps {
    onClose?: () => void
}

export function AIChat({ onClose }: AIChatProps) {
    const queryClient = useQueryClient()
    const [isExpanded, setIsExpanded] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [streamingMessage, setStreamingMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [contextLevel, setContextLevel] = useState<"summary" | "standard" | "detailed">("standard")

    const scrollRef = useRef<HTMLDivElement>(null)

    // Fetch messages when conversationId changes
    const { data: conversationData, isLoading: isLoadingMessages } = useQuery({
        queryKey: ["ai-messages", conversationId],
        queryFn: async () => {
            if (!conversationId) return { messages: [] }
            const res = await fetch(`/api/ai/conversations/${conversationId}`)
            if (!res.ok) throw new Error("Failed to fetch conversation")
            return res.json()
        },
        enabled: !!conversationId,
    })

    useEffect(() => {
        if (conversationData?.messages) {
            setMessages(conversationData.messages)
        } else if (!conversationId) {
            setMessages([])
        }
    }, [conversationData, conversationId])

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, streamingMessage])

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return

        setIsLoading(true)
        const newUserMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content,
            createdAt: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, newUserMessage])

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: content,
                    conversationId,
                    contextLevel,
                }),
            })

            if (!response.ok) {
                throw new Error(await response.text() || "Failed to send message")
            }

            // Handle streaming
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()
            let streamContent = ""

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    const chunk = decoder.decode(value, { stream: true })
                    streamContent += chunk
                    setStreamingMessage(streamContent)
                }
            }

            // After stream complete, update conversation and messages
            // We might need to get the actual conversationId if it was a new one
            const finalResponse = await fetch(`/api/ai/conversations`) // Refresh list
            const convs = await finalResponse.json()

            // Try to find the latest conversation if we were in a "new" chat
            if (!conversationId && convs.length > 0) {
                setConversationId(convs[0].id)
            }

            queryClient.invalidateQueries({ queryKey: ["ai-conversations"] })

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: streamContent,
                createdAt: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, assistantMessage])
            setStreamingMessage(null)

        } catch (error: any) {
            console.error("Chat Error:", error)
            toast.error(error.message || "Failed to get AI response")
            // Remove the user message if it failed or add an error indicator
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectConversation = (id: string | null) => {
        setConversationId(id)
        setShowHistory(false)
    }

    return (
        <div className={cn(
            "fixed z-50 flex flex-col overflow-hidden bg-card border border-border shadow-2xl transition-all duration-300 ease-in-out",
            isExpanded
                ? "inset-4 rounded-2xl sm:inset-10"
                : "bottom-4 right-4 w-[calc(100vw-32px)] sm:w-[440px] h-[600px] rounded-xl sm:bottom-6 sm:right-6"
        )}>
            {/* Header */}
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold leading-none">Financial Assistant</h3>
                        <AIProviderStatus />
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        <History className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hidden sm:flex h-8 w-8"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {/* History Sidebar (Overlay on mobile/small) */}
                <div className={cn(
                    "absolute inset-0 z-20 bg-card transition-transform duration-300 ease-in-out",
                    showHistory ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h4 className="font-semibold text-sm">Conversation History</h4>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowHistory(false)}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        </div>
                        <AIConversationList
                            currentConversationId={conversationId}
                            onSelectConversation={handleSelectConversation}
                        />
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Context Options */}
                    <div className="flex items-center justify-between px-4 py-2 bg-muted/10 border-b">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Context</span>
                            <div className="flex gap-1 p-0.5 rounded-md bg-muted/40">
                                <button
                                    onClick={() => setContextLevel("summary")}
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all",
                                        contextLevel === "summary" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <LayoutDashboard className="h-2.5 w-2.5" />
                                    Summary
                                </button>
                                <button
                                    onClick={() => setContextLevel("standard")}
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all",
                                        contextLevel === "standard" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Zap className="h-2.5 w-2.5" />
                                    Standard
                                </button>
                                <button
                                    onClick={() => setContextLevel("detailed")}
                                    className={cn(
                                        "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all",
                                        contextLevel === "detailed" ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <LineChart className="h-2.5 w-2.5" />
                                    Detailed
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto"
                    >
                        {messages.length === 0 && !streamingMessage && !isLoadingMessages ? (
                            <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                                <div className="relative">
                                    <div className="absolute inset-0 animate-pulse bg-primary/20 blur-xl rounded-full" />
                                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Sparkles className="h-8 w-8" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-lg font-semibold tracking-tight">How can I help you today?</h4>
                                    <p className="text-sm text-muted-foreground max-w-[280px]">
                                        I can help you understand your spending, manage investments, or optimize your budget.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-2 w-full max-w-[320px]">
                                    {[
                                        "Summarize my recent spending",
                                        "How are my investments performing?",
                                        "Do I have any large upcoming bills?",
                                        "Suggest a way to save $500 this month"
                                    ].map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => handleSendMessage(suggestion)}
                                            className="text-xs text-left p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {messages.map((msg) => (
                                    <AIChatMessage
                                        key={msg.id}
                                        role={msg.role}
                                        content={msg.content}
                                        timestamp={new Date(msg.createdAt)}
                                    />
                                ))}
                                {streamingMessage && (
                                    <AIChatMessage
                                        role="assistant"
                                        content={streamingMessage}
                                    />
                                )}
                                {isLoadingMessages && (
                                    <div className="flex items-center justify-center py-10 scale-150">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t bg-muted/20">
                        <AIChatInput
                            onSend={handleSendMessage}
                            isLoading={isLoading}
                        />
                        <p className="mt-2 text-[10px] text-center text-muted-foreground">
                            AI can make mistakes. Please verify important financial decisions.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

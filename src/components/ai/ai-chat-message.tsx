"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"
import { Sparkles, User } from "lucide-react"

interface AIChatMessageProps {
    role: "user" | "assistant"
    content: string
    timestamp?: Date
}

export function AIChatMessage({ role, content, timestamp }: AIChatMessageProps) {
    const isAssistant = role === "assistant"

    return (
        <div className={cn(
            "flex w-full items-start gap-3 p-4",
            isAssistant ? "bg-muted/30" : "bg-transparent"
        )}>
            <div className={cn(
                "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm",
                isAssistant
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border"
            )}>
                {isAssistant ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        {isAssistant ? "WealthVue AI" : "You"}
                    </span>
                    {timestamp && (
                        <span className="text-[10px] text-muted-foreground/50">
                            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
                <div className={cn(
                    "prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed",
                    isAssistant ? "text-foreground" : "text-foreground/90 font-medium"
                )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    )
}

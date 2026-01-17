"use client"

import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { MessageSquare, Plus, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AIConversation {
    id: string
    title: string
    createdAt: string
    updatedAt: string
}

interface AIConversationListProps {
    currentConversationId: string | null
    onSelectConversation: (id: string | null) => void
}

export function AIConversationList({ currentConversationId, onSelectConversation }: AIConversationListProps) {
    const { data: conversations, isLoading } = useQuery<AIConversation[]>({
        queryKey: ["ai-conversations"],
        queryFn: async () => {
            const res = await fetch("/api/ai/conversations")
            if (!res.ok) throw new Error("Failed to fetch conversations")
            return res.json()
        },
    })

    return (
        <div className="flex h-full flex-col gap-2 p-2">
            <Button
                variant="outline"
                className="justify-start gap-2 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all"
                onClick={() => onSelectConversation(null)}
            >
                <Plus className="h-4 w-4" />
                New Chat
            </Button>

            <div className="mt-2 flex-1 overflow-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                ) : conversations?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                        <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center">
                            <MessageSquare className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                        <p className="text-xs text-muted-foreground">No conversations yet</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {conversations?.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => onSelectConversation(conv.id)}
                                className={cn(
                                    "w-full flex flex-col items-start gap-1 rounded-lg px-3 py-2.5 text-left text-sm transition-all hover:bg-muted/80",
                                    currentConversationId === conv.id
                                        ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20"
                                        : "text-foreground/70"
                                )}
                            >
                                <div className="flex w-full items-center justify-between gap-2">
                                    <span className="truncate font-medium">{conv.title || "Untitled Chat"}</span>
                                    <Sparkles className={cn(
                                        "h-3 w-3 shrink-0 opacity-0 transition-opacity",
                                        currentConversationId === conv.id && "opacity-100"
                                    )} />
                                </div>
                                <span className="text-[10px] text-muted-foreground/60">
                                    {format(new Date(conv.createdAt), "MMM d, h:mm a")}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

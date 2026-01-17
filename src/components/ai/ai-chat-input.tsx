"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SendHorizontal, Loader2 } from "lucide-react"

interface AIChatInputProps {
    onSend: (message: string) => void
    isLoading: boolean
    placeholder?: string
}

export function AIChatInput({ onSend, isLoading, placeholder = "Ask me anything about your finances..." }: AIChatInputProps) {
    const [input, setInput] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSend = () => {
        if (!input.trim() || isLoading) return
        onSend(input)
        setInput("")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "inherit"
            const scrollHeight = textareaRef.current.scrollHeight
            textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`
        }
    }, [input])

    return (
        <div className="relative flex items-end gap-2 rounded-xl border border-border/50 bg-background/50 p-2 pl-4 focus-within:border-primary/50 transition-all duration-200">
            <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                className="min-h-[44px] max-h-[200px] w-full resize-none border-0 bg-transparent p-0 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
            />
            <div className="flex h-11 items-center pr-1">
                <Button
                    size="icon"
                    className="h-8 w-8 rounded-lg shrink-0"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <SendHorizontal className="h-4 w-4" />
                    )}
                </Button>
            </div>
        </div>
    )
}

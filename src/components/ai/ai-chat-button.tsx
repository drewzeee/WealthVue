"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIChat } from "./ai-chat"
import { cn } from "@/lib/utils"

export function AIChatButton() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group",
                    isOpen ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
                )}
                size="icon"
            >
                <div className="relative">
                    <Sparkles className={cn(
                        "h-6 w-6 transition-all duration-300",
                        isOpen ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                    )} />
                    <div className={cn(
                        "absolute inset-0 flex items-center justify-center transition-all duration-300",
                        isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                    )}>
                        <div className="h-0.5 w-6 bg-current rounded-full rotate-45 absolute" />
                        <div className="h-0.5 w-6 bg-current rounded-full -rotate-45 absolute" />
                    </div>
                </div>
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-foreground text-[8px] items-center justify-center text-primary font-bold">1</span>
                    </span>
                )}
            </Button>

            {isOpen && (
                <AIChat onClose={() => setIsOpen(false)} />
            )}
        </>
    )
}

"use client"

import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function AIProviderStatus() {
    const { data: config } = useQuery({
        queryKey: ["ai-config"],
        queryFn: async () => {
            const res = await fetch("/api/ai/config")
            if (!res.ok) throw new Error("Failed to fetch AI configuration")
            return res.json()
        },
    })

    if (!config?.enabled) return null

    const providerNames: Record<string, string> = {
        OPENAI: "OpenAI",
        ANTHROPIC: "Anthropic",
        GEMINI: "Gemini",
        OLLAMA: "Ollama",
    }

    const providerName = providerNames[config.activeProvider] || config.activeProvider

    return (
        <div className="flex items-center gap-2 px-1 py-1.5">
            <Badge variant="outline" className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 transition-colors">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-medium tracking-tight uppercase">
                    {providerName}
                </span>
                <div className={cn(
                    "h-1.5 w-1.5 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]",
                    config.hasOpenaiKey || config.hasAnthropicKey || config.hasGeminiKey || config.activeProvider === "OLLAMA"
                        ? "bg-emerald-500"
                        : "bg-amber-400"
                )} />
            </Badge>
        </div>
    )
}

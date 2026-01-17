"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, Sparkles } from "lucide-react"

const configSchema = z.object({
    activeProvider: z.enum(["OPENAI", "ANTHROPIC", "GEMINI", "OLLAMA"]),
    openaiApiKey: z.string().optional(),
    anthropicApiKey: z.string().optional(),
    geminiApiKey: z.string().optional(),
    ollamaEndpoint: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    ollamaModel: z.string().optional(),
    enabled: z.boolean(),
    permissions: z.enum(["READ_ONLY", "SUGGEST", "WRITE"]),
})

type ConfigFormValues = z.infer<typeof configSchema>

export function AISettings() {
    const queryClient = useQueryClient()

    const { data: config, isLoading } = useQuery({
        queryKey: ["ai-config"],
        queryFn: async () => {
            const res = await fetch("/api/ai/config")
            if (!res.ok) throw new Error("Failed to fetch AI configuration")
            return res.json()
        },
    })

    const form = useForm<ConfigFormValues>({
        resolver: zodResolver(configSchema),
        defaultValues: {
            enabled: false,
            activeProvider: "OPENAI",
            permissions: "READ_ONLY",
            ollamaEndpoint: "http://localhost:11434",
            ollamaModel: "llama3.2",
        },
        values: config ? {
            enabled: config.enabled ?? false,
            activeProvider: config.activeProvider ?? "OPENAI",
            permissions: config.permissions ?? "READ_ONLY",
            ollamaEndpoint: config.ollamaEndpoint ?? "http://localhost:11434",
            ollamaModel: config.ollamaModel ?? "llama3.2",
            openaiApiKey: "", // Don't populate keys
            anthropicApiKey: "",
            geminiApiKey: "",
        } : undefined,
    })

    const mutation = useMutation({
        mutationFn: async (values: ConfigFormValues) => {
            const payload = { ...values }
            // Only send keys if they are not empty
            if (!payload.openaiApiKey) delete payload.openaiApiKey
            if (!payload.anthropicApiKey) delete payload.anthropicApiKey
            if (!payload.geminiApiKey) delete payload.geminiApiKey

            const res = await fetch("/api/ai/config", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error("Failed to save AI configuration")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ai-config"] })
            toast.success("AI Configuration saved successfully")
            form.resetField("openaiApiKey")
            form.resetField("anthropicApiKey")
            form.resetField("geminiApiKey")
        },
        onError: (error) => {
            toast.error(error.message)
        },
    })

    const onSubmit = (values: ConfigFormValues) => {
        mutation.mutate(values)
    }

    const activeProvider = form.watch("activeProvider")
    const isEnabled = form.watch("enabled")

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>AI Assistant Settings</CardTitle>
                </div>
                <CardDescription>
                    Configure your AI providers and privacy settings.
                </CardDescription>
            </CardHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="enabled">Enable AI Features</Label>
                            <p className="text-sm text-muted-foreground">
                                Turn on the AI financial assistant and smart insights.
                            </p>
                        </div>
                        <Switch
                            id="enabled"
                            checked={isEnabled}
                            onCheckedChange={(checked) => form.setValue("enabled", checked)}
                        />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="provider">Active AI Provider</Label>
                            <Select
                                value={activeProvider}
                                onValueChange={(value: any) => form.setValue("activeProvider", value)}
                                disabled={!isEnabled}
                            >
                                <SelectTrigger id="provider">
                                    <SelectValue placeholder="Select a provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OPENAI">OpenAI (GPT-4o, GPT-3.5)</SelectItem>
                                    <SelectItem value="ANTHROPIC">Anthropic (Claude 3.5 Sonnet)</SelectItem>
                                    <SelectItem value="GEMINI">Google Gemini</SelectItem>
                                    <SelectItem value="OLLAMA">Ollama (Local AI)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {activeProvider === "OPENAI" && (
                            <div className="space-y-2">
                                <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                                <Input
                                    id="openaiApiKey"
                                    type="password"
                                    placeholder={config?.hasOpenaiKey ? "••••••••••••••••" : "sk-..."}
                                    {...form.register("openaiApiKey")}
                                    disabled={!isEnabled}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Your key is encrypted and stored securely.
                                </p>
                            </div>
                        )}

                        {activeProvider === "ANTHROPIC" && (
                            <div className="space-y-2">
                                <Label htmlFor="anthropicApiKey">Anthropic API Key</Label>
                                <Input
                                    id="anthropicApiKey"
                                    type="password"
                                    placeholder={config?.hasAnthropicKey ? "••••••••••••••••" : "sk-ant-..."}
                                    {...form.register("anthropicApiKey")}
                                    disabled={!isEnabled}
                                />
                            </div>
                        )}

                        {activeProvider === "GEMINI" && (
                            <div className="space-y-2">
                                <Label htmlFor="geminiApiKey">Gemini API Key</Label>
                                <Input
                                    id="geminiApiKey"
                                    type="password"
                                    placeholder={config?.hasGeminiKey ? "••••••••••••••••" : "Your API Key"}
                                    {...form.register("geminiApiKey")}
                                    disabled={!isEnabled}
                                />
                            </div>
                        )}

                        {activeProvider === "OLLAMA" && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="ollamaEndpoint">Ollama Endpoint</Label>
                                    <Input
                                        id="ollamaEndpoint"
                                        placeholder="http://localhost:11434"
                                        {...form.register("ollamaEndpoint")}
                                        disabled={!isEnabled}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ollamaModel">Model Name</Label>
                                    <Input
                                        id="ollamaModel"
                                        placeholder="llama3.2"
                                        {...form.register("ollamaModel")}
                                        disabled={!isEnabled}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <Label>AI Permissions</Label>
                        <RadioGroup
                            value={form.watch("permissions")}
                            onValueChange={(value: any) => form.setValue("permissions", value)}
                            className="flex flex-col space-y-2"
                            disabled={!isEnabled}
                        >
                            <div className="flex items-start space-x-3 space-y-0">
                                <RadioGroupItem value="READ_ONLY" id="read-only" className="mt-1" />
                                <Label htmlFor="read-only" className="font-normal">
                                    <span className="font-medium">Read Only</span>
                                    <p className="text-sm text-muted-foreground">
                                        AI can only see your financial overview and provide summaries.
                                    </p>
                                </Label>
                            </div>
                            <div className="flex items-start space-x-3 space-y-0">
                                <RadioGroupItem value="SUGGEST" id="suggest" className="mt-1" />
                                <Label htmlFor="suggest" className="font-normal">
                                    <span className="font-medium">Suggestive</span>
                                    <p className="text-sm text-muted-foreground">
                                        AI can recommend budget rules, categories, and investment moves.
                                    </p>
                                </Label>
                            </div>
                            <div className="flex items-start space-x-3 space-y-0">
                                <RadioGroupItem value="WRITE" id="write" className="mt-1" />
                                <Label htmlFor="write" className="font-normal">
                                    <span className="font-medium">Active (Write)</span>
                                    <p className="text-sm text-muted-foreground">
                                        AI can perform actions like creating rules or categorization (Beta).
                                    </p>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-border/50 bg-muted/30 py-4">
                    <Button
                        type="submit"
                        disabled={mutation.isPending || !isEnabled}
                        className="gap-2"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Configuration
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

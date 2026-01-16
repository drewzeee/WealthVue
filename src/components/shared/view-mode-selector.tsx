"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface ViewModeSelectorProps {
    className?: string
}

export function ViewModeSelector({ className }: ViewModeSelectorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const viewMode = searchParams.get("mode") || "personal"

    const setViewMode = (mode: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (mode === "household") {
            params.set("mode", "household")
        } else {
            params.delete("mode")
        }
        router.push(`?${params.toString()}`)
    }

    return (
        <div className={cn("flex items-center", className)}>
            <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsList>
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Personal</span>
                    </TabsTrigger>
                    <TabsTrigger value="household" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Household</span>
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    )
}

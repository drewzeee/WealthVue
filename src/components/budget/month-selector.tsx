"use client"

import { format, addMonths, subMonths, startOfMonth } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MonthSelectorProps {
    className?: string
}

export function MonthSelector({ className }: MonthSelectorProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const monthParam = searchParams.get("month")

    // Robust parsing for "yyyy-MM-dd" to avoid UTC shifts
    const currentMonth = (() => {
        if (!monthParam) return startOfMonth(new Date())
        const [y, m, d] = monthParam.split("-").map(Number)
        return startOfMonth(new Date(y, m - 1, d || 1))
    })()

    const navigateToMonth = (date: Date) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("month", format(date, "yyyy-MM-dd"))
        router.push(`?${params.toString()}`)
    }

    const handlePrevious = () => navigateToMonth(subMonths(currentMonth, 1))
    const handleNext = () => navigateToMonth(addMonths(currentMonth, 1))
    const handleCurrent = () => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete("month")
        router.push(`?${params.toString()}`)
    }

    const isCurrentMonth = format(currentMonth, "yyyy-MM") === format(new Date(), "yyyy-MM")

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                title="Previous Month"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 px-4 py-2 border rounded-md bg-background min-w-[180px] justify-center">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                    {format(currentMonth, "MMMM yyyy")}
                </span>
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                title="Next Month"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            {!isCurrentMonth && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCurrent}
                    className="ml-2"
                >
                    Current Month
                </Button>
            )}
        </div>
    )
}

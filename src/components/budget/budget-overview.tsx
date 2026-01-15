"use client"

import { useSearchParams } from "next/navigation"
import { startOfMonth } from "date-fns"

import { useBudgetOverview } from "./use-budget-overview"
import { SummaryCards } from "./summary-cards"
import { SpendingChart } from "./spending-chart"
import { CategoryBudgetList } from "./category-budget-list"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MonthSelector } from "./month-selector"

export function BudgetOverview() {
    const searchParams = useSearchParams()
    const monthParam = searchParams.get("month")

    // Robust parsing for "yyyy-MM-dd" to avoid UTC shifts
    const selectedMonth = (() => {
        if (!monthParam) return undefined
        const [y, m, d] = monthParam.split("-").map(Number)
        return startOfMonth(new Date(y, m - 1, d || 1))
    })()

    const { data, isLoading, error } = useBudgetOverview(selectedMonth)

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading budget data...</div>
    // Simple error display
    if (error) return (
        <Alert variant="destructive">
            <AlertDescription>Failed to load budget data.</AlertDescription>
        </Alert>
    )

    if (!data) return null

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="text-xl font-semibold">Budget Overview</h3>
                <MonthSelector />
            </div>

            <SummaryCards
                income={data.overall.income}
                budgeted={data.overall.budgeted}
                spent={data.overall.spent}
                remaining={data.overall.remaining}
            />

            <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <SpendingChart
                        categories={data.categories}
                        remaining={data.overall.remaining}
                    />
                </div>
                <div className="lg:col-span-1 border rounded-xl p-6 bg-card text-card-foreground shadow-sm h-fit">
                    <CategoryBudgetList categories={data.categories} />
                </div>
            </div>
        </div>
    )
}

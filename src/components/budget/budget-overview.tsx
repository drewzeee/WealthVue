"use client"

import { useBudgetOverview } from "./use-budget-overview"
import { SummaryCards } from "./summary-cards"
import { SpendingChart } from "./spending-chart"
import { CategoryBudgetList } from "./category-budget-list"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function BudgetOverview() {
    const { data, isLoading, error } = useBudgetOverview()

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

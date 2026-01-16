import { useQuery } from "@tanstack/react-query"
import { BudgetOverviewResponse } from "@/types/budget"

export function useBudgetOverview(month?: Date, mode: 'personal' | 'household' = 'personal') {
    return useQuery({
        queryKey: ["budget-overview", month, mode],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (month) params.append("month", month.toISOString())
            if (mode === 'household') params.append("mode", "household")

            const res = await fetch(`/api/budgets/overview?${params.toString()}`)
            if (!res.ok) throw new Error("Failed to fetch budget overview")
            return res.json() as Promise<BudgetOverviewResponse>
        }
    })
}

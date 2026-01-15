import { useQuery } from "@tanstack/react-query"
import { BudgetOverviewResponse } from "@/types/budget"

export function useBudgetOverview(month?: Date) {
    return useQuery({
        queryKey: ["budget-overview", month],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (month) params.append("month", month.toISOString())

            const res = await fetch(`/api/budgets/overview?${params.toString()}`)
            if (!res.ok) throw new Error("Failed to fetch budget overview")
            return res.json() as Promise<BudgetOverviewResponse>
        }
    })
}

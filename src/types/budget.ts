export interface BudgetOverviewResponse {
    overall: {
        income: number
        budgeted: number
        spent: number
        remaining: number
        progress: number
    }
    categories: CategoryBudgetSummary[]
    transactionsCount: number
}

export interface CategoryBudgetSummary {
    id: string
    name: string
    color: string
    icon: string | null
    monthlyBudget: number // Decimal as number
    carryOver: number
    budgeted: number
    spent: number
    remaining: number
    progress: number
}

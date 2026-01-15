import { categoryRepository, categoryBudgetRepository } from "@/lib/db/repositories/budgets"
import { transactionRepository } from "@/lib/db/repositories/transactions"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

export class BudgetService {
    async getBudgetOverview(userId: string, date: Date) {
        const start = startOfMonth(date)
        const end = endOfMonth(date)

        // 1. Fetch Categories
        const categories = await categoryRepository.findMany(userId)

        // 2. Fetch Transactions for this month
        const { transactions } = await transactionRepository.findMany({
            userId,
            startDate: start,
            endDate: end,
            limit: 10000 // Get all
        })

        // 3. Fetch CategoryBudgets for this month (snapshots/overrides)
        const categoryBudgets = await categoryBudgetRepository.findForMonth(userId, start)

        // 4. Calculate stats per category
        const categoryStats = await Promise.all(categories.map(async (cat) => {
            const catTransactions = transactions.filter(t => t.categoryId === cat.id)
            // Flip sign if negative to represent 'cost' in positive terms for budget
            // or just sum absolute values? 
            // Usually, expenses are positive in WealthVue DB (per previous tasks), but some imports might be negative.
            // Let's normalize: if it maps to a category, we treat the MAGNITUDE as spending.
            // But what if it's a refund? Refund should reduce spending.
            // If expense = +100, then refund = -100. Net = 0.
            // If expense = -100 (import), then generic logic fails.

            // Debug found Rent = -2175. This implies this specific transaction is negative.
            // If the user system generally uses Postive = Expense, then this transaction is inverted?
            // Or does Negative = Expense?
            // Looking at Income logic: `transactions.filter(t => Number(t.amount) < 0)`.
            // This implies Negative = Income.
            // So Rent being -2175 means it IS Income? 
            // Wait, "Rent" is usually an expense. 
            // If it's -2175, checking "Income" logic triggers.

            // Proposed Fix:
            // 1. Transactions with a Category are NOT considered generic "Income" unless the category is specifically "Income".
            // 2. Spending for a category should sum the *Activity*. 
            //    If Rent = -2175, it effectively "adds" 2175 to the account (Income-like) OR it is an expense represented negatively.
            //    If the user sees "-$2,175.23" on the dashboard for "Spent (Month)", that means the SUM is negative.
            //    The screenshot shows "Spent (Month) -$2,175.23".
            //    It should be Positive.

            const spent = catTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)

            // Determine Budgeted Amount
            // Priority: CategoryBudget.budgetedAmount > Category.monthlyBudget
            const catBudget = categoryBudgets.find(cb => cb.categoryId === cat.id)
            let budgeted = catBudget ? Number(catBudget.budgetedAmount) : Number(cat.monthlyBudget)

            // Determine Carry-Over
            let carryOver = 0
            if (cat.carryOver) {
                // If we have a persisted carryOverAmount, use it? 
                // Or calculate dynamic? 
                // Plan says: "fetch previous month's budget/spent"
                // Let's check if we have a stored value first (snapshot)
                if (catBudget && Number(catBudget.carryOverAmount) !== 0) {
                    carryOver = Number(catBudget.carryOverAmount)
                } else {
                    // Calculate dynamic from previous month
                    carryOver = await this.calculateCarryOver(userId, cat.id, start)
                }
            }

            return {
                ...cat,
                budgeted,
                spent,
                carryOver,
                remaining: budgeted + carryOver - spent,
                progress: budgeted > 0 ? (spent / (budgeted + carryOver)) * 100 : 0
            }
        }))

        // 5. Calculate Overall Income/Expense
        // Income = Sum of negative transactions (money in) that are NOT categorized.
        // Categorized transactions are tracked in 'spent' regardless of sign (expenses).

        const incomeTransactions = transactions.filter(t => Number(t.amount) < 0 && !t.categoryId)
        const income = Math.abs(incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0))

        // Total Budgeted
        const totalBudgeted = categoryStats.reduce((sum, c) => sum + c.budgeted, 0)

        // Total Spent (only counts positive amounts assigned to budget categories? Or all?)
        // Usually "Total Spent" matches the sum of category spending.
        // What about Uncategorized?
        const uncategorizedTransactions = transactions.filter(t => !t.categoryId)
        const uncategorizedSpent = uncategorizedTransactions
            .filter(t => Number(t.amount) > 0)
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const totalSpent = categoryStats.reduce((sum, c) => sum + c.spent, 0) + uncategorizedSpent

        // Total Remaining
        // Is it (TotalBudget - TotalSpent)? 
        // Or Sum of (CategoryRemaining)?
        // Usually Sum of CategoryRemaining is safer. 
        // Uncategorized reduces "Left to Spend" from a global pool? 
        // For this dashboard, let's sum category remaining. 
        // But Uncategorized spending should allow user to see it.
        // Let's add an "Uncategorized" pseudo-category if > 0?
        // For now, stick to defined categories + global summary.

        // "Left to Spend" = Sum of (Category Budget + CarryOver - Spent)
        // If a category is overspent, does it subtract from others? 
        // "Left to Spend" usually implies available funds.
        // If I overspend Groceries by $100, and have $100 left in Gas, do I have $0 left?
        // Yes, usually.

        const totalCarryOver = categoryStats.reduce((sum, c) => sum + c.carryOver, 0)
        const totalRemaining = (totalBudgeted + totalCarryOver) - totalSpent

        return {
            overall: {
                income,
                budgeted: totalBudgeted,
                spent: totalSpent,
                remaining: totalRemaining,
                progress: (totalBudgeted + totalCarryOver) > 0 ? (totalSpent / (totalBudgeted + totalCarryOver)) * 100 : 0
            },
            categories: categoryStats,
            transactionsCount: transactions.length
        }
    }

    private async calculateCarryOver(userId: string, categoryId: string, currentMonth: Date): Promise<number> {
        const prevMonthStr = subMonths(currentMonth, 1)
        const startPrev = startOfMonth(prevMonthStr)
        const endPrev = endOfMonth(prevMonthStr)

        // Get previous month's budget snapshot
        const prevBudgetSnapshot = await categoryBudgetRepository.findByCategoryId(categoryId, startPrev)

        // If no snapshot, use category default
        let prevBudgeted = 0
        if (prevBudgetSnapshot) {
            prevBudgeted = Number(prevBudgetSnapshot.budgetedAmount) + Number(prevBudgetSnapshot.carryOverAmount)
        } else {
            // Fetch category to get default
            const cat = await categoryRepository.findById(categoryId, userId)
            if (cat) prevBudgeted = Number(cat.monthlyBudget)
        }

        // Get previous month's spending
        const { transactions } = await transactionRepository.findMany({
            userId,
            startDate: startPrev,
            endDate: endPrev,
            categoryId,
            limit: 10000
        })
        const prevSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0)

        const remaining = prevBudgeted - prevSpent
        return remaining > 0 ? remaining : 0 // Only positive roll-over? Usually yes.
    }
}

export const budgetService = new BudgetService()

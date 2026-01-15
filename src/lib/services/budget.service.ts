import { startOfMonth, endOfMonth, subMonths } from "date-fns"
import { prisma } from "@/lib/db/client"
import { categoryRepository, categoryBudgetRepository } from "@/lib/db/repositories/budgets"

export class BudgetService {
    async getBudgetOverview(userId: string, date: Date) {
        const start = startOfMonth(date)
        const end = endOfMonth(date)

        // 1. Fetch Categories
        const categories = await categoryRepository.findMany(userId)

        // 2. Fetch Transactions for this month (Direct Prisma call to ensure isTransfer is present)
        const allTransactions = await prisma.transaction.findMany({
            where: {
                account: { userId },
                date: { gte: start, lte: end }
            },
            include: {
                category: { select: { id: true, name: true, color: true, icon: true } },
                account: { select: { id: true, name: true } },
            },
            orderBy: { date: 'desc' }
        })

        const transactions = allTransactions.filter(t => !t.isTransfer)

        // 3. Fetch CategoryBudgets for this month (snapshots/overrides)
        const categoryBudgets = await categoryBudgetRepository.findForMonth(userId, start)

        // 4. Calculate stats per category
        const categoryStats = await Promise.all(categories.map(async (cat) => {
            const catTransactions = transactions.filter(t => t.categoryId === cat.id)

            // Standardized Convention: Negative = Spent/Expense, Positive = Income.
            // spent = total activity for the category, inverted to show as positive cost.
            const spent = -catTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

            // Determine Budgeted Amount
            const catBudget = categoryBudgets.find(cb => cb.categoryId === cat.id)
            let budgeted = catBudget ? Number(catBudget.budgetedAmount) : Number(cat.monthlyBudget)

            // Determine Carry-Over
            let carryOver = 0
            if (cat.carryOver) {
                if (catBudget && Number(catBudget.carryOverAmount) !== 0) {
                    carryOver = Number(catBudget.carryOverAmount)
                } else {
                    carryOver = await BudgetService.calculateCarryOver(userId, cat.id, start)
                }
            }

            return {
                ...cat,
                budgeted,
                spent,
                carryOver,
                remaining: budgeted + carryOver - spent,
                progress: (budgeted + carryOver) > 0 ? (spent / (budgeted + carryOver)) * 100 : 0
            }
        }))

        // 5. Calculate Overall Income/Expense
        // Income = Uncategorized positive transactions + Net-positive categories
        const uncategorizedIncome = transactions
            .filter(t => !t.categoryId && Number(t.amount) > 0)
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const categorizedIncome = categoryStats
            .filter(c => c.spent < 0)
            .reduce((sum, c) => sum - c.spent, 0)

        const totalIncome = uncategorizedIncome + categorizedIncome

        // Budgeted
        const totalBudgeted = categoryStats.reduce((sum, c) => sum + c.budgeted, 0)

        // Spent = Uncategorized negative transactions + Net-negative categories
        const uncategorizedSpent = -transactions
            .filter(t => !t.categoryId && Number(t.amount) < 0)
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const categorizedSpent = categoryStats
            .filter(c => c.spent > 0)
            .reduce((sum, c) => sum + c.spent, 0)

        const totalSpent = categorizedSpent + uncategorizedSpent

        const totalCarryOver = categoryStats.reduce((sum, c) => sum + c.carryOver, 0)
        const totalRemaining = (totalBudgeted + totalCarryOver) - totalSpent

        return {
            overall: {
                income: totalIncome,
                budgeted: totalBudgeted,
                spent: totalSpent,
                remaining: totalRemaining,
                progress: (totalBudgeted + totalCarryOver) > 0 ? (totalSpent / (totalBudgeted + totalCarryOver)) * 100 : 0
            },
            categories: categoryStats,
            transactionsCount: transactions.length
        }
    }

    static async calculateCarryOver(userId: string, categoryId: string, currentMonth: Date): Promise<number> {
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
            const cat = await prisma.category.findUnique({ where: { id: categoryId } })
            if (cat) prevBudgeted = Number(cat.monthlyBudget)
        }

        // Get previous month's spending (Direct Prisma call)
        const transactions = await prisma.transaction.findMany({
            where: {
                account: { userId },
                date: { gte: startPrev, lte: endPrev },
                categoryId
            }
        })
        const prevSpent = -transactions.filter(t => !t.isTransfer).reduce((sum, t) => sum + Number(t.amount), 0)

        const remaining = prevBudgeted - prevSpent
        return remaining > 0 ? remaining : 0 // Only positive roll-over
    }

    static async processCarryOver(date: Date) {
        const startOfCurrentMonth = startOfMonth(date)
        const categories = await prisma.category.findMany({
            where: { carryOver: true }
        })

        const results = []
        for (const cat of categories) {
            const carryOverAmount = await this.calculateCarryOver(cat.userId, cat.id, startOfCurrentMonth)

            // Fetch existing budget for current month if any
            const existing = await categoryBudgetRepository.findByCategoryId(cat.id, startOfCurrentMonth)

            const budget = await categoryBudgetRepository.upsert({
                categoryId: cat.id,
                month: startOfCurrentMonth,
                budgetedAmount: existing ? existing.budgetedAmount : cat.monthlyBudget,
                carryOverAmount: carryOverAmount,
                actualSpent: existing ? existing.actualSpent : 0
            })
            results.push(budget)
        }
        return results
    }
}

export const budgetService = new BudgetService()

import { startOfMonth, endOfMonth, subMonths } from "date-fns"
import { prisma } from "@/lib/db/client"
import { categoryBudgetRepository } from "@/lib/db/repositories/budgets"
import { CategoryBudget, Category } from "@prisma/client"

export class BudgetService {
    async getBudgetOverview(userId: string, date: Date, mode: 'personal' | 'household' = 'personal') {
        const start = startOfMonth(date)
        const end = endOfMonth(date)

        // 0. Identify Users
        let userIds = [userId]
        if (mode === 'household') {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { linkedUserId: true, linkStatus: true }
            })
            if (user?.linkedUserId && user.linkStatus === 'LINKED') {
                userIds.push(user.linkedUserId)
            }
        }

        // 1. Fetch Categories for all relevant users
        const categories = await prisma.category.findMany({
            where: { userId: { in: userIds } }
        })

        // 2. Fetch Transactions for this month for all relevant users
        const allTransactions = await prisma.transaction.findMany({
            where: {
                account: { userId: { in: userIds } },
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
        const categoryBudgets = await categoryBudgetRepository.findForUsersInMonth(userIds, start)

        // 4. Calculate stats per category (consolidate by name if household)
        // Group categories by name to handle household consolidation
        const groupedCategoryNames = Array.from(new Set(categories.map(c => c.name)))

        const categoryStats = await Promise.all(groupedCategoryNames.map(async (name) => {
            const sameNameCats = categories.filter(c => c.name === name)
            const catIds = sameNameCats.map(c => c.id)
            const catTransactions = transactions.filter(t => t.categoryId && catIds.includes(t.categoryId))

            // Standardized Convention: Negative = Spent/Expense, Positive = Income.
            const spent = -catTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

            // Determine Budgeted Amount (Sum of all same-named categories' budgets)
            let budgeted = 0
            for (const cat of sameNameCats) {
                const catBudget = categoryBudgets.find((cb: CategoryBudget & { category: Category }) => cb.categoryId === cat.id)
                budgeted += catBudget ? Number(catBudget.budgetedAmount) : Number(cat.monthlyBudget)
            }

            // Determine Carry-Over
            let carryOver = 0
            for (const cat of sameNameCats) {
                if (cat.carryOver) {
                    const catBudget = categoryBudgets.find((cb: CategoryBudget & { category: Category }) => cb.categoryId === cat.id)
                    if (catBudget && Number(catBudget.carryOverAmount) !== 0) {
                        carryOver += Number(catBudget.carryOverAmount)
                    } else {
                        carryOver += await BudgetService.calculateCarryOver(cat.userId, cat.id, start)
                    }
                }
            }

            // Use the first category's style for the group
            const firstCat = sameNameCats[0]

            return {
                id: firstCat.id,
                name: firstCat.name,
                color: firstCat.color,
                icon: firstCat.icon,
                budgeted,
                spent,
                carryOver,
                remaining: budgeted + carryOver - spent,
                progress: (budgeted + carryOver) > 0 ? (spent / (budgeted + carryOver)) * 100 : 0
            }
        }))

        // 5. Calculate Overall Income/Expense
        const uncategorizedIncome = transactions
            .filter(t => !t.categoryId && Number(t.amount) > 0)
            .reduce((sum, t) => sum + Number(t.amount), 0)

        const categorizedIncome = categoryStats
            .filter(c => c.spent < 0)
            .reduce((sum, c) => sum - c.spent, 0)

        const totalIncome = uncategorizedIncome + categorizedIncome
        const totalBudgeted = categoryStats.reduce((sum, c) => sum + c.budgeted, 0)

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
            categories: categoryStats.sort((a, b) => b.spent - a.spent),
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

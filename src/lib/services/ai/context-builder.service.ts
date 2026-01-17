import { prisma } from "@/lib/db/client";
import { NetWorthService } from "../net-worth.service";
import { investmentService } from "../investment.service";
import { budgetService } from "../budget.service";
import { format } from "date-fns";

export class ContextBuilderService {
    /**
     * Builds a high-level summary of the user's financial status.
     * Target size: ~500 tokens
     */
    async buildSummaryContext(userId: string): Promise<string> {
        const [netWorth, investmentOverview, budgetOverview] = await Promise.all([
            NetWorthService.calculateCurrentNetWorth(userId),
            investmentService.getOverview(userId),
            budgetService.getBudgetOverview(userId, new Date()), // Current month
        ]);

        const sections = [
            "## Financial Summary",
            `Net Worth: $${netWorth.netWorth.toFixed(2)}`,
            `Total Assets: $${netWorth.totalAssets.toFixed(2)}`,
            `Total Liabilities: $${netWorth.totalLiabilities.toFixed(2)}`,
            "",
            "## Investment Overview",
            `Total Portfolio Value: $${investmentOverview.totalValue.toFixed(2)}`,
            `Total Gain/Loss: $${investmentOverview.totalGainLoss.toFixed(2)} (${investmentOverview.totalGainLossPercent.toFixed(2)}%)`,
            `Today's Change: $${investmentOverview.totalDayChange.toFixed(2)} (${investmentOverview.totalDayChangePercent.toFixed(2)}%)`,
            "",
            "## Budget Overview (Current Month)",
            `Total Budgeted: $${budgetOverview.overall.budgeted.toFixed(2)}`,
            `Total Spent: $${budgetOverview.overall.spent.toFixed(2)}`,
            `Remaining: $${budgetOverview.overall.remaining.toFixed(2)}`,
        ];

        return sections.join("\n");
    }

    /**
     * Builds a standard detailed context of the user's finances.
     * Target size: ~2,000 tokens
     */
    async buildStandardContext(userId: string): Promise<string> {
        const [summary, accounts, categories] = await Promise.all([
            this.buildSummaryContext(userId),
            prisma.account.findMany({ where: { userId, isActive: true } }),
            prisma.category.findMany({ where: { userId } }),
        ]);

        const accountSection = [
            "## Accounts",
            ...accounts.map(acc => `- ${acc.name} (${acc.type}): $${acc.currentBalance.toFixed(2)}`)
        ].join("\n");

        const budgetSection = [
            "## Monthly Budget by Category",
            ...categories
                .filter(c => Number(c.monthlyBudget) > 0)
                .map(c => `- ${c.name}: $${Number(c.monthlyBudget).toFixed(2)} (Monthly)`)
        ].join("\n");

        return [summary, "", accountSection, "", budgetSection].join("\n");
    }

    /**
     * Builds an extremely detailed context for deep analysis.
     * Target size: ~5,000 tokens
     */
    async buildDetailedContext(userId: string): Promise<string> {
        const [standard, investments, transactions] = await Promise.all([
            this.buildStandardContext(userId),
            investmentService.getOverview(userId),
            prisma.transaction.findMany({
                where: { account: { userId } },
                orderBy: { date: 'desc' },
                take: 50,
                include: { category: true, account: true }
            })
        ]);

        const investmentSection = [
            "## Detailed Investments",
            ...investments.assetDetails.map(inv =>
                `- ${inv.name} (${inv.symbol || 'N/A'}): ${inv.quantity} @ $${inv.currentPrice.toFixed(2)} = $${inv.currentValue.toFixed(2)} (Profit/Loss: $${inv.dayChange.toFixed(2)})`
            )
        ].join("\n");

        const transactionSection = [
            "## Recent Transactions",
            ...transactions.map(t =>
                `- ${format(t.date, 'yyyy-MM-dd')}: ${t.description} | $${Number(t.amount).toFixed(2)} | ${t.category?.name || 'Uncategorized'} (${t.account.name})`
            )
        ].join("\n");

        return [standard, "", investmentSection, "", transactionSection].join("\n");
    }

    /**
     * Builds context specific to transactions
     */
    async buildTransactionContext(userId: string, limit: number = 50): Promise<string> {
        const transactions = await prisma.transaction.findMany({
            where: { account: { userId } },
            orderBy: { date: 'desc' },
            take: limit,
            include: { category: true, account: true }
        });

        const sections = [
            "## Transaction History",
            ...transactions.map(t =>
                `- ${format(t.date, 'yyyy-MM-dd')}: ${t.description} | $${Number(t.amount).toFixed(2)} | ${t.category?.name || 'Uncategorized'} (${t.account.name})`
            )
        ];

        return sections.join("\n");
    }

    /**
     * Helper to estimate token count
     */
    estimateTokens(text: string): number {
        return Math.ceil(text.length / 3.5);
    }
}

export const contextBuilderService = new ContextBuilderService();

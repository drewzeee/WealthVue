import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contextBuilderService } from '../context-builder.service';
import { NetWorthService } from '../../net-worth.service';
import { investmentService } from '../../investment.service';
import { budgetService } from '../../budget.service';
import { prisma } from '@/lib/db/client';
import { Decimal } from '@prisma/client/runtime/library';

vi.mock('../../net-worth.service');
vi.mock('../../investment.service');
vi.mock('../../budget.service');
vi.mock('@/lib/db/client', () => ({
    prisma: {
        account: { findMany: vi.fn() },
        category: { findMany: vi.fn() },
        transaction: { findMany: vi.fn() },
    },
}));

describe('ContextBuilderService', () => {
    const userId = 'user-1';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('buildSummaryContext', () => {
        it('should build a summary with core financial metrics', async () => {
            (NetWorthService.calculateCurrentNetWorth as any).mockResolvedValue({
                netWorth: new Decimal(10000),
                totalAssets: new Decimal(15000),
                totalLiabilities: new Decimal(5000),
            });

            (investmentService.getOverview as any).mockResolvedValue({
                totalValue: 5000,
                totalGainLoss: 500,
                totalGainLossPercent: 10,
                totalDayChange: 50,
                totalDayChangePercent: 1,
            });

            (budgetService.getBudgetOverview as any).mockResolvedValue({
                overall: {
                    budgeted: 2000,
                    spent: 1500,
                    remaining: 500,
                }
            });

            const context = await contextBuilderService.buildSummaryContext(userId);

            expect(context).toContain('Net Worth: $10000.00');
            expect(context).toContain('Total Portfolio Value: $5000.00');
            expect(context).toContain('Total Spent: $1500.00');
        });
    });

    describe('estimateTokens', () => {
        it('should provide a rough token estimate', () => {
            const text = 'Hello world'; // 11 chars
            const estimate = contextBuilderService.estimateTokens(text);
            expect(estimate).toBeGreaterThan(0);
            expect(estimate).toBe(Math.ceil(11 / 3.5));
        });
    });
});

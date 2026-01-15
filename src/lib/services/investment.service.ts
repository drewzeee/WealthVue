import { prisma } from "@/lib/db/client"
import { investmentRepository } from "@/lib/db/repositories/investments"

export class InvestmentService {
    async getOverview(userId: string) {
        // 1. Get current holdings (fetch enough to cover most portfolios)
        const { investments } = await investmentRepository.findMany({ userId, limit: 1000 });
        
        // 2. Aggregate totals and allocation
        let totalValue = 0;
        let totalCostBasis = 0;
        const allocationMap = new Map<string, number>();

        investments.forEach(inv => {
            const val = Number(inv.currentValue || 0);
            totalValue += val;
            totalCostBasis += Number(inv.costBasis || 0);
            
            const currentClassValue = allocationMap.get(inv.assetClass) || 0;
            allocationMap.set(inv.assetClass, currentClassValue + val);
        });

        const totalGainLoss = totalValue - totalCostBasis;
        const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

        const allocation = Array.from(allocationMap.entries()).map(([name, value]) => ({
            name,
            value,
            percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
        })).sort((a, b) => b.value - a.value); // Sort by value desc

        // 3. Get History (from NetWorthSnapshot)
        // We rely on the NetWorthSnapshot job to populate 'investmentAssets'
        const history = await prisma.netWorthSnapshot.findMany({
            where: { userId },
            orderBy: { date: 'asc' },
            take: 365, // Last year
            select: { date: true, allocation: true }
        });
        
        const chartData = history.map(h => {
            const alloc = h.allocation as any; 
            return {
                date: h.date.toISOString().split('T')[0],
                value: Number(alloc?.investmentAssets || 0)
            };
        });

        return {
            totalValue,
            totalCostBasis,
            totalGainLoss,
            totalGainLossPercent,
            allocation,
            history: chartData
        };
    }
}

export const investmentService = new InvestmentService();

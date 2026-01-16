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
        const cryptoAllocationMap = new Map<string, { name: string; value: number }>();
        const stockAllocationMap = new Map<string, { name: string; value: number }>();

        investments.forEach(inv => {
            const val = Number(inv.currentValue || 0);
            totalValue += val;
            totalCostBasis += Number(inv.costBasis || 0);

            // General allocation (by asset class)
            const currentClassValue = allocationMap.get(inv.assetClass) || 0;
            allocationMap.set(inv.assetClass, currentClassValue + val);

            // Crypto allocation (by coin)
            if (inv.assetClass === 'CRYPTO') {
                const symbol = inv.symbol || 'OTHER';
                const current = cryptoAllocationMap.get(symbol) || { name: inv.name, value: 0 };
                cryptoAllocationMap.set(symbol, { ...current, value: current.value + val });
            }

            // Stock/ETF allocation (by ticker)
            if (inv.assetClass === 'STOCK' || inv.assetClass === 'ETF') {
                const symbol = inv.symbol || 'OTHER';
                const current = stockAllocationMap.get(symbol) || { name: inv.name, value: 0 };
                stockAllocationMap.set(symbol, { ...current, value: current.value + val });
            }
        });

        const totalGainLoss = totalValue - totalCostBasis;
        const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

        const allocation = Array.from(allocationMap.entries()).map(([name, value]) => ({
            name,
            value,
            percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
        })).sort((a, b) => b.value - a.value);

        const totalCryptoValue = Array.from(cryptoAllocationMap.values()).reduce((sum, d) => sum + d.value, 0);
        const totalStockValue = Array.from(stockAllocationMap.values()).reduce((sum, d) => sum + d.value, 0);

        const cryptoAllocation = Array.from(cryptoAllocationMap.entries()).map(([symbol, data]) => ({
            symbol,
            name: data.name,
            value: data.value,
            percentage: totalCryptoValue > 0 ? (data.value / totalCryptoValue) * 100 : 0
        })).sort((a, b) => b.value - a.value);

        const stockAllocation = Array.from(stockAllocationMap.entries()).map(([symbol, data]) => ({
            symbol,
            name: data.name,
            value: data.value,
            percentage: totalStockValue > 0 ? (data.value / totalStockValue) * 100 : 0
        })).sort((a, b) => b.value - a.value);

        // 3. Get History (from NetWorthSnapshot)
        const history = await prisma.netWorthSnapshot.findMany({
            where: { userId },
            orderBy: { date: 'asc' },
            take: 365,
            select: { date: true, allocation: true }
        });

        const chartData = history.map(h => {
            const alloc = h.allocation as any;
            return {
                date: h.date.toISOString().split('T')[0],
                value: Number(alloc?.investmentAssets || 0)
            };
        });

        // 4. Aggregate Asset Details by symbol
        const assetMap = new Map<string, any>();
        investments.forEach(inv => {
            const symbol = inv.symbol || `manual-${inv.id}`;
            const existing = assetMap.get(symbol);

            const perUnitChange = Number(inv.dayChange || 0);
            const percentChange = Number(inv.dayChangePercent || 0);
            const currentValue = Number(inv.currentValue || 0);
            const quantity = Number(inv.quantity);

            // Calculate total dollar change for this record
            let totalRecordDayChange = quantity * perUnitChange;

            // If absolute change is zero but percent isn't (common for Crypto), derive it
            if (totalRecordDayChange === 0 && percentChange !== 0) {
                totalRecordDayChange = currentValue * (percentChange / 100);
            }

            if (existing) {
                existing.quantity += quantity;
                existing.currentValue += currentValue;
                existing.dayChange += totalRecordDayChange;
                // Percent remains the same if it's the same symbol, otherwise take the non-zero one
                if (existing.dayChangePercent === 0) existing.dayChangePercent = percentChange;
            } else {
                assetMap.set(symbol, {
                    id: inv.id,
                    symbol: inv.symbol,
                    name: inv.name,
                    assetClass: inv.assetClass,
                    quantity: quantity,
                    currentPrice: Number(inv.currentPrice || 0),
                    currentValue: currentValue,
                    dayChange: totalRecordDayChange,
                    dayChangePercent: percentChange,
                    lastPriceUpdate: inv.lastPriceUpdate?.toISOString() || null
                });
            }
        });

        return {
            totalValue,
            totalCostBasis,
            totalGainLoss,
            totalGainLossPercent,
            allocation,
            history: chartData,
            cryptoAllocation,
            stockAllocation,
            assetDetails: Array.from(assetMap.values())
        };
    }
}

export const investmentService = new InvestmentService();

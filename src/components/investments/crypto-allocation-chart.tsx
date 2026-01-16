"use client"

import { AllocationChart } from "./allocation-chart"
import { InvestmentOverviewData } from "./investment-overview"

interface CryptoAllocationChartProps {
    data: InvestmentOverviewData['cryptoAllocation']
}

export function CryptoAllocationChart({ data }: CryptoAllocationChartProps) {
    // Map symbols to readable labels if needed, or just use symbols
    const chartData = data.map(d => ({
        name: d.symbol, // This matches the expected 'name' in AllocationChart
        value: d.value,
        percentage: d.percentage
    }))

    return (
        <div className="h-full">
            <AllocationChart data={chartData as any} />
        </div>
    )
}

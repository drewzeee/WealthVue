"use client"

import { AllocationChart } from "./allocation-chart"
import { InvestmentOverviewData } from "./investment-overview"

interface StockAllocationChartProps {
    data: InvestmentOverviewData['stockAllocation']
}

export function StockAllocationChart({ data }: StockAllocationChartProps) {
    const chartData = data.map(d => ({
        name: d.symbol,
        value: d.value,
        percentage: d.percentage
    }))

    return (
        <div className="h-full">
            <AllocationChart data={chartData as any} />
        </div>
    )
}

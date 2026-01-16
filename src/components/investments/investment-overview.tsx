"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowDown, ArrowUp, DollarSign, PieChart as PieChartIcon, TrendingUp, Wallet } from "lucide-react"

import { GlassCard } from "@/components/ui/glass-card"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AllocationChart } from "./allocation-chart"
import { PortfolioHistoryChart } from "./portfolio-history-chart"
import { formatCurrency } from "@/lib/utils"

interface InvestmentOverviewData {
    totalValue: number
    totalCostBasis: number
    totalGainLoss: number
    totalGainLossPercent: number
    allocation: { name: string; value: number; percentage: number }[]
    history: { date: string; value: number }[]
}

export function InvestmentOverview() {
    const { data, isLoading } = useQuery<{ success: boolean; data: InvestmentOverviewData }>({
        queryKey: ["investment-overview"],
        queryFn: async () => {
            const res = await fetch("/api/investments/overview")
            return res.json()
        }
    })

    const overview = data?.data

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="h-[400px] bg-muted rounded-xl" />
                <div className="h-[400px] bg-muted rounded-xl" />
            </div>
        </div>
    }

    if (!overview) return null

    const isPositive = overview.totalGainLoss >= 0

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <GlassCard glowColor="blue" className="p-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{formatCurrency(overview.totalValue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Current portfolio value
                        </p>
                    </CardContent>
                </GlassCard>
                <GlassCard glowColor={isPositive ? "emerald" : "rose"} className="p-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold">Total Gain/Loss</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {isPositive ? "+" : ""}{formatCurrency(overview.totalGainLoss)}
                        </div>
                        <p className={`text-xs flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {isPositive ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                            {overview.totalGainLossPercent.toFixed(2)}% all time
                        </p>
                    </CardContent>
                </GlassCard>
                <GlassCard glowColor="amber" className="p-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold">Cost Basis</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{formatCurrency(overview.totalCostBasis)}</div>
                        <p className="text-xs text-muted-foreground">
                            Total invested amount
                        </p>
                    </CardContent>
                </GlassCard>
                <GlassCard glowColor="primary" className="p-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold">Asset Count</CardTitle>
                        <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">{overview.allocation.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active asset classes
                        </p>
                    </CardContent>
                </GlassCard>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <GlassCard glowColor="primary" className="p-0">
                    <CardHeader>
                        <CardTitle>Portfolio History</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <PortfolioHistoryChart data={overview.history} />
                    </CardContent>
                </GlassCard>
                <GlassCard glowColor="blue" className="p-0">
                    <CardHeader>
                        <CardTitle>Allocation</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <AllocationChart data={overview.allocation} />
                    </CardContent>
                </GlassCard>
            </div>
        </div>
    )
}

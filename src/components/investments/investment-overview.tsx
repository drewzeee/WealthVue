"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowDown, ArrowUp, Clock, DollarSign, PieChart as PieChartIcon, TrendingUp } from "lucide-react"
import { AssetClass } from "@prisma/client"

import { GlassCard } from "@/components/ui/glass-card"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AllocationChart } from "./allocation-chart"
import { PortfolioHistoryChart } from "./portfolio-history-chart"
import { formatCurrency } from "@/lib/utils"

import { CryptoAllocationChart } from "./crypto-allocation-chart"
import { StockAllocationChart } from "./stock-allocation-chart"
import { AssetDailyChangeCard } from "./asset-daily-change-card"
import { useState } from "react"
import { TimeRange, TimeSelector } from "@/components/dashboard/time-selector"

export interface InvestmentOverviewData {
    totalValue: number
    totalCostBasis: number
    totalGainLoss: number
    totalGainLossPercent: number
    allocation: { name: string; value: number; percentage: number }[]
    history: { date: string; value: number }[]
    cryptoAllocation: { symbol: string; name: string; value: number; percentage: number }[]
    stockAllocation: { symbol: string; name: string; value: number; percentage: number }[]
    assetDetails: {
        id: string
        symbol: string | null
        name: string
        assetClass: AssetClass
        quantity: number
        currentPrice: number
        currentValue: number
        dayChange: number
        dayChangePercent: number
        lastPriceUpdate: string | null
    }[]
    totalDayChange: number
    totalDayChangePercent: number
    biggestMover: {
        symbol: string | null
        name: string
        dayChangePercent: number
        currentPrice: number
    } | null
}

export function InvestmentOverview() {
    const [range, setRange] = useState<TimeRange>("ALL")

    const { data, isLoading } = useQuery<{ success: boolean; data: InvestmentOverviewData }>({
        queryKey: ["investment-overview", range],
        queryFn: async () => {
            const res = await fetch(`/api/investments/overview?range=${range}`)
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
        <div className="space-y-8">
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
                <GlassCard glowColor={overview.totalDayChange >= 0 ? "emerald" : "rose"} className="p-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold">Total Daily Change</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-semibold ${overview.totalDayChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {overview.totalDayChange >= 0 ? "+" : ""}{formatCurrency(overview.totalDayChange)}
                        </div>
                        <p className={`text-xs flex items-center ${overview.totalDayChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {overview.totalDayChange >= 0 ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
                            {overview.totalDayChangePercent.toFixed(2)}% today
                        </p>
                    </CardContent>
                </GlassCard>
                <GlassCard glowColor="primary" className="p-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold">Biggest Mover</CardTitle>
                        <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {overview.biggestMover ? (
                            <>
                                <div className="text-2xl font-semibold flex items-center gap-2">
                                    {overview.biggestMover.symbol}
                                    <span className={`text-sm flex items-center ${overview.biggestMover.dayChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {overview.biggestMover.dayChangePercent >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                        {Math.abs(overview.biggestMover.dayChangePercent).toFixed(2)}%
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                    {overview.biggestMover.name}
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-2xl font-semibold">--</div>
                                <p className="text-xs text-muted-foreground">
                                    No price data
                                </p>
                            </>
                        )}
                    </CardContent>
                </GlassCard>
            </div>

            {/* Asset Class Allocation & Portfolio History */}
            <div className="grid gap-6 md:grid-cols-2">
                <GlassCard glowColor="primary" className="p-0 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Portfolio History</CardTitle>
                        <TimeSelector selected={range} onChange={setRange} />
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <PortfolioHistoryChart data={overview.history} />
                    </CardContent>
                </GlassCard>
                <GlassCard glowColor="blue" className="p-0 overflow-hidden">
                    <CardHeader>
                        <CardTitle>Asset Class Allocation</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <AllocationChart data={overview.allocation} />
                    </CardContent>
                </GlassCard>
            </div>

            {/* Specific Allocations (Crypto & Stocks) */}
            <div className="grid gap-6 md:grid-cols-2">
                {overview.cryptoAllocation.length > 0 && (
                    <GlassCard glowColor="primary" className="p-0 overflow-hidden">
                        <CardHeader>
                            <CardTitle>Crypto Allocation</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <CryptoAllocationChart data={overview.cryptoAllocation} />
                        </CardContent>
                    </GlassCard>
                )}
                {overview.stockAllocation.length > 0 && (
                    <GlassCard glowColor="blue" className="p-0 overflow-hidden">
                        <CardHeader>
                            <CardTitle>Stock/ETF Allocation</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <StockAllocationChart data={overview.stockAllocation} />
                        </CardContent>
                    </GlassCard>
                )}
            </div>

            {/* Daily Asset Change Cards */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold tracking-tight">Market Movers</h3>
                    <p className="text-xs text-muted-foreground">Daily performance of individual assets</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    {overview.assetDetails
                        .filter(asset => asset.symbol) // Only show assets with symbols in movers grid
                        .sort((a, b) => Math.abs(b.dayChangePercent) - Math.abs(a.dayChangePercent)) // Top movers first
                        .map(asset => (
                            <AssetDailyChangeCard key={asset.id} asset={asset} />
                        ))}
                    {overview.assetDetails.filter(asset => asset.symbol).length === 0 && (
                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                            <Clock className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No assets with real-time tracking found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

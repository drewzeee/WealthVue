'use client'

import { useState, useEffect } from 'react'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GlassCard } from '@/components/ui/glass-card'
import { TimeSelector, TimeRange } from './time-selector'
import { NetWorthChart } from './net-worth-chart'
import { AllocationChart } from './allocation-chart'
import { MetricCards } from './metric-cards'
import { useSearchParams } from 'next/navigation'

interface DashboardClientProps {
    initialBreakdown: {
        accountAssets: number
        accountLiabilities: number
        investmentAssets: number
        manualAssets: number
        manualLiabilities: number
        investmentBreakdown: {
            stocks: number
            etfs: number
            crypto: number
            other: number
        }
    } | null
    initialNetWorth: number
}

export function DashboardClient({
    initialBreakdown,
    initialNetWorth,
}: DashboardClientProps) {
    const searchParams = useSearchParams()
    const viewMode = (searchParams.get('mode') as 'personal' | 'household') || 'personal'
    const [timeRange, setTimeRange] = useState<TimeRange>('1M')
    const [breakdown, setBreakdown] = useState(initialBreakdown)
    const [netWorth, setNetWorth] = useState(initialNetWorth)

    // Update data when viewMode changes
    useEffect(() => {
        if (viewMode === 'personal') {
            setBreakdown(initialBreakdown)
            setNetWorth(initialNetWorth)
            return
        }

        async function fetchHouseholdBreakdown() {
            try {
                const res = await fetch('/api/net-worth?mode=household')
                const result = await res.json()
                if (result.success) {
                    setBreakdown(result.data.breakdown)
                    setNetWorth(result.data.netWorth)
                }
            } catch (error) {
                console.error('Failed to fetch household data:', error)
            }
        }
        fetchHouseholdBreakdown()
    }, [viewMode, initialBreakdown, initialNetWorth])

    const isPositive = netWorth >= 0

    return (
        <div className="space-y-8">
            {/* Net Worth Card */}
            <GlassCard glowColor="primary" className="p-0">
                <CardHeader className="pb-6">
                    <CardDescription className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.15em]">
                        Net Worth
                    </CardDescription>
                    <CardTitle className={`text-5xl font-semibold tracking-tight ${isPositive ? 'text-primary' : 'text-finance-expense'}`}>
                        {netWorth < 0 ? '-' : ''}${Math.abs(netWorth).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })}
                    </CardTitle>
                </CardHeader>
            </GlassCard>

            {/* Metric Cards */}
            <MetricCards mode={viewMode} />

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Net Worth Over Time */}
                <GlassCard glowColor="primary" className="p-0">
                    <CardHeader className="pb-2">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.15em]">Net Worth Over Time</CardTitle>
                                <CardDescription className="text-[10px] font-normal text-muted-foreground/50">Track financial growth</CardDescription>
                            </div>
                            <div className="flex justify-start md:justify-end">
                                <TimeSelector selected={timeRange} onChange={setTimeRange} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <NetWorthChart range={timeRange} mode={viewMode} />
                    </CardContent>
                </GlassCard>

                {/* Asset Allocation */}
                <GlassCard glowColor="blue" className="p-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-[0.15em]">Asset Allocation</CardTitle>
                        <CardDescription className="text-[10px] font-normal text-muted-foreground/50">How wealth is distributed</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <AllocationChart data={breakdown} />
                    </CardContent>
                </GlassCard>
            </div>
        </div>
    )
}

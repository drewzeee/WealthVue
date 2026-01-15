'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TimeSelector, TimeRange } from './time-selector'
import { NetWorthChart } from './net-worth-chart'
import { AllocationChart } from './allocation-chart'
import { MetricCards } from './metric-cards'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, User } from 'lucide-react'

interface DashboardClientProps {
    initialBreakdown: {
        accountAssets: number
        accountLiabilities: number
        investmentAssets: number
        manualAssets: number
        manualLiabilities: number
    } | null
}

export function DashboardClient({ initialBreakdown }: DashboardClientProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('1M')
    const [viewMode, setViewMode] = useState<'personal' | 'household'>('personal')
    const [breakdown, setBreakdown] = useState(initialBreakdown)

    // Update breakdown when viewMode changes
    useEffect(() => {
        if (viewMode === 'personal') {
            setBreakdown(initialBreakdown)
            return
        }

        async function fetchHouseholdBreakdown() {
            try {
                const res = await fetch('/api/net-worth?mode=household')
                const result = await res.json()
                if (result.success) {
                    setBreakdown(result.data.breakdown)
                }
            } catch (error) {
                console.error('Failed to fetch household breakdown:', error)
            }
        }
        fetchHouseholdBreakdown()
    }, [viewMode, initialBreakdown])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        {viewMode === 'personal' ? 'Your personal financial overview' : 'Combined household financial overview'}
                    </p>
                </div>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                    <TabsList>
                        <TabsTrigger value="personal" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Personal
                        </TabsTrigger>
                        <TabsTrigger value="household" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Household
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Metric Cards */}
            <MetricCards mode={viewMode} />

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Net Worth Over Time */}
                <Card className="border-none shadow-card">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">Net Worth Over Time</CardTitle>
                                <CardDescription className="text-[10px] font-medium text-muted-foreground/50">Track financial growth</CardDescription>
                            </div>
                            <TimeSelector selected={timeRange} onChange={setTimeRange} />
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <NetWorthChart range={timeRange} mode={viewMode} />
                    </CardContent>
                </Card>

                {/* Asset Allocation */}
                <Card className="border-none shadow-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">Asset Allocation</CardTitle>
                        <CardDescription className="text-[10px] font-medium text-muted-foreground/50">How wealth is distributed</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <AllocationChart data={breakdown} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

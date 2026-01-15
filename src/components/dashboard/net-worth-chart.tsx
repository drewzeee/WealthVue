'use client'

import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TimeRange } from './time-selector'

interface NetWorthChartProps {
    range: TimeRange
    mode?: 'personal' | 'household'
}

interface ChartDataPoint {
    date: string
    netWorth: number
}

export function NetWorthChart({ range, mode = 'personal' }: NetWorthChartProps) {
    const [data, setData] = useState<ChartDataPoint[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchHistory() {
            setLoading(true)
            try {
                const response = await fetch(`/api/net-worth/history?range=${range}&mode=${mode}`)
                const result = await response.json()

                if (result.success) {
                    const chartData = result.data.map((snapshot: any) => ({
                        date: new Date(snapshot.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                        }),
                        netWorth: snapshot.netWorth,
                    }))
                    setData(chartData)
                }
            } catch (error) {
                console.error('Failed to fetch net worth history:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchHistory()
    }, [range, mode])

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
                Loading chart data...
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                <p>No historical data available yet</p>
                <p className="text-xs mt-2">Snapshots are created daily at midnight</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                    dataKey="date"
                    className="text-xs"
                    stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                    className="text-xs"
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number | undefined) => [`$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Net Worth']}
                />
                <Area
                    type="monotone"
                    dataKey="netWorth"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#netWorthGradient)"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

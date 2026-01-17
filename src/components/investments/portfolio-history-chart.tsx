"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from "@/lib/utils"

interface HistoryPoint {
    date: string
    value: number
}

interface PortfolioHistoryChartProps {
    data: HistoryPoint[]
}

export function PortfolioHistoryChart({ data }: PortfolioHistoryChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                No history data available
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" vertical={false} />
                <XAxis
                    dataKey="date"
                    className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-tighter"
                    stroke="none"
                    tick={{ fill: 'oklch(var(--muted-foreground)/0.5)' }}
                    minTickGap={30}
                    hide
                />
                <YAxis
                    className="text-[10px] font-bold text-muted-foreground/50"
                    stroke="none"
                    tick={{ fill: 'oklch(var(--muted-foreground)/0.5)' }}
                    tickFormatter={(value) => {
                        if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
                        return `$${value}`
                    }}
                    domain={['auto', 'auto']}
                    width={45}
                    tickCount={5}
                    hide
                />
                <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value)), "Portfolio Value"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    contentStyle={{
                        backgroundColor: 'oklch(var(--card))',
                        borderRadius: 'var(--radius)',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}
                    itemStyle={{ color: 'oklch(var(--foreground))' }}
                    labelStyle={{ color: 'oklch(var(--muted-foreground))', fontSize: '10px', fontWeight: 'bold' }}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorValue)"
                    animationDuration={1000}
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

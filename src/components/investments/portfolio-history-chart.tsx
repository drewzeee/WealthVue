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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--muted-foreground)/0.2)" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                    stroke="none"
                    tick={{ fill: 'oklch(var(--muted-foreground)/0.5)', fontSize: 10, fontWeight: 700 }}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    stroke="none"
                    tick={{ fill: 'oklch(var(--muted-foreground)/0.5)', fontSize: 10, fontWeight: 700 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin', 'dataMax']}
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
                    fillOpacity={1}
                    fill="url(#colorValue)"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

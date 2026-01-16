"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { formatCurrency } from "@/lib/utils"
import { ASSET_CLASS_CONFIG, AssetClass } from "@/types/investment"

interface AllocationData {
    name: string // AssetClass
    value: number
    percentage: number
}

interface AllocationChartProps {
    data: AllocationData[]
}

const COLOR_PALETTE = [
    "hsl(195, 100%, 55%)", // Bright Cyan
    "hsl(50, 100%, 55%)",  // Electric Yellow
    "hsl(285, 90%, 60%)",  // Violet
    "hsl(30, 100%, 55%)",  // Orange
    "hsl(270, 100%, 70%)", // Purple
    "hsl(170, 100%, 45%)", // Teal
    "hsl(340, 100%, 65%)", // Pink
    "hsl(210, 100%, 50%)", // Blue
]

export function AllocationChart({ data }: AllocationChartProps) {
    const chartData = data
        .filter(d => d.value > 0)
        .map((d, index) => {
            const config = ASSET_CLASS_CONFIG[d.name as AssetClass]
            return {
                name: config ? config.label : d.name,
                value: d.value,
                color: config ? config.color : COLOR_PALETTE[index % COLOR_PALETTE.length],
                percentage: d.percentage
            }
        })

    if (chartData.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                No allocation data available
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    strokeWidth={0}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{
                        backgroundColor: 'oklch(var(--card))',
                        borderRadius: 'var(--radius)',
                        border: 'none',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}
                    itemStyle={{ color: 'oklch(var(--foreground))' }}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value, entry: any) => (
                        <span className="text-xs font-medium ml-1 text-muted-foreground uppercase">
                            {value} ({entry.payload.percentage.toFixed(1)}%)
                        </span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}

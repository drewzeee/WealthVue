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

export function AllocationChart({ data }: AllocationChartProps) {
    const chartData = data
        .filter(d => d.value > 0)
        .map(d => {
            const config = ASSET_CLASS_CONFIG[d.name as AssetClass] || ASSET_CLASS_CONFIG.OTHER
            return {
                name: config.label,
                value: d.value,
                color: config.color,
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
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderRadius: 'var(--radius)',
                        border: '1px solid hsl(var(--border))',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
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

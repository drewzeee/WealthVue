"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { CategoryBudgetSummary } from "@/types/budget"
import { formatCurrency } from "@/lib/utils"

interface SpendingChartProps {
    categories: CategoryBudgetSummary[]
    remaining: number
}

export function SpendingChart({ categories, remaining }: SpendingChartProps) {
    const data = [
        ...categories.map((c) => ({
            name: c.name,
            value: Number(c.spent),
            color: c.color
        })).filter(d => d.value > 0),
        {
            name: "Remaining",
            value: remaining > 0 ? remaining : 0,
            color: "oklch(var(--finance-remaining))"
        }
    ].filter(d => d.value > 0)

    return (
        <div className="h-[400px] w-full p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                Spending Overview
            </h3>
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
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
                            formatter={(value) => <span className="text-xs font-medium ml-1 text-muted-foreground uppercase">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

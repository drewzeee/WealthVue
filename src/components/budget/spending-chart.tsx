"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { CategoryBudgetSummary } from "@/types/budget"
import { formatCurrency } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"

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
        <GlassCard glowColor="primary" className="h-[400px] w-full p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80 mb-6">
                Spending Overview
            </h3>
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
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
                            content={(props) => {
                                const { payload } = props;
                                return (
                                    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                                        {payload?.map((entry: any, index: number) => (
                                            <li key={`item-${index}`} className="flex items-center gap-1.5">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor: entry.color,
                                                        boxShadow: `0 0 8px ${entry.color}`
                                                    }}
                                                />
                                                <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                                                    {entry.value}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    )
}

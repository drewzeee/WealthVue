"use client"

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts'

const PieAny = Pie as any
import { CategoryBudgetSummary } from "@/types/budget"
import { formatCurrency } from "@/lib/utils"
import { GlassCard } from "@/components/ui/glass-card"

interface SpendingChartProps {
    categories: CategoryBudgetSummary[]
    remaining: number
}

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius - 2}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                style={{ filter: `drop-shadow(0 0 8px ${fill})` }}
                className="transition-all duration-300 ease-in-out"
            />
        </g>
    );
};

export function SpendingChart({ categories, remaining }: SpendingChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

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

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index)
    }

    const onPieLeave = () => {
        setActiveIndex(null)
    }

    return (
        <GlassCard glowColor="primary" className="h-[400px] w-full p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80 mb-6">
                Spending Overview
            </h3>
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <PieAny
                            activeIndex={activeIndex !== null ? activeIndex : undefined}
                            activeShape={renderActiveShape}
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            strokeWidth={0}
                            onMouseEnter={onPieEnter}
                            onMouseLeave={onPieLeave}
                            animationBegin={0}
                            animationDuration={800}
                        >
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    stroke="none"
                                    style={{
                                        opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
                                        transition: 'all 0.3s ease-in-out',
                                        outline: 'none'
                                    }}
                                />
                            ))}
                        </PieAny>
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
                                        {payload?.map((entry: any, index: number) => {
                                            const dataIndex = data.findIndex(d => d.name === entry.value);
                                            return (
                                                <li
                                                    key={`item-${index}`}
                                                    className="flex items-center gap-1.5 cursor-pointer transition-opacity duration-300"
                                                    onMouseEnter={() => setActiveIndex(dataIndex)}
                                                    onMouseLeave={() => setActiveIndex(null)}
                                                    style={{
                                                        opacity: activeIndex === null || activeIndex === dataIndex ? 1 : 0.4
                                                    }}
                                                >
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
                                            );
                                        })}
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

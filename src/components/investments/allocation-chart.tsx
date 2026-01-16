"use client"

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, Sector } from 'recharts'

const PieAny = Pie as any
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

export function AllocationChart({ data }: AllocationChartProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

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

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index)
    }

    const onPieLeave = () => {
        setActiveIndex(null)
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <PieAny
                    activeIndex={activeIndex !== null ? activeIndex : undefined}
                    activeShape={renderActiveShape}
                    data={chartData}
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
                    {chartData.map((entry, index) => (
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
                    iconType="circle"
                    formatter={(value, entry: any) => {
                        const index = chartData.findIndex(d => d.name === value);
                        return (
                            <span
                                className="text-xs font-medium ml-1 text-muted-foreground uppercase transition-opacity duration-300"
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                                style={{
                                    opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
                                    cursor: 'pointer'
                                }}
                            >
                                {value} ({entry.payload.percentage.toFixed(1)}%)
                            </span>
                        )
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}

'use client'

import { useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, Sector } from 'recharts'

const PieAny = Pie as any

interface AllocationData {
    accountAssets: number
    accountLiabilities: number
    investmentAssets: number
    manualAssets: number
    manualLiabilities: number
    investmentBreakdown: {
        stocks: number
        etfs: number
        crypto: number
        other: number
    }
}

interface AllocationChartProps {
    data: AllocationData | null
}

const COLORS = {
    cash: 'hsl(90, 100%, 55%)', // Neon Lime
    stocks: 'hsl(195, 100%, 55%)', // Bright Cyan
    crypto: 'hsl(270, 100%, 70%)', // Glowing Violet
    etfs: 'hsl(50, 100%, 55%)', // Electric Yellow
    other: 'hsl(340, 100%, 65%)', // Neon Pink
    realEstate: 'hsl(220, 15%, 40%)', // Neutral Grey
}

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
        <g>
            <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
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

    if (!data) {
        return (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
                Loading allocation data...
            </div>
        )
    }

    // Group into meaningful categories
    const chartData = [
        {
            name: 'Cash',
            value: data.accountAssets,
            color: COLORS.cash,
        },
        {
            name: 'Stocks',
            value: data.investmentBreakdown?.stocks || 0,
            color: COLORS.stocks,
        },
        {
            name: 'ETFs',
            value: data.investmentBreakdown?.etfs || 0,
            color: COLORS.etfs,
        },
        {
            name: 'Crypto',
            value: data.investmentBreakdown?.crypto || 0,
            color: COLORS.crypto,
        },
        {
            name: 'Real Estate',
            value: data.manualAssets, // Assuming manuals are mostly Real Estate/Physical
            color: COLORS.realEstate,
        },
        {
            name: 'Other',
            value: data.investmentBreakdown?.other || 0,
            color: COLORS.other,
        },
    ].filter(item => item.value > 0) // Only show categories with value

    if (chartData.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                <p>No assets to display yet</p>
                <p className="text-xs mt-2">Add accounts or assets to see allocation</p>
            </div>
        )
    }

    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index)
    }

    const onPieLeave = () => {
        setActiveIndex(null)
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <PieAny
                    activeIndex={activeIndex !== null ? activeIndex : undefined}
                    activeShape={renderActiveShape}
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
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
                            style={{
                                opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
                                transition: 'all 0.3s ease-in-out',
                                outline: 'none'
                            }}
                        />
                    ))}
                </PieAny>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                    }}
                    formatter={(value: number | undefined, name: string | undefined) => [
                        `$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${(((value || 0) / total) * 100).toFixed(1)}%)`,
                        name || 'Value'
                    ]}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    content={(props) => {
                        const { payload } = props;
                        return (
                            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                                {payload?.map((entry: any, index: number) => {
                                    const dataIndex = chartData.findIndex(d => d.name === entry.value);
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
    )
}

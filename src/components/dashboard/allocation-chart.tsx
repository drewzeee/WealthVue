'use client'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface AllocationData {
    accountAssets: number
    accountLiabilities: number
    investmentAssets: number
    manualAssets: number
    manualLiabilities: number
}

interface AllocationChartProps {
    data: AllocationData | null
}

const COLORS = {
    cash: 'hsl(142, 76%, 36%)', // Green
    investments: 'hsl(221, 83%, 53%)', // Blue
    realEstate: 'hsl(262, 83%, 58%)', // Purple
    other: 'hsl(48, 96%, 53%)', // Yellow
}

export function AllocationChart({ data }: AllocationChartProps) {
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
            name: 'Cash & Accounts',
            value: data.accountAssets,
            color: COLORS.cash,
        },
        {
            name: 'Investments',
            value: data.investmentAssets,
            color: COLORS.investments,
        },
        {
            name: 'Real Estate & Assets',
            value: data.manualAssets,
            color: COLORS.realEstate,
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

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                    }}
                    formatter={(value: number | undefined) => [
                        `$${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${(((value || 0) / total) * 100).toFixed(1)}%)`,
                        'Value'
                    ]}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-sm">{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}

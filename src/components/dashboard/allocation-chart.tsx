'use client'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

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

// Sleek modern palette
const COLORS = {
    cash: 'hsl(160, 60%, 45%)', // Emerald Green
    stocks: 'hsl(215, 90%, 55%)', // Vibrant Blue
    etfs: 'hsl(195, 85%, 50%)', // Cyan/Azure
    crypto: 'hsl(270, 80%, 65%)', // Royal Purple
    realEstate: 'hsl(320, 70%, 60%)', // Magenta/Pink
    other: 'hsl(200, 20%, 30%)', // Slate Grey (was 'hsl(0, 0%, 50%)' but slate fits dark mode better)
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

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    strokeWidth={0}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
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
    )
}

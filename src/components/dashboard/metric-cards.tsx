'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, CreditCard, TrendingUp, Building2 } from 'lucide-react'

interface NetWorthData {
    netWorth: number
    totalAssets: number
    totalLiabilities: number
    breakdown: {
        accountAssets: number
        accountLiabilities: number
        investmentAssets: number
        manualAssets: number
        manualLiabilities: number
    }
}

interface MetricCardsProps {
    mode?: 'personal' | 'household'
}

export function MetricCards({ mode = 'personal' }: MetricCardsProps) {
    const [data, setData] = useState<NetWorthData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchNetWorth() {
            setLoading(true)
            try {
                const response = await fetch(`/api/net-worth?mode=${mode}`)
                const result = await response.json()

                if (result.success) {
                    setData(result.data)
                }
            } catch (error) {
                console.error('Failed to fetch net worth:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchNetWorth()
    }, [mode])

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Loading...</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$0.00</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const breakdown = data?.breakdown

    const cards = [
        {
            title: 'Total Cash',
            value: breakdown?.accountAssets || 0,
            icon: Wallet,
            description: 'Bank accounts',
        },
        {
            title: 'Credit Balance',
            value: breakdown?.accountLiabilities || 0,
            icon: CreditCard,
            description: 'Credit cards & loans',
            isLiability: true,
        },
        {
            title: 'Investments',
            value: breakdown?.investmentAssets || 0,
            icon: TrendingUp,
            description: 'Portfolio value',
        },
        {
            title: 'Real Estate',
            value: breakdown?.manualAssets || 0,
            icon: Building2,
            description: 'Property value',
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon
                const displayValue = card.isLiability ? -card.value : card.value

                return (
                    <Card key={card.title} className="border-none shadow-card">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
                                {card.title}
                            </CardTitle>
                            <Icon className="h-3.5 w-3.5 text-muted-foreground/50" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold tracking-tight ${card.isLiability && card.value > 0 ? 'text-destructive' : ''}`}>
                                {displayValue < 0 ? '-' : ''}${Math.abs(displayValue).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 font-medium">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

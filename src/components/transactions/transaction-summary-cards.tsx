"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Receipt } from "lucide-react"

interface TransactionSummaryCardsProps {
    totalCount: number
    totalIncome: number
    totalExpenses: number
}

export function TransactionSummaryCards({
    totalCount,
    totalIncome,
    totalExpenses,
}: TransactionSummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <GlassCard glowColor="primary" className="p-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
                        Total transactions
                    </CardTitle>
                    <Receipt className="h-4 w-4 text-muted-foreground/50" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{totalCount}</div>
                </CardContent>
            </GlassCard>

            <GlassCard glowColor="emerald" className="p-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
                        Income
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-finance-income/50" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-finance-income tracking-tight">
                        {formatCurrency(totalIncome)}
                    </div>
                </CardContent>
            </GlassCard>

            <GlassCard glowColor="rose" className="p-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
                        Expenses
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-finance-expense/50" />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-finance-expense tracking-tight">
                        {formatCurrency(Math.abs(totalExpenses))}
                    </div>
                </CardContent>
            </GlassCard>
        </div>
    )
}

import { GlassCard } from "@/components/ui/glass-card"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface SummaryCardsProps {
    income: number
    budgeted: number
    spent: number
    remaining: number
}

export function SummaryCards({ income, budgeted, spent, remaining }: SummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <GlassCard glowColor="emerald" className="p-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
                        Income (January)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-finance-income tracking-tight">{formatCurrency(income)}</div>
                </CardContent>
            </GlassCard>
            <GlassCard glowColor="primary" className="p-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
                        Budget (January)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{formatCurrency(budgeted)}</div>
                </CardContent>
            </GlassCard>
            <GlassCard glowColor="rose" className="p-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
                        Spent (January)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-finance-expense tracking-tight">{formatCurrency(spent)}</div>
                </CardContent>
            </GlassCard>
            <GlassCard glowColor="blue" className="p-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                    <CardTitle className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-[0.15em]">
                        Left to Spend
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-finance-remaining tracking-tight">{formatCurrency(remaining)}</div>
                </CardContent>
            </GlassCard>
        </div>
    )
}

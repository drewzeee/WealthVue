"use client"

import { ArrowDown, ArrowUp, Clock } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface AssetDailyChangeCardProps {
    asset: {
        id: string
        symbol: string | null
        name: string
        currentValue: number
        dayChange: number
        dayChangePercent: number
        lastPriceUpdate: string | null
    }
}

export function AssetDailyChangeCard({ asset }: AssetDailyChangeCardProps) {
    const isPositive = asset.dayChange >= 0

    return (
        <GlassCard glowColor={isPositive ? "emerald" : "rose"} className="p-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold truncate pr-2">
                    {asset.symbol ? (
                        <span className="flex items-baseline gap-2">
                            <span className="text-foreground">{asset.symbol}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">{asset.name}</span>
                        </span>
                    ) : asset.name}
                </CardTitle>
                <div className={`text-xs flex items-center font-medium ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? <ArrowUp className="mr-0.5 h-3 w-3" /> : <ArrowDown className="mr-0.5 h-3 w-3" />}
                    {Math.abs(asset.dayChangePercent).toFixed(2)}%
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end">
                    <div>
                        <div className="text-xl font-bold tracking-tight">
                            {formatCurrency(asset.currentValue)}
                        </div>
                        <div className={`text-[10px] ${isPositive ? "text-green-500/80" : "text-red-500/80"}`}>
                            {isPositive ? "+" : "-"}{formatCurrency(Math.abs(asset.dayChange))} today
                        </div>
                    </div>
                    {asset.lastPriceUpdate && (
                        <div className="text-[9px] text-muted-foreground flex items-center gap-1 mb-0.5">
                            <Clock className="h-2 w-2" />
                            {formatDistanceToNow(new Date(asset.lastPriceUpdate))} ago
                        </div>
                    )}
                </div>
            </CardContent>
        </GlassCard>
    )
}

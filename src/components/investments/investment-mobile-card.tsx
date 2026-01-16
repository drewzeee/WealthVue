"use client"

import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, TrendingUp, TrendingDown, Wallet } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ASSET_CLASS_CONFIG } from "@/types/investment"
import { InvestmentRow } from "./investment-columns"
import { AssetClass } from "@prisma/client"

interface InvestmentMobileCardProps {
    investment: InvestmentRow
    isSelected?: boolean
    onSelectChange?: (checked: boolean) => void
    onEdit?: (investment: InvestmentRow) => void
    onDelete?: (investment: InvestmentRow) => void
}

export function InvestmentMobileCard({
    investment,
    isSelected,
    onSelectChange,
    onEdit,
    onDelete,
}: InvestmentMobileCardProps) {
    const assetClassConfig = ASSET_CLASS_CONFIG[investment.assetClass as AssetClass]
    const isPositive = investment.gainLoss >= 0

    return (
        <div className={`flex flex-col p-4 space-y-3 relative group border-b last:border-0 ${isSelected ? "bg-muted/30" : "bg-transparent"}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="pt-1">
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => onSelectChange?.(!!checked)}
                            aria-label="Select investment"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold truncate">
                                {investment.symbol}
                            </span>
                            <Badge
                                variant="outline"
                                className="font-normal text-[10px] px-1.5 py-0 h-4"
                                style={{
                                    borderColor: assetClassConfig.color,
                                    color: assetClassConfig.color,
                                }}
                            >
                                {assetClassConfig.label}
                            </Badge>
                        </div>

                        <div className="flex flex-col space-y-1">
                            <span className="text-xs text-muted-foreground line-clamp-1">
                                {investment.name}
                            </span>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Wallet className="h-3 w-3" />
                                    {investment.account.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="font-bold">
                        {formatCurrency(investment.currentValue)}
                    </div>
                    <div className={`flex items-center text-xs ${isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        <span>{isPositive ? "+" : ""}{formatCurrency(investment.gainLoss)} ({isPositive ? "+" : ""}{investment.gainLossPercent.toFixed(2)}%)</span>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 -mr-2 mt-1">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(investment.symbol)}
                            >
                                Copy Symbol
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit?.(investment)}>
                                Edit Investment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDelete?.(investment)}
                            >
                                Delete Investment
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider opacity-70">Quantity</span>
                    <span className="font-medium text-foreground">{Number(investment.quantity).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase tracking-wider opacity-70">Price</span>
                    <span className="font-medium text-foreground">
                        {investment.currentPrice ? formatCurrency(Number(investment.currentPrice)) : "—"}
                    </span>
                </div>
            </div>
        </div>
    )
}

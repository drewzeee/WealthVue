"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ASSET_CLASS_CONFIG } from "@/types/investment"
import type { AssetClass, InvestmentAccountType } from "@prisma/client"

// Type for investment with calculated fields
export type InvestmentRow = {
    id: string
    symbol: string
    name: string
    assetClass: AssetClass
    quantity: number | string
    costBasis: number | string
    currentPrice: number | string | null
    purchaseDate: Date | string
    currentValue: number
    gainLoss: number
    gainLossPercent: number
    account: {
        id: string
        name: string
        type: InvestmentAccountType
    }
}

interface ColumnActions {
    onEdit?: (investment: InvestmentRow) => void
    onDelete?: (investment: InvestmentRow) => void
}

export function getInvestmentColumns(actions?: ColumnActions): ColumnDef<InvestmentRow>[] {
    return [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "symbol",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Symbol
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const symbol = row.getValue("symbol") as string
                return <div className="font-bold">{symbol || "—"}</div>
            },
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate" title={row.getValue("name")}>
                    {row.getValue("name")}
                </div>
            ),
        },
        {
            accessorKey: "assetClass",
            header: "Type",
            cell: ({ row }) => {
                const assetClass = row.getValue("assetClass") as AssetClass
                const config = ASSET_CLASS_CONFIG[assetClass]
                return (
                    <Badge
                        variant="outline"
                        style={{
                            borderColor: config.color,
                            color: config.color,
                        }}
                    >
                        {config.label}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "account",
            header: "Account",
            cell: ({ row }) => row.original.account.name,
        },
        {
            accessorKey: "quantity",
            header: () => <div className="text-right">Shares</div>,
            cell: ({ row }) => {
                const quantity = Number(row.getValue("quantity"))
                return (
                    <div className="text-right font-medium">
                        {quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </div>
                )
            },
        },
        {
            accessorKey: "currentPrice",
            header: () => <div className="text-right">Price</div>,
            cell: ({ row }) => {
                const price = row.getValue("currentPrice")
                const formatted = price
                    ? new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(Number(price))
                    : "—"
                return <div className="text-right">{formatted}</div>
            },
        },
        {
            accessorKey: "currentValue",
            header: ({ column }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Value
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const value = row.getValue("currentValue") as number
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(value)
                return <div className="text-right font-medium">{formatted}</div>
            },
        },
        {
            accessorKey: "gainLoss",
            header: ({ column }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Gain/Loss
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const gainLoss = row.original.gainLoss
                const gainLossPercent = row.original.gainLossPercent
                const isPositive = gainLoss >= 0

                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    signDisplay: "always",
                }).format(gainLoss)

                return (
                    <div className={`text-right flex items-center justify-end gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                        {isPositive ? (
                            <TrendingUp className="h-4 w-4" />
                        ) : (
                            <TrendingDown className="h-4 w-4" />
                        )}
                        <div>
                            <div className="font-medium">{formatted}</div>
                            <div className="text-xs">
                                ({gainLossPercent >= 0 ? "+" : ""}{gainLossPercent.toFixed(2)}%)
                            </div>
                        </div>
                    </div>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const investment = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
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
                            <DropdownMenuItem onClick={() => actions?.onEdit?.(investment)}>
                                Edit Investment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => actions?.onDelete?.(investment)}
                            >
                                Delete Investment
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}

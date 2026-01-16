"use client"

import { format } from "date-fns"
import { formatTransactionDate, formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Repeat, MoreHorizontal, Calendar, CreditCard, StickyNote } from "lucide-react"
import { useState } from "react"
import { EditTransactionDialog } from "./edit-transaction-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CategorySelect } from "./category-select"
import { Checkbox } from "@/components/ui/checkbox"

interface TransactionMobileCardProps {
    transaction: any // Using any to bypass Prisma type sync issues for now
    categories: any[]
    isSelected?: boolean
    onSelectChange?: (checked: boolean) => void
    accounts: any[]
}

export function TransactionMobileCard({
    transaction,
    categories,
    isSelected,
    onSelectChange,
    accounts,
}: TransactionMobileCardProps) {
    const dateToDisplay = transaction.authorizedDate || transaction.date
    const displayDescription = transaction.rawDescription || transaction.description
    const amount = parseFloat(transaction.amount.toString())
    const [showEditDialog, setShowEditDialog] = useState(false)

    return (
        <>
            <div className="flex flex-col p-4 space-y-3 relative group">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="pt-1">
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => onSelectChange?.(!!checked)}
                                aria-label="Select transaction"
                            />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={`font-semibold truncate ${transaction.pending ? "text-muted-foreground italic" : ""}`}>
                                    {displayDescription}
                                </span>
                                {transaction.isTransfer && (
                                    <Badge variant="outline" className="flex items-center gap-1 font-normal text-muted-foreground text-[10px] h-4 py-0">
                                        <Repeat className="h-2.5 w-2.5" />
                                        Transfer
                                    </Badge>
                                )}
                                {transaction.pending && (
                                    <Badge variant="secondary" className="font-normal text-[10px] px-1.5 py-0 h-4">
                                        Pending
                                    </Badge>
                                )}
                            </div>

                            <div className="flex flex-col space-y-1">
                                {transaction.rawDescription && transaction.rawDescription !== transaction.description && (
                                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                                        {transaction.description}
                                    </span>
                                )}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {format(formatTransactionDate(new Date(dateToDisplay)), "MMM d")}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        {transaction.account?.name}
                                    </span>
                                </div>
                                {transaction.notes && (
                                    <div className="flex items-start gap-1.5 mt-1 p-2 bg-amber-50/50 dark:bg-amber-900/10 rounded border border-amber-200/50 dark:border-amber-900/20">
                                        <StickyNote className="h-3 w-3 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                                        <p className="text-[10px] text-amber-800 dark:text-amber-400 break-words line-clamp-2">
                                            {transaction.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className={`font-bold ${amount < 0 ? "text-destructive" : amount > 0 ? "text-green-600 dark:text-green-500" : ""}`}>
                            {amount < 0 ? "-" : ""}{formatCurrency(Math.abs(amount))}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 -mr-2">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => navigator.clipboard.writeText(transaction.id)}
                                >
                                    Copy ID
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setShowEditDialog(true)}>Edit transaction</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                    Delete transaction
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="pt-1">
                    <CategorySelect
                        transactionId={transaction.id}
                        categoryId={transaction.categoryId}
                        categories={categories}
                    />
                </div>
            </div>
            <EditTransactionDialog
                transaction={transaction}
                accounts={accounts}
                categories={categories}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
            />
        </>
    )
}

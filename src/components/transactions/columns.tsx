"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Transaction } from "@prisma/client"
import { format } from "date-fns"
import { formatTransactionDate } from "@/lib/utils"
import { ArrowUpDown, MoreHorizontal, Repeat, StickyNote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CategorySelect } from "./category-select"
import { useState } from "react"
import { EditTransactionDialog } from "./edit-transaction-dialog"

// We need to extend the Transaction type to include relations
export type TransactionWithRelations = Transaction & {
  category: { id: string; name: string; color: string; icon: string | null } | null
  account: { id: string; name: string; customName: string | null }
}

interface TransactionActionsProps {
  transaction: TransactionWithRelations
  categories: any[]
  accounts: any[]
}

function TransactionActions({ transaction, categories, accounts }: TransactionActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  return (
    <>
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
            onClick={() => navigator.clipboard.writeText(transaction.id)}
          >
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            Edit transaction
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            Delete transaction
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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

export const getColumns = (
  categories: any[],
  accounts: any[]
): ColumnDef<TransactionWithRelations>[] => [
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
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const transaction = row.original
        const dateToDisplay = transaction.authorizedDate || transaction.date
        return format(formatTransactionDate(new Date(dateToDisplay)), "MMM d, yyyy")
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const transaction = row.original
        const displayDescription = transaction.rawDescription || transaction.description

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={transaction.pending ? "text-muted-foreground italic" : ""}>
                {displayDescription}
              </span>
              {transaction.isTransfer && (
                <Badge variant="outline" className="flex items-center gap-1 font-normal text-muted-foreground">
                  <Repeat className="h-3 w-3" />
                  Transfer
                </Badge>
              )}
              {transaction.pending && (
                <Badge variant="secondary" className="font-normal text-[10px] px-1.5 py-0 h-4">
                  Pending
                </Badge>
              )}
            </div>
            {transaction.rawDescription && transaction.rawDescription !== transaction.description && (
              <span className="text-[10px] text-muted-foreground leading-none">
                {transaction.description}
              </span>
            )}
            {transaction.notes && (
              <div
                className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-500 font-medium cursor-help"
                title={transaction.notes}
              >
                <StickyNote className="h-3 w-3" />
                <span>Has Note</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <CategorySelect
            transactionId={transaction.id}
            categoryId={transaction.categoryId}
            categories={categories}
          />
        )
      },
    },
    {
      accessorKey: "account",
      header: "Account",
      cell: ({ row }) => row.original.account.customName || row.original.account.name,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Math.abs(amount))

        return (
          <div className={`text-right font-medium ${amount < 0 ? "text-destructive" : amount > 0 ? "text-green-600 dark:text-green-500" : ""
            }`}>
            {amount < 0 ? "-" : ""}{formatted}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <TransactionActions
          transaction={row.original}
          categories={categories}
          accounts={accounts}
        />
      ),
    },
  ]

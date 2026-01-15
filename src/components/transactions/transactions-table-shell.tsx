"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { DataTable } from "./data-table"
import { getColumns, TransactionWithRelations } from "./columns"
import { useCallback, useState, useMemo } from "react"
import { RowSelectionState } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TransactionsTableShellProps {
  data: TransactionWithRelations[]
  pageCount: number
  categories: { id: string; name: string; color: string }[]
}

export function TransactionsTableShell({ data, pageCount, categories }: TransactionsTableShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const columns = useMemo(() => getColumns(categories), [categories])

  const page = Number(searchParams.get("page")) || 1

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const onPageChange = (newPage: number) => {
    router.push(pathname + "?" + createQueryString("page", String(newPage)))
  }

  const selectedCount = Object.keys(rowSelection).length

  const deleteSelected = async () => {
    setIsDeleting(true)
    const selectedIndices = Object.keys(rowSelection).map(Number)
    // We need to map indices to IDs. 
    // Since rowSelection from tanstack table uses indices by default if no getRowId is provided.
    // However, data might be different if sorting/filtering is applied clientside?
    // Wait, getRowId defaults to index. 
    // BUT, if we paginate server-side, indices restart at 0?
    // Actually, simple way: `data` prop contains current page transactions.
    // `rowSelection` keys will be the indices of `data`.

    const selectedIds = selectedIndices.map((index) => data[index]?.id).filter(Boolean)

    if (selectedIds.length === 0) {
      setIsDeleting(false)
      return
    }

    try {
      const response = await fetch("/api/transactions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedIds),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete transactions")
      }

      setRowSelection({})
      setIsDeleteDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete transactions", error)
      alert("Failed to delete transactions. Check console for details.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
          <span className="text-sm text-muted-foreground ml-2">
            {selectedCount} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="ml-auto"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      <GlassCard glowColor="primary" className="p-0 overflow-visible">
        <DataTable
          columns={columns}
          data={data}
          pageCount={pageCount}
          pageIndex={page}
          onPageChange={onPageChange}
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
        />
      </GlassCard>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transactions</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCount} transactions? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteSelected}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

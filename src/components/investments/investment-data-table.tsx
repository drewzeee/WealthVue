"use client"

import { useState, useEffect } from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    SortingState,
    OnChangeFn,
    RowSelectionState,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { InvestmentMobileCard } from "./investment-mobile-card"
import { InvestmentRow } from "./investment-columns"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pageCount: number
    pageIndex: number
    onPageChange: (page: number) => void
    rowSelection?: RowSelectionState
    onRowSelectionChange?: OnChangeFn<RowSelectionState>
    isLoading?: boolean
    onEdit?: (investment: TData) => void
    onDelete?: (investment: TData) => void
    onSortingChange?: (sortBy: string, sortOrder: "asc" | "desc") => void
}

export function InvestmentDataTable<TData, TValue>({
    columns,
    data,
    pageCount,
    pageIndex,
    onPageChange,
    rowSelection,
    onRowSelectionChange,
    isLoading,
    onEdit,
    onDelete,
    onSortingChange,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])

    // Communicate sorting changes to parent for server-side sorting
    useEffect(() => {
        if (sorting.length > 0 && onSortingChange) {
            const sortColumn = sorting[0]
            onSortingChange(sortColumn.id, sortColumn.desc ? "desc" : "asc")
        }
    }, [sorting, onSortingChange])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true, // Enable manual sorting for server-side
        pageCount: pageCount,
        state: {
            pagination: {
                pageIndex: pageIndex - 1,
                pageSize: 50,
            },
            sorting,
            rowSelection,
        },
        enableRowSelection: true,
        onSortingChange: setSorting,
        onRowSelectionChange: onRowSelectionChange,
    })

    const selectedCount = Object.keys(rowSelection || {}).length

    return (
        <div className="space-y-4">
            {selectedCount > 0 && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md mb-4">
                    <span className="text-sm text-muted-foreground">
                        {selectedCount} investment{selectedCount > 1 ? "s" : ""} selected
                    </span>
                </div>
            )}

            {/* Mobile View */}
            <div className="flex flex-col md:hidden border rounded-lg divide-y divide-border bg-background/50 backdrop-blur-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">
                        Loading investments...
                    </div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No investments found. Add your first investment to get started.
                    </div>
                ) : (
                    data.map((row, index) => {
                        // Cast to InvestmentRow since TData is generic but we know it's InvestmentRow in this context
                        // ideally we'd make the component generic properly but for now casting is safer than changing all types
                        const investment = row as unknown as InvestmentRow
                        const isSelected = !!rowSelection?.[index]

                        return (
                            <InvestmentMobileCard
                                key={investment.id}
                                investment={investment}
                                isSelected={isSelected}
                                onSelectChange={(checked) => {
                                    if (onRowSelectionChange && rowSelection) {
                                        onRowSelectionChange({
                                            ...rowSelection,
                                            [index]: checked
                                        })
                                    }
                                }}
                                onEdit={() => onEdit?.(row)}
                                onDelete={() => onDelete?.(row)}
                            />
                        )
                    })
                )}
            </div>

            {/* Desktop View */}
            <GlassCard glowColor="primary" className="p-0 overflow-visible hidden md:block">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Loading investments...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No investments found. Add your first investment to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </GlassCard>
            <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pageIndex - 1)}
                        disabled={pageIndex <= 1}
                    >
                        Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Page {pageIndex} of {pageCount || 1}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange(pageIndex + 1)}
                        disabled={pageIndex >= pageCount}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}

"use client"

import { useState, useMemo, Suspense } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { RowSelectionState } from "@tanstack/react-table"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { InvestmentAccountList } from "@/components/investments/investment-account-list"
import { AddInvestmentDialog } from "@/components/investments/add-investment-dialog"
import { InvestmentDataTable } from "@/components/investments/investment-data-table"
import { getInvestmentColumns, InvestmentRow } from "@/components/investments/investment-columns"
import { ASSET_CLASS_CONFIG } from "@/types/investment"
import { InvestmentAccountType } from "@prisma/client"
import { InvestmentOverview } from "@/components/investments/investment-overview"

interface InvestmentAccount {
    id: string
    name: string
    type: InvestmentAccountType
}

interface InvestmentListResponse {
    success: boolean
    data: {
        investments: InvestmentRow[]
        total: number
        page: number
        totalPages: number
        hasMore: boolean
    }
}

interface AccountListResponse {
    success: boolean
    data: InvestmentAccount[]
}

export default function InvestmentsPage() {
    const queryClient = useQueryClient()

    // Filters state
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [accountFilter, setAccountFilter] = useState<string>("all")
    const [assetClassFilter, setAssetClassFilter] = useState<string>("all")
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

    // Edit/Delete state
    const [editInvestment, setEditInvestment] = useState<InvestmentRow | null>(null)
    const [deleteInvestment, setDeleteInvestment] = useState<InvestmentRow | null>(null)
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false)

    // Fetch accounts
    const { data: accountsData } = useQuery<AccountListResponse>({
        queryKey: ["investment-accounts"],
        queryFn: async () => {
            const res = await fetch("/api/investments/accounts")
            return res.json()
        },
    })

    const accounts = accountsData?.data || []

    // Fetch investments
    const { data: investmentsData, isLoading } = useQuery<InvestmentListResponse>({
        queryKey: ["investments", page, search, accountFilter, assetClassFilter],
        queryFn: async () => {
            const params = new URLSearchParams()
            params.set("page", String(page))
            if (search) params.set("search", search)
            if (accountFilter && accountFilter !== "all") params.set("accountId", accountFilter)
            if (assetClassFilter && assetClassFilter !== "all") params.set("assetClass", assetClassFilter)

            const res = await fetch(`/api/investments?${params}`)
            return res.json()
        },
    })

    const investments = investmentsData?.data?.investments || []
    const totalPages = investmentsData?.data?.totalPages || 1

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/investments/${id}`, { method: "DELETE" })
            if (!res.ok) throw new Error("Failed to delete investment")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["investments"] })
            queryClient.invalidateQueries({ queryKey: ["investment-accounts"] })
            setDeleteInvestment(null)
        },
    })

    // Bulk delete mutation
    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            const res = await fetch("/api/investments", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(ids),
            })
            if (!res.ok) throw new Error("Failed to delete investments")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["investments"] })
            queryClient.invalidateQueries({ queryKey: ["investment-accounts"] })
            setRowSelection({})
            setShowBulkDeleteDialog(false)
        },
    })

    // Column actions
    const columns = useMemo(
        () =>
            getInvestmentColumns({
                onEdit: (investment) => setEditInvestment(investment),
                onDelete: (investment) => setDeleteInvestment(investment),
            }),
        []
    )

    // Get selected investment IDs
    const selectedIds = Object.keys(rowSelection).map((index) => investments[parseInt(index)]?.id).filter(Boolean)

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Investments</h2>
                <p className="text-muted-foreground">
                    Track and manage your investment portfolio.
                </p>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="holdings">Holdings</TabsTrigger>
                    <TabsTrigger value="accounts">Accounts</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Suspense fallback={<div>Loading overview...</div>}>
                        <InvestmentOverview />
                    </Suspense>
                </TabsContent>

                <TabsContent value="holdings" className="space-y-4">
                    <Suspense fallback={<div>Loading holdings...</div>}>
                        {/* Filters and Actions */}
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center w-full md:w-auto">
                                <Input
                                    placeholder="Search by symbol or name..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value)
                                        setPage(1)
                                    }}
                                    className="w-full sm:w-64"
                                />
                                <div className="flex gap-2">
                                    <Select
                                        value={accountFilter}
                                        onValueChange={(value) => {
                                            setAccountFilter(value)
                                            setPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-48">
                                            <SelectValue placeholder="All Accounts" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Accounts</SelectItem>
                                            {accounts.map((account) => (
                                                <SelectItem key={account.id} value={account.id}>
                                                    {account.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select
                                        value={assetClassFilter}
                                        onValueChange={(value) => {
                                            setAssetClassFilter(value)
                                            setPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-40">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            {Object.entries(ASSET_CLASS_CONFIG).map(([key, config]) => (
                                                <SelectItem key={key} value={key}>
                                                    {config.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full md:w-auto justify-end">
                                {selectedIds.length > 0 && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowBulkDeleteDialog(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete ({selectedIds.length})
                                    </Button>
                                )}
                                <AddInvestmentDialog accounts={accounts} />
                            </div>
                        </div>

                        {/* Data Table */}
                        <InvestmentDataTable
                            columns={columns}
                            data={investments}
                            pageCount={totalPages}
                            pageIndex={page}
                            onPageChange={setPage}
                            rowSelection={rowSelection}
                            onRowSelectionChange={setRowSelection}
                            isLoading={isLoading}
                            onEdit={setEditInvestment}
                            onDelete={setDeleteInvestment}
                        />
                    </Suspense>
                </TabsContent>

                <TabsContent value="accounts" className="space-y-4">
                    <InvestmentAccountList />
                </TabsContent>
            </Tabs>

            {/* Edit Investment Dialog */}
            {editInvestment && (
                <AddInvestmentDialog
                    investmentToEdit={{
                        ...editInvestment,
                        accountId: editInvestment.account.id,
                        quantity: Number(editInvestment.quantity),
                        costBasis: Number(editInvestment.costBasis),
                        currentPrice: editInvestment.currentPrice ? Number(editInvestment.currentPrice) : null,
                        manualPrice: false,
                        notes: null,
                    }}
                    accounts={accounts}
                    open={!!editInvestment}
                    onOpenChange={(open) => !open && setEditInvestment(null)}
                />
            )}

            {/* Delete Single Investment Dialog */}
            <AlertDialog open={!!deleteInvestment} onOpenChange={(open) => !open && setDeleteInvestment(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Investment?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete your {deleteInvestment?.symbol} investment.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteInvestment && deleteMutation.mutate(deleteInvestment.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Dialog */}
            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.length} Investment(s)?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the selected investments.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => bulkDeleteMutation.mutate(selectedIds)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {bulkDeleteMutation.isPending ? "Deleting..." : "Delete All"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal, Pencil, Trash2, Wallet } from "lucide-react"
import { InvestmentAccountType } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/ui/glass-card"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { AddInvestmentAccountDialog } from "./add-investment-account-dialog"
import { ImportInvestmentsDialog } from "./import-investments-dialog"
import { ACCOUNT_TYPE_CONFIG } from "@/types/investment"

interface InvestmentAccountWithSummary {
    id: string
    name: string
    type: InvestmentAccountType
    taxAdvantaged: boolean
    totalValue: number
    totalCostBasis: number
    totalGainLoss: number
    gainLossPercent: number
    investments: unknown[]
}

export function InvestmentAccountList() {
    const [editAccount, setEditAccount] = useState<InvestmentAccountWithSummary | null>(null)
    const [deleteAccount, setDeleteAccount] = useState<InvestmentAccountWithSummary | null>(null)

    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery<{ success: boolean; data: InvestmentAccountWithSummary[] }>({
        queryKey: ["investment-accounts"],
        queryFn: async () => {
            const res = await fetch("/api/investments/accounts")
            return res.json()
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/investments/accounts/${id}`, {
                method: "DELETE",
            })
            if (!res.ok) throw new Error("Failed to delete account")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["investment-accounts"] })
            queryClient.invalidateQueries({ queryKey: ["investments"] })
            setDeleteAccount(null)
        },
    })

    const accounts = data?.data || []

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <GlassCard key={i} className="animate-pulse p-0">
                        <CardHeader className="h-20 bg-muted" />
                        <CardContent className="h-24 bg-muted/50" />
                    </GlassCard>
                ))}
            </div>
        )
    }

    if (accounts.length === 0) {
        return (
            <GlassCard glowColor="primary" className="p-0">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Investment Accounts</h3>
                    <p className="text-muted-foreground text-center mb-4">
                        Create your first investment account to start tracking your portfolio.
                    </p>
                    <AddInvestmentAccountDialog />
                </CardContent>
            </GlassCard>
        )
    }

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(value)

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Investment Accounts</h3>
                    <p className="text-sm text-muted-foreground">
                        {accounts.length} account{accounts.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex gap-2">
                    <ImportInvestmentsDialog accounts={accounts.map(a => ({ id: a.id, name: a.name }))} />
                    <AddInvestmentAccountDialog />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map((account) => {
                    const config = ACCOUNT_TYPE_CONFIG[account.type]
                    const isPositive = account.totalGainLoss >= 0

                    return (
                        <GlassCard key={account.id} glowColor={isPositive ? "emerald" : "rose"} className="p-0">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle className="text-base font-medium">
                                        {account.name}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2">
                                        {config.label}
                                        {account.taxAdvantaged && (
                                            <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                                Tax Advantaged
                                            </span>
                                        )}
                                    </CardDescription>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setEditAccount(account)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => setDeleteAccount(account)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(account.totalValue)}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span
                                        className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}
                                    >
                                        {isPositive ? "+" : ""}
                                        {formatCurrency(account.totalGainLoss)}
                                    </span>
                                    <span
                                        className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}
                                    >
                                        ({isPositive ? "+" : ""}{account.gainLossPercent.toFixed(2)}%)
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {account.investments.length} holding{account.investments.length !== 1 ? "s" : ""}
                                </p>
                            </CardContent>
                        </GlassCard>
                    )
                })}
            </div>

            {/* Edit Dialog */}
            <AddInvestmentAccountDialog
                accountToEdit={editAccount || undefined}
                open={!!editAccount}
                onOpenChange={(open) => !open && setEditAccount(null)}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteAccount} onOpenChange={(open) => !open && setDeleteAccount(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Investment Account?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this investment account and all associated holdings.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteAccount && deleteMutation.mutate(deleteAccount.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

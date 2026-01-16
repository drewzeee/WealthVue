"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Trash, Pencil, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Account, Asset, Liability, InvestmentAccount, PlaidItem } from "@prisma/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteAccount } from "@/app/actions/accounts"
import { resetPlaidSync } from "@/app/actions/plaid"
import { AccountDialog } from "@/components/accounts/add-account-dialog"
import { RefreshCcw } from "lucide-react"

type SimpleAccount = Omit<Account, "currentBalance" | "availableBalance" | "creditLimit"> & {
    currentBalance: number;
    availableBalance: number | null;
    creditLimit: number | null;
    customName: string | null;
    plaidItemId: string | null;
    plaidItem?: PlaidItem | null
}
type SimpleAsset = Omit<Asset, "currentValue"> & { currentValue: number }
type SimpleLiability = Omit<Liability, "currentBalance" | "interestRate" | "minimumPayment"> & {
    currentBalance: number;
    interestRate: number | null;
    minimumPayment: number | null
}

interface AccountListProps {
    accounts: SimpleAccount[]
    assets: SimpleAsset[]
    liabilities: SimpleLiability[]
    investmentAccounts: InvestmentAccount[]
}

export function AccountList({ accounts, assets, liabilities, investmentAccounts }: AccountListProps) {
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [editingAccount, setEditingAccount] = useState<any>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const handleEdit = (account: any) => {
        setEditingAccount(account)
        setIsEditDialogOpen(true)
    }

    const handleDelete = async (type: string, id: string) => {
        if (!confirm("Are you sure you want to delete this account? This action cannot be undone.")) return

        setDeletingId(id)
        try {
            await deleteAccount(type as any, id)
            router.refresh()
            console.log("Deleted", type, id) // Keep log for verification
        } catch (error) {
            console.error("Failed to delete", error)
            alert("Failed to delete account")
        } finally {
            setDeletingId(null)
        }
    }

    const isEmpty = accounts.length === 0 && assets.length === 0 && liabilities.length === 0 && investmentAccounts.length === 0

    if (isEmpty) {
        return (
            <div className="text-center py-10 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">No accounts connected yet.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-6">
            {accounts.length > 0 && (
                <Section title="Connected Accounts" description="Bank accounts and credit cards">
                    {accounts.map(account => (
                        <AccountItem
                            id={account.id}
                            key={account.id}
                            name={account.customName || account.name}
                            balance={account.currentBalance}
                            type={account.type}
                            subtype={account.subtype}
                            isPlaid={!!account.plaidItem}
                            lastSyncedAt={account.lastSyncedAt}
                            plaidItemId={account.plaidItemId}
                            onDelete={() => handleDelete("account", account.id)}
                            onEdit={() => handleEdit({ ...account, balance: account.currentBalance, plaidItemId: account.plaidItemId })}
                            deletingId={deletingId}
                        />
                    ))}
                </Section>
            )}

            {investmentAccounts.length > 0 && (
                <Section title="Investment Portfolios" description="Manually tracked investments">
                    {investmentAccounts.map(account => (
                        <AccountItem
                            id={account.id}
                            key={account.id}
                            name={account.name}
                            balance={0} // TODO: Calculate total value
                            type={account.type}
                            onDelete={() => handleDelete("investment", account.id)}
                            onEdit={() => handleEdit({ ...account, balance: 0 })} // Balance TODO
                            deletingId={deletingId}
                        />
                    ))}
                </Section>
            )}

            {assets.length > 0 && (
                <Section title="Assets" description="Property, vehicles, and other valuables">
                    {assets.map(asset => (
                        <AccountItem
                            id={asset.id}
                            key={asset.id}
                            name={asset.name}
                            balance={asset.currentValue}
                            type={asset.type}
                            onDelete={() => handleDelete("asset", asset.id)}
                            onEdit={() => handleEdit({ ...asset, balance: asset.currentValue })}
                            deletingId={deletingId}
                        />
                    ))}
                </Section>
            )}

            {liabilities.length > 0 && (
                <Section title="Liabilities" description="Loans and other debts">
                    {liabilities.map(liability => (
                        <AccountItem
                            id={liability.id}
                            key={liability.id}
                            name={liability.name}
                            balance={liability.currentBalance}
                            type={liability.type}
                            onDelete={() => handleDelete("liability", liability.id)}
                            onEdit={() => handleEdit({ ...liability, balance: liability.currentBalance })}
                            deletingId={deletingId}
                        />
                    ))}
                </Section>
            )}

            <AccountDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                mode="edit"
                initialData={editingAccount}
            />
        </div>
    )
}

function Section({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
                {children}
            </CardContent>
        </Card>
    )
}

function AccountItem({ id, name, balance, type, subtype, isPlaid, lastSyncedAt, plaidItemId, onDelete, onEdit, deletingId }: {
    id: string,
    name: string,
    balance: number,
    type: string,
    subtype?: string | null,
    isPlaid?: boolean,
    lastSyncedAt?: Date | null,
    plaidItemId?: string | null,
    onDelete: () => void,
    onEdit: () => void,
    deletingId: string | null
}) {
    const router = useRouter()
    const [isResetting, setIsResetting] = useState(false)
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    })

    const handleResetSync = async () => {
        if (!plaidItemId) return
        if (!confirm("This will clear the sync 'bookmark' for this account, forcing it to re-download all transactions on the next sync. Are you sure?")) return

        setIsResetting(true)
        try {
            await resetPlaidSync(plaidItemId)
            alert("Sync reset successfully. Please trigger a manual sync or wait for the next automatic sync to see deleted transactions return.")
            router.refresh()
        } catch (error) {
            console.error(error)
            alert("Failed to reset sync")
        } finally {
            setIsResetting(false)
        }
    }

    return (
        <div className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{name}</span>
                    {isPlaid && (
                        <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="text-[10px] h-5">Synced</Badge>
                            {lastSyncedAt && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{type.replace(/_/g, " ").toLowerCase()}</span>
                    {subtype && <span>• {subtype}</span>}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <span className="font-medium text-sm">{formatter.format(balance)}</span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        {isPlaid && (
                            <DropdownMenuItem onClick={handleResetSync} disabled={isResetting}>
                                <RefreshCcw className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
                                {isResetting ? 'Resetting...' : 'Reset Sync'}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem disabled={deletingId === id} className="text-destructive focus:text-destructive" onClick={onDelete}>
                            {deletingId === id ? <span className="animate-spin mr-2">⟳</span> : <Trash className="mr-2 h-4 w-4" />} Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

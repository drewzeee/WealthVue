import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/client"
import { AccountDialog } from "@/components/accounts/add-account-dialog"
import { AccountList } from "@/components/settings/account-list"
import { Separator } from "@/components/ui/separator"

export const metadata = {
    title: "Settings - WealthVue",
    description: "Manage your accounts and preferences",
}

export default async function SettingsPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const userId = session.user.id

    // Fetch all account types
    const accounts = await prisma.account.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { plaidItem: true },
    })

    const assets = await prisma.asset.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    })

    const liabilities = await prisma.liability.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    })

    const investmentAccounts = await prisma.investmentAccount.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    })

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account connections and preferences.
                </p>
            </div>
            <Separator />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-base font-medium">Accounts & Assets</h4>
                        <p className="text-sm text-muted-foreground">
                            Connect banks, add manual accounts, or track assets.
                        </p>
                    </div>
                    <AccountDialog />
                </div>

                <AccountList
                    accounts={accounts.map(a => ({ ...a, currentBalance: a.currentBalance.toNumber(), availableBalance: a.availableBalance?.toNumber() || null, creditLimit: a.creditLimit?.toNumber() || null }))}
                    assets={assets.map(a => ({ ...a, currentValue: a.currentValue.toNumber() }))}
                    liabilities={liabilities.map(l => ({ ...l, currentBalance: l.currentBalance.toNumber(), interestRate: l.interestRate?.toNumber() || null, minimumPayment: l.minimumPayment?.toNumber() || null }))}
                    investmentAccounts={investmentAccounts}
                />
            </div>
        </div>
    )
}

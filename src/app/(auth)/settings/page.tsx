import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db/client"
import { AccountDialog } from "@/components/accounts/add-account-dialog"
import { AccountList } from "@/components/settings/account-list"
import { AssetList } from "@/components/assets/asset-list"
import { LiabilityList } from "@/components/liabilities/liability-list"
import { FamilyManagement } from "@/components/settings/family-management"
import { PreferencesSettings } from "@/components/settings/preferences-settings"
import { SyncAccountsButton } from "@/components/settings/sync-accounts-button"
import { Separator } from "@/components/ui/separator"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

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

    // Fetch user details for preferences
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { timezone: true }
    })

    // Fetch data for all sections
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
        include: {
            investments: {
                select: {
                    quantity: true,
                    currentPrice: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
    })

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account connections, assets, and liabilities.
                </p>
            </div>
            <Separator />

            <Tabs defaultValue="accounts" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
                    <TabsTrigger value="assets">Manual Assets</TabsTrigger>
                    <TabsTrigger value="liabilities">Manual Liabilities</TabsTrigger>
                    <TabsTrigger value="family">Family</TabsTrigger>
                    <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>

                <TabsContent value="accounts" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-base font-medium">Accounts</h4>
                            <p className="text-sm text-muted-foreground">
                                Connect banks or add manual bank accounts.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <SyncAccountsButton />
                            <AccountDialog />
                        </div>
                    </div>

                    <AccountList
                        accounts={accounts.map((a: any) => ({
                            id: a.id,
                            userId: a.userId,
                            name: a.name,
                            officialName: a.officialName,
                            type: a.type,
                            subtype: a.subtype,
                            mask: a.mask,
                            customName: a.customName,
                            plaidAccountId: a.plaidAccountId,
                            plaidItemId: a.plaidItemId,
                            plaidItem: a.plaidItem,
                            currentBalance: a.currentBalance.toNumber(),
                            availableBalance: a.availableBalance?.toNumber() || null,
                            creditLimit: a.creditLimit?.toNumber() || null,
                            isActive: a.isActive,
                            lastSyncedAt: a.lastSyncedAt,
                            createdAt: a.createdAt,
                            updatedAt: a.updatedAt,
                        }))}
                        assets={assets.map(a => ({ ...a, currentValue: a.currentValue.toNumber() }))}
                        liabilities={liabilities.map(l => ({ ...l, currentBalance: l.currentBalance.toNumber(), interestRate: l.interestRate?.toNumber() || null, minimumPayment: l.minimumPayment?.toNumber() || null }))}
                        investmentAccounts={investmentAccounts}
                    />
                </TabsContent>

                <TabsContent value="assets">
                    <AssetList />
                </TabsContent>

                <TabsContent value="liabilities">
                    <LiabilityList />
                </TabsContent>

                <TabsContent value="family">
                    <FamilyManagement />
                </TabsContent>

                <TabsContent value="preferences">
                    <PreferencesSettings initialTimezone={user?.timezone || "UTC"} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

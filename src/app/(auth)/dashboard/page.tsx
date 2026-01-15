import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { NetWorthService } from '@/lib/services/net-worth.service'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export const metadata = {
  title: 'Dashboard - WealthVue',
  description: 'Your financial overview',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  // Fetch current net worth on server
  let netWorthData = null
  let error = null

  try {
    const data = await NetWorthService.calculateCurrentNetWorth(session.user.id)
    netWorthData = {
      netWorth: data.netWorth.toNumber(),
      totalAssets: data.totalAssets.toNumber(),
      totalLiabilities: data.totalLiabilities.toNumber(),
      breakdown: {
        accountAssets: data.breakdown.accountAssets.toNumber(),
        accountLiabilities: data.breakdown.accountLiabilities.toNumber(),
        investmentAssets: data.breakdown.investmentAssets.toNumber(),
        manualAssets: data.breakdown.manualAssets.toNumber(),
        manualLiabilities: data.breakdown.manualLiabilities.toNumber(),
      },
    }
  } catch (err) {
    console.error('Failed to fetch net worth:', err)
    error = 'Failed to load financial data'
  }

  const netWorth = netWorthData?.netWorth || 0
  const isPositive = netWorth >= 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session.user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your financial health.
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Net Worth Card */}
      <Card>
        <CardHeader>
          <CardDescription>Net Worth</CardDescription>
          <CardTitle className={`text-4xl ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
            {netWorth < 0 ? '-' : ''}${Math.abs(netWorth).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {netWorthData ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Assets</p>
                <p className="font-semibold text-green-600 dark:text-green-500">
                  ${netWorthData.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Liabilities</p>
                <p className="font-semibold text-red-600 dark:text-red-500">
                  ${netWorthData.totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Connect your accounts to see your net worth
            </p>
          )}
        </CardContent>
      </Card>

      {/* Client-side components with charts and time selector */}
      <DashboardClient initialBreakdown={netWorthData?.breakdown || null} />
    </div>
  )
}

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { NetWorthService } from '@/lib/services/net-worth.service'
import {
  CardContent,
} from '@/components/ui/card'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { GlassCard } from '@/components/ui/glass-card'

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
        investmentBreakdown: {
          stocks: data.breakdown.investmentBreakdown.stocks.toNumber(),
          etfs: data.breakdown.investmentBreakdown.etfs.toNumber(),
          crypto: data.breakdown.investmentBreakdown.crypto.toNumber(),
          other: data.breakdown.investmentBreakdown.other.toNumber(),
        },
      },
    }
  } catch (err) {
    console.error('Failed to fetch net worth:', err)
    error = 'Failed to load financial data'
  }




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
        <GlassCard glowColor="rose">
          <CardContent className="pt-6">
            <p className="text-destructive font-bold">{error}</p>
          </CardContent>
        </GlassCard>
      )}

      {/* Client-side components with charts and time selector */}
      <DashboardClient
        initialBreakdown={netWorthData?.breakdown || null}
        initialNetWorth={netWorthData?.netWorth || 0}
      />
    </div>
  )
}

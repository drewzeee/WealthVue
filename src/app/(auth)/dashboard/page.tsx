import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Wallet, CreditCard, TrendingUp, Building2 } from 'lucide-react'

export const metadata = {
  title: 'Dashboard - WealthVue',
  description: 'Your financial overview',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const placeholderCards = [
    {
      title: 'Total Cash',
      value: '$0.00',
      icon: Wallet,
      description: 'Bank accounts',
    },
    {
      title: 'Credit Balance',
      value: '$0.00',
      icon: CreditCard,
      description: 'Credit cards',
    },
    {
      title: 'Investments',
      value: '$0.00',
      icon: TrendingUp,
      description: 'Portfolio value',
    },
    {
      title: 'Real Estate',
      value: '$0.00',
      icon: Building2,
      description: 'Property value',
    },
  ]

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

      {/* Net Worth Card */}
      <Card>
        <CardHeader>
          <CardDescription>Net Worth</CardDescription>
          <CardTitle className="text-4xl">$0.00</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect your accounts to see your net worth
          </p>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {placeholderCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Placeholder for Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Net Worth Over Time</CardTitle>
            <CardDescription>Track your financial growth</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
            Chart placeholder - Coming in Phase 4
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>How your wealth is distributed</CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
            Chart placeholder - Coming in Phase 4
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

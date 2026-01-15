import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Hash } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { investmentRepository } from "@/lib/db/repositories/investments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ASSET_CLASS_CONFIG, ACCOUNT_TYPE_CONFIG } from "@/types/investment"

interface PageProps {
    params: {
        id: string
    }
}

export default async function InvestmentDetailPage({ params }: PageProps) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        redirect("/login")
    }

    const investment = await investmentRepository.findById(params.id, session.user.id)

    if (!investment) {
        notFound()
    }

    const assetConfig = ASSET_CLASS_CONFIG[investment.assetClass]
    const isPositive = investment.gainLoss >= 0

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(value)

    const formatPercent = (value: number) =>
        `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`

    return (
        <div className="flex flex-col gap-6 p-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/investments">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold tracking-tight">{investment.symbol}</h2>
                        <Badge
                            variant="outline"
                            style={{ borderColor: assetConfig.color, color: assetConfig.color }}
                        >
                            {assetConfig.label}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{investment.name}</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(investment.currentValue)}</div>
                        <p className="text-xs text-muted-foreground">
                            {Number(investment.quantity).toLocaleString(undefined, { maximumFractionDigits: 4 })} shares
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gain/Loss</CardTitle>
                        {isPositive ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {formatCurrency(investment.gainLoss)}
                        </div>
                        <p className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {formatPercent(investment.gainLossPercent)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cost Basis</CardTitle>
                        <Hash className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(Number(investment.costBasis))}</div>
                        <p className="text-xs text-muted-foreground">
                            Avg: {formatCurrency(Number(investment.costBasis) / Number(investment.quantity))} / share
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Price</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {investment.currentPrice ? formatCurrency(Number(investment.currentPrice)) : "—"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {investment.lastPriceUpdate
                                ? `Updated ${format(new Date(investment.lastPriceUpdate), "MMM d, h:mm a")}`
                                : "No price data"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Details */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Investment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Account</span>
                            <span className="font-medium">{investment.account.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Account Type</span>
                            <span className="font-medium">
                                {ACCOUNT_TYPE_CONFIG[investment.account.type].label}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Purchase Date</span>
                            <span className="font-medium">
                                {format(new Date(investment.purchaseDate), "MMM d, yyyy")}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Quantity</span>
                            <span className="font-medium">
                                {Number(investment.quantity).toLocaleString(undefined, { maximumFractionDigits: 8 })}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Price Mode</span>
                            <span className="font-medium">
                                {investment.manualPrice ? "Manual" : "Automatic"}
                            </span>
                        </div>
                        {investment.notes && (
                            <div className="pt-2 border-t">
                                <span className="text-muted-foreground block mb-1">Notes</span>
                                <p className="text-sm">{investment.notes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Price History</CardTitle>
                        <CardDescription>Recent price updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {investment.priceHistory && investment.priceHistory.length > 0 ? (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {investment.priceHistory.map((price) => (
                                    <div
                                        key={price.id}
                                        className="flex justify-between items-center py-2 border-b last:border-0"
                                    >
                                        <div>
                                            <p className="font-medium">{formatCurrency(Number(price.price))}</p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {price.source}
                                            </p>
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {format(new Date(price.timestamp), "MMM d, h:mm a")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                No price history available
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

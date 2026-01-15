import type { Investment, InvestmentAccount, AssetClass, InvestmentAccountType } from "@prisma/client"

// Re-export Prisma enums for convenience
export type { AssetClass, InvestmentAccountType }

// Investment with related account data
export interface InvestmentWithAccount extends Investment {
    account: {
        id: string
        name: string
        type: InvestmentAccountType
    }
}

// Investment account with investments summary
export interface InvestmentAccountWithSummary extends InvestmentAccount {
    investments: Investment[]
    totalValue: number
    totalCostBasis: number
    totalGainLoss: number
    gainLossPercent: number
}

// Price data from external APIs
export interface PriceData {
    symbol: string
    price: number
    change: number
    changePercent: number
    source: "yahoo" | "coingecko" | "manual"
    timestamp: Date
}

// Portfolio summary for dashboard
export interface PortfolioSummary {
    totalValue: number
    totalCostBasis: number
    totalGainLoss: number
    gainLossPercent: number
    dayChange: number
    dayChangePercent: number
    allocation: AllocationItem[]
}

// Allocation breakdown by asset class
export interface AllocationItem {
    assetClass: AssetClass
    label: string
    value: number
    percentage: number
    color: string
}

// Portfolio history point for charts
export interface PortfolioHistoryPoint {
    date: string
    value: number
}

// Investment with calculated fields
export interface InvestmentWithCalculations extends Investment {
    account: {
        id: string
        name: string
        type: InvestmentAccountType
    }
    currentValue: number
    gainLoss: number
    gainLossPercent: number
    dayChange: number
    dayChangePercent: number
}

// Filters for investment queries
export interface InvestmentFilters {
    accountId?: string
    assetClass?: AssetClass
    search?: string
    page?: number
    limit?: number
}

// API response types
export interface InvestmentListResponse {
    investments: InvestmentWithCalculations[]
    total: number
    page: number
    limit: number
    hasMore: boolean
}

export interface InvestmentAccountListResponse {
    accounts: InvestmentAccountWithSummary[]
    total: number
}

export interface PortfolioResponse {
    summary: PortfolioSummary
    topHoldings: InvestmentWithCalculations[]
    recentActivity: Investment[]
}

// Asset class display configuration
export const ASSET_CLASS_CONFIG: Record<AssetClass, { label: string; color: string }> = {
    STOCK: { label: "Stocks", color: "hsl(195, 100%, 55%)" }, // Bright Cyan
    ETF: { label: "ETFs", color: "hsl(50, 100%, 55%)" }, // Electric Yellow
    MUTUAL_FUND: { label: "Mutual Funds", color: "hsl(285, 90%, 60%)" },
    BOND: { label: "Bonds", color: "hsl(30, 100%, 55%)" },
    CRYPTO: { label: "Crypto", color: "hsl(270, 100%, 70%)" }, // Glowing Violet
    REAL_ESTATE: { label: "Real Estate", color: "hsl(220, 15%, 40%)" }, // Neutral Grey
    PRECIOUS_METAL: { label: "Precious Metals", color: "hsl(45, 100%, 50%)" },
    COMMODITY: { label: "Commodities", color: "hsl(170, 100%, 45%)" },
    OTHER: { label: "Other", color: "hsl(340, 100%, 65%)" }, // Neon Pink
}

// Investment account type display configuration
export const ACCOUNT_TYPE_CONFIG: Record<InvestmentAccountType, { label: string; description: string }> = {
    BROKERAGE: { label: "Brokerage", description: "Standard taxable investment account" },
    RETIREMENT_401K: { label: "401(k)", description: "Employer-sponsored retirement plan" },
    RETIREMENT_IRA: { label: "Traditional IRA", description: "Tax-deferred retirement account" },
    RETIREMENT_ROTH_IRA: { label: "Roth IRA", description: "Tax-free growth retirement account" },
    CRYPTO: { label: "Crypto", description: "Cryptocurrency exchange or wallet" },
    OTHER: { label: "Other", description: "Other investment account type" },
}

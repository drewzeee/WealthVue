import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { investmentRepository } from "@/lib/db/repositories/investments"
import { getLatestStockPrices } from "@/lib/integrations/yahoo-finance"
import { getLatestCryptoPrices } from "@/lib/integrations/coingecko"
import { AssetClass } from "@prisma/client"
import { z } from "zod"

const importSchema = z.object({
    accountId: z.string(),
    investments: z.array(z.object({
        symbol: z.string().min(1),
        quantity: z.number(),
        costBasis: z.number(),
        purchaseDate: z.string().optional(), // ISO string
        name: z.string().optional(),
        assetClass: z.nativeEnum(AssetClass).default(AssetClass.STOCK),
    }))
})

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const json = await req.json()
        const { accountId, investments } = importSchema.parse(json)

        // Verify account ownership
        const { investmentAccountRepository } = await import("@/lib/db/repositories/investments")
        const account = await investmentAccountRepository.findById(accountId, session.user.id)

        if (!account) {
            return NextResponse.json(
                { success: false, error: "Investment account not found" },
                { status: 404 }
            )
        }

        // Fetch existing investments to prevent duplicates
        const { investments: existingInvestments } = await investmentRepository.findMany({
            userId: session.user.id,
            accountId: accountId,
            limit: 1000 // Assume no more than 1000 positions per account for simplicity
        })

        // Filter out duplicates
        const newInvestments = investments.filter(inv => {
            const isDuplicate = existingInvestments.some(existing => {
                const sameSymbol = existing.symbol?.toLowerCase() === inv.symbol.toLowerCase()
                const sameQuantity = Number(existing.quantity) === inv.quantity
                const sameCostBasis = Number(existing.costBasis) === inv.costBasis

                // Compare dates by day
                const existingDate = existing.purchaseDate.toISOString().split('T')[0]
                const incomingDate = inv.purchaseDate
                    ? new Date(inv.purchaseDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
                const sameDate = existingDate === incomingDate

                return sameSymbol && sameQuantity && sameCostBasis && sameDate
            })
            return !isDuplicate
        })

        if (newInvestments.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: "No new investments to import (all appear to be duplicates)" }, { status: 200 })
        }

        // Fetch prices
        // We'll separate by likely asset class or just try both if generic.
        // For simplicity in import, we assume most are STOCKS/ETFs unless specified otherwise,
        // but if the user mapped 'assetClass', we use it.

        const cryptoSymbols = newInvestments.filter(i => i.assetClass === AssetClass.CRYPTO).map(i => i.symbol)
        const stockSymbols = newInvestments.filter(i => i.assetClass !== AssetClass.CRYPTO).map(i => i.symbol)

        let stockData: Record<string, any> = {}
        let cryptoData: Record<string, any> = {}

        const fetchPromises = []

        if (stockSymbols.length > 0) {
            fetchPromises.push(
                getLatestStockPrices(stockSymbols)
                    .then(res => { stockData = res })
                    .catch(err => console.warn("Failed to fetch stock prices during import", err))
            )
        }

        if (cryptoSymbols.length > 0) {
            fetchPromises.push(
                getLatestCryptoPrices(cryptoSymbols)
                    .then(res => { cryptoData = res })
                    .catch(err => console.warn("Failed to fetch crypto prices during import", err))
            )
        }

        await Promise.all(fetchPromises)

        // Create records
        const results = await Promise.all(newInvestments.map(async (inv) => {
            const dataMap = inv.assetClass === AssetClass.CRYPTO ? cryptoData : stockData
            // Try symbol match, then lowercase match
            const priceInfo = dataMap[inv.symbol] || dataMap[inv.symbol.toLowerCase()]
            const currentPrice = priceInfo?.price

            return investmentRepository.create({
                accountId,
                assetClass: inv.assetClass,
                symbol: inv.symbol,
                name: inv.name || inv.symbol,
                quantity: inv.quantity,
                costBasis: inv.costBasis,
                purchaseDate: inv.purchaseDate ? new Date(inv.purchaseDate) : new Date(),
                currentPrice: currentPrice,
                manualPrice: false,
                lastPriceUpdate: currentPrice ? new Date() : undefined
            })
        }))

        return NextResponse.json({ success: true, count: results.length }, { status: 201 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: "Validation error", details: error.issues },
                { status: 400 }
            )
        }
        console.error("Failed to import investments:", error)
        return NextResponse.json(
            { success: false, error: "Failed to import investments" },
            { status: 500 }
        )
    }
}

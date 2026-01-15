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

        // Fetch prices
        // We'll separate by likely asset class or just try both if generic.
        // For simplicity in import, we assume most are STOCKS/ETFs unless specified otherwise,
        // but if the user mapped 'assetClass', we use it.
        
        const cryptoSymbols = investments.filter(i => i.assetClass === AssetClass.CRYPTO).map(i => i.symbol)
        const stockSymbols = investments.filter(i => i.assetClass !== AssetClass.CRYPTO).map(i => i.symbol)

        let stockPrices: Record<string, number> = {}
        let cryptoPrices: Record<string, number> = {}

        const fetchPromises = []

        if (stockSymbols.length > 0) {
            fetchPromises.push(
                getLatestStockPrices(stockSymbols)
                    .then(res => { stockPrices = res })
                    .catch(err => console.warn("Failed to fetch stock prices during import", err))
            )
        }

        if (cryptoSymbols.length > 0) {
            fetchPromises.push(
                getLatestCryptoPrices(cryptoSymbols)
                    .then(res => { cryptoPrices = res })
                    .catch(err => console.warn("Failed to fetch crypto prices during import", err))
            )
        }

        await Promise.all(fetchPromises)

        // Create records
        // We'll do this in parallel or a loop since we don't have a true 'createMany' with side effects (AssetPrice) in our repo yet
        // and we want to use the repository logic if possible, or just raw prisma.
        // Given the volume might be 10-100, a loop with Promise.all is fine.

        const results = await Promise.all(investments.map(async (inv) => {
            const priceMap = inv.assetClass === AssetClass.CRYPTO ? cryptoPrices : stockPrices
            // Try symbol match, then lowercase match
            const currentPrice = priceMap[inv.symbol] || priceMap[inv.symbol.toLowerCase()]

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

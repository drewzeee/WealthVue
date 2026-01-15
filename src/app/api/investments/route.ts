import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { investmentRepository } from "@/lib/db/repositories/investments"
import { createInvestmentSchema, deleteInvestmentsSchema } from "@/lib/validations/investment"
import { AssetClass } from "@prisma/client"
import { z } from "zod"

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    const accountId = searchParams.get("accountId") || undefined
    const assetClassParam = searchParams.get("assetClass")
    const assetClass = assetClassParam && Object.values(AssetClass).includes(assetClassParam as AssetClass)
        ? (assetClassParam as AssetClass)
        : undefined
    const search = searchParams.get("search") || undefined

    try {
        const { total, investments } = await investmentRepository.findMany({
            userId: session.user.id,
            accountId,
            assetClass,
            search,
            limit,
            offset,
        })

        return NextResponse.json({
            success: true,
            data: {
                investments,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        })
    } catch (error) {
        console.error("Failed to fetch investments:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch investments" },
            { status: 500 }
        )
    }
}

import { getLatestStockPrices } from "@/lib/integrations/yahoo-finance"
import { getLatestCryptoPrices } from "@/lib/integrations/coingecko"

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const json = await req.json()
        const body = createInvestmentSchema.parse(json)

        // Verify the investment account belongs to the user
        const { investmentAccountRepository } = await import("@/lib/db/repositories/investments")
        const account = await investmentAccountRepository.findById(body.accountId, session.user.id)

        if (!account) {
            return NextResponse.json(
                { success: false, error: "Investment account not found" },
                { status: 404 }
            )
        }

        // If automatic price and no price provided, try to fetch it immediately
        let initialPrice = body.currentPrice
        if (!body.manualPrice && !initialPrice) {
            try {
                if (body.assetClass === AssetClass.CRYPTO) {
                    const prices = await getLatestCryptoPrices([body.symbol])
                    if (prices[body.symbol.toLowerCase()]) {
                        initialPrice = prices[body.symbol.toLowerCase()]
                    }
                } else if (([AssetClass.STOCK, AssetClass.ETF, AssetClass.MUTUAL_FUND] as AssetClass[]).includes(body.assetClass)) {
                    const prices = await getLatestStockPrices([body.symbol])
                    if (prices[body.symbol]) {
                        initialPrice = prices[body.symbol]
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch initial price:", err)
                // Continue without price, background job will pick it up later
            }
        }

        const investment = await investmentRepository.create({
            accountId: body.accountId,
            assetClass: body.assetClass,
            symbol: body.symbol,
            name: body.name,
            quantity: body.quantity,
            costBasis: body.costBasis,
            purchaseDate: body.purchaseDate,
            currentPrice: initialPrice,
            manualPrice: body.manualPrice,
            notes: body.notes,
            lastPriceUpdate: initialPrice ? new Date() : undefined,
        })

        return NextResponse.json({ success: true, data: investment }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: "Validation error", details: error.issues },
                { status: 400 }
            )
        }
        console.error("Failed to create investment:", error)
        return NextResponse.json(
            { success: false, error: "Failed to create investment" },
            { status: 500 }
        )
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    try {
        const json = await req.json()
        const ids = deleteInvestmentsSchema.parse(json)

        const result = await investmentRepository.deleteMany(ids, session.user.id)

        return NextResponse.json({ success: true, data: result })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: "Validation error", details: error.issues },
                { status: 400 }
            )
        }
        console.error("Failed to delete investments:", error)
        return NextResponse.json(
            { success: false, error: "Failed to delete investments" },
            { status: 500 }
        )
    }
}

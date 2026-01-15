import { z } from "zod"
import { AssetClass, InvestmentAccountType } from "@prisma/client"

// Investment Account Schemas
export const createInvestmentAccountSchema = z.object({
    name: z.string().min(1, "Account name is required"),
    type: z.nativeEnum(InvestmentAccountType).default("BROKERAGE"),
    taxAdvantaged: z.boolean().default(false),
})

export type CreateInvestmentAccountSchema = z.infer<typeof createInvestmentAccountSchema>

export const updateInvestmentAccountSchema = createInvestmentAccountSchema.partial()
export type UpdateInvestmentAccountSchema = z.infer<typeof updateInvestmentAccountSchema>

// Investment Schemas
export const createInvestmentSchema = z.object({
    accountId: z.string().min(1, "Investment account is required"),
    assetClass: z.nativeEnum(AssetClass).default("STOCK"),
    symbol: z.string().min(1, "Symbol is required").toUpperCase(),
    name: z.string().min(1, "Name is required"),
    quantity: z.coerce.number().positive("Quantity must be positive"),
    costBasis: z.coerce.number().min(0, "Cost basis cannot be negative"),
    purchaseDate: z.coerce.date(),
    currentPrice: z.coerce.number().optional().nullable(),
    manualPrice: z.boolean().default(false),
    notes: z.string().optional().nullable(),
})

export type CreateInvestmentSchema = z.infer<typeof createInvestmentSchema>

export const updateInvestmentSchema = createInvestmentSchema.partial()
export type UpdateInvestmentSchema = z.infer<typeof updateInvestmentSchema>

export const deleteInvestmentsSchema = z.array(z.string().min(1))
export type DeleteInvestmentsSchema = z.infer<typeof deleteInvestmentsSchema>

// Price Update Schema
export const updatePriceSchema = z.object({
    symbol: z.string().min(1),
    price: z.coerce.number().positive(),
    source: z.enum(["yahoo", "coingecko", "manual"]).default("manual"),
})

export type UpdatePriceSchema = z.infer<typeof updatePriceSchema>

// Bulk Price Update Schema
export const bulkUpdatePricesSchema = z.array(updatePriceSchema)
export type BulkUpdatePricesSchema = z.infer<typeof bulkUpdatePricesSchema>

// Query/Filter Schemas
export const investmentFiltersSchema = z.object({
    accountId: z.string().optional(),
    assetClass: z.nativeEnum(AssetClass).optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50),
})

export type InvestmentFiltersSchema = z.infer<typeof investmentFiltersSchema>

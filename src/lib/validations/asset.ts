import { z } from 'zod'
import { AssetType, LiabilityType } from '@prisma/client'

// Schema for API and internal use (with transformed Dates)
export const assetSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.nativeEnum(AssetType),
    currentValue: z.number().min(0, 'Value must be positive'),
    acquiredDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
        return arg;
    }, z.date()),
    notes: z.string().optional().nullable(),
})

export const liabilitySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.nativeEnum(LiabilityType),
    currentBalance: z.number().min(0, 'Balance must be positive'),
    originalAmount: z.number().min(0, 'Original amount must be positive'),
    interestRate: z.number().optional().nullable(),
    minimumPayment: z.number().optional().nullable(),
    dueDate: z.preprocess((arg) => {
        if (typeof arg == "string" || arg instanceof Date) return new Date(arg);
        return arg;
    }, z.date().optional().nullable()),
    notes: z.string().optional().nullable(),
})

// Schema for Forms (keeps dates as strings for <input type="date">)
export const assetFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.nativeEnum(AssetType),
    currentValue: z.number().min(0, 'Value must be positive'),
    acquiredDate: z.string().min(1, 'Acquired date is required'),
    notes: z.string().optional().nullable(),
})

export const liabilityFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    type: z.nativeEnum(LiabilityType),
    currentBalance: z.number().min(0, 'Balance must be positive'),
    originalAmount: z.number().min(0, 'Original amount must be positive'),
    interestRate: z.number().optional().nullable(),
    minimumPayment: z.number().optional().nullable(),
    dueDate: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
})

export const createAssetSchema = assetSchema
export const updateAssetSchema = assetSchema.partial()
export const createLiabilitySchema = liabilitySchema
export const updateLiabilitySchema = liabilitySchema.partial()

export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>
export type CreateLiabilityInput = z.infer<typeof createLiabilitySchema>
export type UpdateLiabilityInput = z.infer<typeof updateLiabilitySchema>

export type AssetFormInput = z.infer<typeof assetFormSchema>
export type LiabilityFormInput = z.infer<typeof liabilityFormSchema>

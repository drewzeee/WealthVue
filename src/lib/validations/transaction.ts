import { z } from "zod"
import { TransactionSource } from "@prisma/client"

export const createTransactionSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  date: z.coerce.date(),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number(), // Can be negative
  categoryId: z.string().optional().nullable(),
  merchant: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  source: z.nativeEnum(TransactionSource).default("MANUAL"),
})

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>

export const updateTransactionSchema = createTransactionSchema.partial()
export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>

export const deleteTransactionsSchema = z.array(z.string().min(1))
export type DeleteTransactionsSchema = z.infer<typeof deleteTransactionsSchema>
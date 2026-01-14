import { z } from "zod"

// ============================================================================
// CATEGORY SCHEMAS
// ============================================================================

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  color: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color code")
    .default("#3B82F6"),
  icon: z.string().optional(),
  monthlyBudget: z.coerce.number().min(0, "Budget must be positive").default(0),
  carryOver: z.boolean().default(false),
})

export type CreateCategorySchema = z.infer<typeof createCategorySchema>

export const updateCategorySchema = createCategorySchema.partial()

export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>

// ============================================================================
// RULE SCHEMAS
// ============================================================================

export const conditionSchema = z.object({
  field: z.enum(["description", "amount", "merchant"]),
  operator: z.enum(["contains", "equals", "gt", "lt", "gte", "lte"]),
  value: z.union([z.string(), z.number()]),
})

export type Condition = z.infer<typeof conditionSchema>

export const createRuleSchema = z.object({
  categoryId: z.string().cuid("Invalid category ID"),
  priority: z.number().int().min(1).default(1),
  conditions: z.array(conditionSchema).min(1, "At least one condition is required"),
  isActive: z.boolean().default(true),
})

export type CreateRuleSchema = z.infer<typeof createRuleSchema>

export const updateRuleSchema = createRuleSchema.partial()

export type UpdateRuleSchema = z.infer<typeof updateRuleSchema>

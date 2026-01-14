import { Transaction, CategorizationRule } from "@prisma/client"
import { Condition, conditionSchema } from "@/lib/validations/budget"
import { ruleRepository } from "@/lib/db/repositories/rules"

export class CategorizationEngine {
  /**
   * Applies rules to a transaction and returns the matching categoryId, or null if no match.
   * Rules are processed in order of priority (ascending).
   */
  async categorize(
    transaction: Pick<Transaction, "description" | "amount" | "merchant">,
    userId: string,
    rules?: CategorizationRule[] // Optional: pass rules if already fetched
  ): Promise<string | null> {
    const userRules = rules || (await ruleRepository.findMany(userId))

    for (const rule of userRules) {
      if (!rule.isActive) continue
      
      // Parse conditions safely
      const conditions = rule.conditions as any[] // Prisma Json type
      if (!Array.isArray(conditions)) continue

      const isMatch = conditions.every((cond) => this.evaluateCondition(transaction, cond))

      if (isMatch) {
        return rule.categoryId
      }
    }

    return null
  }

  private evaluateCondition(
    transaction: Pick<Transaction, "description" | "amount" | "merchant">,
    rawCondition: any
  ): boolean {
    const result = conditionSchema.safeParse(rawCondition)
    if (!result.success) return false
    const { field, operator, value } = result.data

    let fieldValue: string | number | null | undefined
    
    if (field === "amount") {
      fieldValue = Number(transaction.amount)
    } else {
      fieldValue = transaction[field]
    }

    // If field is null/undefined on transaction (e.g. merchant), it fails comparison unless operator handles it
    if (fieldValue === null || fieldValue === undefined) return false

    // Normalize for comparison
    const normalizedFieldValue = typeof fieldValue === 'string' ? fieldValue.toLowerCase() : fieldValue
    const normalizedValue = typeof value === 'string' ? value.toLowerCase() : value

    switch (operator) {
      case "contains":
        return String(normalizedFieldValue).includes(String(normalizedValue))
      case "equals":
        return normalizedFieldValue === normalizedValue
      case "gt":
        return Number(normalizedFieldValue) > Number(normalizedValue)
      case "lt":
        return Number(normalizedFieldValue) < Number(normalizedValue)
      case "gte":
        return Number(normalizedFieldValue) >= Number(normalizedValue)
      case "lte":
        return Number(normalizedFieldValue) <= Number(normalizedValue)
      default:
        return false
    }
  }
}

export const categorizationEngine = new CategorizationEngine()

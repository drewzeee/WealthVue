import { createCategorySchema, createRuleSchema } from "../src/lib/validations/budget"

try {
  console.log("Testing Category Schema...")
  createCategorySchema.parse({ name: "Groceries", color: "#FF0000", carryOver: true })
  console.log("✅ Category Valid")

  console.log("Testing Rule Schema...")
  createRuleSchema.parse({
    categoryId: "clq1234567890123456789012", // Mock CUID-like
    priority: 1,
    conditions: [{ field: "description", operator: "contains", value: "Walmart" }]
  })
  console.log("✅ Rule Valid")
  
} catch (e) {
  console.error("❌ Validation Failed", e)
  process.exit(1)
}

import { categorizationEngine } from "../src/lib/services/categorization.engine"

import { Decimal } from "@prisma/client/runtime/library"

// Mock Transaction
const tx1 = {
  description: "UBER *TRIP",
  amount: new Decimal(25.50),
  merchant: "Uber"
}

const tx2 = {
  description: "McDonalds",
  amount: new Decimal(15.00),
  merchant: null
}

// Mock Rules
const rules: any[] = [
  {
    id: "r1",
    priority: 1,
    isActive: true,
    categoryId: "cat-transport",
    conditions: [
      { field: "description", operator: "contains", value: "Uber" }
    ]
  },
  {
    id: "r2",
    priority: 2,
    isActive: true,
    categoryId: "cat-food",
    conditions: [
      { field: "amount", operator: "lt", value: 20 }
    ]
  }
]

async function main() {
  console.log("Testing Categorization Engine...")

  // Test 1: Uber -> Transport
  const cat1 = await categorizationEngine.categorize(tx1, "user1", rules)
  if (cat1 !== "cat-transport") throw new Error(`Expected cat-transport, got ${cat1}`)
  console.log("✅ Uber -> Transport")

  // Test 2: McDonalds -> Food (by amount rule)
  const cat2 = await categorizationEngine.categorize(tx2, "user1", rules)
  if (cat2 !== "cat-food") throw new Error(`Expected cat-food, got ${cat2}`)
  console.log("✅ McDonalds -> Food")

  console.log("✅ Engine Logic Valid")
}

main().catch(console.error)

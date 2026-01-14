import { ruleRepository } from "../src/lib/db/repositories/rules"
import { categoryRepository } from "../src/lib/db/repositories/budgets"
import { prisma } from "../src/lib/db/client"

async function main() {
  console.log("Testing Rule Repository...")

  const user = await prisma.user.create({
    data: {
      email: `test-rule-repo-${Date.now()}@example.com`,
      name: "Test User",
      passwordHash: "hash",
    }
  })

  try {
    // Need a category first
    const cat = await categoryRepository.create({
      userId: user.id,
      name: "Rule Cat",
      color: "#00FF00"
    })

    // Create Rule
    const rule = await ruleRepository.create({
      userId: user.id,
      categoryId: cat.id,
      priority: 1,
      conditions: [{ field: "description", operator: "contains", value: "Test" }]
    })
    console.log("✅ Created:", rule.id)

    // Find Many
    const list = await ruleRepository.findMany(user.id)
    if (list.length !== 1) throw new Error("List length mismatch")
    console.log("✅ Find Many")

    // Update
    const updated = await ruleRepository.update(rule.id, user.id, { priority: 2 })
    if (updated.priority !== 2) throw new Error("Update failed")
    console.log("✅ Updated")

    // Delete
    await ruleRepository.delete(rule.id, user.id)
    const listAfter = await ruleRepository.findMany(user.id)
    if (listAfter.length !== 0) throw new Error("Delete failed")
    console.log("✅ Deleted")

  } finally {
    await prisma.user.delete({ where: { id: user.id } })
  }
}

main().catch(console.error)

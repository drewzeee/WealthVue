import { categoryRepository } from "../src/lib/db/repositories/budgets"
import { prisma } from "../src/lib/db/client"

async function main() {
  console.log("Testing Category Repository...")

  // Mock user ID (assuming seed user or we create one)
  // For safety, let's create a temp user
  const user = await prisma.user.create({
    data: {
      email: `test-cat-repo-${Date.now()}@example.com`,
      name: "Test User",
      passwordHash: "hash",
    }
  })

  try {
    // Create
    const cat = await categoryRepository.create({
      userId: user.id,
      name: "Test Category",
      color: "#00FF00"
    })
    console.log("✅ Created:", cat.id)

    // Find Many
    const list = await categoryRepository.findMany(user.id)
    if (list.length !== 1) throw new Error("List length mismatch")
    console.log("✅ Find Many")

    // Update
    const updated = await categoryRepository.update(cat.id, user.id, { name: "Updated Name" })
    if (updated.name !== "Updated Name") throw new Error("Update failed")
    console.log("✅ Updated")

    // Delete
    await categoryRepository.delete(cat.id, user.id)
    const listAfter = await categoryRepository.findMany(user.id)
    if (listAfter.length !== 0) throw new Error("Delete failed")
    console.log("✅ Deleted")

  } finally {
    await prisma.user.delete({ where: { id: user.id } })
  }
}

main().catch(console.error)

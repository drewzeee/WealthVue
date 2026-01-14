import { transactionRepository } from "../src/lib/db/repositories/transactions"
import { prisma } from "../src/lib/db/client"

async function main() {
  console.log("Testing TransactionRepository...")

  // Mock user ID (assuming seed data or existing user)
  // We'll fetch a user first
  const user = await prisma.user.findFirst()
  if (!user) {
    console.log("No users found. skipping test.")
    return
  }
  console.log(`Using user: ${user.email} (${user.id})`)

  // 1. Create a transaction
  console.log("1. Creating transaction...")
  const account = await prisma.account.findFirst({ where: { userId: user.id } })
  
  if (!account) {
     // Create dummy account
     await prisma.account.create({
         data: {
             userId: user.id,
             name: "Test Account",
             type: "CHECKING",
             currentBalance: 1000,
         }
     })
  }
  
  const validAccount = await prisma.account.findFirstOrThrow({ where: { userId: user.id } })

  const created = await transactionRepository.create({
    accountId: validAccount.id,
    date: new Date(),
    description: "Test Transaction 123",
    amount: 50.00,
    source: "MANUAL"
  })
  console.log("Created:", created.id)

  // 2. Find many with search
  console.log("2. Searching 'Test'...")
  const result = await transactionRepository.findMany({
    userId: user.id,
    search: "Test Transaction 123",
  })
  console.log(`Found ${result.total} transactions matching search.`)
  if (result.total === 0) console.error("FAILED: Search returned 0")

  // 3. Find many with date filter (future date should be empty)
  console.log("3. Filtering by future date...")
  const future = new Date()
  future.setFullYear(future.getFullYear() + 1)
  const emptyResult = await transactionRepository.findMany({
    userId: user.id,
    startDate: future,
  })
  console.log(`Found ${emptyResult.total} transactions in future.`)
  if (emptyResult.total > 0) console.error("FAILED: Future date filter returned results")

  // 4. Delete
  console.log("4. Deleting...")
  await transactionRepository.delete(created.id, user.id)
  console.log("Deleted.")

  console.log("Done.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

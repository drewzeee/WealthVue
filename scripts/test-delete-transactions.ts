
import { transactionRepository } from "../src/lib/db/repositories/transactions"
import { prisma } from "../src/lib/db/client"

async function main() {
    console.log("Starting bulk delete test...")

    // 1. Get a test user (create one if needed, or find first user)
    const user = await prisma.user.findFirst()
    if (!user) {
        console.error("No user found. Run seed or create user first.")
        process.exit(1)
    }
    console.log(`Using user: ${user.email}`)

    // 2. Create an account if needed
    let account = await prisma.account.findFirst({ where: { userId: user.id } })
    if (!account) {
        account = await prisma.account.create({
            data: {
                userId: user.id,
                name: "Test Account",
                type: "CHECKING",
                currentBalance: 1000,
            },
        })
        console.log("Created test account")
    }

    // 3. Create dummy transactions
    const tx1 = await transactionRepository.create({
        accountId: account.id,
        date: new Date(),
        description: "To Delete 1",
        amount: 10,
        source: "MANUAL",
    })
    const tx2 = await transactionRepository.create({
        accountId: account.id,
        date: new Date(),
        description: "To Delete 2",
        amount: 20,
        source: "MANUAL",
    })

    console.log(`Created transactions: ${tx1.id}, ${tx2.id}`)

    // 4. Delete them using deleteMany
    const deleteResult = await transactionRepository.deleteMany([tx1.id, tx2.id], user.id)
    console.log("Delete result:", deleteResult)

    // 5. Verify they are gone
    const remaining = await prisma.transaction.findMany({
        where: { id: { in: [tx1.id, tx2.id] } },
    })

    if (remaining.length === 0) {
        console.log("SUCCESS: Transactions successfully deleted.")
    } else {
        console.error("FAILURE: Some transactions still exist:", remaining)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

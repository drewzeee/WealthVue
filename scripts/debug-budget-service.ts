
import { budgetService } from "../src/lib/services/budget.service"
import { transactionRepository } from "../src/lib/db/repositories/transactions"
import { prisma } from "../src/lib/db/client"
import { startOfMonth, endOfMonth } from "date-fns"

async function main() {
    console.log("🔍 Debugging Budget Service...")

    // 1. Get a user
    const user = await prisma.user.findFirst()
    if (!user) {
        console.error("❌ No user found in database")
        return
    }
    console.log(`👤 Using User: ${user.email} (${user.id})`)

    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    console.log(`📅 Date Range: ${start.toISOString()} to ${end.toISOString()}`)

    // 2. Fetch Raw Transactions
    console.log("\n📊 fetching RAW transactions from Repository...")
    const raw = await transactionRepository.findMany({
        userId: user.id,
        startDate: start,
        endDate: end,
        limit: 1000
    })
    console.log(`✅ Found ${raw.transactions.length} transactions via Repository.`)
    if (raw.transactions.length > 0) {
        console.log("Sample Transaction Dates (Rep):")
        raw.transactions.slice(0, 5).forEach(t => console.log(` - ${t.date.toISOString()} | ${t.description} | ${t.amount} | CatID: ${t.categoryId} | Transfer: ${t.isTransfer}`))
    }

    // 3. Call Budget Service
    console.log("\n💰 Calling BudgetService.getBudgetOverview...")
    const overview = await budgetService.getBudgetOverview(user.id, now)

    console.log("\n📉 Overview Result:")
    console.log("Income:", overview.overall.income)
    console.log("Spent:", overview.overall.spent)
    console.log("Budgeted:", overview.overall.budgeted)
    console.log("Remaining:", overview.overall.remaining)

    console.log("\n📂 Categories:")
    overview.categories.forEach(c => {
        console.log(` - ${c.name}: Budgeted=${c.budgeted}, CarryOver=${c.carryOver}, Spent=${c.spent}, Remaining=${c.remaining}, Progress=${c.progress}%`)
    })

    // 4. Debug: Check for transactions OUTSIDE range if any
    const allTrans = await prisma.transaction.findMany({
        where: { account: { userId: user.id } },
        select: { date: true, amount: true, categoryId: true }
    })
    console.log(`\n🔎 Total Transactions in DB for user: ${allTrans.length}`)
    const outOfRange = allTrans.filter(t => t.date < start || t.date > end)
    console.log(`⚠️ Transactions OUTSIDE current month: ${outOfRange.length}`)

    // Check Transfers specifically
    // Note: 'isTransfer' might not be in the selection above. Let's re-fetch or cast if we trust it's there?
    // Actually, let's fetch it properly.
    const allTransWithTransfer = await prisma.transaction.findMany({
        where: { account: { userId: user.id } },
        select: { date: true, amount: true, isTransfer: true }
    })
    const transfers = allTransWithTransfer.filter(t => t.isTransfer)
    console.log(`\n🔄 Total Detected Transfers in DB: ${transfers.length}`)
    transfers.forEach(t => console.log(`   - Date: ${t.date.toISOString()} | Amount: ${t.amount} | IsTransfer: ${t.isTransfer}`))
    const transferSum = transfers.reduce((sum, t) => sum + Number(t.amount), 0)
    console.log(`Sum of Transfers (raw): ${transferSum}`)

    // Calculate sum of ALL transactions
    const totalSum = allTrans.reduce((sum, t) => sum + Number(t.amount), 0)
    console.log(`Sum of ALL transactions (raw amount): ${totalSum}`)

    // 5. DIRECT DB CHECK for CategoryId
    console.log("\n🕵️ DIRECT DB CHECK:")
    const direct = await prisma.transaction.findMany({
        where: {
            account: { userId: user.id },
            amount: { lt: 0 }, // Check expenses
            date: { gte: start, lte: end }
        },
        take: 5
    })
    console.log("Direct query samples:")
    direct.forEach(t => console.log(` - ${t.description} | CatID: ${t.categoryId}`))

    // 6. Check Rules
    console.log("\n📜 Checking Rules...")
    const rules = await prisma.categorizationRule.findMany({
        where: { userId: user.id },
        include: { category: true }
    })
    console.log(`Active Rules: ${rules.length}`)
    rules.forEach(r => console.log(` - Rule for ${r.category.name}: ${JSON.stringify(r.conditions)}`))
}

main().catch(console.error)

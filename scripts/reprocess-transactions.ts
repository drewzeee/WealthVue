
import { batchProcessingService } from "../src/lib/services/batch-processing.service"
import { prisma } from "../src/lib/db/client"

async function main() {
    console.log("🔄 Starting Transaction Reprocessing...")

    // 1. Get a user
    const user = await prisma.user.findFirst()
    if (!user) {
        console.error("❌ No user found in database")
        return
    }
    console.log(`👤 Processing for User: ${user.email} (${user.id})`)

    try {
        const result = await batchProcessingService.processAllTransactions(user.id)
        console.log("\n✅ Reprocess Complete!")
        console.log(` - Categorized: ${result.categorizedCount} transactions`)
        console.log(` - Transfers Detected: ${result.transferCount} transactions`)
    } catch (error) {
        console.error("❌ Error during reprocessing:", error)
    }
}

main().catch(console.error)

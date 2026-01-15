import { PrismaClient, TransactionSource } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting transaction sign migration...');

    // We only target PLAID and CSV_IMPORT sources as they definitely followed the raw amount mapping.
    // MANUAL transactions are left alone to avoid flipping user-entered values that might already be correct,
    // though the user can review them manually in the UI.

    const sourcesToFlip = [TransactionSource.PLAID, TransactionSource.CSV_IMPORT];

    const transactions = await prisma.transaction.findMany({
        where: {
            source: {
                in: sourcesToFlip,
            },
        },
    });

    console.log(`Found ${transactions.length} transactions to update.`);

    let updatedCount = 0;
    for (const txn of transactions) {
        // Invert the sign
        const newAmount = -Number(txn.amount);

        await prisma.transaction.update({
            where: { id: txn.id },
            data: { amount: newAmount },
        });

        updatedCount++;
        if (updatedCount % 10 === 0) {
            console.log(`Updated ${updatedCount}/${transactions.length}...`);
        }
    }

    console.log('✅ Migration complete!');
}

main()
    .catch((e) => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

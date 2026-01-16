import { prisma } from "../src/lib/db/client";

async function main() {
    console.log("Starting backfill for transaction dates...");

    const transactions = await prisma.transaction.findMany({
        where: {
            authorizedDate: { not: null },
        },
    });

    console.log(`Found ${transactions.length} transactions with authorizedDate.`);

    let updatedCount = 0;
    for (const txn of transactions) {
        if (txn.authorizedDate && txn.date.getTime() !== txn.authorizedDate.getTime()) {
            await prisma.transaction.update({
                where: { id: txn.id },
                data: {
                    date: txn.authorizedDate,
                },
            });
            updatedCount++;
        }
    }

    console.log(`Backfill complete. Updated ${updatedCount} transactions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

import { prisma } from "../src/lib/db/client";

async function main() {
    const transactions = await prisma.transaction.findMany({
        orderBy: { date: "desc" },
        include: {
            account: { select: { name: true } },
        },
        take: 20,
    });

    console.log("Date | AuthDate | Description | Account | Pending");
    console.log("-----|----------|-------------|---------|--------");
    transactions.forEach((t) => {
        console.log(
            `${t.date.toISOString().split("T")[0]} | ${t.authorizedDate ? t.authorizedDate.toISOString().split("T")[0] : "null"
            } | ${t.description.substring(0, 20)} | ${t.account.name} | ${t.pending}`
        );
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

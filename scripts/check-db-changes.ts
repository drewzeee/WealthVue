import { prisma } from '../src/lib/db/client';

async function main() {
    const btc = await prisma.investment.findFirst({
        where: { symbol: "BTC" },
        select: { symbol: true, dayChange: true, dayChangePercent: true, quantity: true, currentPrice: true }
    });

    const eth = await prisma.investment.findFirst({
        where: { symbol: "ETH" },
        select: { symbol: true, dayChange: true, dayChangePercent: true, quantity: true, currentPrice: true }
    });

    const mdlox = await prisma.investment.findFirst({
        where: { symbol: "MDLOX" },
        select: { symbol: true, dayChange: true, dayChangePercent: true, quantity: true, currentPrice: true }
    });

    console.log("BTC:", JSON.stringify(btc, null, 2));
    console.log("ETH:", JSON.stringify(eth, null, 2));
    console.log("MDLOX:", JSON.stringify(mdlox, null, 2));
}

main().then(() => process.exit(0)).catch(console.error);

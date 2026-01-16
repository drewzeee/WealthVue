import { investmentService } from '../src/lib/services/investment.service';

async function main() {
    const userId = "clws9zxl70000ux286sqs3v3r"; // Need a valid ID, let's look for one
    const users = await require('../src/lib/db/client').prisma.user.findMany({ take: 1 });
    if (users.length === 0) {
        console.log("No users found");
        return;
    }

    const id = users[0].id;
    console.log(`Checking overview for user: ${id}`);

    const overview = await investmentService.getOverview(id);

    const btc = overview.assetDetails.find(a => a.symbol === "BTC");
    const mdlox = overview.assetDetails.find(a => a.symbol === "MDLOX");

    console.log("BTC in Overview:", JSON.stringify(btc, null, 2));
    console.log("MDLOX in Overview:", JSON.stringify(mdlox, null, 2));
}

main().then(() => process.exit(0)).catch(console.error);

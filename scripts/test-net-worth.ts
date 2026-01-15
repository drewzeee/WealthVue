import { prisma } from "../src/lib/db/client";
import { NetWorthService } from "../src/lib/services/net-worth.service";
import { AccountType, AssetType, LiabilityType, InvestmentAccountType, AssetClass } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

async function main() {
  console.log("Starting Net Worth Service Test...");

  // 1. Create a test user
  const user = await prisma.user.create({
    data: {
      email: `networth-test-${Date.now()}@example.com`,
      name: "Net Worth Tester",
      passwordHash: "dummy",
    },
  });
  console.log(`Created test user: ${user.id}`);

  try {
    // 2. Create Accounts (Assets & Liabilities)
    // Asset: Checking Account ($1000)
    await prisma.account.create({
      data: {
        userId: user.id,
        name: "Test Checking",
        type: AccountType.CHECKING,
        currentBalance: new Decimal(1000),
      },
    });

    // Liability: Credit Card ($500 debt - usually positive in Plaid/DB)
    await prisma.account.create({
      data: {
        userId: user.id,
        name: "Test Visa",
        type: AccountType.CREDIT_CARD,
        currentBalance: new Decimal(500),
      },
    });

    // 3. Create Investment Account
    const invAccount = await prisma.investmentAccount.create({
      data: {
        userId: user.id,
        name: "Test Brokerage",
        type: InvestmentAccountType.BROKERAGE,
      },
    });

    // 10 shares of Apple at $150 = $1500
    await prisma.investment.create({
      data: {
        accountId: invAccount.id,
        symbol: "AAPL",
        name: "Apple Inc.",
        quantity: new Decimal(10),
        costBasis: new Decimal(140),
        currentPrice: new Decimal(150),
        purchaseDate: new Date(),
        assetClass: AssetClass.STOCK,
      },
    });

    // 4. Create Manual Asset
    // Car worth $20,000
    await prisma.asset.create({
      data: {
        userId: user.id,
        name: "Tesla Model 3",
        type: AssetType.VEHICLE,
        currentValue: new Decimal(20000),
        acquiredDate: new Date(),
      },
    });

    // 5. Create Manual Liability
    // Car Loan $15,000
    await prisma.liability.create({
      data: {
        userId: user.id,
        name: "Car Loan",
        type: LiabilityType.AUTO_LOAN,
        currentBalance: new Decimal(15000),
        originalAmount: new Decimal(20000),
      },
    });

    console.log("Created test data. Calculating Net Worth...");

    // 6. Calculate Net Worth
    const result = await NetWorthService.calculateCurrentNetWorth(user.id);

    console.log("\n--- Net Worth Result ---");
    console.log(`Net Worth: $${result.netWorth.toString()}`);
    console.log(`Total Assets: $${result.totalAssets.toString()}`);
    console.log(`Total Liabilities: $${result.totalLiabilities.toString()}`);
    console.log("Breakdown:", JSON.stringify(result.breakdown, null, 2));

    // Expected:
    // Assets: 1000 (Checking) + 1500 (Stocks) + 20000 (Car) = 22,500
    // Liabilities: 500 (CC) + 15000 (Loan) = 15,500
    // Net Worth: 22,500 - 15,500 = 7,000

    const expectedNetWorth = 7000;
    const actualNetWorth = result.netWorth.toNumber();

    if (actualNetWorth === expectedNetWorth) {
      console.log("\n✅ SUCCESS: Net Worth calculation is correct.");
    } else {
      console.error(`\n❌ FAILURE: Expected ${expectedNetWorth}, got ${actualNetWorth}`);
    }

    // 7. Test Snapshot
    console.log("\nGenerating Snapshot...");
    const snapshot = await NetWorthService.generateSnapshot(user.id);
    console.log("Snapshot created:", snapshot.id);

    if (snapshot.netWorth.toNumber() === expectedNetWorth) {
       console.log("✅ SUCCESS: Snapshot saved correctly.");
    } else {
       console.error("❌ FAILURE: Snapshot value mismatch.");
    }

    // 8. Test History
    console.log("\nFetching History...");
    const history = await NetWorthService.getHistory(user.id, 'ALL');
    console.log(`Found ${history.length} snapshot(s).`);
    if (history.length === 1) {
        console.log("✅ SUCCESS: History retrieval correct.");
    } else {
        console.error("❌ FAILURE: History count mismatch.");
    }

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    // Cleanup
    console.log("\nCleaning up...");
    await prisma.user.delete({ where: { id: user.id } });
  }
}

main();
import { prisma } from "@/lib/db/client";
import { AccountType, Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface NetWorthResult {
  netWorth: Decimal;
  totalAssets: Decimal;
  totalLiabilities: Decimal;
  currency: string;
  breakdown: {
    accountAssets: Decimal;
    accountLiabilities: Decimal;
    investmentAssets: Decimal;
    manualAssets: Decimal;
    manualLiabilities: Decimal;
  };
}

export class NetWorthService {
  static async calculateCurrentNetWorth(userId: string): Promise<NetWorthResult> {
    // 1. Sum Account Assets (Checking, Savings, Investment, Other)
    const accountAssetsAgg = await prisma.account.aggregate({
      where: {
        userId,
        type: {
          in: [
            AccountType.CHECKING,
            AccountType.SAVINGS,
            AccountType.INVESTMENT,
            AccountType.OTHER,
          ],
        },
      },
      _sum: {
        currentBalance: true,
      },
    });

    // 2. Sum Account Liabilities (Credit Card, Loan)
    const accountLiabilitiesAgg = await prisma.account.aggregate({
      where: {
        userId,
        type: {
          in: [AccountType.CREDIT_CARD, AccountType.LOAN],
        },
      },
      _sum: {
        currentBalance: true,
      },
    });

    // 3. Sum InvestmentAccount Assets (Calculated from holdings)
    const investmentAccounts = await prisma.investmentAccount.findMany({
      where: { userId },
      include: {
        investments: true,
      },
    });

    let investmentAssetsSum = new Decimal(0);
    for (const account of investmentAccounts) {
      for (const inv of account.investments) {
        // Fallback to costBasis if currentPrice is null
        const price = inv.currentPrice ?? inv.costBasis;
        const value = inv.quantity.mul(price);
        investmentAssetsSum = investmentAssetsSum.add(value);
      }
    }

    // 4. Sum Manual Assets
    const manualAssetsAgg = await prisma.asset.aggregate({
      where: { userId },
      _sum: { currentValue: true },
    });

    // 5. Sum Manual Liabilities
    const manualLiabilitiesAgg = await prisma.liability.aggregate({
      where: { userId },
      _sum: { currentBalance: true },
    });

    // Aggregation (Handle nulls with new Decimal(0))
    const totalAccountAssets =
      accountAssetsAgg._sum.currentBalance ?? new Decimal(0);
    const totalAccountLiabilities =
      accountLiabilitiesAgg._sum.currentBalance ?? new Decimal(0);
    const totalManualAssets =
      manualAssetsAgg._sum.currentValue ?? new Decimal(0);
    const totalManualLiabilities =
      manualLiabilitiesAgg._sum.currentBalance ?? new Decimal(0);

    const totalAssets = totalAccountAssets
      .add(investmentAssetsSum)
      .add(totalManualAssets);

    const totalLiabilities = totalAccountLiabilities.add(totalManualLiabilities);

    // Plaid liabilities are positive numbers representing debt, so we subtract them.
    const netWorth = totalAssets.sub(totalLiabilities);

    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      currency: "USD",
      breakdown: {
        accountAssets: totalAccountAssets,
        accountLiabilities: totalAccountLiabilities,
        investmentAssets: investmentAssetsSum,
        manualAssets: totalManualAssets,
        manualLiabilities: totalManualLiabilities,
      },
    };
  }

  static async calculateHouseholdNetWorth(userId: string): Promise<NetWorthResult> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { linkedUserId: true, linkStatus: true },
    });

    if (!user?.linkedUserId || user.linkStatus !== 'LINKED') {
      return this.calculateCurrentNetWorth(userId);
    }

    const [member1, member2] = await Promise.all([
      this.calculateCurrentNetWorth(userId),
      this.calculateCurrentNetWorth(user.linkedUserId),
    ]);

    return {
      netWorth: member1.netWorth.add(member2.netWorth),
      totalAssets: member1.totalAssets.add(member2.totalAssets),
      totalLiabilities: member1.totalLiabilities.add(member2.totalLiabilities),
      currency: "USD",
      breakdown: {
        accountAssets: member1.breakdown.accountAssets.add(member2.breakdown.accountAssets),
        accountLiabilities: member1.breakdown.accountLiabilities.add(member2.breakdown.accountLiabilities),
        investmentAssets: member1.breakdown.investmentAssets.add(member2.breakdown.investmentAssets),
        manualAssets: member1.breakdown.manualAssets.add(member2.breakdown.manualAssets),
        manualLiabilities: member1.breakdown.manualLiabilities.add(member2.breakdown.manualLiabilities),
      },
    };
  }

  static async generateSnapshot(userId: string) {
    const data = await this.calculateCurrentNetWorth(userId);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Normalized to UTC midnight

    // Check if snapshot exists for today to update or create
    return await prisma.netWorthSnapshot.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        netWorth: data.netWorth,
        totalAssets: data.totalAssets,
        totalLiabilities: data.totalLiabilities,
        allocation: data.breakdown as unknown as Prisma.JsonObject,
      },
      create: {
        userId,
        date: today,
        netWorth: data.netWorth,
        totalAssets: data.totalAssets,
        totalLiabilities: data.totalLiabilities,
        allocation: data.breakdown as unknown as Prisma.JsonObject,
      },
    });
  }

  static async getHistory(userId: string, range: string = 'ALL') {
    let dateFilter: Date | undefined;
    const now = new Date();

    switch (range) {
      case '1M':
        dateFilter = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '3M':
        dateFilter = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '6M':
        dateFilter = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1Y':
        dateFilter = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case 'ALL':
      default:
        dateFilter = undefined;
    }

    return await prisma.netWorthSnapshot.findMany({
      where: {
        userId,
        date: dateFilter ? { gte: dateFilter } : undefined,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}

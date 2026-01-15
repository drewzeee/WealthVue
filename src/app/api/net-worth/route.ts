import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { NetWorthService } from "@/lib/services/net-worth.service";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("mode") || "personal";

  try {
    const data = mode === "household"
      ? await NetWorthService.calculateHouseholdNetWorth(session.user.id)
      : await NetWorthService.calculateCurrentNetWorth(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        // Convert Decimals to numbers for JSON serialization
        netWorth: data.netWorth.toNumber(),
        totalAssets: data.totalAssets.toNumber(),
        totalLiabilities: data.totalLiabilities.toNumber(),
        breakdown: {
          accountAssets: data.breakdown.accountAssets.toNumber(),
          accountLiabilities: data.breakdown.accountLiabilities.toNumber(),
          investmentAssets: data.breakdown.investmentAssets.toNumber(),
          manualAssets: data.breakdown.manualAssets.toNumber(),
          manualLiabilities: data.breakdown.manualLiabilities.toNumber(),
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch net worth:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch net worth" },
      { status: 500 }
    );
  }
}

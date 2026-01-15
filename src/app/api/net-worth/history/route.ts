import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { authOptions } from "@/lib/auth";
import { NetWorthService } from "@/lib/services/net-worth.service";
import { Decimal } from "@prisma/client/runtime/library";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "ALL";
  const mode = searchParams.get("mode") || "personal";

  try {
    if (mode === "household") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { linkedUserId: true, linkStatus: true },
      });

      if (user?.linkedUserId && user.linkStatus === 'LINKED') {
        const [history1, history2] = await Promise.all([
          NetWorthService.getHistory(session.user.id, range),
          NetWorthService.getHistory(user.linkedUserId, range),
        ]);

        // Merge and sum by date
        const dateMap = new Map<string, { netWorth: any, totalAssets: any, totalLiabilities: any }>();

        [...history1, ...history2].forEach(s => {
          const dateStr = s.date.toISOString().split('T')[0];
          const existing = dateMap.get(dateStr) || {
            netWorth: new Decimal(0),
            totalAssets: new Decimal(0),
            totalLiabilities: new Decimal(0)
          };

          dateMap.set(dateStr, {
            netWorth: existing.netWorth.add(s.netWorth),
            totalAssets: existing.totalAssets.add(s.totalAssets),
            totalLiabilities: existing.totalLiabilities.add(s.totalLiabilities),
          });
        });

        let merged = Array.from(dateMap.entries()).map(([dateStr, values]) => ({
          date: new Date(dateStr),
          netWorth: values.netWorth.toNumber(),
          totalAssets: values.totalAssets.toNumber(),
          totalLiabilities: values.totalLiabilities.toNumber(),
        })).sort((a, b) => a.date.getTime() - b.date.getTime());

        // Append current live household value for all ranges
        const current = await NetWorthService.calculateHouseholdNetWorth(session.user.id);
        merged.push({
          date: new Date(),
          netWorth: current.netWorth.toNumber(),
          totalAssets: current.totalAssets.toNumber(),
          totalLiabilities: current.totalLiabilities.toNumber(),
        });

        return NextResponse.json({ success: true, data: merged });
      }
    }

    const snapshots = await NetWorthService.getHistory(session.user.id, range);

    const data = snapshots.map((s) => ({
      ...s,
      netWorth: s.netWorth.toNumber(),
      totalAssets: s.totalAssets.toNumber(),
      totalLiabilities: s.totalLiabilities.toNumber(),
    }));

    // Append current live personal value for all ranges
    const current = await NetWorthService.calculateCurrentNetWorth(session.user.id);
    data.push({
      id: 'live',
      userId: session.user.id,
      date: new Date(),
      netWorth: current.netWorth.toNumber(),
      totalAssets: current.totalAssets.toNumber(),
      totalLiabilities: current.totalLiabilities.toNumber(),
      allocation: current.breakdown as any,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Failed to fetch net worth history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch net worth history" },
      { status: 500 }
    );
  }
}

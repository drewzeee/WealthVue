# Investment Overview Cards Enhancement

Add crypto allocation, stock allocation donut charts, and daily change cards for each asset to the investment overview page.

---

## Proposed Changes

### Backend Service Enhancements

#### [MODIFY] [investment.service.ts](file:///home/andrew/wealthvue/src/lib/services/investment.service.ts)

Extend `getOverview` to return:
- **Crypto allocation**: Breakdown of all CRYPTO investments by symbol (e.g., BTC, ETH) with value and percentage
- **Stock allocation**: Breakdown of all STOCK/ETF investments by symbol (e.g., AAPL, GOOGL) with value and percentage
- **Per-asset data**: List of all investments with daily change info for display in individual cards

New response shape will include:
```typescript
{
  // Existing fields...
  cryptoAllocation: { symbol: string; name: string; value: number; percentage: number }[]
  stockAllocation: { symbol: string; name: string; value: number; percentage: number }[]
  assetDetails: {
    id: string
    symbol: string
    name: string
    assetClass: AssetClass
    quantity: number
    currentPrice: number
    currentValue: number
    dayChange: number
    dayChangePercent: number
    lastPriceUpdate: Date | null
  }[]
}
```

---

#### [MODIFY] [yahoo-finance.ts](file:///home/andrew/wealthvue/src/lib/integrations/yahoo-finance.ts)

Add new function `getStockQuotesWithChange` that returns both current price and daily change data using Yahoo Finance's `regularMarketChange` and `regularMarketChangePercent` fields.

---

#### [MODIFY] [coingecko.ts](file:///home/andrew/wealthvue/src/lib/integrations/coingecko.ts)

Modify `getLatestCryptoPrices` to also fetch 24-hour change data by adding `include_24hr_change=true` to the API request.

---

### Persistence & Job Updates

#### [MODIFY] [schema.prisma](file:///home/andrew/wealthvue/prisma/schema.prisma)
- Add `dayChange` and `dayChangePercent` (Decimal) to `Investment` model.

#### [MODIFY] [investments.ts](file:///home/andrew/wealthvue/src/lib/db/repositories/investments.ts)
- Update `bulkUpdatePrices` to accept and save `dayChange` and `dayChangePercent`.
- Update `findMany` and `findById` to return the stored change values.

#### [MODIFY] [price-update.ts](file:///home/andrew/wealthvue/src/lib/jobs/price-update.ts)
- Update worker to extract change data from API responses and pass to `bulkUpdatePrices`.

---

### Frontend Components

#### [NEW] [crypto-allocation-chart.tsx](file:///home/andrew/wealthvue/src/components/investments/crypto-allocation-chart.tsx)

Donut chart showing breakdown of crypto holdings by coin. Reuses styling from existing `AllocationChart` but filters to only crypto assets and uses custom colors for each coin.

---

#### [NEW] [stock-allocation-chart.tsx](file:///home/andrew/wealthvue/src/components/investments/stock-allocation-chart.tsx)

Donut chart showing breakdown of stock/ETF holdings by ticker symbol. Similar to crypto chart but for stocks.

---

#### [NEW] [asset-daily-change-card.tsx](file:///home/andrew/wealthvue/src/components/investments/asset-daily-change-card.tsx)

Individual card for each asset showing:
- Asset symbol and name
- Current value
- Daily change ($ and %)
- Last updated timestamp
- Green/red theming based on positive/negative change

---

#### [MODIFY] [investment-overview.tsx](file:///home/andrew/wealthvue/src/components/investments/investment-overview.tsx)

Update to:
1. Fetch extended overview data
2. Add Crypto Allocation chart in a new section
3. Add Stock Allocation chart in a new section
4. Add scrollable/grid section with individual asset daily change cards

---

### Types Update

#### [MODIFY] [investment.ts](file:///home/andrew/wealthvue/src/types/investment.ts)

Add new interfaces for the extended overview data types.

---

## Verification Plan

### Manual Verification

1. **Start the app**: Run `pnpm dev` in the project root
2. **Navigate to Investments page**: Go to `/investments` and select the "Overview" tab
3. **Verify Crypto Allocation Chart**:
   - If you have crypto investments, a donut chart should show breakdown by coin
   - Hover over segments to see values
4. **Verify Stock Allocation Chart**:
   - If you have stock/ETF investments, a donut chart should show breakdown by ticker
   - Hover over segments to see values
5. **Verify Daily Change Cards**:
   - Each asset should have its own card
   - Cards should show current price, daily change ($), and daily change (%)
   - Positive changes should be green, negative should be red
   - "Last updated" timestamp should be visible
6. **Verify Price Updates**:
   - Refresh the page after some time or trigger a price update job
   - Daily change values should reflect any updates

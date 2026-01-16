# Investment Overview Card Updates

## Goal Description
Replace "Cost Basis" and "Unique Asset Count" cards on the Investment Overview page with "Total Daily Change" and "Biggest Mover" (by price change %) to provide more relevant daily performance metrics.

## Proposed Changes

### [Backend] Investment Service
#### [MODIFY] [investment.service.ts](file:///home/andrew/wealthvue/src/lib/services/investment.service.ts)
- Update `getOverview` to return:
    - `totalDayChange`: Sum of all assets' daily value change.
    - `totalDayChangePercent`: Portfolio-wide daily percentage change.
    - `biggestMover`: The asset with the largest absolute percentage price change.

### [Frontend] Investment Overview
#### [MODIFY] [investment-overview.tsx](file:///home/andrew/wealthvue/src/components/investments/investment-overview.tsx)
- Update `InvestmentOverviewData` interface.
- Replace "Cost Basis" card with "Total Daily Change" card.
- Replace "Unique Asset Count" card with "Biggest Mover" card.
    - Use logic similar to `AssetDailyChangeCard` but styled for the top summary row.

## Verification Plan

### Manual Verification
1.  **Total Daily Change Card**:
    - Check if the value matches the sum of "Market Movers" (roughly).
    - Verify percentage is calculated correctly `(Total Change / (Total Value - Total Change))`.
    - Check color coding (Green for positive, Red for negative).
2.  **Biggest Mover Card**:
    - Verify it displays the asset with the highest positive or negative percentage change from the "Market Movers" list.
    - Verify it displays the symbol, name, and percentage change.

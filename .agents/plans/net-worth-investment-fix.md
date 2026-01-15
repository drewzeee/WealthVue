# Fix Inflated Investment Value in NetWorthService

## Goal Description
The dashboard is showing an inflated investment value ($1.3M) compared to the accurate Investments page ($346k).
The root cause is a bug in `NetWorthService.calculateCurrentNetWorth`. When an investment lacks a `currentPrice`, the service uses `costBasis` (which is the *total* cost) as the *unit price*. This is then multiplied by `quantity`, effectively inflating the value by a factor of the quantity.

For example, if you own 100 shares bought for $1000 total (Cost Basis):
- Correct Value: $1000.
- Current Buggy Value: 100 * $1000 = $100,000.

This change fixes the calculation to strictly use `costBasis` as the total value when `currentPrice` is unavailable, matching the logic in `InvestmentRepository`.

## Proposed Changes

### Lib
#### [MODIFY] [net-worth.service.ts](file:///home/andrew/wealthvue/src/lib/services/net-worth.service.ts)
- Update the calculation loop for `investmentAssetsSum`.
- If `inv.currentPrice` exists, calculate `quantity * currentPrice`.
- If `inv.currentPrice` is null, explicitly use `inv.costBasis` as the value.

## Verification Plan

### Manual Verification
1.  **Before Fix**: Note the inflated "Investments" or "Total Assets" value on the Dashboard.
2.  **Apply Fix**: Apply the code change.
3.  **After Fix**: Refresh the Dashboard. The "Investments" value should now match (or be very close to) the value shown on the Investments page (~$346k).

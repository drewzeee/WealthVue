
# Fix Net Worth Chart Display

## Goal Description
Fix the "Net Worth Over Time" chart which was invisible due to color format issues, and enhance it to be more useful and "dramatic".
1.  **Visibility:** Fix the chart line color by switching from `hsl()` to `oklch()` to match the global CSS variables.
2.  **Logic:** Implement missing backend logic for '24H' and '1W' time ranges in `NetWorthService`.
3.  **Visualization:** Adjust Y-axis domain to be dynamic (`['dataMin', 'dataMax']`) to remove the zero baseline and highlight fluctuations.
4.  **Live Data:** Extend the "Live" data point logic to **ALL** timeframes so the chart always ends at the current real-time net worth.

## Changes

### Backend
#### [net-worth.service.ts](file:///home/andrew/wealthvue/src/lib/services/net-worth.service.ts)
- Added filters for `'24H'` (now - 2 days to capture start point) and `'1W'`.

#### [route.ts](file:///home/andrew/wealthvue/src/app/api/net-worth/history/route.ts)
- Updated GET handler to **always** append the current live net worth value to the end of the history array. This connects the last historical snapshot to the present moment.

### Frontend
#### [net-worth-chart.tsx](file:///home/andrew/wealthvue/src/components/dashboard/net-worth-chart.tsx)
- Updated colors to usage `oklch(var(--primary))`.
- Updated `YAxis` domain to `['dataMin', 'dataMax']`.

## Verification
- Verified '24h' view shows a line from yesterday to today (live).
- Verified charts for '1W', '1M', etc. all end at the current time.
- Verified chart scales dynamically to show trends clearly.

# Implementation Plan - Fix Donut Chart Legend Sync

Correct the hover interaction bug where the wrong legend item is highlighted when hovering over a chart segment. This is caused by a mismatch between the data array index and the legend's payload index (likely due to sorting).

## Proposed Changes

### [SpendingChart (Budget)](file:///home/andrew/wealthvue/src/components/budget/spending-chart.tsx)

- Update the `Legend` custom content to find the correct `activeIndex` by matching the category name instead of using the loop index.
- Ensure `onMouseEnter` and `opacity` logic use the resolved index.

### [AllocationChart (Dashboard)](file:///home/andrew/wealthvue/src/components/dashboard/allocation-chart.tsx)

- Apply the same name-based matching fix to the dashboard allocation chart to prevent similar issues.

### [AllocationChart (Investments)](file:///home/andrew/wealthvue/src/components/investments/allocation-chart.tsx)

- Verify and ensure name-based matching is used consistently.

## Verification Plan

### Manual Verification
- Hover over segments in the Budget chart and verify the correct legend item highlights.
- Hover over legend items in the Budget chart and verify the correct segment highlights.
- Repeat for Dashboard and Investment charts.

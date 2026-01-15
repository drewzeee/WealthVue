# Feature Plan: Mobile Optimization Improvements

## Overview
Improve the application's mobile experience by reclaiming screen real estate and fixing UI glitches on small screens, specifically on the dashboard.

## Goals
- Reduce global container padding on mobile.
- Refactor chart headers to be responsive (stack on mobile).
- Optimize Net Worth chart Y-axis scaling and formatting.
- Reclaim space in metric cards on mobile.

## Implementation Steps
1. **Responsive Container Padding**:
    - Modify `tailwind.config.ts` to use responsive padding for the `container` class: `1rem` for mobile, `2rem` for desktop (`md` and up).
2. **Dashboard Layout adjustments**:
    - Update `DashboardClient` to use `flex-col` for chart headers on mobile and `flex-row` on desktop.
3. **Net Worth Chart Optimization**:
    - Adjust `YAxis` in `NetWorthChart` to use `domain={['auto', 'auto']}`.
    - Update `tickFormatter` to provide more precision (1 decimal for values over $1k).
    - Increase `minTickGap` on `XAxis`.
    - Set explicit `width` for `YAxis` and adjust chart `margin`.
4. **Metric Cards Polish**:
    - Reduce `CardContent` padding on mobile in `MetricCards`.

## Verification Plan
- [x] Verify responsive padding in DevTools.
- [x] Confirm stacked headers on narrow viewports.
- [x] Validate Y-axis labels are unique and readable.
- [x] Check overall dashboard aesthetics on mobile.

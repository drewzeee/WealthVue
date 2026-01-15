# Feature Plan: Budget Month Selector

## Overview
Implement a month selection interface on the budget overview page to allow users to view historical budget data and navigate between months.

## Goals
- Add a MonthSelector component to the budget overview.
- Support month filtering via URL search parameters.
- Fix date parsing to avoid UTC/Local time shifts.
- Separate income and expenses in the budget total spent calculation.

## UI Components
- `MonthSelector`: A client component with previous/next navigation and a "Current Month" shortcut.

## Implementation Steps
1. Create `MonthSelector.tsx` using `lucide-react` and `date-fns`.
2. Integrate `MonthSelector` into `BudgetOverview.tsx`.
3. Update `useBudgetOverview` hook to accept a `Date` parameter.
4. Robustly parse the `month` parameter from the URL in both `MonthSelector` and `BudgetOverview` using local time to avoid UTC shifts (`new Date(y, m-1, d)`).
5. Refactor `BudgetService.ts` to correctly aggregate `totalIncome` and `totalSpent` by separating positive and negative transactions/categories.
6. Update `CategoryBudgetList.tsx` to filter for active spending categories and remove the 5-item limit.

## Verification Results
- Manual navigation tested across multiple months.
- Validated that total spending correctly reflects expense category sums even when income is present in other categories.
- Verified that URL parameters are correctly updated and parsed.

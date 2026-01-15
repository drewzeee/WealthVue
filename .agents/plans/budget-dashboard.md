# Feature: Budget Dashboard & Carry-Over Logic

## Overview
Implement the Budget Dashboard to visualize spending against budgets and add "Carry-Over" functionality to allow unused budget amounts to roll over to the next month.

## Goals
1.  **Budget Dashboard**: Visual overview of total budget, total spent, and remaining amount for the current month.
2.  **Category Breakdown**: Progress bars for each category showing budget vs actual.
3.  **Carry-Over Logic**: Mechanism to calculate and apply unused budget from the previous month to the current month's available amount.
4.  **UI Controls**: Toggle "Carry-over" setting per category.

## Data Model Changes
*None required.* The `Category` model already has `carryOver` boolean, and `CategoryBudget` has `carryOverAmount` decimal.

## API Endpoints
1.  `GET /api/budgets/overview?month=YYYY-MM-DD`
    -   Returns:
        -   `overall`: { budgeted, spent, remaining, progress }
        -   `categories`: Array of categoriy summaries with their individual budget, spent, and carry-over data.
2.  `POST /api/budgets/rollover` (Optional/Internal)
    -   Trigger manual rollover calculation (might be handled implicitly by the service).

## UI Components
1.  **BudgetOverview**:
    -   Top cards: Total Budget, Total Spent, Remaining.
    -   Chart: Bar chart comparing Budget vs Actual.
2.  **CategoryBudgetList**:
    -   List of categories with progress bars.
    -   Visual indicator for "Carry-over" amounts.
3.  **Add/Edit Category Dialog**:
    -   Add Switch input for `carryOver` field.

## Implementation Steps

### Backend
1.  **Update Repository**:
    -   Update `CategoryRepository` to support `update` of `carryOver` field if not already covered.
    -   Create `CategoryBudgetRepository` in `src/lib/db/repositories/budgets.ts`.
        -   `upsert(categoryId, month, amount)`
        -   `findForMonth(userId, month)`
2.  **Create Service**:
    -   `src/lib/services/budget.service.ts`
    -   `getBudgetOverview(userId, date)`:
        -   Fetch all categories and transactions for the month.
        -   Calculate spent amounts (sum transactions).
        -   Calculate carry-over if enabled (fetch previous month's budget/spent).
        -   Return aggregated data.
3.  **Create API**:
    -   `src/app/api/budgets/overview/route.ts`: Handler for GET.

### Frontend
1.  **Update Hooks**:
    -   `useBudgetOverview` (React Query) to fetch from `/api/budgets/overview`.
2.  **Create Components**:
    -   `src/components/budget/budget-overview.tsx`: Main dashboard component.
    -   `src/components/budget/budget-progress.tsx`: Individual category progress bar.
    -   `src/components/budget/summary-cards.tsx`: Top level metrics.
3.  **Update Dialogs**:
    -   Modify `add-category-dialog.tsx` and `edit-category-dialog.tsx` to include `carryOver` toggle.
4.  **Update Page**:
    -   `src/app/(auth)/budget/page.tsx`: Replace placeholder in "Overview" tab with `BudgetOverview` component.

## Testing Plan
1.  **Unit Tests (Service)**:
    -   Create `scripts/test-budget-service.ts`.
    -   Test `getBudgetOverview`:
        -   Scenario: No transactions (Result: 0 spent).
        -   Scenario: Transactions exist (Result: Correct sum).
        -   Scenario: Carry-over enabled (Result: Previous remaining added to available).
2.  **Manual Verification**:
    -   Go to Budget page.
    -   Verify "Overview" shows correct totals.
    -   Edit a category, enable "Carry-over".
    -   (Simulate next month) Check if budget increases. (Might need to mock date or create past data).

## Potential Challenges
-   **Performance**: Aggregating transactions for all categories might be slow if there are thousands. Ensure database queries are efficient (group by categoryId).
-   **Date Handling**: Timezones can be tricky. Use strict "First day of month" UTC dates.

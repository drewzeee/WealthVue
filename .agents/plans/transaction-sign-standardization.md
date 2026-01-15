# Feature Plan: Transaction Sign Standardization

## Overview
Standardize the application to use the industry-standard accounting convention: **Negative for Expenses** and **Positive for Income**. This fixes the reported bug where Plaid transactions (which use Positive for Expenses) show up as reversed in the budget and transaction list.

## Goals
- Fix Plaid transaction sign inversion during sync.
- Update Budget calculations to handle the new convention correctly.
- Ensure UI displays income and expenses with appropriate color coding.
- Fix bug in `BudgetService` where `Math.abs()` prevented refunds from reducing spending.

## Data Model Changes
No structural changes to the database schema. The interpretation of the `amount` field in the `Transaction` model will change.

## Implementation Steps

### 1. Plaid Integration
- [ ] Modify `src/lib/services/plaid.service.ts`:
    - Invert `txn.amount` when creating/updating: `amount: -txn.amount`.
    - Update inline documentation to reflect the convention.

### 2. Budget Logic
- [ ] Modify `src/lib/services/budget.service.ts`:
    - Update `income` calculation: `Number(t.amount) > 0`.
    - Update `spent` calculation: `-sum(catTransactions.amount)`.
    - Remove `Math.abs()` from category spending logic to correctly handle refunds.

### 3. UI Enhancements
- [ ] Modify `src/components/transactions/columns.tsx`:
    - Add color coding to amounts (Red for < 0, Green for > 0).
- [ ] Modify `src/components/dashboard/metric-cards.tsx`:
    - Verify liability display logic remains consistent.

## Testing Plan
- [ ] **Plaid Sync Test**: Connect sandbox bank and verify purchases are stored as negative values.
- [ ] **Budget Accuracy Test**: Verify Income and Spent totals on the dashboard match the new convention.
- [ ] **Refund Test**: Categorize a positive transaction as an expense and ensure it reduces "Spent" for that category.
- [ ] **Manual Entry Test**: Add a manual transaction with a negative amount and verify it appears as spending.

## Potential Challenges
- **Legacy Data**: Existing transactions in the database will have the old sign convention.
- **CSV Imports**: Other banks might export CSVs with different conventions; we may need a "Flip Signs" option in the CSV importer eventually.

# Fix Hidden Transfer Transactions

The transaction list currently hides transactions marked as transfers by default. This is because the `TransactionsPage` defaults the `isTransfer` filter to `false` when no search parameter is provided. Additionally, there is no UI element to filter for or toggle transfers.

## User Review Required

> [!IMPORTANT]
> By default, all transactions including transfers will now be shown in the transaction list. Previously, transfers were hidden.

## Proposed Changes

### Transactions API & Page

#### [MODIFY] [page.tsx](file:///home/andrew/wealthvue/src/app/(auth)/transactions/page.tsx)
- Change `isTransfer` default from `false` to `undefined` for `transactionRepository.findMany` to show all transactions by default.
- For `transactionRepository.getSummary`, we need to decide if "Total Income" and "Total Expenses" should include transfers. Usually, they should not. I'll pass `isTransfer: false` for the summary's income/expense calculation if not specifically filtering for transfers, or handle it in the component.

### Components

#### [MODIFY] [filter-popover.tsx](file:///home/andrew/wealthvue/src/components/transactions/filter-popover.tsx)
- Add a new "Transfers" tab or add a toggle to the "Type" tab to filter by transfer status.
- Support `isTransfer` state and sync it with URL search params.

#### [MODIFY] [transaction-filters.tsx](file:///home/andrew/wealthvue/src/components/transactions/transaction-filters.tsx)
- Update `getActiveFilters` to display the "Transfers" filter badge if active.

## Verification Plan

### Manual Verification
1. Open the Transactions page.
2. Verify that transactions meeting transfer criteria (e.g., matching amounts in different accounts) are now visible in the list.
3. Open the Filter popover.
4. Use the new "Transfers" filter to show "Only Transfers", "Exclude Transfers", or "Show All".
5. Verify that the list updates correctly for each setting.
6. Verify that the "Income" and "Expense" summary cards do not count transfers as income or expense (unless this is the desired behavior, but typically transfers are excluded from these totals).

### Automated Tests
- I'll check if there are existing tests for the transaction repository or API and update them if needed.
- `src/lib/services/__tests__/transfer-detection.test.ts` exists, I'll see if I can add a test case there or in a new repository test file.

# Implementation Plan - Move Process History Button to Rules Page

The user wants to move the 'Process History' button from the Transactions page to the Rules page (which is a tab in the Budget page). This button triggers a batch processing of transactions against categorization rules.

## Proposed Changes

### Budget Component

#### [MODIFY] [rule-list.tsx](file:///home/andrew/wealthvue/src/components/budget/rule-list.tsx)
- Import `ProcessTransactionsButton` from `@/components/transactions/process-transactions-button`.
- Place the `ProcessTransactionsButton` next to the `RuleDialog` in the header section of the rule list.

### Pages

#### [MODIFY] [transactions/page.tsx](file:///home/andrew/wealthvue/src/app/(auth)/transactions/page.tsx)
- Remove the `ProcessTransactionsButton` import and usage.

## Verification Plan

### Manual Verification
1. Navigate to the **Transactions** page and verify the "Process History" button is no longer there.
2. Navigate to the **Budget** page and click on the **Rules** tab.
3. Verify the "Process History" button is present next to the "Add Rule" button.
4. Click the "Process History" button and ensure it still functions correctly (shows a toast notification upon completion).

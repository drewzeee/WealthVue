# Transaction Enhancements: Raw Descriptions & Pending Status

This plan addresses the user's request to see "dirty" (raw) transaction descriptions from Plaid and provides clarity on how pending transactions are handled and visualized.

## Proposed Changes

### Database & Types

#### [MODIFY] [schema.prisma](file:///home/andrew/wealthvue/prisma/schema.prisma)
- Add `rawDescription String?` to the `Transaction` model.

#### [MODIFY] [columns.tsx](file:///home/andrew/wealthvue/src/components/transactions/columns.tsx)
- Update `TransactionWithRelations` type to include `rawDescription`. (Note: `pending` is already present in the base `Transaction` type).

### Backend Integration

#### [MODIFY] [plaid.service.ts](file:///home/andrew/wealthvue/src/lib/services/plaid.service.ts)
- Update `syncTransactions` to capture `txn.original_description` and store it in the `rawDescription` field during both `create` and `update` blocks of the `upsert` and `updateMany` calls.

### UI Enhancements

#### [MODIFY] [columns.tsx](file:///home/andrew/wealthvue/src/components/transactions/columns.tsx)
- Update the `Description` column to:
    - Display `rawDescription` if available, falling back to the cleaned `description`.
    - Provide a tooltip or subtle indicator showing the other version if they differ.
    - Add a "Pending" badge or styling (e.g., reduced opacity or italics) for transactions where `pending` is true.

## Verification Plan

### Automated Tests
- **Database**: Run `npx prisma validate` to ensure schema changes are correct.
- **Service Logic**: I will create a new test file `src/lib/services/__tests__/plaid.service.test.ts` to verify that `original_description` is correctly mapped.

### Manual Verification
1. **Plaid Linking**: Link a sandbox account.
2. **Transaction View**:
    - Go to the Transactions page (`/transactions`).
    - Confirm that descriptions match the raw string (e.g., "PURCHASE-12345") when available.
    - Confirm that pending transactions are visually distinct (e.g., have a "Pending" badge).
3. **Sync Update**: Trigger a sync where a transaction moves from pending to posted and verify the badge disappears.

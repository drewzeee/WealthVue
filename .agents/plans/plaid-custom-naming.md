# Plaid Account Custom Naming & Edit Improvements

Documenting the implementation of custom account naming and UX improvements for Plaid-linked accounts.

## Overview
Users often find Plaid account names (e.g., "CREDIT CARD") to be too generic. This feature allows users to set a custom "Display Name" that persists across Plaid syncs. It also fixes a bug where the account edit button was non-functional and improves the overall editing experience for Plaid accounts.

## Goals
- Allow users to set custom names for all account types.
- Fix the non-functional "Edit" button in account settings.
- Prevent manual balance/name overrides for Plaid-linked accounts (managed by Plaid).
- Provide a "Reset Sync" feature to recover deleted transactions by resetting the Plaid cursor.
- Ensure custom names are displayed consistently across the transaction list and filters.

## Data Model Changes
Updated `prisma/schema.prisma`:
- Added `customName` (String?) to `Account` model.
- Added `officialName` (String?) and `mask` (String?) to `Account` model for better bank-provided info storage.

## UI Components
- **AccountDialog**: 
  - Fixed state sync bug using `useEffect`.
  - Added "Display Name" input field.
  - Disabled "Bank Name" and "Current Value" for Plaid-linked accounts.
- **AccountList**:
  - Displays `customName` if available.
  - Added "Reset Sync" option to the dropdown menu for Plaid accounts.
- **Transaction Table**:
  - Updated `columns.tsx` to display `account.customName` if set.
- **Transaction Filters**:
  - Updated `filter-popover.tsx` to show custom names in the account selection list.

## Implementation Steps
1. **Schema Update**: Added fields to Prisma and ran `npx prisma migrate dev`.
2. **Naming Strategy**: Updated `plaid.service.ts` to use `official_name` and `mask` as the default `name` on sync.
3. **Edit Fix**: Refactored `add-account-dialog.tsx` to sync props to state correctly.
4. **Custom Persistence**: Updated `updateAccount` server action to handle `customName`.
5. **Sync Reset**: Created `plaid.ts` server action to clear `plaidItem.cursor`.
6. **UI Propagation**: Modified `TransactionRepository` and filter components to fetch/show `customName`.

## Testing Plan
- Verify custom name survives a manual Plaid sync.
- Verify balance field is read-only for Plaid accounts.
- Verify "Reset Sync" correctly triggers a full re-download of transactions.
- Verify transaction filters show the familiar custom names.

# Feature: Automatic Transfer Detection

Implement a system to automatically detect and link transfers between accounts (e.g., credit card payments, savings transfers). This prevents double-counting of expenses and income in budgets.

## User Story

As a user with multiple bank accounts and credit cards,
I want my transfers (like paying my credit card or moving money to savings) to be automatically detected and classified
So that my budget accurately reflects my actual spending and income without double-counting transfers.

## Problem Statement

Currently, a credit card payment appears as:
1. An outflow from a checking account (e.g., -$1,000).
2. An inflow to a credit card account (e.g., +$1,000).

Without transfer detection, the outflow might be categorized as an expense and the inflow as income, which is incorrect. They should be linked and categorized as a "Transfer" which is typically excluded from spending/income totals.

## Solution Statement

1.  **Schema Support**: Update the `Transaction` model to include `isTransfer` and `transferId` to link matching pairs.
2.  **Detection Engine**: Create a `TransferDetectionService` that uses heuristic matching (amount, date, account types) to find transfers in newly synced transactions.
3.  **Automatic Linking**: Automatically link and categorize detected transfers during the sync process.
4.  **UI Feedback**: Visual indicators for transfers in the transaction list.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: Prisma Schema, Plaid Sync Service, Transaction UI
**Dependencies**: `prisma`, `plaid`

---

## CONTEXT REFERENCES

### Relevant Codebase Files

- `prisma/schema.prisma` - Add transfer-related fields.
- `src/lib/services/plaid.service.ts` - Integrate detection into sync flow.
- `src/lib/db/repositories/transactions.ts` - Manage transfer status.
- `src/components/transactions/transaction-list.tsx` - Display transfer status.

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation & Infrastructure

**Tasks:**

- **UPDATE** `prisma/schema.prisma`:
    - Add `isTransfer Boolean @default(false)` to `Transaction`.
    - Add `transferId String?` to `Transaction` (grouping ID).
    - Add `@@index([transferId])` to `Transaction`.
- **UPDATE** `prisma/seed.ts`: Add a "Transfer" category if it doesn't exist.
- **SETUP** Testing: Initialize Vitest for unit testing the detection logic.

### Phase 2: Transfer Detection Logic

**Tasks:**

- **CREATE** `src/lib/services/transfer-detection.service.ts`:
    - `detectTransfers(transactions: Transaction[])`: Find matching pairs in a set.
    - `linkTransfers(outflow: Transaction, inflow: Transaction)`: Atomic update to link them.
- **MATCHING CRITERIA**:
    1.  Amount: `A.amount === -B.amount`.
    2.  Date: `abs(A.date - B.date) <= 4 days`.
    3.  Accounts: `A.accountId !== B.accountId`.
    4.  Logic: One outflow, one inflow.

### Phase 3: Integration

**Tasks:**

- **UPDATE** `src/lib/services/plaid.service.ts`:
    - Call `detectTransfers` after fetching new transactions.
    - Automatically categorize as "Transfer" if matched.
- **UPDATE** `src/lib/services/categorization.engine.ts`:
    - Ensure transfers bypass regular rule-based categorization or are handled specifically.

### Phase 4: UI & Verification

**Tasks:**

- **UPDATE** Transaction list UI to show transfer badge.
- **ADD** Manual transfer linking capability (optional but recommended).
- **VALIDATE** with unit tests and manual sync tests.

---

## STEP-BY-STEP TASKS

### Phase 1: Foundation

1. **UPDATE** `prisma/schema.prisma`
   - Add `isTransfer` and `transferId` to `Transaction` model.
   - Run `npx prisma migrate dev --name add_transfer_fields`.

2. **UPDATE** `prisma/seed.ts`
   - Add `{ name: 'Transfer', color: '#94a3b8', icon: '🔁' }` to default categories.
   - Run `npm run db:seed`.

3. **CREATE** `vitest.config.ts` and update `package.json` with `test` script.
   - `npm install -D vitest`.

### Phase 2: Core Logic

4. **CREATE** `src/lib/services/transfer-detection.service.ts`
   - Implement matching algorithm.
   - PATTERN: Use `Decimal` for amount comparisons.

5. **CREATE** `src/lib/services/__tests__/transfer-detection.test.ts`
   - Test various scenarios: exact match, date offset, multi-match collisions.

### Phase 3: Integration

6. **UPDATE** `src/lib/services/plaid.service.ts`
   - Modify `syncTransactions` to include transfer detection step.

7. **UPDATE** `src/lib/db/repositories/transactions.ts`
   - Add `linkTransfer(id1, id2)` method.

---

## TESTING STRATEGY

### Unit Tests
- `vitest src/lib/services/__tests__/transfer-detection.test.ts`
- Tests for math equality, date windows, and account exclusions.

### Manual Verification
- Seed two transactions with matching amounts and dates.
- Trigger sync (or simulation) and verify they are marked as `isTransfer`.

## ACCEPTANCE CRITERIA
- [ ] Transactions matching amount and within 2 days across different accounts are marked as transfers.
- [ ] Transfers are linked via a shared `transferId`.
- [ ] Transfers appear with a distinct UI indicator.
- [ ] No regression in regular Plaid sync or manual entry.

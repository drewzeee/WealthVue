# Feature: Plaid Integration

This plan details the implementation of Plaid for bank account linking and transaction synchronization. It addresses the need for a dedicated `PlaidItem` model to correctly manage access tokens and supports the modern `transactions/sync` API.

## Feature Description

Integration with Plaid to allow users to securely link their bank accounts. The feature includes:
1.  **Link Flow**: Securely exchanging public tokens for access tokens.
2.  **Data Storage**: Storing Plaid Items, Accounts, and Transactions in the database.
3.  **Transaction Sync**: Using Plaid's `/transactions/sync` API to fetch new and modified transactions efficiently.
4.  **Webhook Handling**: Responding to Plaid webhooks to trigger background syncs.

## User Story

As a **User**
I want to **connect my bank accounts**
So that **my transaction data and balances are automatically updated in the dashboard**

## Problem Statement

Currently, the application has no way to ingest real financial data. Users would have to manually enter everything. We need a robust, automated pipeline to fetch this data securely. The existing database schema for `Account` suggests a simplified view (storing access tokens on accounts) which is incorrect for Plaid's data model (where one Login/Item = multiple Accounts).

## Solution Statement

We will implement a standard Plaid Link flow. We will refactor the database to introduce a `PlaidItem` model that holds the `access_token` and `cursor` for sync. We will implement API routes to handle the link token creation and public token exchange. A service layer will handle the complexity of mapping Plaid data to our Prisma models.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: High
**Primary Systems Affected**: Database, API, Frontend
**Dependencies**: `plaid`, `react-plaid-link`

---

## CONTEXT REFERENCES

### Relevant Codebase Files

- `prisma/schema.prisma` (lines 80-100) - Why: Existing `Account` and `Transaction` models need refactoring.
- `src/lib/db/client.ts` - Why: Database access for storing items.
- `.env.example` - Why: Plaid credentials configuration.

### New Files to Create

- `src/lib/integrations/plaid.ts` - Plaid Client configuration.
- `src/lib/services/plaid.service.ts` - Core business logic (exchange token, sync).
- `src/app/api/plaid/create-link-token/route.ts` - API for Link Token.
- `src/app/api/plaid/exchange-public-token/route.ts` - API for Token Exchange.
- `src/app/api/webhooks/plaid/route.ts` - Webhook handler.
- `src/components/plaid/PlaidLinkButton.tsx` - Frontend component.

### Relevant Documentation

- [Plaid Link Flow](https://plaid.com/docs/link/) - The core authentication flow.
- [Plaid Transactions Sync](https://plaid.com/docs/api/products/transactions/#transactionssync) - The modern API for fetching transactions.
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations) - For modeling Item -> Accounts.

### Patterns to Follow

**Service Pattern:**
Encapsulate business logic in `src/lib/services/`.

**API Route Pattern:**
Use Next.js 14 App Router conventions (`route.ts`) with `NextResponse`.

**Error Handling:**
Use standard try/catch blocks and return consistent JSON error responses.

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation & Database

Set up the environment, install dependencies, and correct the database schema to support Plaid's "Item" concept.

**Tasks:**

- Install `plaid` and `react-plaid-link`.
- Update `prisma/schema.prisma` to add `PlaidItem` and link it to `Account`.
- Remove `plaidAccessToken` from `Account`.
- Run migration.

### Phase 2: Backend Core & Service

Implement the Plaid client and the service layer responsible for communicating with Plaid and updating the database.

**Tasks:**

- Create `src/lib/integrations/plaid.ts` (Client setup).
- Create `src/lib/services/plaid.service.ts`.
- Implement `createLinkToken` method.
- Implement `exchangePublicToken` method (includes creating `PlaidItem` and initial `Account` fetch).
- Implement `syncTransactions` method (logic to handle added/modified/removed transactions).

### Phase 3: API Routes

Expose the service functionality via secure API routes for the frontend.

**Tasks:**

- Create `/api/plaid/create-link-token`.
- Create `/api/plaid/exchange-public-token`.
- Create `/api/webhooks/plaid` (Basic validation and triggering sync).

### Phase 4: Frontend Implementation

Create the UI component to trigger the Link flow.

**Tasks:**

- Create `PlaidLinkButton` component.
- Integrate into a page (e.g., Settings or Dashboard) for testing.

---

## STEP-BY-STEP TASKS

### 1. INSTALL dependencies

- **ACTION**: Run command to install required packages.
- **VALIDATE**: `npm list plaid react-plaid-link`

### 2. UPDATE `prisma/schema.prisma`

- **UPDATE**: `prisma/schema.prisma`
    - Create `model PlaidItem` with fields: `id`, `userId`, `itemId`, `accessToken`, `cursor`, `status`, `institutionId`, `institutionName`.
    - Update `model Account` to add `plaidItemId` (FK) and remove `plaidAccessToken`.
    - Update `User` to have `plaidItems PlaidItem[]`.
- **VALIDATE**: `npx prisma validate`

### 3. APPLY Migration

- **ACTION**: Run migration to update database.
- **VALIDATE**: `npx prisma migrate dev --name add_plaid_items`

### 4. CREATE `src/lib/integrations/plaid.ts`

- **CREATE**: `src/lib/integrations/plaid.ts`
- **IMPLEMENT**: Instantiate `PlaidApi` using `Configuration` with env vars. Export the client.
- **VALIDATE**: Check imports and build.

### 5. CREATE `src/lib/services/plaid.service.ts` (Skeleton)

- **CREATE**: `src/lib/services/plaid.service.ts`
- **IMPLEMENT**: Class `PlaidService`.
- **IMPLEMENT**: Method `createLinkToken(userId: string)`.
- **IMPLEMENT**: Method `exchangePublicToken(userId: string, publicToken: string)`.
- **IMPLEMENT**: Method `syncTransactions(plaidItemId: string)`.

### 6. IMPLEMENT `PlaidService.createLinkToken`

- **UPDATE**: `src/lib/services/plaid.service.ts`
- **LOGIC**: Call `plaidClient.linkTokenCreate`. Return `link_token`.
- **VALIDATE**: Unit test or manual API call later.

### 7. IMPLEMENT `PlaidService.exchangePublicToken`

- **UPDATE**: `src/lib/services/plaid.service.ts`
- **LOGIC**:
    1. Call `plaidClient.itemPublicTokenExchange`.
    2. Save `PlaidItem` to DB with `access_token` and `item_id`.
    3. Call `plaidClient.accountsGet` to fetch accounts.
    4. Upsert `Account` records in DB linked to this Item.
- **GOTCHA**: Map Plaid account types to Prisma enum `AccountType`.

### 8. CREATE API Route: Create Link Token

- **CREATE**: `src/app/api/plaid/create-link-token/route.ts`
- **IMPLEMENT**: POST handler. Auth check. Call `PlaidService.createLinkToken`.
- **VALIDATE**: `curl -X POST http://localhost:3000/api/plaid/create-link-token` (expect 401 if not authed, or 200 with token).

### 9. CREATE API Route: Exchange Public Token

- **CREATE**: `src/app/api/plaid/exchange-public-token/route.ts`
- **IMPLEMENT**: POST handler. Auth check. Body: `{ publicToken }`. Call `PlaidService.exchangePublicToken`.
- **VALIDATE**: Requires frontend or mock public token.

### 10. CREATE Frontend Component `PlaidLinkButton`

- **CREATE**: `src/components/plaid/PlaidLinkButton.tsx`
- **IMPLEMENT**: Use `usePlaidLink`. Fetch link token on mount/click. Call exchange endpoint `onSuccess`.
- **VALIDATE**: Add to a page and test the flow (Sandbox mode).

### 11. IMPLEMENT `PlaidService.syncTransactions`

- **UPDATE**: `src/lib/services/plaid.service.ts`
- **LOGIC**:
    1. Fetch `PlaidItem` (get access token and cursor).
    2. Call `plaidClient.transactionsSync` loop until `has_more` is false.
    3. Process `added`, `modified`, `removed` lists.
    4. `added`: Create Transaction, connect to Account.
    5. `modified`: Update Transaction.
    6. `removed`: Delete or mark deleted.
    7. Update `PlaidItem` with new `next_cursor`.
- **GOTCHA**: Handle pending transactions and categorization mapping.

### 12. CREATE Webhook Handler

- **CREATE**: `src/app/api/webhooks/plaid/route.ts`
- **IMPLEMENT**: Verify webhook code (optional but recommended). Check `webhook_type` ("TRANSACTIONS") and `webhook_code` ("SYNC_UPDATES_AVAILABLE").
- **LOGIC**: Find Item by `item_id`. Trigger `PlaidService.syncTransactions`.
- **VALIDATE**: Use Plaid Dashboard to fire test webhook.

---

## TESTING STRATEGY

### Unit Tests

- Mock `plaidClient` methods to test `PlaidService` logic without hitting real API.
- Test `exchangePublicToken` creates DB records correctly.
- Test `syncTransactions` handles pagination and DB updates correctly.

### Manual Validation

1.  **Link Flow**: Use Plaid Sandbox credentials (user_good / pass_good).
2.  **Dashboard**: Verify Accounts appear in DB/UI.
3.  **Transactions**: Trigger a "Fire Webhook" in Plaid Dashboard or call sync manually. Verify transactions appear in DB.

## VALIDATION COMMANDS

### Schema
`npx prisma validate`

### Type Check
`npm run type-check`

### Lint
`npm run lint`

---

## ACCEPTANCE CRITERIA

- [ ] `PlaidItem` model exists and tracks access tokens.
- [ ] Users can link a bank account via Plaid Link (Sandbox).
- [ ] Accounts are saved to the database upon linking.
- [ ] Transactions are synced initially upon linking.
- [ ] Webhook endpoint accepts Plaid updates.
- [ ] Code is type-safe and validated.

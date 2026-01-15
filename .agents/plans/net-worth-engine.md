# Feature: Net Worth Engine & History

## Feature Description

The Net Worth Engine is the backend logic responsible for aggregating all user assets and liabilities to calculate a single "Net Worth" value. It supports both real-time calculation (for current status) and historical snapshots (for trend analysis).

This feature encompasses:
1.  **Aggregation Logic**: Summing values from Plaid Accounts, Manual Investment Accounts, Manual Assets, and Manual Liabilities.
2.  **Snapshot System**: A background job to record daily Net Worth snapshots.
3.  **API Layer**: Endpoints to fetch current net worth and historical data.

## User Story

As a **WealthVue User**
I want to **see my total Net Worth and its history over time**
So that **I can track my financial progress and understand my asset allocation.**

## Problem Statement

Currently, the system has various data sources (Plaid, Manual Investments, etc.) but no unified way to aggregate them into a single "Net Worth" figure. There is also no historical tracking to show progress over time.

## Solution Statement

We will implement a `NetWorthService` that queries all 5 data sources (`Account`, `InvestmentAccount`, `Asset`, `Liability`) to calculate totals. We will then set up a daily BullMQ job to snapshot these values into the `NetWorthSnapshot` table.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: `NetWorthService`, `Worker`, `Database`
**Dependencies**: Prisma, BullMQ

---

## CONTEXT REFERENCES

### Relevant Codebase Files
- `prisma/schema.prisma` (lines 145, 175, 275, 290, 310) - Why: Defines all the models we need to query (`Account`, `InvestmentAccount`, `Asset`, `Liability`, `NetWorthSnapshot`).
- `src/lib/services/budget.service.ts` - Why: Example of a service pattern in this codebase.
- `src/worker.ts` - Why: Entry point for background jobs, where we'll register the snapshot job.
- `src/lib/jobs/price-update.ts` - Why: Example of a BullMQ job implementation.

### New Files to Create
- `src/lib/services/net-worth.service.ts` - Core aggregation logic.
- `src/lib/jobs/net-worth-snapshot.ts` - Background job definition.
- `src/app/api/net-worth/route.ts` - API for current net worth and history.
- `scripts/test-net-worth.ts` - Validation script.

### Patterns to Follow
- **Service Layer**: Business logic resides in `src/lib/services/`.
- **Job Queue**: Use `bullmq` with a worker defined in `src/lib/jobs/` and registered in `src/worker.ts`.
- **Decimal Handling**: Always use `Decimal` from `@prisma/client/runtime/library` for money.

---

## IMPLEMENTATION PLAN

### Phase 1: Core Service Implementation

Implement the logic to aggregate data from all sources.

**Tasks:**
- Create `NetWorthService` class.
- Implement `calculateCurrentNetWorth(userId)` method.
- Handle currency sign logic (Credit Cards/Loans are negative).
- Implement `getHistory(userId, range)` method.

### Phase 2: Snapshot Job

Create a background job to run daily and save the snapshot.

**Tasks:**
- Define `netWorthSnapshotQueue` and `netWorthSnapshotWorker`.
- Implement job processor to call `NetWorthService.snapshot(userId)`.
- Register worker in `src/worker.ts`.
- Schedule recurring job (e.g., Midnight UTC).

### Phase 3: API Endpoints

Expose the data to the frontend.

**Tasks:**
- Create `GET /api/net-worth` (Current status).
- Create `GET /api/net-worth/history` (Historical snapshots).

---

## STEP-BY-STEP TASKS

### 1. CREATE `src/lib/services/net-worth.service.ts`

- **IMPLEMENT**: `calculateTotalAssets(userId)`
    - Query `Account` where type IN (`CHECKING`, `SAVINGS`, `INVESTMENT`, `OTHER`). Sum `currentBalance`.
    - Query `InvestmentAccount`. Sum `investments.quantity * currentPrice` (fallback to `costBasis`).
    - Query `Asset`. Sum `currentValue`.
- **IMPLEMENT**: `calculateTotalLiabilities(userId)`
    - Query `Account` where type IN (`CREDIT_CARD`, `LOAN`). Sum `currentBalance`. **Note**: Plaid often provides positive balances for debt. We treat them as liabilities.
    - Query `Liability`. Sum `currentBalance`.
- **IMPLEMENT**: `getCurrentNetWorth(userId)`
    - Returns `{ netWorth, totalAssets, totalLiabilities, currency: 'USD' }`.
- **IMPLEMENT**: `generateSnapshot(userId)`
    - Calls `getCurrentNetWorth`.
    - Creates `NetWorthSnapshot` record for today (upsert based on date).
- **IMPORTS**: `PrismaClient`, `Decimal`.
- **VALIDATE**: `npx ts-node scripts/test-net-worth.ts` (We will create this script next).

### 2. CREATE `scripts/test-net-worth.ts`

- **IMPLEMENT**: A script that:
    - Creates a test user with mock Accounts, Assets, and Liabilities.
    - Calls `NetWorthService.getCurrentNetWorth`.
    - Logs the result.
    - Verifies the math.
- **VALIDATE**: `npx ts-node scripts/test-net-worth.ts`

### 3. CREATE `src/lib/jobs/net-worth-snapshot.ts`

- **PATTERN**: Copy structure from `src/lib/jobs/price-update.ts`.
- **IMPLEMENT**: `netWorthSnapshotQueue` (Queue name: 'net-worth-snapshot').
- **IMPLEMENT**: `netWorthSnapshotWorker`.
- **PROCESS**:
    - Iterate through ALL users (or accept `userId` in job data).
    - If `userId` provided, snapshot that user.
    - If no `userId` (cron job), fetch all user IDs and trigger individual jobs (or batch process). *Decision: For MVP, iterate all users in one job or spawn child jobs. Spawning child jobs is better for scalability.*
    - **Refined Process**: The cron job adds a 'trigger-daily-snapshots' job. That job finds all users and adds a 'snapshot-user' job for each.
- **VALIDATE**: `npx ts-node scripts/test-job-flow.ts` (Update this script to test the new queue).

### 4. UPDATE `src/worker.ts`

- **IMPORTS**: `netWorthSnapshotWorker`, `netWorthSnapshotQueue`.
- **ADD**: `netWorthSnapshotWorker.on('completed'...)` logging.
- **ADD**: Schedule cron job:
    ```typescript
    await netWorthSnapshotQueue.add(
      'daily-snapshot-trigger',
      {},
      {
        repeat: { pattern: '0 0 * * *' }, // Midnight daily
        jobId: 'daily-snapshot-config',
        removeOnComplete: true
      }
    );
    ```
- **VALIDATE**: Run `npm run dev` and check console for "Scheduled daily-snapshot-trigger".

### 5. CREATE `src/app/api/net-worth/route.ts`

- **IMPLEMENT**: `GET` handler.
- **AUTH**: Check `auth()`.
- **CALL**: `NetWorthService.getCurrentNetWorth(user.id)`.
- **RETURN**: JSON response.
- **VALIDATE**: `curl http://localhost:3000/api/net-worth` (after login).

### 6. CREATE `src/app/api/net-worth/history/route.ts`

- **IMPLEMENT**: `GET` handler with query param `range` (e.g., '1M', '1Y', 'ALL').
- **LOGIC**: Query `NetWorthSnapshot` table for the user, filtered by date range.
- **RETURN**: Array of snapshots.
- **VALIDATE**: `curl http://localhost:3000/api/net-worth/history?range=1M`

---

## TESTING STRATEGY

### Unit Tests
- **Service**: Test aggregation logic with various mocked database states (no assets, only liabilities, mixed).
- **Edge Cases**:
    - Zero balances.
    - Missing asset prices (should fallback or handle gracefully).
    - Null fields.

### Integration Tests
- **Job Flow**: Trigger the 'daily-snapshot-trigger' and ensure `NetWorthSnapshot` records are created for all users.
- **API**: Call endpoints and verify structure matches `NetWorth` interface.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
npm run lint
```

### Level 2: Logic Validation
```bash
npx ts-node scripts/test-net-worth.ts
```

### Level 3: Job Validation
```bash
# Requires Redis and Worker running
npx ts-node scripts/test-job-flow.ts
```

---

## ACCEPTANCE CRITERIA

- [ ] `NetWorthService` correctly sums Assets and Liabilities.
- [ ] Plaid `Account` types are correctly classified (Credit/Loan = Liability, others = Asset).
- [ ] `NetWorthSnapshot` records are created daily via background job.
- [ ] API endpoints return correct current and historical data.
- [ ] "Asset Allocation" is calculated (optional but good for dashboard).

# Feature: Transaction Management

This plan details the implementation of the transaction management system, including the list view, filtering, manual entry, and CSV import.

## Feature Description

A comprehensive interface for users to view, manage, and analyze their financial transactions. This includes:
1.  **Transaction List**: A paginated, sortable data table of all transactions.
2.  **Filtering & Search**: Ability to filter by date range, account, category, and search text.
3.  **Manual Management**: CRUD operations for manual transactions.
4.  **Bulk Import**: Support for importing transactions via CSV.

## User Story

As a **User**
I want to **view and manage my transactions**
So that **I can categorize my spending and ensure my financial data is accurate**

## Dependencies

- `@tanstack/react-table` (for data tables)
- `date-fns` (for date formatting)
- `lucide-react` (for icons)
- `zod` (for validation)
- `papaparse` (for CSV parsing)

## Data Model References

- `Transaction` (Prisma model)
- `Account` (Prisma model)
- `Category` (Prisma model)

## Implementation Steps

### Phase 1: Backend & Data Access

1.  **Create Transaction Repository**
    -   File: `src/lib/db/repositories/transactions.ts`
    -   Methods: `findMany` (with filters), `create`, `update`, `delete`.
    -   Logic: Handle pagination, sorting, and complex where clauses.

2.  **Create API Endpoints**
    -   File: `src/app/api/transactions/route.ts` (GET, POST)
    -   File: `src/app/api/transactions/[id]/route.ts` (PATCH, DELETE)
    -   Validation: Use Zod schemas for input validation.

### Phase 2: Frontend Components (Data Table)

3.  **Create Transaction Columns Definition**
    -   File: `src/components/transactions/columns.tsx`
    -   Details: Define columns for Date, Description, Category, Amount, Account, Actions.

4.  **Create Data Table Component**
    -   File: `src/components/transactions/data-table.tsx`
    -   Details: Reusable table component using `@tanstack/react-table` with pagination and sorting.

5.  **Create Transaction Filters Component**
    -   File: `src/components/transactions/transaction-filters.tsx`
    -   Details: Date range picker, Account select, Category select, Search input.

### Phase 3: Frontend Pages & Interactions

6.  **Create Transactions Page**
    -   File: `src/app/(auth)/transactions/page.tsx`
    -   Details: Server component that fetches initial data and renders the table and filters.

7.  **Create Add Transaction Dialog**
    -   File: `src/components/transactions/add-transaction-dialog.tsx`
    -   Details: Dialog with form for manual transaction entry.

8.  **Create CSV Import Dialog**
    -   File: `src/components/transactions/import-csv-dialog.tsx`
    -   Details: File upload and parsing (using `papaparse`) to bulk create transactions.

## Step-by-Step Tasks

### 1. Create Transaction Repository

-   **Create**: `src/lib/db/repositories/transactions.ts`
-   **Content**: Implement `TransactionRepository` class.
-   **Validation**: Check types.

### 2. Implement GET /api/transactions

-   **Create**: `src/app/api/transactions/route.ts`
-   **Content**: GET handler. Extract query params (page, limit, from, to, accountId, categoryId, search). Call repository.
-   **Validation**: Test with `curl`.

### 3. Implement POST /api/transactions

-   **Update**: `src/app/api/transactions/route.ts`
-   **Content**: POST handler. Validate body with Zod. Create transaction.
-   **Validation**: Test with `curl`.

### 4. Implement PATCH/DELETE /api/transactions/[id]

-   **Create**: `src/app/api/transactions/[id]/route.ts`
-   **Content**: PATCH and DELETE handlers. Validate ownership.
-   **Validation**: Test with `curl`.

### 5. Install UI Dependencies

-   **Command**: `npm install @tanstack/react-table papaparse`
-   **Command**: `npm install -D @types/papaparse`

### 6. Create Transaction UI Components

-   **Create**: `src/components/transactions/columns.tsx`
-   **Create**: `src/components/transactions/data-table.tsx`
-   **Create**: `src/components/transactions/transaction-filters.tsx`
-   **Ref**: Use shadcn/ui table examples.

### 7. Implement Transactions Page

-   **Create**: `src/app/(auth)/transactions/page.tsx`
-   **Content**: Fetch data (server-side). Render `TransactionDataTable`.

### 8. Create Add Transaction Dialog

-   **Create**: `src/components/transactions/add-transaction-dialog.tsx`
-   **Content**: Form with `react-hook-form` and `zod`.

## Validation Commands

`npm run type-check`
`npm run lint`

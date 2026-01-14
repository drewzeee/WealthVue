# Feature: Phase 2.3 - Budget & Categorization

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

This phase implements the core budgeting and transaction categorization engine for WealthVue. It enables users to:
1.  Manage custom budget categories (create, edit, delete).
2.  Set monthly budget goals per category.
3.  Create and manage automated categorization rules (e.g., "If description contains 'Uber', set category to 'Transport'").
4.  Automatically categorize transactions based on these rules.
5.  Visualize budget progress vs actual spending.

## User Story

As a **Financial Planner**
I want to **create custom categories and rules**
So that **my transactions are automatically organized and I can track my spending against my budget goals.**

## Problem Statement

Currently, transactions are just a list. Users cannot organize them into meaningful groups (categories) or set spending limits (budgets). Manual categorization is tedious, so an automated rule engine is required.

## Solution Statement

We will implement a robust budgeting system including:
-   **Data Layer**: Repositories for `Category`, `CategoryBudget`, and `CategorizationRule`.
-   **Logic Layer**: A `CategorizationEngine` service that applies rules to transactions.
-   **API Layer**: REST endpoints for managing categories, budgets, and rules.
-   **UI Layer**: React components for managing these entities and a Budget Dashboard.

## Feature Metadata

**Feature Type**: New Capability
**Estimated Complexity**: Medium
**Primary Systems Affected**: Transaction Processing, Database, UI
**Dependencies**: Prisma, Zod, React Query, Recharts

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

-   `prisma/schema.prisma` (Category, CategoryBudget, CategorizationRule models) - Why: Defines the data structure.
-   `src/lib/db/repositories/transactions.ts` - Why: Repository pattern to mirror.
-   `src/lib/validations/transaction.ts` - Why: Validation pattern to mirror.
-   `src/app/api/transactions/route.ts` - Why: API route pattern to mirror.
-   `src/components/transactions/columns.tsx` - Why: Shows how categories are currently consumed/displayed.

### New Files to Create

-   `src/lib/validations/budget.ts` - Zod schemas for Categories and Rules.
-   `src/lib/db/repositories/budgets.ts` - Repository for Category and CategoryBudget.
-   `src/lib/db/repositories/rules.ts` - Repository for CategorizationRule.
-   `src/lib/services/categorization.engine.ts` - The logic to apply rules to transactions.
-   `src/app/api/budgets/categories/route.ts` - CRUD for categories.
-   `src/app/api/budgets/rules/route.ts` - CRUD for rules.
-   `src/components/budget/category-manager.tsx` - UI for managing categories.
-   `src/components/budget/rule-manager.tsx` - UI for managing rules.

### Patterns to Follow

**Repository Pattern:**
```typescript
export class CategoryRepository {
  async findMany(userId: string) { ... }
  async create(data: Prisma.CategoryUncheckedCreateInput) { ... }
}
export const categoryRepository = new CategoryRepository()
```

**Validation Pattern:**
```typescript
export const createCategorySchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  // ...
})
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (Data & Logic)

**Tasks:**
-   Create Zod schemas for Categories and Rules.
-   Implement `CategoryRepository` and `RuleRepository`.
-   Implement `CategorizationEngine` service.

### Phase 2: API Layer

**Tasks:**
-   Create API endpoints for Categories (`GET`, `POST`).
-   Create API endpoints for Rules (`GET`, `POST`).
-   Create API endpoints for Budgets (`GET`, `POST` - managing monthly amounts).

### Phase 3: UI Implementation

**Tasks:**
-   Create `CategoryManager` component (Dialog/List).
-   Create `RuleManager` component (Dialog/List).
-   Create `BudgetDashboard` view (Overview of spending vs budget).

### Phase 4: Integration

**Tasks:**
-   Hook up `CategorizationEngine` to Transaction creation (optional hook or manual trigger for now).
-   Ensure UI updates reflect API changes.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### Task 1: Create Validation Schemas

-   **CREATE** `src/lib/validations/budget.ts`
-   **IMPLEMENT**: Zod schemas for `createCategorySchema`, `updateCategorySchema`, `createRuleSchema`.
-   **GOTCHA**: Ensure color validation uses hex regex.
-   **VALIDATE**: `npx tsx src/lib/validations/budget.ts` (create a temp test file if needed or just compile check)

### Task 2: Implement Category Repository

-   **CREATE** `src/lib/db/repositories/budgets.ts`
-   **IMPLEMENT**: `CategoryRepository` class with `findMany`, `create`, `update`, `delete`.
-   **PATTERN**: Mirror `TransactionRepository` in `src/lib/db/repositories/transactions.ts`.
-   **VALIDATE**: Create a simple script `scripts/test-budget-repo.ts` to test CRUD operations.

### Task 3: Implement Rule Repository

-   **CREATE** `src/lib/db/repositories/rules.ts`
-   **IMPLEMENT**: `RuleRepository` class with `findMany`, `create`, `update`, `delete`, `reorder`.
-   **PATTERN**: Similar to `CategoryRepository` but handle `priority` field reordering if possible.
-   **VALIDATE**: Create `scripts/test-rule-repo.ts` to test.

### Task 4: Implement Categorization Engine

-   **CREATE** `src/lib/services/categorization.engine.ts`
-   **IMPLEMENT**: `CategorizationEngine` class.
    -   Method `applyRules(transaction: Transaction)`: Fetches user rules, matches conditions, returns categoryId.
    -   Conditions logic: `contains`, `equals`, `gt`, `lt`.
-   **VALIDATE**: Unit test `CategorizationEngine` with mock transaction and rules.

### Task 5: Create Category API

-   **CREATE** `src/app/api/budgets/categories/route.ts`
-   **IMPLEMENT**: `GET` (list categories) and `POST` (create category).
-   **IMPORTS**: Use `categoryRepository` and `createCategorySchema`.
-   **VALIDATE**: `curl` or Postman test to `http://localhost:3000/api/budgets/categories`.

### Task 6: Create Rule API

-   **CREATE** `src/app/api/budgets/rules/route.ts`
-   **IMPLEMENT**: `GET` (list rules) and `POST` (create rule).
-   **IMPORTS**: Use `ruleRepository` and `createRuleSchema`.
-   **VALIDATE**: `curl` test.

### Task 7: Create Budget Management Page UI Skeleton

-   **CREATE** `src/app/(auth)/budget/page.tsx`
-   **IMPLEMENT**: Basic layout with tabs for "Overview", "Categories", "Rules".
-   **VALIDATE**: Navigate to `/budget` in browser.

### Task 8: Implement Category Manager UI

-   **CREATE** `src/components/budget/category-list.tsx` and `src/components/budget/add-category-dialog.tsx`.
-   **IMPLEMENT**: List categories, add new one via Dialog + React Query mutation.
-   **UPDATE**: `src/app/(auth)/budget/page.tsx` to include `CategoryList`.
-   **VALIDATE**: Add a category via UI and see it appear.

### Task 9: Implement Rule Manager UI

-   **CREATE** `src/components/budget/rule-list.tsx` and `src/components/budget/add-rule-dialog.tsx`.
-   **IMPLEMENT**: List rules, add new one via Dialog.
-   **UPDATE**: `src/app/(auth)/budget/page.tsx` to include `RuleList`.
-   **VALIDATE**: Add a rule via UI.

---

## TESTING STRATEGY

### Unit Tests
-   Test `CategorizationEngine` logic extensively (string matching, case sensitivity).
-   Test Zod schemas for edge cases.

### Integration Tests
-   Test Repository CRUD operations against real DB (via scripts).
-   Test API endpoints return 200/201/400 correctly.

---

## VALIDATION COMMANDS

### Level 1: Syntax
`npm run lint`

### Level 2: Repository Tests
`npx tsx scripts/test-budget-repo.ts`
`npx tsx scripts/test-rule-repo.ts`

### Level 3: Manual
-   Visit `/budget`
-   Create Category "Test Cat"
-   Create Rule "If 'Starbucks' -> 'Test Cat'"

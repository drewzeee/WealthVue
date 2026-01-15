# Enhanced Transaction Filtering Engine

Add a robust, multi-criteria filtering system with dynamic summary cards that show totals based on the current filter state.

## Proposed Changes

### Backend - Repository Layer

#### [MODIFY] [transactions.ts](file:///home/andrew/wealthvue/src/lib/db/repositories/transactions.ts)

**Extend TransactionFilter type:**
- `type?: 'income' | 'expense' | 'all'` - Filter by transaction type (positive/negative amounts)
- `amountMin?: number` - Minimum amount filter
- `amountMax?: number` - Maximum amount filter
- `merchant?: string` - Merchant name filter
- `isTransfer?: boolean` - Include/exclude transfers

**Add `getSummary` method:**
```typescript
async getSummary(filter: TransactionFilter): Promise<{
  count: number;
  totalIncome: Decimal;
  totalExpenses: Decimal;
}>
```
This calculates aggregates from filtered transactions without fetching all data.

---

### Frontend - New Filter UI Component

#### [NEW] [filter-popover.tsx](file:///home/andrew/wealthvue/src/components/transactions/filter-popover.tsx)

A dropdown popover component with sections for:
- **Type**: Radio group (All / Income / Expenses)
- **Date Range**: From/To date pickers
- **Account**: Multi-select checkboxes with search
- **Category**: Multi-select checkboxes with search
- **Amount**: Min/Max number inputs
- **Merchant**: Text input with autocomplete
- **Active filter badges**: Show applied filters as removable chips

UI matches current design (glassmorphism, theme colors).

---

### Frontend - Dynamic Summary Cards

#### [NEW] [transaction-summary-cards.tsx](file:///home/andrew/wealthvue/src/components/transactions/transaction-summary-cards.tsx)

Server component displaying:
- **Total Transactions**: Count of filtered transactions
- **Income**: Sum of positive amounts (filtered)
- **Expenses**: Sum of negative amounts as positive display (filtered)

Uses `GlassCard` component for consistency with design system.

---

### Transactions Page Integration

#### [MODIFY] [page.tsx](file:///home/andrew/wealthvue/src/app/(auth)/transactions/page.tsx)

- Add new filter parameters to `searchParams` interface (type, amountMin, amountMax, merchant, isTransfer)
- Fetch summary data alongside transactions using Promise.all
- Replace inline filter row with `<FilterPopover />` and search input
- Add `<TransactionSummaryCards />` at top of page

#### [MODIFY] [transaction-filters.tsx](file:///home/andrew/wealthvue/src/components/transactions/transaction-filters.tsx)

Refactor to:
- Keep search input separate (quick access)
- Move all other filters into the new FilterPopover
- Show active filter badges/chips below search bar

---

## Verification Plan

### Manual Verification

1. **Navigate to Transactions page** at `/transactions`
2. **Test Type filter**:
   - Click Filter button → Select "Income" → Apply
   - Verify: Only transactions with positive amounts show, Income summary updates, Expenses shows $0.00
   - Select "Expenses" → Apply
   - Verify: Only negative amounts show, summary reflects change
3. **Test Date Range filter**:
   - Set From/To dates → Apply
   - Verify: Only transactions within range shown, totals recalculate
4. **Test Account filter**:
   - Select specific account(s) → Apply
   - Verify: Only transactions from those accounts appear
5. **Test Amount Range filter**:
   - Set Min=100, Max=500 → Apply
   - Verify: Only transactions in that amount range shown
6. **Test Combined filters**:
   - Apply Type=Income + Account=Chase + Amount Min=50
   - Verify all filters work together, summary is accurate
7. **Test Clear filters**:
   - Click "Clear filters" or remove all chips
   - Verify: All transactions return, summary shows full totals

### Build Verification
```bash
cd /home/andrew/wealthvue && npm run build
```
Verify no TypeScript errors.

### Lint Check
```bash
cd /home/andrew/wealthvue && npm run lint
```

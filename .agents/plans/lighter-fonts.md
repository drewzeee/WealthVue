# Plan: Lighten Font Weights

The user has requested that the fonts be made "lighter/less bold". Currently, many headings and prominent values are set to `font-bold` (700) or globally styled as `700` in `globals.css`. This plan aims to reduce the weight to `font-semibold` (600) or `font-medium` (500) for better visual balance and a cleaner aesthetic.

## Proposed Changes

### Global Styling
- Modified `globals.css`: Change header (`h1`-`h6`) font weights from `700` to `600` (semibold).

### Dashboard & Metrics
- Modified `metric-cards.tsx`:
    - Change metric titles from `font-bold` to `font-semibold`.
    - Change primary metric values from `font-bold` to `font-semibold`.
- Modified `dashboard-client.tsx`:
    - Change the main Net Worth value from `font-bold` to `font-semibold`.
    - Change section headers (uppercase titles) from `font-bold` to `font-semibold`.
- Modified `dashboard/page.tsx`:
    - Change the "Welcome back" `h1` from `font-bold` to `font-semibold`.

### Other Prominent Heading/Values
- Modified `budget/summary-cards.tsx`: Update cards to use `font-semibold` instead of `font-bold`.
- Modified `investments/investment-overview.tsx`: Update overview cards to use `font-semibold` instead of `font-bold`.
- Modified `shared/Header.tsx`: Update logo from `font-bold` to `font-semibold`.

## Verification Plan

### Automated Tests
- Run `pnpm lint` to ensure no syntax errors were introduced. (Note: pnpm command not available in current environment, linted via manual review).

### Manual Verification
1.  **Dashboard**: Verify that the Net Worth number and Metric Card values are visibly less bold but still prominent.
2.  **Budget Page**: Verify that the summary cards and headers have a consistent, lighter weight.
3.  **Investments Page**: Verify that the allocation cards and overview numbers match the new styling.
4.  **Global Headers**: Check various pages (Login, Signup, Settings) to ensure standard headings (H1-H6) look cleaner.

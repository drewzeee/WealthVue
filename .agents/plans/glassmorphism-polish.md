# Glassmorphism UI Polish

## Overview
Implement a consistent, high-premium glassmorphism UI across all major dashboard components. This includes frosted glass panels, deep floating shadows, and performance-based hover effects.

## Goals
- Establish `GlassCard` as the primary container for dashboard elements.
- Implement high-contrast "floating" shadows to create depth.
- Add dynamic hover glows based on performance (e.g., green for profit, red for loss).
- Ensure consistency across Budget, Transactions, and Investment pages.

## UI Components
- `GlassCard`: The core component implementing `backdrop-blur`, semi-transparent backgrounds, and custom `boxShadow`.
- `SpendingChart`: Updated to use `GlassCard`.
- `TransactionsTableShell`: Wrapped in `GlassCard`.
- `InvestmentOverview`: Summary cards and charts migrated to `GlassCard`.
- `InvestmentDataTable`: Table container updated.
- `InvestmentAccountList`: Individual account cards migrated with dynamic glows.

## Implementation Steps
1. **Shadow Engineering**: Define high-contrast shadows in `tailwind.config.ts` and fix rendering issues using inline `boxShadow` in `GlassCard` to ensure visibility across all browsers.
2. **GlassCard Refinement**: Standardize padding, border-radius (2xl), and backdrop-blur (md).
3. **Component Migration**: Systematically replace standard `Card` components with `GlassCard` in:
    - Budget page (`SpendingChart`)
    - Transactions page (`TransactionsTableShell`)
    - Investments page (`InvestmentOverview`, `InvestmentDataTable`, `InvestmentAccountList`)
4. **Dynamic Glows**: Implement `glowColor` logic in `GlassCard` and apply it based on investment/budget performance.

## Testing Plan
- Manual visual inspection of shadows in Light and Dark modes.
- Verify hover transitions and glow effects.
- Check responsive behavior of glass panels on mobile vs desktop.

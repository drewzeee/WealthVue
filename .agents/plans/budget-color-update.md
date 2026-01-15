# Budget Color Update Plan

## Goal Description
Align the colors in the Budget Overview dashboard (Summary Cards and Charts) with the provided reference image.

## Proposed Changes

### Configuration
#### [MODIFY] [tailwind.config.ts](file:///home/andrew/wealthvue/tailwind.config.ts)
- Add new colors to the theme extension for financial metrics:
    - `finance-income`: Neon Green
    - `finance-expense`: Bright Red
    - `finance-remaining`: Vivid Blue

### Styles
#### [MODIFY] [globals.css](file:///home/andrew/wealthvue/src/app/globals.css)
- Define the OKLch values for the new financial colors in `:root`, `.dark`, and `.pink`.
    - **Income**: Bright Green (`0.7 0.2 145`)
    - **Expense**: Red/Pink (`0.65 0.25 25`)
    - **Remaining**: Blue (`0.6 0.22 270`)

### Components
#### [MODIFY] [summary-cards.tsx](file:///home/andrew/wealthvue/src/components/budget/summary-cards.tsx)
- Replace static Tailwind classes (`text-emerald-500`, `text-destructive`, `text-blue-600`) with the new `text-finance-*` classes.

#### [MODIFY] [spending-chart.tsx](file:///home/andrew/wealthvue/src/components/budget/spending-chart.tsx)
- Update the "Remaining" slice color to use the `finance-income` variable (or a dedicated `finance-remaining-chart` color if different).
- Ensure the tooltip uses the theme-aware colors.

## Verification
-   **Manual**: Check the Dashboard/Budget page and verify the numbers match the reference colors (Green, Black, Red, Blue).

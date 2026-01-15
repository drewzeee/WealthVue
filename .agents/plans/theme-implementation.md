# Theme Implementation

## Overview
Implement the new branding and color system as defined in `BRANDING.md`. This involves processing a switch to the OKLch color space, introducing multiple themes (Light, Dark, Pink), and updating the application's typography.

## Goals
- Implement OKLch-based color system for accurate color reproduction.
- Establish three distinct themes: Light (Default), Dark (Sci-fi/Neon), and Pink (Warm/Soft).
- Update typography to use Space Grotesk for headings/body and JetBrains Mono for code.
- Provide a robust theme switching mechanism that persists user preference.

## Data Model Changes
None. Theme preference will be stored in `localStorage`, not the database.

## API Endpoints
None.

## UI Components
- **`ThemeContext`**: A React context provider to manage state (current theme) and apply the `data-theme` attribute to the document root.
- **`ThemeSwitcher`**: A UI component allowing users to toggle between available themes.

## Implementation Steps
1.  **Configure Tailwind**:
    -   Update `tailwind.config.ts` to remove `hsl()` wrappers, enabling direct CSS variable usage for OKLch.
    -   Add `Space Grotesk` and `JetBrains Mono` to the font family configuration.
    -   Update border radius tokens.
2.  **Define Styles**:
    -   Rewrite `src/app/globals.css` to define OKLch CSS variables for `:root` (Light), `.dark` (Dark), and `.pink` (Pink).
    -   Add utility classes for glassmorphism and glow effects.
3.  **Implement Core Logic**:
    -   Create `src/core/theme/ThemeContext.tsx` to handle theme logic and persistence.
    -   Create `src/core/theme/ThemeSwitcher.tsx` for user interaction.
4.  **Integrate**:
    -   Update `src/app/layout.tsx` to include the `ThemeProvider` and load the new fonts from `next/font/google`.

## Testing Plan
-   **Manual Verification**:
    -   Verify the application loads in the default Light theme with correct Violet accents.
    -   Use `ThemeSwitcher` to toggle to Dark and Pink themes, ensuring colors update instantly.
    -   Refresh the page to verify theme persistence.
    -   Inspect text elements to confirm correct font families are applied.

## Potential Challenges
-   **Browser Support**: OKLch is widely supported in modern browsers, but older browsers might display incorrect colors. We are assuming a modern environment.
-   **Existing Hardcoded Colors**: There might be ad-hoc colors in individual components that need to be refactored to use the new CSS variables.

# Multiple Conditions & Logic for Rules

## Goal Description
Allow users to define more complex categorization rules by adding support for multiple conditions within a single rule, as well as specifying the logical operator (AND/OR) that governs how these conditions are evaluated. This moves beyond the current "single condition" limitation and implicit "AND" logic.

## User Review Required
> [!WARNING]
> This requires a database schema change to add the `logic` field to the `CategorizationRule` model.

## Proposed Changes

### Database Schema
#### [MODIFY] [schema.prisma](file:///home/andrew/wealthvue/prisma/schema.prisma)
- Add `logic` field to `CategorizationRule` model (Enum or String, likely `RuleLogic` enum: `AND`, `OR`). Default to `AND`.

### Validation Schemas
#### [MODIFY] [budget.ts](file:///home/andrew/wealthvue/src/lib/validations/budget.ts)
- Update `createRuleSchema` to include `logic` field.

### Backend Services
#### [MODIFY] [categorization.engine.ts](file:///home/andrew/wealthvue/src/lib/services/categorization.engine.ts)
- Update `categorize` method to switch between `.every()` (AND) and `.some()` (OR) based on the rule's `logic` field.

### Frontend Components
#### [MODIFY] [add-rule-dialog.tsx](file:///home/andrew/wealthvue/src/components/budget/add-rule-dialog.tsx)
- Use `useFieldArray` to manage the list of conditions dynamically.
- Add "Add Condition" button.
- Add "Remove" button next to each condition (except the first one maybe, or verify >0).
- Add a radio group or select for "Match Type": "All conditions (AND)" vs "Any condition (OR)".

#### [MODIFY] [rule-list.tsx](file:///home/andrew/wealthvue/src/components/budget/rule-list.tsx)
- Update the conditions display column to show "AND" / "OR" badges or separators between conditions to clearly indicate the logic.

## Verification Plan

### Automated Tests
- Create unit tests for `CategorizationEngine` testing both AND and OR logic with multiple conditions.

### Manual Verification
1.  Create a rule with 2 conditions and 'AND' logic. Verify a transaction matching only one condition is NOT categorized.
2.  Create a rule with 2 conditions and 'OR' logic. Verify a transaction matching only one condition IS categorized.

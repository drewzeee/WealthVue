# Account Management Actions Fix

## Goal Description
The 'edit' and 'delete' buttons in the account management view are unresponsive. The goal is to identify the cause of this issue in the frontend components and implement a fix to ensure these actions work as expected.

## User Review Required
None at this stage.

## Proposed Changes
### src/components/settings
#### [MODIFY] [account-list.tsx](file:///home/andrew/wealthvue/src/components/settings/account-list.tsx)
- The Edit action is currently just a `console.log`. We need to implement the actual edit logic.
- We will reuse or adapt `AddAccountDialog` for editing, or create a new `EditAccountDialog`.
- The Delete action uses `window.confirm`. We should verify this works or replace it with a shadcn `AlertDialog` for a better UI.

### src/components/accounts
#### [MODIFY] [add-account-dialog.tsx](file:///home/andrew/wealthvue/src/components/accounts/add-account-dialog.tsx)
- Rename to `AccountDialog` to reflect dual purpose (create/edit).
- Add `mode` prop ("create" | "edit") and `initialData` prop.
- If in edit mode, pre-fill `formData`.
- If in edit mode, disable the "Method Selection" step and go straight to form.
- Call `updateAccount` instead of `createAccount` on submit if in edit mode.

### src/app/actions
#### [MODIFY] [accounts.ts](file:///home/andrew/wealthvue/src/app/actions/accounts.ts)
- Implement `updateAccount` function.
- It should accept `id`, `type`, and the data to update (name, balance, interest, etc.).
- Ensure it handles all 4 types (use switch case similar to delete/create).

## Verification Plan
### Manual Verification
- Navigate to the account settings page.
- Click the 'Edit' button on an account. Verification: The edit dialog/form should appear.
- Click the 'Delete' button on an account. Verification: A confirmation dialog should appear, validation of deletion should occur.

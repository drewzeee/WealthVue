# CSV Import Column Mapping

## Overview
Enhance the existing CSV import functionality to support files with varying column orders and names. This feature will allow users to upload CSV exports from different banks and manually map the CSV headers to the required WealthVue transaction fields (Date, Description, Amount).

## Goals
- Allow users to import CSV files from any source, regardless of header names.
- Provide a user-friendly interface for mapping CSV columns to transaction fields.
- Auto-detect common header names to minimize user effort.
- Validate CSV data before sending it to the backend.

## Data Model Changes
No database schema changes are required for this iteration. We are not persisting the mapping preferences per account yet.

## API Endpoints
No new API endpoints are required. We will reuse the existing `POST /api/transactions/import` endpoint. The data transformation will happen on the client-side.

## UI Components
- **ImportCSVDialog (Refactor)**:
  - **Upload Step**: File input (existing).
  - **Mapping Step**: New UI to display detected headers and allow selection for "Date", "Description", and "Amount".
  - **Preview/Validation**: Show any errors or a summary before final import.

## Implementation Steps
1.  **Refactor `ImportCSVDialog`**: Introduce a state machine for the dialog steps (`UPLOAD`, `MAPPING`, `IMPORTING`).
2.  **Implement Header Parsing**: Use `papaparse` to read just the header row first.
3.  **Build Mapping UI**: Create a step where users select which CSV column corresponds to:
    - `Transaction Date`
    - `Description`
    - `Amount`
4.  **Implement `guessMapping` Logic**: Auto-select dropdowns if headers match known patterns (e.g., "date", "posting date", "amount", "value", "details", "memo").
5.  **Implement Transformation Logic**: Map the parsed CSV rows to the `Transaction` object structure expected by the API.
6.  **Error Handling**: Ensure invalid rows (missing mapped data) are handled gracefully (skip or error).

## Testing Plan
- **Standard Import**: Verify imports with standard headers still work (auto-mapped).
- **Custom Headers**: Manually map non-standard headers and verify data accuracy.
- **Validation**: Ensure the import is blocked if required fields are not mapped.
- **Edge Cases**: Empty files, files with missing headers, files with extra columns.

### Date Parsing Update
- Integrate `date-fns` (or native parsing if sufficient) to handle formats like `MM/dd/yyyy` and `yyyy-MM-dd`.
- Attempt to auto-detect format or try multiple formats during parsing.


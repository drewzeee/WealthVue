# Feature: Account Types & Net Worth Logic

## Overview
This plan defines the standard for Account Types within WealthVue, how they impact Net Worth calculations, and the user workflow for creating/linking accounts. It addresses the architectural distinction between Plaid-synced accounts and manually managed detailed assets/liabilities.

## Goals
1.  **Define Account Taxonomy**: Clearly map all financial entities to the appropriate Prisma model (`Account`, `InvestmentAccount`, `Asset`, `Liability`).
2.  **Net Worth Formula**: Establish a deterministic formula for calculating Net Worth based on these types.
3.  **Account Creation Workflow**: Design a unified "Add Account" experience that guides users to the right type.

## 1. Account Taxonomy & Schema Mapping

The system supports two primary methods of tracking: **Automated (Plaid)** and **Manual**.

### A. Automated (Plaid Items)
All accounts linked via Plaid are stored in the **`Account`** model. They provide automatic balance updates but may lack granular holding details (for MVP).

| Plaid Type | Prisma Model | Prisma `AccountType` | Net Worth Impact | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `depository` (Checking/Savings) | `Account` | `CHECKING` / `SAVINGS` | **Asset (+)** | Positive balance = Cash |
| `credit` (Credit Card) | `Account` | `CREDIT_CARD` | **Liability (-)** | Plaid returns positive balance for debt. **Must negate for Net Worth.** |
| `loan` (Mortgage/Student) | `Account` | `LOAN` | **Liability (-)** | Plaid returns positive balance for debt. **Must negate.** |
| `investment` (Brokerage/401k) | `Account` | `INVESTMENT` | **Asset (+)** | Tracks total balance only (no holdings breakdown in `Account` model). |
| `other` | `Account` | `OTHER` | **Asset (+)** | Default to asset unless specified. |

### B. Manual (Detailed Tracking)
Users can manually add entities for granular tracking or for items Plaid doesn't support.

| User Intent | Prisma Model | Type Enum | Net Worth Impact | Value Source |
| :--- | :--- | :--- | :--- | :--- |
| "Add Bank Account" (Manual) | `Account` | `CHECKING`/`SAVINGS` | **Asset (+)** | `currentBalance` |
| "Add Credit Card" (Manual) | `Account` | `CREDIT_CARD` | **Liability (-)** | `currentBalance` (treated as negative) |
| "Add Investment Portfolio" | `InvestmentAccount` | `BROKERAGE`, etc. | **Asset (+)** | **Sum of Investments** (`quantity` * `price`) |
| "Add Real Estate/Vehicle" | `Asset` | `REAL_ESTATE`, `VEHICLE` | **Asset (+)** | `currentValue` |
| "Add Loan/Mortgage" | `Liability` | `MORTGAGE`, `LOAN` | **Liability (-)** | `currentBalance` (treated as negative) |

> **Key Distinction**:
> *   **`Account` (Type: INVESTMENT)**: Used for Plaid-synced investment accounts (Top-level balance only).
> *   **`InvestmentAccount`**: Used for manually managed portfolios where the user enters specific holdings (Stocks, Crypto) and we calculate the total value.

## 2. Net Worth Calculation Logic

The Net Worth calculation is a global aggregation query.

**Formula:**
$$Net Worth = \sum(Assets) - \sum(Liabilities)$$

**Implementation Details:**

1.  **Sum `Account` Assets**:
    *   Where `type` IN (`CHECKING`, `SAVINGS`, `INVESTMENT`, `OTHER`)
    *   Sum `currentBalance` (Ensure we handle 0 or nulls).
2.  **Sum `Account` Liabilities**:
    *   Where `type` IN (`CREDIT_CARD`, `LOAN`)
    *   Sum `currentBalance` (Plaid usually sends debt as positive, so we sum the magnitude).
3.  **Sum `InvestmentAccount` Assets**:
    *   For each `InvestmentAccount`, calculated value = $\sum(Investment.quantity \times (Investment.currentPrice \text{ OR } Investment.costBasis))$
    *   *Note: If price is missing, fallback to cost basis or fail gracefully.*
4.  **Sum `Asset` Model**:
    *   Sum `currentValue`.
5.  **Sum `Liability` Model**:
    *   Sum `currentBalance`.

**Result:**
`Total Assets` = (1) + (3) + (4)
`Total Liabilities` = (2) + (5)
`Net Worth` = `Total Assets` - `Total Liabilities` (Subtracting the positive magnitude of debt)

## 3. Account Creation Wizard (UI/UX)

The "Add Account" button should open a Wizard Modal:

**Step 1: Connection Method**
*   [Button] **Connect via Plaid** (Recommended) -> Launches Plaid Link.
*   [Button] **Add Manually** -> Proceed to Step 2.

**Step 2: Manual Account Type Selection**
*   "What do you want to add?"
    *   **Bank Account** -> Create `Account` (Type: Checking/Savings)
    *   **Credit Card** -> Create `Account` (Type: Credit Card)
    *   **Investment Portfolio** -> Create `InvestmentAccount` + Add Holdings Flow
    *   **Physical Asset** (Home, Car) -> Create `Asset`
    *   **Loan/Debt** -> Create `Liability`

## 4. Implementation Steps

1.  **Update `Account` Model (Optional)**: Ensure `AccountType` matches Plaid's mapping. (Current schema looks good).
2.  **Backend Service (`NetWorthService`)**:
    *   Create a service that executes the 5 component queries.
    *   Aggregates them into `currentNetWorth`.
    *   Snapshots this value into `NetWorthSnapshot`.
3.  **Frontend Wizard**:
    *   Implement the routing logic described in Section 3.
4.  **Plaid Webhook Handler**:
    *   Ensure `Account` creation maps the Plaid `type`/`subtype` correctly to Prisma `AccountType`.

## Potential Challenges
*   **Plaid Sign Convention**: Plaid documentation says "Positive values indicate money owed to the account holder... Negative values indicate money owed by the account holder" for DEPOSITORY. But for CREDIT, "Positive balances indicate the amount owed". We must verify this logic in `PlaidService`.
    *   *Mitigation*: Store absolute values in DB and rely on `type` to determine sign during calculation? OR store signed values in DB?
    *   *Decision*: Store **Absolute Values** (Magnitude) in DB to match Plaid's `current_balance` behavior, and let the `type` determine the arithmetic sign in the application logic. This avoids confusion where a user sees "-$500" for a credit card balance and thinks they have a credit.


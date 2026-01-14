# WealthVue - Database Schema Design

**Version:** 1.0
**Last Updated:** 2026-01-14
**ORM:** Prisma

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Schema Definitions](#schema-definitions)
4. [Indexes and Performance](#indexes-and-performance)
5. [Data Types and Constraints](#data-types-and-constraints)
6. [Migrations Strategy](#migrations-strategy)

---

## Overview

WealthVue uses PostgreSQL as the primary database. The schema is managed via Prisma ORM, which provides type-safe database access and automatic migration generation.

**Key Design Principles:**

1. **Referential Integrity:** Foreign keys with CASCADE on delete where appropriate
2. **Decimal Precision:** Use `Decimal` type for all monetary values (no floats!)
3. **Soft Deletes:** Consider for transactions/budgets (future enhancement)
4. **Timestamps:** All tables include `createdAt` and `updatedAt`
5. **User Isolation:** Every user-owned resource has `userId` foreign key

---

## Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐         ┌──────────────────┐
│   LinkInvitation│         │    Account       │
└─────────────────┘         └────────┬─────────┘
                                     │ 1:N
                                     ▼
                            ┌─────────────────┐        ┌─────────────────┐
                            │  Transaction    │────────│   Category      │
                            └─────────────────┘   N:1  └────────┬────────┘
                                                                 │ 1:N
                                                                 ▼
                                                        ┌─────────────────┐
                                                        │ CategoryBudget  │
                                                        └─────────────────┘

┌─────────────────┐        ┌─────────────────┐
│CategorizationRule│        │ InvestmentAccount│
└─────────────────┘        └────────┬────────┘
                                    │ 1:N
                                    ▼
                           ┌─────────────────┐        ┌─────────────────┐
                           │   Investment    │────────│   AssetPrice    │
                           └─────────────────┘   1:N  └─────────────────┘

┌─────────────────┐        ┌─────────────────┐
│     Asset       │        │   Liability     │
└─────────────────┘        └─────────────────┘

┌─────────────────┐
│ NetWorthSnapshot│
└─────────────────┘
```

---

## Schema Definitions

### Core Authentication & Users

#### User

Stores user account information and authentication credentials.

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  emailVerified DateTime?
  image         String?

  // Family linking
  linkedUserId  String?   @unique
  linkedUser    User?     @relation("UserLink", fields: [linkedUserId], references: [id])
  linkingUser   User?     @relation("UserLink")
  linkStatus    LinkStatus @default(NONE)

  // Relations
  accounts            Account[]
  categories          Category[]
  categorizationRules CategorizationRule[]
  investmentAccounts  InvestmentAccount[]
  assets              Asset[]
  liabilities         Liability[]
  netWorthSnapshots   NetWorthSnapshot[]
  sentInvitations     LinkInvitation[] @relation("InvitationSender")
  receivedInvitations LinkInvitation[] @relation("InvitationReceiver")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

enum LinkStatus {
  NONE
  PENDING
  LINKED
}
```

**Design Notes:**
- `linkedUserId` creates bidirectional link between family members
- `passwordHash` uses bcrypt (never store plain text)
- `cuid()` generates collision-resistant IDs

---

#### LinkInvitation

Manages family account linking invitations.

```prisma
model LinkInvitation {
  id       String @id @default(cuid())
  fromUserId String
  fromUser   User   @relation("InvitationSender", fields: [fromUserId], references: [id], onDelete: Cascade)

  toEmail  String
  toUserId String?
  toUser   User?   @relation("InvitationReceiver", fields: [toUserId], references: [id], onDelete: Cascade)

  status   InvitationStatus @default(PENDING)
  expiresAt DateTime

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("link_invitations")
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  DECLINED
  EXPIRED
}
```

---

### Banking & Transactions

#### Account

Represents connected bank accounts (via Plaid) or manual accounts.

```prisma
model Account {
  id              String  @id @default(cuid())
  userId          String
  user            User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Account details
  name            String
  type            AccountType
  subtype         String?

  // Plaid integration
  plaidAccountId  String?  @unique
  plaidAccessToken String? // Encrypted
  plaidItemId     String?

  // Balance tracking
  currentBalance  Decimal  @db.Decimal(15, 2)
  availableBalance Decimal? @db.Decimal(15, 2)
  creditLimit     Decimal? @db.Decimal(15, 2) // For credit cards

  // Account status
  isActive        Boolean  @default(true)
  lastSyncedAt    DateTime?

  // Relations
  transactions    Transaction[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([plaidAccountId])
  @@map("accounts")
}

enum AccountType {
  CHECKING
  SAVINGS
  CREDIT_CARD
  INVESTMENT
  LOAN
  OTHER
}
```

**Design Notes:**
- `plaidAccessToken` should be encrypted at application level before storage
- `creditLimit` only applicable for credit card accounts
- `isActive` allows soft-deactivation without deletion

---

#### Transaction

Stores all financial transactions from bank accounts.

```prisma
model Transaction {
  id          String   @id @default(cuid())
  accountId   String
  account     Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)

  // Transaction details
  date        DateTime
  description String
  merchant    String?
  amount      Decimal  @db.Decimal(15, 2)

  // Categorization
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  // Metadata
  pending     Boolean  @default(false)
  source      TransactionSource

  // Plaid integration
  plaidTransactionId String? @unique

  // User notes
  notes       String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([accountId])
  @@index([categoryId])
  @@index([date])
  @@index([plaidTransactionId])
  @@map("transactions")
}

enum TransactionSource {
  PLAID
  MANUAL
  CSV_IMPORT
}
```

**Design Notes:**
- `amount` can be positive (income) or negative (expense)
- `pending` indicates transaction hasn't cleared yet
- Full-text search index on `description` for fast searching (added via raw SQL)

---

### Budgets & Categories

#### Category

User-defined budget categories for transaction organization.

```prisma
model Category {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Category details
  name        String
  color       String  @default("#3B82F6") // Hex color
  icon        String? // Icon name/emoji

  // Budget settings
  carryOver   Boolean @default(false)

  // Relations
  transactions Transaction[]
  budgets      CategoryBudget[]
  rules        CategorizationRule[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, name])
  @@index([userId])
  @@map("categories")
}
```

**Design Notes:**
- `carryOver` determines if unused budget rolls to next month
- Unique constraint on `[userId, name]` prevents duplicate category names per user

---

#### CategoryBudget

Monthly budget allocation for each category.

```prisma
model CategoryBudget {
  id         String   @id @default(cuid())
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  // Budget period
  month      DateTime // First day of month (e.g., 2024-01-01)

  // Budget amounts
  budgetedAmount  Decimal @db.Decimal(15, 2)
  actualSpent     Decimal @db.Decimal(15, 2) @default(0)
  carryOverAmount Decimal @db.Decimal(15, 2) @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([categoryId, month])
  @@index([categoryId])
  @@index([month])
  @@map("category_budgets")
}
```

**Design Notes:**
- `month` stored as first day of month for easy querying
- `actualSpent` calculated from sum of transactions (or cached for performance)
- `carryOverAmount` from previous month

---

#### CategorizationRule

Rules for automatic transaction categorization.

```prisma
model CategorizationRule {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  categoryId String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  // Rule definition
  priority   Int      // Lower number = higher priority
  conditions Json     // Array of conditions: { field, operator, value }

  // Status
  isActive   Boolean  @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([priority])
  @@map("categorization_rules")
}
```

**Conditions JSON Structure:**
```typescript
type Condition = {
  field: 'description' | 'amount' | 'merchant'
  operator: 'contains' | 'equals' | 'gt' | 'lt' | 'gte' | 'lte'
  value: string | number
}

// Example:
[
  { field: 'description', operator: 'contains', value: 'Amazon' },
  { field: 'amount', operator: 'lt', value: 50 }
]
```

---

### Investments & Portfolio

#### InvestmentAccount

Separate accounts for grouping investments (brokerage, retirement, etc.).

```prisma
model InvestmentAccount {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Account details
  name        String
  type        InvestmentAccountType
  taxAdvantaged Boolean @default(false) // IRA, 401k, etc.

  // Relations
  investments Investment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("investment_accounts")
}

enum InvestmentAccountType {
  BROKERAGE
  RETIREMENT_401K
  RETIREMENT_IRA
  RETIREMENT_ROTH_IRA
  CRYPTO
  OTHER
}
```

---

#### Investment

Individual investment holdings.

```prisma
model Investment {
  id        String @id @default(cuid())
  accountId String
  account   InvestmentAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)

  // Asset details
  assetClass   AssetClass
  symbol       String     // Ticker symbol (AAPL, BTC, etc.)
  name         String     // Full name

  // Holding details
  quantity     Decimal    @db.Decimal(20, 8) // High precision for crypto
  costBasis    Decimal    @db.Decimal(15, 2) // Total purchase price
  purchaseDate DateTime

  // Current pricing (cached)
  currentPrice Decimal?   @db.Decimal(15, 2)
  lastPriceUpdate DateTime?

  // Manual price entry for unsupported assets
  manualPrice  Boolean    @default(false)

  // Notes
  notes        String?

  // Relations
  priceHistory AssetPrice[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([accountId])
  @@index([symbol])
  @@index([assetClass])
  @@map("investments")
}

enum AssetClass {
  STOCK
  ETF
  MUTUAL_FUND
  BOND
  CRYPTO
  REAL_ESTATE
  PRECIOUS_METAL
  COMMODITY
  OTHER
}
```

**Design Notes:**
- `quantity` has high precision for crypto (e.g., 0.00012345 BTC)
- `currentPrice` cached from external APIs
- `costBasis` is total cost (not per-unit cost)

---

#### AssetPrice

Historical price tracking for investments.

```prisma
model AssetPrice {
  id           String     @id @default(cuid())
  investmentId String
  investment   Investment @relation(fields: [investmentId], references: [id], onDelete: Cascade)

  // Price data
  price     Decimal  @db.Decimal(15, 2)
  timestamp DateTime @default(now())
  source    String   // 'yahoo', 'coingecko', 'manual'

  @@index([investmentId, timestamp])
  @@map("asset_prices")
}
```

**Design Notes:**
- Stores point-in-time prices for charting
- Can be pruned periodically (keep daily snapshots, delete intraday after 30 days)

---

### Assets & Liabilities

#### Asset

Non-investment assets (real estate, vehicles, etc.).

```prisma
model Asset {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Asset details
  type         AssetType
  name         String
  currentValue Decimal   @db.Decimal(15, 2)
  acquiredDate DateTime

  // Metadata
  notes        String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("assets")
}

enum AssetType {
  REAL_ESTATE_PRIMARY
  REAL_ESTATE_INVESTMENT
  VEHICLE
  VALUABLE
  OTHER
}
```

---

#### Liability

Debts and loans.

```prisma
model Liability {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Liability details
  type            LiabilityType
  name            String
  currentBalance  Decimal       @db.Decimal(15, 2)
  originalAmount  Decimal       @db.Decimal(15, 2)
  interestRate    Decimal?      @db.Decimal(5, 2) // Percentage

  // Payment schedule
  minimumPayment  Decimal?      @db.Decimal(15, 2)
  dueDate         DateTime?     // Next payment due date

  // Metadata
  notes           String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("liabilities")
}

enum LiabilityType {
  MORTGAGE
  AUTO_LOAN
  STUDENT_LOAN
  PERSONAL_LOAN
  CREDIT_CARD
  OTHER
}
```

---

### Analytics & Tracking

#### NetWorthSnapshot

Daily snapshots of net worth for historical tracking.

```prisma
model NetWorthSnapshot {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Snapshot data
  date      DateTime @unique
  netWorth  Decimal  @db.Decimal(15, 2)

  // Breakdown (optional, for detailed charts)
  totalAssets      Decimal @db.Decimal(15, 2)
  totalLiabilities Decimal @db.Decimal(15, 2)

  // Asset class breakdown (JSON)
  allocation       Json?

  createdAt DateTime @default(now())

  @@index([userId, date])
  @@map("net_worth_snapshots")
}
```

**Allocation JSON Structure:**
```typescript
type AllocationBreakdown = {
  cash: number
  stocks: number
  crypto: number
  realEstate: number
  other: number
}
```

---

## Indexes and Performance

### Primary Indexes

All tables have primary key (`@id`) automatically indexed.

### Foreign Key Indexes

```prisma
@@index([userId])      // On all user-owned resources
@@index([accountId])   // On transactions
@@index([categoryId])  // On transactions
@@index([investmentId])// On asset prices
```

### Query Performance Indexes

```prisma
@@index([date])                    // Transaction date queries
@@index([plaidAccountId])          // Plaid sync lookups
@@index([plaidTransactionId])      // Duplicate detection
@@index([symbol])                  // Investment symbol lookups
@@index([month])                   // Budget period queries
@@index([userId, date])            // Net worth snapshots
@@index([investmentId, timestamp]) // Price history
```

### Full-Text Search

For transaction search, add PostgreSQL full-text index:

```sql
CREATE INDEX transactions_description_fulltext
ON transactions
USING GIN (to_tsvector('english', description));
```

---

## Data Types and Constraints

### Monetary Values

**Always use `Decimal` type:**
```prisma
amount Decimal @db.Decimal(15, 2)
```

- Precision: 15 digits total, 2 decimal places
- Supports values up to 9,999,999,999,999.99
- Avoids floating-point precision errors

### Timestamps

```prisma
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
```

- `@default(now())` sets creation timestamp
- `@updatedAt` automatically updates on modification

### Enums

Defined at schema level for type safety:
```prisma
enum AccountType {
  CHECKING
  SAVINGS
  CREDIT_CARD
}
```

Benefits:
- Type safety in TypeScript
- Database-level constraint
- Clear documentation of valid values

---

## Migrations Strategy

### Development Workflow

1. **Modify schema:**
   ```bash
   # Edit prisma/schema.prisma
   ```

2. **Create migration:**
   ```bash
   npx prisma migrate dev --name add_investment_tables
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

### Production Deployment

1. **Review migration SQL:**
   ```bash
   cat prisma/migrations/20240115_add_investment_tables/migration.sql
   ```

2. **Apply migration:**
   ```bash
   npx prisma migrate deploy
   ```

### Migration Best Practices

- **Never edit migrations after creation**
- **Always test migrations on staging first**
- **Use descriptive migration names**
- **Review generated SQL before deploying**
- **Backup database before major migrations**

### Rollback Strategy

Prisma doesn't support automatic rollbacks. For rollbacks:

1. Create new migration to undo changes
2. Or restore from database backup

---

## Schema Evolution (Future)

### Planned Additions

**Soft Deletes:**
```prisma
deletedAt DateTime?

@@index([deletedAt]) // Query non-deleted: WHERE deletedAt IS NULL
```

**Audit Logging:**
```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String   // 'CREATE', 'UPDATE', 'DELETE'
  entityType String  // 'Transaction', 'Budget', etc.
  entityId  String
  changes   Json     // Before/after values
  timestamp DateTime @default(now())
}
```

**Recurring Transactions:**
```prisma
model RecurringTransaction {
  id          String @id @default(cuid())
  userId      String
  frequency   Frequency // WEEKLY, MONTHLY, YEARLY
  nextDate    DateTime
  template    Json // Transaction template data
}
```

---

## Conclusion

This schema provides a robust foundation for WealthVue's financial management features. Key design decisions prioritize data integrity, performance, and type safety.

**Key Takeaways:**

- ✅ Use Decimal for all monetary values
- ✅ Index foreign keys and frequently queried fields
- ✅ Cascade deletes where appropriate for data consistency
- ✅ Use enums for type-safe categorical data
- ✅ Store timestamps for audit trails
- ✅ Encrypt sensitive data (Plaid tokens) at application level

---

**Document Ownership:** Engineering Team
**Review Schedule:** After each migration or quarterly

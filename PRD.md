# Product Requirements Document: WealthVue

## Executive Summary

WealthVue is a comprehensive personal financial dashboard that unifies budget management, investment tracking, and asset overview in a single, intuitive application. Unlike existing solutions that fragment financial management across multiple platforms, WealthVue provides users with a holistic view of their entire financial posture—from daily transactions and monthly budgets to long-term investments and net worth tracking.

The application targets individuals and families who value financial clarity and want to manage their complete financial picture without consulting multiple applications. By integrating automated bank synchronization (via Plaid), real-time market data, and flexible manual entry options, WealthVue serves users with varying levels of financial complexity—from single bank accounts to multi-asset portfolios including stocks, crypto, real estate, and commodities.

The MVP will deliver a fully-featured financial management platform with multi-user support, deployable via Docker Compose for self-hosting, with a future roadmap toward a paid SaaS offering. The core differentiator is the seamless integration of budget management and investment tracking in a sleek, modern interface, with AI-powered insights planned for future releases.

## Mission

**Mission Statement:** Empower individuals and families to achieve financial clarity and confidence by providing a unified, intuitive platform that eliminates the complexity of managing budgets, investments, and assets across fragmented tools.

**Core Principles:**

1. **Holistic Financial View** - Users should see their complete financial picture in one place, from daily spending to long-term net worth.

2. **Privacy & Security First** - As a financial application, user data privacy and security are non-negotiable. Self-hosting options ensure users maintain complete control.

3. **Flexibility Without Complexity** - Support diverse financial situations (simple to complex) while maintaining an intuitive, approachable interface.

4. **Automation with Control** - Automate data synchronization and categorization while giving users full control to override and customize.

5. **Transparency & Accuracy** - Provide accurate, real-time financial data with clear visualizations that enable informed decision-making.

## Target Users

**Primary User Personas:**

**Persona 1: The Holistic Planner**
- Age: 28-45
- Financial literacy: Moderate to high
- Tech-savviness: High
- Pain points: Frustrated by juggling Mint (budgeting), Personal Capital (investments), and spreadsheets (net worth tracking)
- Needs: Single dashboard showing spending trends, investment performance, and net worth trajectory

**Persona 2: The Family Financial Manager**
- Age: 35-55
- Financial literacy: High
- Tech-savviness: Moderate to high
- Pain points: Managing household finances across multiple accounts, tracking shared budgets, coordinating with spouse
- Needs: Multi-user support with linked accounts, comprehensive asset tracking, family budget visibility

**Persona 3: The Sophisticated Investor**
- Age: 30-60
- Financial literacy: Very high
- Tech-savviness: High
- Pain points: Existing tools don't support diverse asset classes (crypto, real estate, commodities)
- Needs: Track complex portfolios, manual entry flexibility, accurate allocation across all asset types

**Technical Comfort Level:**
- Comfortable with web applications and cloud services
- Willing to use Docker for self-hosting (or will use SaaS version)
- Understands basic financial concepts (budgets, portfolio allocation, net worth)

**Key User Needs:**
- Unified view of budget and investment performance
- Automated transaction syncing with manual override capability
- Real-time net worth and allocation tracking
- Privacy-respecting, self-hostable solution
- Support for diverse asset classes beyond stocks/bonds

## MVP Scope

### ✅ In Scope - Core Functionality

**Dashboard & Overview:**
- ✅ Total net worth calculation (assets - liabilities)
- ✅ Net worth change over time (24h, 1w, 1mo, 3mo, 6mo, 1y, all)
- ✅ Interactive asset allocation and budget spending donut charts with "glow" effects and inactive fading
- ✅ Key metric cards (Total Cash, Credit Balance, Investment Balance, Outstanding Loans, Real Estate Value)
- ✅ Timezone-aware local midnight snapshots
- ✅ Historical net worth tracking and visualization

**Budget Management:**
- ✅ Create custom budget categories
- ✅ Allocate monthly budget amounts per category
- ✅ Category-level carry-over settings (reset vs. accumulate)
- ✅ Transaction categorization (manual and rule-based)
- ✅ Budget vs. actual spending visualization
- ✅ Spending trends and category breakdowns

**Transaction Management:**
- ✅ Plaid integration for automatic bank account syncing
- ✅ Manual transaction entry
- ✅ CSV import for transactions
- ✅ Transaction categorization rules engine (description contains 'x', amount = 'x')
- ✅ Transaction editing and deletion
- ✅ Uncategorized transaction queue
- ✅ Robust multi-criteria filtering (Account, Category, Date, Type, Amount, Merchant)
- ✅ Dynamic transaction summary cards (Income/Expense/Count)

**Investment Tracking:**
- ✅ Support multiple asset classes: stocks, ETFs, retirement accounts, crypto, real estate, precious metals, commodities
- ✅ Manual investment entry
- ✅ CSV import for investment transactions
- ✅ Real-time stock prices (Yahoo Finance API)
- ✅ Real-time crypto prices (CoinGecko API)
- ✅ Portfolio value over time
- ✅ Allocation breakdown by asset class
- ✅ Dedicated crypto allocation chart (by coin)
- ✅ Dedicated stock allocation chart (by symbol/ticker)
- ✅ Real-time 24h performance tracking (Market Movers)
- ✅ Persistent daily change data in database
- ✅ Gains/losses calculation (total and unrealized)
- ✅ Multiple portfolio/account support

**Assets & Liabilities:**
- ✅ Track cash accounts (checking, savings)
- ✅ Track credit cards (balances and limits)
- ✅ Track loans (mortgages, personal loans, student loans)
- ✅ Track real estate holdings
- ✅ Track other valuable assets
- ✅ Liability payment schedules and history

**User Management:**
- ✅ Multi-user support (separate user accounts)
- ✅ Email/password authentication
- ✅ Linked family accounts (separate accounts with shared visibility)
- ✅ User profile management

### ✅ In Scope - Technical

- ✅ Next.js 14+ application with TypeScript
- ✅ PostgreSQL database
- ✅ Redis for caching and job queues
- ✅ BullMQ for background job processing
- ✅ Docker Compose deployment for self-hosting
- ✅ Scheduled jobs for price updates and budget resets
- ✅ Responsive design (desktop and mobile)
- ✅ API rate limiting and error handling

### ❌ Out of Scope - Future Phases

**Phase 2+ Features:**
- ❌ AI-powered financial insights and recommendations
- ❌ OAuth authentication (Google, GitHub, etc.)
- ❌ Two-factor authentication (2FA)
- ❌ Bill payment reminders and alerts
- ❌ Financial goal tracking and projections
- ❌ Tax optimization insights and reporting
- ❌ Automated investment rebalancing suggestions
- ❌ Receipt scanning and attachment
- ❌ Advanced reporting and custom dashboards
- ❌ Mobile native applications (iOS/Android)
- ❌ API for third-party integrations
- ❌ Subscription billing for SaaS version
- ❌ Admin panel for SaaS management

**Explicitly Deferred:**
- ❌ Cryptocurrency wallet integration (beyond price tracking)
- ❌ Direct brokerage account integration (beyond Plaid)
- ❌ Automatic bill pay functionality
- ❌ Social/community features
- ❌ Advisor/professional access features

## User Stories

### Primary User Stories

1. **As a budget-conscious user, I want to see all my bank transactions automatically categorized, so that I can quickly understand where my money is going without manual data entry.**
   - Example: After connecting Chase and Wells Fargo accounts via Plaid, transactions appear automatically and are categorized using my custom rules (e.g., "Starbucks" → Coffee category).

2. **As an investor, I want to track my entire portfolio (stocks, crypto, real estate) in one place, so that I can see my true net worth and allocation without switching between apps.**
   - Example: I manually add my Coinbase crypto holdings, Vanguard retirement account, and rental property. The dashboard shows I'm 40% stocks, 25% crypto, 20% real estate, 15% cash.

3. **As a family financial manager, I want to link my spouse's account to mine, so that we can both track our household finances while maintaining separate logins.**
   - Example: My spouse and I each have separate accounts, but we've linked them. We both see the combined household net worth, shared budgets, and individual spending.

4. **As a user with complex finances, I want to create custom budget categories with flexible carry-over rules, so that my budget reflects how I actually manage money.**
   - Example: My "Groceries" category resets monthly, but my "Vacation Fund" carries over unused amounts. At month-end, unused vacation budget rolls into next month.

5. **As a detail-oriented user, I want to create transaction categorization rules, so that future transactions are automatically organized without manual intervention.**
   - Example: I create a rule: "If description contains 'Amazon' and amount < $50, categorize as 'Shopping'." Future Amazon purchases under $50 auto-categorize.

6. **As a net worth tracker, I want to see my financial trajectory over time with flexible timeframes, so that I can understand if I'm moving toward my financial goals.**
   - Example: The dashboard shows my net worth increased 12% over the past year, with a chart showing the growth trajectory and highlighting market dips.

7. **As a privacy-conscious user, I want to self-host the application via Docker, so that my sensitive financial data never leaves my control.**
   - Example: I run `docker-compose up` on my home server. All data stays local, and I access the app via https://finance.myhome.local.

8. **As a hands-on user, I want the ability to manually add, edit, or delete any transaction or investment, so that I maintain complete control over my financial data.**
   - Example: Plaid missed a cash transaction. I manually add it. Later, a duplicate appears—I delete it. I also adjust an investment entry where the import had the wrong cost basis.

### Technical User Stories

9. **As a system, I need to fetch real-time stock and crypto prices on a scheduled basis, so that users always see current portfolio values.**
   - Background job runs every 15 minutes during market hours, queries Yahoo Finance and CoinGecko, updates asset values in PostgreSQL.

10. **As a system, I need to process Plaid webhooks for transaction updates, so that user accounts stay synchronized without manual refreshes.**
    - Plaid webhook arrives with new transactions → BullMQ job processes them → applies categorization rules → updates database.

## Core Architecture & Patterns

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Next.js Application                    │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │   Frontend UI    │ ◄────► │   API Routes     │          │
│  │  (React + TSX)   │        │  (/api/*)        │          │
│  └──────────────────┘        └──────────────────┘          │
│                                       │                      │
│                              ┌────────┴─────────┐           │
│                              │   BullMQ Workers │           │
│                              │  (Background Jobs)│          │
│                              └──────────────────┘           │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼─────┐
    │PostgreSQL│    │  Redis  │    │ External │
    │ Database │    │  Cache  │    │   APIs   │
    └──────────┘    └─────────┘    └──────────┘
                                   (Plaid, Yahoo, CoinGecko)
```

### Directory Structure

```
wealthvue/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── (auth)/            # Auth-protected routes
│   │   │   ├── dashboard/     # Main dashboard page
│   │   │   ├── budget/        # Budget management
│   │   │   ├── transactions/  # Transaction list/rules
│   │   │   ├── investments/   # Investment portfolio
│   │   │   ├── assets/        # Asset/liability management
│   │   │   └── settings/      # User settings
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── plaid/         # Plaid integration
│   │   │   ├── transactions/  # Transaction CRUD
│   │   │   ├── budgets/       # Budget CRUD
│   │   │   ├── investments/   # Investment CRUD
│   │   │   ├── assets/        # Asset CRUD
│   │   │   └── webhooks/      # External webhooks
│   │   ├── login/             # Login page
│   │   └── signup/            # Signup page
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── charts/           # Chart components
│   │   └── shared/           # Shared components
│   ├── lib/                  # Utilities and core logic
│   │   ├── db/              # Database connection & queries
│   │   ├── jobs/            # BullMQ job definitions
│   │   ├── auth/            # Authentication logic
│   │   ├── plaid/           # Plaid client wrapper
│   │   ├── market-data/     # Yahoo/CoinGecko integrations
│   │   ├── calculations/    # Financial calculations
│   │   └── utils/           # Helper functions
│   ├── types/               # TypeScript type definitions
│   └── middleware.ts        # Next.js middleware (auth)
├── prisma/                  # Prisma ORM schema
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── docker/                 # Docker configuration
│   ├── Dockerfile
│   └── docker-compose.yml
├── .env.example           # Environment variables template
└── package.json
```

### Key Design Patterns

**1. API Route Structure**
- RESTful API design with clear resource endpoints
- Consistent response format: `{ success: boolean, data?: any, error?: string }`
- Middleware for authentication and authorization checks
- Input validation using Zod schemas

**2. Database Access**
- Prisma ORM for type-safe database queries
- Repository pattern for data access abstraction
- Transaction support for multi-step operations (e.g., budget carry-over + reset)

**3. Background Job Processing**
- BullMQ for reliable job queuing
- Separate workers for different job types (price updates, Plaid sync, budget resets)
- Retry logic with exponential backoff
- Job monitoring and logging

**4. State Management**
- React Context for global state (user session, preferences)
- Server components for data fetching (Next.js 14 pattern)
- React Query/SWR for client-side data caching and revalidation
- Optimistic updates for immediate UI feedback

**5. Component Architecture**
- Atomic design: atoms (buttons, inputs) → molecules (cards) → organisms (dashboard sections)
- Composition over inheritance
- Server components by default, client components only when needed (interactivity, hooks)

**6. Security Patterns**
- API routes protected by session middleware
- Row-level security checks (users can only access their own data)
- CSRF protection via NextAuth
- Encrypted sensitive data at rest (Plaid tokens)
- Environment-based configuration (no secrets in code)

## Tools/Features

### Feature 1: Dashboard Overview

**Purpose:** Provide users with an at-a-glance view of their complete financial health.

**Key Components:**
- **Net Worth Display:** Large, prominent number showing total net worth with color-coded change indicator
- **Time Selector:** Toggle between 24h, 1w, 1mo, 3mo, 6mo, 1y, all-time views
- **Net Worth Chart:** Line chart showing net worth trajectory over selected timeframe
- **Allocation Donut Chart:** Visual breakdown of assets by class (cash, stocks, crypto, real estate, other)
- **Metric Cards:**
  - Total Cash (sum of all bank accounts)
  - Total Credit Balance (current credit card balances)
  - Total Investment Balance (market value of all investments)
  - Total Outstanding Loans (sum of all loan balances)
  - Total Real Estate (current value of properties)

**Technical Implementation:**
- Server component fetches aggregated data on load
- Client component for time selector with SWR for data refetching
- Recharts for donut and line chart visualizations
- Real-time price updates via background job (every 15 min)

---

### Feature 2: Budget Management

**Purpose:** Enable users to create, track, and manage monthly budgets with flexible category rules.

**Operations:**
1. **Create Category:** User defines custom budget category (e.g., "Groceries", "Entertainment")
2. **Set Monthly Budget:** Allocate dollar amount for each category
3. **Configure Carry-Over:** Toggle whether unused/overused amounts roll to next month
4. **Track Spending:** View budget vs. actual spending with progress bars
5. **Budget Reset:** Automated monthly reset (respecting carry-over settings)

**Key Features:**
- Visual progress indicators (green when under budget, red when over)
- Category-level spending breakdown
- Month-over-month comparison
- Alerts when approaching or exceeding budget limits
- Bulk category import/export

**Data Model:**
```typescript
Category {
  id: string
  userId: string
  name: string
  monthlyBudget: decimal
  carryOver: boolean
  color: string
  icon: string
}

CategorySpending {
  id: string
  categoryId: string
  month: date
  budgeted: decimal
  actual: decimal
  carryOverAmount: decimal
}
```

---

### Feature 3: Transaction Management & Categorization

**Purpose:** Automatically sync, categorize, and manage all financial transactions.

**Operations:**
1. **Plaid Sync:** Automatically fetch new transactions from linked bank accounts
2. **Manual Entry:** Users can add transactions not captured by Plaid
3. **CSV Import:** Bulk import from bank export files
4. **Categorization:** Apply rules or manually categorize transactions
5. **Rule Engine:** Create rules for automatic categorization

**Key Features:**
- **Transaction List View:** Searchable, filterable table of all transactions
- **Uncategorized Queue:** View of transactions needing categorization
- **Rule Builder:** UI for creating categorization rules with conditions:
  - Description contains/equals
  - Amount greater/less than
  - Merchant matches
  - Date range
- **Bulk Actions:** Categorize, delete, or edit multiple transactions
- **Duplicate Detection:** Identify and merge duplicate transactions

**Categorization Rule Engine:**
```typescript
Rule {
  id: string
  userId: string
  priority: number
  conditions: {
    field: 'description' | 'amount' | 'merchant'
    operator: 'contains' | 'equals' | 'gt' | 'lt'
    value: string | number
  }[]
  categoryId: string
  autoApply: boolean
}
```

**Technical Implementation:**
- Plaid webhook handler processes new transactions
- Rule engine runs on new transactions (priority-sorted)
- PostgreSQL full-text search for transaction search
- BullMQ job for daily Plaid sync

---

### Feature 4: Investment Portfolio Tracking

**Purpose:** Track diverse investment holdings with real-time valuations and performance metrics.

**Supported Asset Classes:**
- Stocks & ETFs
- Mutual Funds
- Retirement Accounts (401k, IRA, Roth IRA)
- Cryptocurrency
- Real Estate (investment properties)
- Precious Metals (gold, silver)
- Commodities
- Other (art, collectibles, etc.)

**Operations:**
1. **Add Investment:** Manual entry of asset purchase (symbol, quantity, cost basis, date)
2. **CSV Import:** Bulk import from brokerage statements
3. **Price Updates:** Automatic real-time price fetching
4. **Calculate Performance:** Gains/losses, ROI, time-weighted returns
5. **Portfolio Allocation:** Visual breakdown by asset class

**Key Metrics:**
- Current portfolio value
- Total gain/loss (dollar and percentage)
- Cost basis vs. current value
- Allocation by asset class
- Performance over time (daily, monthly, yearly)
- Individual asset performance

**Data Model:**
```typescript
Investment {
  id: string
  userId: string
  accountId: string
  assetClass: enum
  symbol: string
  name: string
  quantity: decimal
  costBasis: decimal
  purchaseDate: date
  currentPrice: decimal
  lastPriceUpdate: timestamp
}

InvestmentAccount {
  id: string
  userId: string
  name: string
  type: 'brokerage' | 'retirement' | 'crypto' | 'other'
}
```

**Technical Implementation:**
- Background job fetches prices every 15 minutes (stocks during market hours)
- Yahoo Finance API for stock/ETF prices
- CoinGecko API for cryptocurrency prices
- Manual price updates for assets without API support (real estate, collectibles)
- Caching layer (Redis) to minimize API calls

---

### Feature 5: Asset & Liability Management

**Purpose:** Track all assets and liabilities for comprehensive net worth calculation.

**Asset Types:**
- Bank Accounts (checking, savings)
- Credit Cards
- Loans (mortgage, personal, student, auto)
- Real Estate (primary residence, investment properties)
- Vehicles
- Other Valuable Assets

**Operations:**
1. **Add Asset/Liability:** Create new asset or liability entry
2. **Update Values:** Manual value updates or automated (bank accounts via Plaid)
3. **Track Payment History:** Log loan payments and balances over time
4. **Calculate Net Worth:** Automatic aggregation (assets - liabilities)

**Key Features:**
- Loan amortization schedules
- Credit card utilization tracking
- Real estate equity calculation
- Asset depreciation tracking (vehicles)
- Historical value tracking

**Data Model:**
```typescript
Asset {
  id: string
  userId: string
  type: enum
  name: string
  currentValue: decimal
  acquiredDate: date
  notes: string
}

Liability {
  id: string
  userId: string
  type: enum
  name: string
  currentBalance: decimal
  originalAmount: decimal
  interestRate: decimal
  minimumPayment: decimal
  dueDate: date
}
```

---

### Feature 6: Multi-User & Family Accounts

**Purpose:** Support individual users and linked family accounts with shared financial visibility.

**Operations:**
1. **User Registration:** Create individual user account
2. **Link Accounts:** Send invitation to link with family member
3. **Accept Link:** Family member accepts invitation, accounts are linked
4. **Shared Dashboard:** View combined household finances
5. **Individual Views:** Toggle between personal and household views

**Key Features:**
- Separate user authentication and data isolation
- Linked accounts see combined net worth and budgets
- Individual transaction privacy (optional)
- Shared budget categories
- Permission levels (view-only vs. edit access)

**Data Model:**
```typescript
User {
  id: string
  email: string
  passwordHash: string
  name: string
  linkedUserId?: string
  linkStatus: 'none' | 'pending' | 'linked'
}

LinkInvitation {
  id: string
  fromUserId: string
  toEmail: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: timestamp
}
```

**Technical Implementation:**
- Middleware checks for linked accounts when fetching data
- Aggregate queries combine data from both users when linked
- Row-level security ensures users only access authorized data

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2+ | React framework with App Router, SSR, API routes |
| **React** | 18.3+ | UI component library |
| **TypeScript** | 5.4+ | Type safety and developer experience |
| **Tailwind CSS** | 3.4+ | Utility-first CSS framework for styling |
| **shadcn/ui** | Latest | Pre-built, customizable UI components |
| **Recharts** | 2.12+ | Charting library for data visualizations |
| **React Query (TanStack Query)** | 5.0+ | Server state management and caching |
| **Zod** | 3.22+ | Schema validation for forms and API inputs |
| **React Hook Form** | 7.51+ | Form state management and validation |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 14.2+ | Backend API endpoints (monolithic architecture) |
| **NextAuth.js** | 4.24+ | Authentication with email/password |
| **Prisma** | 5.12+ | ORM for type-safe database access |
| **BullMQ** | 5.4+ | Job queue for background processing |
| **node-cron** | 3.0+ | Scheduled tasks (price updates, budget resets) |

### Database & Cache

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 16+ | Primary relational database |
| **Redis** | 7.2+ | Caching layer and BullMQ job queue storage |

### External Services & APIs

| Service | Purpose | Pricing |
|---------|---------|---------|
| **Plaid** | Bank account and transaction syncing | Development: Free, Production: Pay-per-use |
| **Yahoo Finance API** | Real-time stock and ETF prices | Free (unofficial) |
| **CoinGecko API** | Cryptocurrency prices | Free tier: 10-50 calls/min |

### DevOps & Deployment

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration (self-hosted deployment) |
| **Nginx** | Reverse proxy and SSL termination |
| **GitHub Actions** | CI/CD pipeline |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

### Development Tools

| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager (faster than npm) |
| **Husky** | Git hooks for pre-commit linting |
| **tsx** | TypeScript execution for scripts |
| **Prisma Studio** | Database GUI for development |

## Security & Configuration

### Authentication & Authorization

**MVP Authentication:**
- **Email/Password:** NextAuth.js with credential provider
- **Session Management:** JWT-based sessions stored in HTTP-only cookies
- **Password Requirements:** Minimum 8 characters, must include uppercase, lowercase, number
- **Password Hashing:** bcrypt with salt rounds = 10

**Authorization Model:**
- **User Isolation:** Row-level security ensures users only access their own data
- **Linked Accounts:** Middleware checks for linked users and aggregates data accordingly
- **API Protection:** All API routes under `/api` (except `/api/auth`) require valid session
- **CSRF Protection:** Built-in NextAuth CSRF protection

**Future Authentication (Post-MVP):**
- OAuth providers (Google, GitHub)
- Two-factor authentication (TOTP)
- Biometric authentication (for mobile apps)
- Session timeout and refresh logic

---

### Configuration Management

**Environment Variables:**

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/wealthvue
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret>

# Plaid
PLAID_CLIENT_ID=<your-client-id>
PLAID_SECRET=<your-secret>
PLAID_ENV=sandbox # sandbox | development | production

# Market Data APIs
COINGECKO_API_KEY=<optional-for-higher-limits>

# Application
NODE_ENV=development # development | production
LOG_LEVEL=info # debug | info | warn | error
```

**Configuration Files:**
- `.env.local` - Local development environment variables (gitignored)
- `.env.example` - Template for required environment variables (committed)
- `docker/.env` - Docker-specific environment variables for self-hosting

---

### Security Scope

**✅ In Scope for MVP:**
- ✅ Secure password hashing (bcrypt)
- ✅ JWT session management with HTTP-only cookies
- ✅ HTTPS enforcement in production
- ✅ Environment-based secrets management
- ✅ SQL injection prevention (Prisma parameterized queries)
- ✅ XSS protection (React automatic escaping, CSP headers)
- ✅ CSRF protection (NextAuth built-in)
- ✅ Rate limiting on API endpoints
- ✅ Input validation on all forms and API routes (Zod)
- ✅ Encrypted Plaid access tokens at rest

**❌ Out of Scope (Future Phases):**
- ❌ Advanced threat detection and monitoring
- ❌ Penetration testing and security audits
- ❌ SOC 2 compliance
- ❌ End-to-end encryption for all data
- ❌ Hardware security key support
- ❌ Audit logging for compliance
- ❌ DDoS protection (rely on infrastructure)

---

### Data Privacy

**Privacy Principles:**
1. **User Data Ownership:** Users own their data; self-hosting ensures full control
2. **No Third-Party Sharing:** Data is never sold or shared with third parties
3. **Minimal Data Collection:** Only collect data necessary for functionality
4. **Transparent Data Usage:** Clear privacy policy explaining data handling

**Data Storage:**
- All user data stored in user's PostgreSQL instance (self-hosted)
- Plaid tokens encrypted at rest using application-level encryption
- Passwords hashed and never stored in plain text
- Redis cache cleared on logout

**Data Retention:**
- Users can delete their account and all associated data at any time
- Transaction data retained indefinitely (user choice)
- Logs retained for 30 days (debugging purposes)

---

### Deployment Considerations

**Self-Hosted (Docker Compose):**
- Single `docker-compose.yml` file for easy deployment
- Services: Next.js app, PostgreSQL, Redis, Nginx
- Persistent volumes for database and Redis data
- Environment variable configuration via `.env` file
- Automatic SSL certificate generation (Let's Encrypt) for custom domains
- Health checks and automatic restart policies

**Security Best Practices for Self-Hosting:**
- Run containers as non-root user
- Network isolation (internal Docker network)
- Firewall configuration (only expose port 443)
- Regular security updates via Docker image rebuilds
- Backup recommendations for PostgreSQL data

**Future SaaS Deployment:**
- Managed PostgreSQL (AWS RDS, DigitalOcean Managed DB)
- Managed Redis (AWS ElastiCache, Redis Cloud)
- Container orchestration (ECS, Kubernetes)
- CDN for static assets (CloudFront, Cloudflare)
- Automated backups and disaster recovery

## API Specification

### Authentication Endpoints

**POST /api/auth/signup**
```typescript
Request:
{
  email: string
  password: string
  name: string
}

Response (201):
{
  success: true
  data: {
    userId: string
    email: string
    name: string
  }
}
```

**POST /api/auth/signin**
```typescript
Request:
{
  email: string
  password: string
}

Response (200):
{
  success: true
  data: {
    user: {
      id: string
      email: string
      name: string
    }
    token: string // JWT token
  }
}
```

---

### Transaction Endpoints

**GET /api/transactions**
```typescript
Query Parameters:
- startDate?: string (ISO 8601)
- endDate?: string (ISO 8601)
- categoryId?: string
- accountId?: string
- limit?: number (default: 50)
- offset?: number (default: 0)

Response (200):
{
  success: true
  data: {
    transactions: Transaction[]
    total: number
    hasMore: boolean
  }
}

Transaction:
{
  id: string
  accountId: string
  date: string
  description: string
  amount: number
  categoryId: string | null
  category?: { id: string, name: string }
  merchant: string | null
  pending: boolean
  source: 'plaid' | 'manual' | 'csv'
}
```

**POST /api/transactions**
```typescript
Request:
{
  accountId: string
  date: string
  description: string
  amount: number
  categoryId?: string
  merchant?: string
}

Response (201):
{
  success: true
  data: Transaction
}
```

**PATCH /api/transactions/:id**
```typescript
Request:
{
  description?: string
  categoryId?: string
  amount?: number
}

Response (200):
{
  success: true
  data: Transaction
}
```

**DELETE /api/transactions/:id**
```typescript
Response (200):
{
  success: true
  message: "Transaction deleted"
}
```

---

### Budget Endpoints

**GET /api/budgets**
```typescript
Query Parameters:
- month?: string (YYYY-MM, default: current month)

Response (200):
{
  success: true
  data: {
    categories: CategoryBudget[]
    totalBudgeted: number
    totalSpent: number
  }
}

CategoryBudget:
{
  id: string
  name: string
  monthlyBudget: number
  actualSpent: number
  carryOver: boolean
  carryOverAmount: number
  percentUsed: number
  color: string
}
```

**POST /api/budgets/categories**
```typescript
Request:
{
  name: string
  monthlyBudget: number
  carryOver: boolean
  color?: string
  icon?: string
}

Response (201):
{
  success: true
  data: Category
}
```

**PATCH /api/budgets/categories/:id**
```typescript
Request:
{
  name?: string
  monthlyBudget?: number
  carryOver?: boolean
}

Response (200):
{
  success: true
  data: Category
}
```

---

### Investment Endpoints

**GET /api/investments**
```typescript
Response (200):
{
  success: true
  data: {
    investments: Investment[]
    totalValue: number
    totalGainLoss: number
    totalGainLossPercent: number
    allocation: {
      assetClass: string
      value: number
      percentage: number
    }[]
  }
}
```

**POST /api/investments**
```typescript
Request:
{
  accountId: string
  assetClass: 'stock' | 'crypto' | 'real_estate' | 'commodity' | 'other'
  symbol: string
  name: string
  quantity: number
  costBasis: number
  purchaseDate: string
}

Response (201):
{
  success: true
  data: Investment
}
```

**GET /api/investments/:id/history**
```typescript
Query Parameters:
- period: '1d' | '1w' | '1m' | '3m' | '1y' | 'all'

Response (200):
{
  success: true
  data: {
    history: {
      date: string
      value: number
    }[]
  }
}
```

---

### Dashboard Endpoints

**GET /api/dashboard**
```typescript
Response (200):
{
  success: true
  data: {
    netWorth: number
    netWorthChange: {
      amount: number
      percentage: number
      period: string
    }
    allocation: {
      label: string
      value: number
      percentage: number
    }[]
    metrics: {
      totalCash: number
      totalCredit: number
      totalInvestments: number
      totalLoans: number
      totalRealEstate: number
    }
    netWorthHistory: {
      date: string
      value: number
    }[]
  }
}
```

---

### Plaid Endpoints

**POST /api/plaid/link/token**
```typescript
Response (200):
{
  success: true
  data: {
    linkToken: string
  }
}
```

**POST /api/plaid/link/exchange**
```typescript
Request:
{
  publicToken: string
}

Response (200):
{
  success: true
  data: {
    accountId: string
    institutionName: string
  }
}
```

**POST /api/webhooks/plaid**
```typescript
// Plaid webhook handler
Request:
{
  webhook_type: string
  webhook_code: string
  item_id: string
  // ... other Plaid webhook fields
}

Response (200):
{
  received: true
}
```

## Success Criteria

### MVP Success Definition

The MVP is considered successful when a user can:
1. Sign up, log in, and manage their profile
2. Connect bank accounts via Plaid and see transactions automatically
3. Create budget categories, set monthly budgets, and track spending
4. Create transaction categorization rules that work automatically
5. Manually add investments across multiple asset classes
6. View a comprehensive dashboard showing net worth, allocation, and key metrics
7. See real-time stock and crypto prices reflected in portfolio value
8. Link accounts with family members and view combined household finances
9. Deploy the application via Docker Compose on their own infrastructure

### Functional Requirements

**Core Functionality:**
- ✅ User registration and authentication works reliably
- ✅ Plaid integration successfully syncs transactions from major banks
- ✅ Transaction categorization rules apply correctly with priority ordering
- ✅ Budget carry-over logic executes accurately at month boundaries
- ✅ Real-time price updates for stocks and crypto (15-minute refresh during market hours)
- ✅ Net worth calculation accurately aggregates all assets and liabilities
- ✅ Allocation chart reflects current portfolio composition
- ✅ Family account linking works bidirectionally
- ✅ CSV import processes transactions and investments without data loss
- ✅ Manual data entry works for all asset types

**Performance:**
- ✅ Dashboard loads in < 2 seconds on initial page load
- ✅ Transaction list with 1000+ transactions renders in < 1 second
- ✅ Price updates complete for 100 investments in < 30 seconds
- ✅ API endpoints respond in < 500ms for standard queries
- ✅ Background jobs process without blocking UI interactions

**Reliability:**
- ✅ Zero data loss during Plaid syncs
- ✅ Failed background jobs retry with exponential backoff
- ✅ Database transactions ensure consistency for multi-step operations
- ✅ Graceful error handling with user-friendly error messages

**Security:**
- ✅ All API routes require authentication
- ✅ Users cannot access other users' data
- ✅ Plaid tokens encrypted at rest
- ✅ HTTPS enforced in production
- ✅ Rate limiting prevents abuse

**Usability:**
- ✅ Responsive design works on desktop and mobile browsers
- ✅ Intuitive navigation with < 3 clicks to reach any feature
- ✅ Clear visual feedback for user actions (loading states, success/error messages)
- ✅ Consistent UI patterns across the application

**Deployment:**
- ✅ Docker Compose deployment completes in < 10 minutes from clone to running app
- ✅ Environment variables clearly documented
- ✅ Database migrations run automatically on startup
- ✅ Health checks verify all services are running

### Quality Indicators

**Code Quality:**
- TypeScript strict mode enabled with no type errors
- ESLint configured with no errors or warnings
- Unit test coverage > 60% for critical business logic (calculations, rule engine)
- API endpoints have integration tests

**Documentation:**
- README with setup instructions
- Environment variable documentation
- API endpoint documentation
- Docker deployment guide

**User Experience:**
- Users can complete core workflows without consulting documentation
- Error messages are actionable (e.g., "Invalid email format" vs. "Error 400")
- Loading states indicate progress for long-running operations

## Implementation Phases

### Phase 1: Foundation & Core Infrastructure
**Duration:** 2-3 weeks

**Goal:** Establish project structure, database, authentication, and basic UI framework.

**Deliverables:**
- ✅ Next.js 14 project setup with TypeScript, Tailwind, shadcn/ui
- ✅ PostgreSQL database with Prisma schema
- ✅ Redis setup for caching and job queues
- ✅ NextAuth.js email/password authentication
- ✅ User registration and login pages
- ✅ Basic protected dashboard route
- ✅ Docker Compose configuration for local development
- ✅ Database migrations for User, Account, Transaction tables
- ✅ Basic layout and navigation components

**Validation:**
- User can sign up, log in, and access protected dashboard
- Docker Compose spins up all services successfully
- Database schema reflects core data models

---

### Phase 2: Budget & Transaction Management
**Duration:** 3-4 weeks

**Goal:** Implement Plaid integration, transaction management, budget creation, and categorization engine.

**Deliverables:**
- ✅ Plaid Link integration (connect bank accounts)
- ✅ Plaid webhook handler for transaction updates
- ✅ Transaction list UI (table with filters, search)
- ✅ Manual transaction entry form
- ✅ CSV transaction import
- ✅ Budget category CRUD (create, edit, delete categories)
- ✅ Budget allocation UI (set monthly budgets)
- ✅ Transaction categorization rule builder
- ✅ Rule engine implementation with priority ordering
- ✅ Uncategorized transaction queue
- ✅ Budget dashboard (progress bars, spending trends)
- ✅ BullMQ setup for Plaid sync jobs
- ✅ Scheduled job for daily transaction sync

**Validation:**
- User can connect bank via Plaid and see transactions within 1 minute
- Categorization rules correctly auto-categorize new transactions
- Budget dashboard accurately reflects spending vs. budgeted amounts
- CSV import processes 1000+ transactions without errors

---

### Phase 3: Investment Tracking & Market Data
**Duration:** 3-4 weeks

**Goal:** Build investment portfolio management with real-time price updates.

**Deliverables:**
- ✅ Investment account and asset CRUD
- ✅ Support for all asset classes (stocks, crypto, real estate, etc.)
- ✅ Manual investment entry form
- ✅ CSV investment import
- ✅ Yahoo Finance API integration for stock prices
- ✅ CoinGecko API integration for crypto prices
- ✅ Background job for price updates (15-minute intervals)
- ✅ Investment portfolio dashboard
- ✅ Allocation donut chart by asset class
- ✅ Portfolio value over time chart
- ✅ Gains/losses calculation and display
- ✅ Individual investment detail pages
- ✅ Real-time portfolio valuation

**Validation:**
- User can add 50+ investments across multiple asset classes
- Stock prices update automatically every 15 minutes during market hours
- Portfolio value accurately reflects real-time market prices
- Allocation chart correctly shows portfolio distribution
- Historical performance chart displays accurate data

---

### Phase 4: Dashboard, Net Worth & Family Accounts
**Duration:** 2-3 weeks

**Goal:** Complete the dashboard, net worth tracking, asset/liability management, and family linking.

**Deliverables:**
- ✅ Complete dashboard implementation (net worth, metrics, charts)
- ✅ Net worth calculation engine (aggregates all assets/liabilities)
- ✅ Time selector for net worth history (24h, 1w, 1m, 3m, 6m, 1y, all)
- ✅ Asset and liability CRUD (loans, real estate, credit cards, etc.)
- ✅ Liability tracking with payment schedules
- ✅ Family account linking (invitation system)
- ✅ Combined household view for linked accounts
- ✅ Toggle between individual and household views
- ✅ Monthly budget carry-over logic (scheduled job)
- ✅ Responsive design for mobile/tablet
- ✅ Final UI polish and consistency pass

**Validation:**
- Dashboard displays accurate net worth with all data sources
- Net worth history chart shows correct values over all timeframes
- Family account linking works bidirectionally
- Linked users see combined household finances
- Budget carry-over executes correctly at month boundary
- Application is fully responsive on mobile devices

---

### Phase 5: Polish, Testing & Deployment
**Duration:** 1-2 weeks

**Goal:** Production-ready application with documentation and deployment assets.

**Deliverables:**
- ✅ Comprehensive error handling and user-friendly error messages
- ✅ Loading states and optimistic UI updates
- ✅ Rate limiting on API endpoints
- ✅ API input validation with Zod schemas
- ✅ Integration tests for critical workflows
- ✅ Docker Compose production configuration
- ✅ Nginx reverse proxy setup with SSL
- ✅ Environment variable documentation (.env.example)
- ✅ README with setup and deployment instructions
- ✅ Database backup and restore scripts
- ✅ Health check endpoints
- ✅ Logging and monitoring setup

**Validation:**
- All critical user workflows have integration tests passing
- Docker Compose deployment works on fresh Ubuntu/Debian server
- Application passes basic security audit (OWASP top 10 checks)
- Documentation is complete and tested by external reviewer
- Performance benchmarks meet success criteria

## Future Considerations

### Post-MVP Enhancements

**Phase 6: AI-Powered Insights (Q2 2026)**
- Natural language transaction search ("Show me all restaurant spending last month")
- Spending pattern analysis and anomaly detection
- Budget recommendations based on historical trends
- Predictive cash flow forecasting
- Automated transaction categorization using ML (beyond rule engine)
- Financial goal suggestions and tracking

**Phase 7: Advanced Authentication & Security**
- OAuth providers (Google, GitHub, Apple)
- Two-factor authentication (TOTP, SMS)
- Biometric authentication preparation (for mobile apps)
- Session management improvements (timeout, device tracking)
- Security audit logging
- Compliance features (export all data, GDPR-ready)

**Phase 8: Enhanced Reporting & Analytics**
- Custom dashboard builder (drag-and-drop widgets)
- Advanced charts and visualizations
- Tax reporting (capital gains, deductions)
- Net worth projections and scenarios
- Expense reports by time period, category, merchant
- Export to PDF, Excel, CSV

**Phase 9: Mobile Applications**
- React Native mobile apps (iOS, Android)
- Mobile-optimized transaction entry
- Receipt scanning with OCR
- Push notifications for budget alerts
- Biometric authentication (Face ID, Touch ID)
- Offline mode with sync

**Phase 10: SaaS Platform**
- Subscription billing (Stripe integration)
- Multi-tenant architecture
- Admin dashboard for SaaS management
- Usage analytics and insights
- Automated backups and disaster recovery
- 99.9% uptime SLA

### Integration Opportunities

**Financial Institution Integrations:**
- Yodlee as alternative to Plaid
- Direct brokerage integrations (TD Ameritrade, E*TRADE APIs)
- Cryptocurrency exchange APIs (Coinbase, Kraken, Binance)
- Mortgage and loan servicer integrations

**Third-Party Services:**
- Zapier integration for automation
- IFTTT for custom workflows
- Google Sheets export
- Email digests and reports
- Slack/Discord notifications

**Data Import/Export:**
- Mint CSV import compatibility
- Personal Capital export format
- QuickBooks export
- Generic JSON/XML export for API consumers

### Advanced Features for Later Phases

**Investment Features:**
- Dividend tracking and reinvestment
- Options and derivatives support
- Automated portfolio rebalancing suggestions
- Tax-loss harvesting recommendations
- ESG (Environmental, Social, Governance) scoring

**Budget & Spending:**
- Bill payment reminders
- Recurring transaction detection and management
- Shared budgets with multiple users (roommates, teams)
- Savings goals and automatic transfers
- Debt payoff calculators and strategies

**Real Estate:**
- Rental property income/expense tracking
- Mortgage refinance calculator
- Property appreciation tracking
- Zillow integration for automated home value updates

**Collaboration:**
- Financial advisor access (read-only mode)
- Accountant export for tax preparation
- Shared notes and annotations on transactions
- Family member permission levels (view, edit, admin)

## Risks & Mitigations

### Risk 1: Plaid Integration Complexity
**Severity:** High | **Likelihood:** Medium

**Description:** Plaid integration may be more complex than anticipated, with edge cases like bank authentication failures, webhook delays, or incomplete transaction data.

**Impact:**
- Delayed MVP delivery
- Poor user experience with missing transactions
- Increased support burden

**Mitigation Strategies:**
1. Start Plaid integration early in Phase 2 to identify issues quickly
2. Use Plaid's sandbox environment extensively for testing
3. Implement robust error handling and user-friendly error messages
4. Provide manual transaction entry as fallback for Plaid failures
5. Monitor Plaid webhook delivery and implement retry logic
6. Test with multiple banks (Chase, Bank of America, Wells Fargo, etc.)
7. Document known Plaid limitations and communicate to users

---

### Risk 2: Real-Time Price Fetching Rate Limits
**Severity:** Medium | **Likelihood:** High

**Description:** Yahoo Finance (unofficial API) and CoinGecko free tier have rate limits that may be insufficient as user base grows.

**Impact:**
- Price updates fail or are delayed
- User frustration with stale portfolio values
- Potential IP blocking from excessive requests

**Mitigation Strategies:**
1. Implement aggressive caching (Redis) with 15-minute TTL
2. Batch API requests (fetch multiple symbols per request where possible)
3. Use CoinGecko's official API with paid tier for production
4. Consider alternative APIs (Alpha Vantage, Twelve Data) as backups
5. Implement exponential backoff for rate limit errors
6. Allow users to manually trigger price refresh (with cooldown)
7. Monitor API usage and upgrade plans proactively

---

### Risk 3: Data Privacy & Security Concerns
**Severity:** High | **Likelihood:** Low

**Description:** As a financial application, any security breach or data leak would be catastrophic for user trust and potentially expose sensitive financial information.

**Impact:**
- Loss of user trust
- Legal liability
- Reputational damage
- Regulatory scrutiny

**Mitigation Strategies:**
1. Follow OWASP Top 10 security best practices rigorously
2. Encrypt Plaid tokens and sensitive data at rest
3. Implement strict row-level security and authorization checks
4. Conduct security code review before production launch
5. Provide self-hosting option so users control their data
6. Use environment variables for all secrets (never commit to Git)
7. Implement rate limiting and DDoS protection
8. Plan for third-party security audit post-MVP
9. Document security measures transparently in user-facing docs
10. Implement audit logging for sensitive operations (future phase)

---

### Risk 4: Complex Financial Calculations Accuracy
**Severity:** High | **Likelihood:** Medium

**Description:** Financial calculations (net worth, gains/losses, budget carry-over, ROI) must be accurate. Errors in calculations could lead to user distrust or financial mismanagement.

**Impact:**
- Loss of user trust
- Users making financial decisions based on incorrect data
- Support burden for debugging calculation errors

**Mitigation Strategies:**
1. Write comprehensive unit tests for all financial calculation functions
2. Use decimal data types (not floats) for all monetary values
3. Round consistently (e.g., always round to 2 decimal places for currency)
4. Implement calculation auditing (log inputs/outputs for debugging)
5. Cross-reference calculations with established financial libraries
6. Manual testing with known datasets and expected results
7. Beta testing with real users before production launch
8. Provide transparency (show calculation breakdowns to users)

---

### Risk 5: Docker Deployment Complexity for Non-Technical Users
**Severity:** Medium | **Likelihood:** Medium

**Description:** While Docker Compose simplifies deployment, self-hosting still requires technical knowledge (SSH, domain setup, SSL certificates, firewall configuration).

**Impact:**
- Lower adoption for self-hosted version
- Increased support burden for deployment issues
- Poor user experience for non-technical users

**Mitigation Strategies:**
1. Create comprehensive, step-by-step deployment documentation with screenshots
2. Provide video tutorials for deployment process
3. Develop one-click deployment scripts where possible
4. Support common platforms (Ubuntu, Debian, Raspberry Pi)
5. Offer pre-configured DigitalOcean/Linode droplet images
6. Build automated SSL certificate setup (Let's Encrypt)
7. Prioritize SaaS offering for less technical users
8. Create community forums/Discord for peer support
9. Consider managed hosting partnerships (e.g., Umbrel app store)

## Appendix

### Related Documents

- **Technical Architecture Deep Dive** (to be created)
- **API Documentation** (to be generated from OpenAPI spec)
- **User Guide** (to be written post-MVP)
- **Deployment Guide** (to be created in Phase 5)
- **Security Best Practices** (to be documented)

### Key Dependencies

| Dependency | Link | Notes |
|------------|------|-------|
| Next.js Docs | https://nextjs.org/docs | Primary framework documentation |
| Prisma Docs | https://www.prisma.io/docs | ORM and database management |
| Plaid Docs | https://plaid.com/docs | Banking integration |
| BullMQ Docs | https://docs.bullmq.io | Job queue system |
| shadcn/ui | https://ui.shadcn.com | UI component library |
| Yahoo Finance API | Unofficial | Stock price data source |
| CoinGecko API | https://www.coingecko.com/en/api | Crypto price data source |

### Repository Structure

```
wealthvue/
├── .github/
│   └── workflows/         # GitHub Actions CI/CD
├── docker/
│   ├── Dockerfile        # Production Dockerfile
│   ├── Dockerfile.dev    # Development Dockerfile
│   └── docker-compose.yml # Multi-container setup
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── seed.ts          # Database seeding
│   └── migrations/       # Database migrations
├── public/               # Static assets (images, fonts)
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # React components
│   ├── lib/            # Core business logic
│   └── types/          # TypeScript definitions
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── .env.example        # Environment variables template
├── .eslintrc.json     # ESLint configuration
├── .prettierrc        # Prettier configuration
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # Project documentation
```

### Glossary

- **Asset Class:** Category of investments (stocks, bonds, crypto, real estate, etc.)
- **Carry-Over:** Budget feature where unused/overused amounts roll to next month
- **Cost Basis:** Original purchase price of an investment
- **Net Worth:** Total assets minus total liabilities
- **Plaid:** Third-party service for connecting bank accounts
- **Portfolio Allocation:** Distribution of investments across asset classes
- **Rule Engine:** System for auto-categorizing transactions based on conditions
- **Unrealized Gain/Loss:** Profit/loss on investments not yet sold

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-14 | WealthVue Team | Initial PRD based on brainstorming session |

---

**End of Document**

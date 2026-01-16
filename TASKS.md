# WealthVue MVP - Master Task List

**Status Legend:**
- 🔲 Not Started
- 🔄 In Progress
- ✅ Completed
- ⏸️ Blocked
- ⏭️ Deferred

---

## Phase 1: Foundation & Core Infrastructure

**Goal:** Establish project structure, database, authentication, and basic UI framework.
**Duration:** 2-3 weeks

### 1.1 Project Setup & Configuration
- ✅ Initialize Next.js 14 project with TypeScript
- ✅ Configure Tailwind CSS and custom theme
- ✅ Install and configure shadcn/ui
- ✅ Set up ESLint and Prettier
- ✅ Configure Git repository and .gitignore
- ✅ Create .env.example with all required variables
- ✅ Set up project directory structure (src/app, src/components, src/lib)
- ✅ Configure TypeScript strict mode and path aliases
- ✅ Install core dependencies (React Query, Zod, React Hook Form)

### 1.2 Database Setup
- ✅ Install and configure Prisma
- ✅ Create PostgreSQL database schema (all models)
- ✅ Set up database migrations
- ✅ Configure database connection pooling
- ✅ Create seed data for development
- ✅ Set up Prisma Studio for local development
- 🔲 Document database naming conventions

### 1.3 Redis & Job Queue Setup
- ✅ Install and configure Redis client
- ✅ Set up BullMQ for job queues
- ✅ Create job queue configurations
- ✅ Set up Redis connection pooling
- ✅ Configure job retry policies
- ✅ Create job monitoring utilities

### 1.4 Authentication System
- ✅ Install and configure NextAuth.js
- ✅ Create authentication API routes (/api/auth/[...nextauth])
- ✅ Implement credential provider (email/password)
- ✅ Set up password hashing with bcrypt
- ✅ Create session management logic
- ✅ Implement JWT token generation and validation
- ✅ Create middleware for protected routes
- ✅ Build Login page UI
- ✅ Build Signup page UI
- ✅ Implement form validation (Zod schemas)
- ✅ Add error handling for auth failures
- ✅ Test authentication flow end-to-end

### 1.5 Base Layout & Navigation
- ✅ Create root layout component
- ✅ Build navigation sidebar/header
- ✅ Create protected layout wrapper
- ✅ Implement responsive navigation (mobile/desktop)
- ✅ Create user profile dropdown menu
- ✅ Build logout functionality
- ✅ Add loading states for navigation

### 1.6 Docker Configuration
- ✅ Create Dockerfile for Next.js app
- ✅ Create docker-compose.yml (app, postgres, redis)
- ✅ Configure volume mounts for persistence
- ✅ Set up networking between containers
- ✅ Create docker-compose.dev.yml for development
- ✅ Add health checks for all services
- ✅ Test local Docker deployment
- 🔲 Document Docker setup in README

### 1.7 Basic Dashboard Page
- ✅ Create /dashboard route
- ✅ Build empty dashboard layout
- ✅ Add placeholder cards for metrics
- ✅ Test protected route access
- ✅ Verify authentication redirects work

### 1.8 Testing & Documentation
- 🔲 Set up testing framework (Jest, React Testing Library)
- 🔲 Write unit tests for auth utilities
- ✅ Create README with setup instructions
- ✅ Document environment variables
- 🔲 Create CONTRIBUTING.md guidelines

**Phase 1 Progress:** 51/68 tasks completed (75%)

---

## Phase 2: Budget & Transaction Management

**Goal:** Implement Plaid integration, transaction management, budget creation, and categorization engine.
**Duration:** 3-4 weeks
**Status:** 🔄 In Progress

### 2.1 Plaid Integration Setup
- ✅ Create Plaid developer account and get API keys
- ✅ Install Plaid client library
- ✅ Create Plaid configuration module
- ✅ Implement Plaid Link Token generation (POST /api/plaid/create-link-token)
- ✅ Implement public token exchange (POST /api/plaid/exchange-public-token)
- ✅ Store encrypted Plaid access tokens in database
- ✅ Create Account model in Prisma schema
- ✅ Build Plaid Link UI component
- ✅ Create account connection page
- ✅ Test Plaid Link flow with sandbox banks

### 2.2 Transaction Management
- ✅ Implement initial transaction fetch from Plaid
- ✅ Create transaction storage logic
- ✅ Build Plaid webhook endpoint (POST /api/webhooks/plaid)
- ✅ Create transaction list page (/transactions)
- ✅ Build transaction table component with sorting
- ✅ Add transaction filters (date range, category, account)
- ✅ Build search functionality
- ✅ Create manual transaction entry form
- ✅ Implement CSV import

### 2.3 Budget & Categorization
- ✅ Create budget category management UI
- ✅ Build budget allocation form
- ✅ Implement categorization rule builder
- ✅ Create rule engine for auto-categorization
- ✅ Build budget dashboard
- ✅ Implement carry-over logic

---

## Phase 3: Investment Tracking & Market Data

**Goal:** Build investment portfolio management with real-time price updates.
**Duration:** 3-4 weeks
**Status:** ✅ Completed

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

---

## Phase 4: Dashboard, Net Worth & Family Accounts

**Goal:** Complete the dashboard, net worth tracking, asset/liability management, and family linking.
**Duration:** 2-3 weeks
**Status:** ✅ Completed

### Sprint 1: Dashboard Implementation ✅
- ✅ Net worth calculation engine (backend service complete)
- ✅ Net worth snapshot job (timezone-aware hourly trigger)
- ✅ User timezone preference in Settings
- ✅ API endpoints for net worth data (/api/net-worth, /api/net-worth/history)
- ✅ Dashboard page with real data (replaced placeholders)
- ✅ Time selector component (24h, 1w, 1m, 3m, 6m, 1y, all)
- ✅ Net worth area chart with historical data
- ✅ Asset allocation donut chart
- ✅ Metric cards (cash, credit, investments, real estate)
- ✅ Test dashboard on live development server
- ✅ Verify mobile/tablet responsive design

### Sprint 2: Asset & Liability Management (Complete)
- ✅ Asset CRUD API endpoints (POST, GET, PATCH, DELETE)
- ✅ Liability CRUD API endpoints
- ✅ Asset management UI (loans, real estate, vehicles, etc.)
- ✅ Liability tracking with payment schedules
- ✅ Integrate into Settings page

### Sprint 3: Polish & Family Linking ✅
- ✅ Family account linking (invitation system)
- ✅ Combined household view for linked accounts
- ✅ Toggle between individual and household views
- ✅ Monthly budget carry-over logic (scheduled job)
- ✅ Final UI polish and consistency pass

---

## Phase 5: Polish, Testing & Deployment

**Goal:** Production-ready application with documentation and deployment assets.
**Duration:** 1-2 weeks
**Status:** 🔄 In Progress

- 🔄 Comprehensive error handling and user-friendly error messages
- ✅ Loading states and optimistic UI updates
- 🔲 Rate limiting on API endpoints
- ✅ API input validation with Zod schemas
- 🔲 Integration tests for critical workflows
- 🔲 Docker Compose production configuration
- 🔲 Nginx reverse proxy setup with SSL
- ✅ Environment variable documentation (.env.example)
- ✅ README with setup and deployment instructions
- ✅ Systemd service configuration (App + Worker)
- ✅ Deployment automation script (`setup-services.sh`)
- ✅ Application update script (`update-app.sh`)
- 🔲 Database backup and restore scripts
- ✅ Health check endpoints
- 🔲 Logging and monitoring setup

**Phase 5 Progress: 7/14 tasks completed (50%)**

---

## Odds and Ends
- ✅ Plaid link modal non-responsive
- ✅ Improve CSV transaction import
- ✅ Implement branding
- ✅ Implement budget dashboard overview (summary cards, spending chart, category list)
- ✅ Implement theme system (Light/Dark/Pink with OKLch colors)
- ✅ Implement manual account creation
- ✅ Implement category editing on transaction list
- ✅ Implement premium glassmorphism UI with deep floating shadows and performance-based glows
- 🔲 Add duplicate account detection
- ✅ Add automatic transfer detection for credit cards, loans, account transfers, etc
- ✅ Identify account creation workflow
- ✅ Implement month navigation selector for budget overview
- ✅ Implement robust multi-criteria transaction filtering (Popover, multi-tab, search chips, uncategorized filter)
- ✅ Implement dynamic transaction summary cards (Income/Expense/Count)

## Bugs

- ✅ Fix transaction sign inversion for Plaid imports
- ✅ Fix budget dashboard including transfers in "Income" and "Spent" totals
- ✅ Fix Plaid modal focus/accessibility issues
- ✅ Fix budget total spent calculation incorrectly including categorized income
- ✅ Fix `useSearchParams` Suspense error in `/budget` page
- ✅ Fix `Suspense` error in `/investments` page (aborted requests)
- ✅ Fix inflated investment value on dashboard (NetWorthService logic)
- ✅ Fix Net Worth Chart display (colors) and scaling (dynamic Y-axis, live data point)
- ✅ Improve mobile responsiveness: reclaim container space and optimize chart headers
- ✅ Optimize chart Y-axis scaling for high-precision ranges (e.g. $66.2k)

## Quick Commands

```bash
# Development
npm run dev              # Start development server
npm run db:studio        # Open Prisma Studio (database GUI)
npm run db:migrate       # Run database migrations
npm run db:seed          # Seed database with test data

# Docker
docker compose up -d     # Start PostgreSQL and Redis
docker compose down      # Stop all containers
docker compose ps        # Check container status
docker compose logs -f   # View logs

# Testing
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript checks
npm run format          # Format code with Prettier
```

---

## Test Credentials

**Email:** test@wealthvue.com  
**Password:** password123

---

**Last Updated:** 2026-01-16 (Timezone-Aware Net Worth Snapshots)

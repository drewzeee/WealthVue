# WealthVue - Technical Architecture

**Version:** 1.0
**Last Updated:** 2026-01-14

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Diagrams](#architecture-diagrams)
3. [Technology Stack](#technology-stack)
4. [Application Layers](#application-layers)
5. [Data Flow](#data-flow)
6. [Background Jobs & Scheduling](#background-jobs--scheduling)
7. [Caching Strategy](#caching-strategy)
8. [Security Architecture](#security-architecture)
9. [Deployment Architecture](#deployment-architecture)
10. [Scalability Considerations](#scalability-considerations)
11. [API Design Principles](#api-design-principles)

---

## System Overview

WealthVue is a full-stack financial management application built with Next.js 14, leveraging the App Router for modern React server components. The architecture follows a monolithic approach with the frontend and backend API routes within a single Next.js application, using BullMQ for background job processing.

**Key Architectural Decisions:**

1. **Monolithic Next.js App:** Simplifies development and deployment for MVP; can be split later if needed
2. **PostgreSQL for Data:** ACID compliance critical for financial data integrity
3. **Redis for Caching & Jobs:** Fast key-value store for price caching and job queue
4. **BullMQ for Background Processing:** Reliable job queue for Plaid sync, price updates, scheduled tasks
5. **Docker Compose for Deployment:** Self-hosting via containers with orchestration

---

## Architecture Diagrams

### High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         User Browser                            │
└───────────────────────────┬────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                      Nginx (Reverse Proxy)                      │
│                    - SSL Termination                            │
│                    - Static File Serving                        │
└───────────────────────────┬────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────────┐
│                     Next.js Application                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Frontend (React Components)                 │  │
│  │  - Server Components (default)                          │  │
│  │  - Client Components (interactive UI)                   │  │
│  │  - React Query for data fetching                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   API Routes (/api/*)                    │  │
│  │  - Authentication                                        │  │
│  │  - Transaction CRUD                                      │  │
│  │  - Budget Management                                     │  │
│  │  - Investment Tracking                                   │  │
│  │  - Dashboard Aggregation                                 │  │
│  │  - Plaid Integration                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Business Logic Layer                       │  │
│  │  - Services (calculations, integrations)                │  │
│  │  - Repositories (data access)                           │  │
│  │  - Utilities                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               BullMQ Workers (Background)                │  │
│  │  - Plaid Transaction Sync                               │  │
│  │  - Price Update Jobs                                    │  │
│  │  - Budget Reset Jobs                                    │  │
│  │  - Webhook Processing                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────┬──────────────────────┘
             │                            │
             ▼                            ▼
┌─────────────────────┐        ┌─────────────────────┐
│    PostgreSQL       │        │       Redis         │
│    - User Data      │        │  - Job Queue        │
│    - Transactions   │        │  - Price Cache      │
│    - Investments    │        │  - Session Store    │
│    - Budgets        │        │                     │
└─────────────────────┘        └─────────────────────┘
             │
             │ Scheduled Queries
             ▼
┌─────────────────────────────────────────┐
│        External APIs                    │
│  - Plaid (Banking)                     │
│  - Yahoo Finance (Stock Prices)        │
│  - CoinGecko (Crypto Prices)           │
└─────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2+ | React framework with App Router, SSR, API routes |
| **React** | 18.3+ | UI component library |
| **TypeScript** | 5.4+ | Type safety across frontend and backend |
| **Tailwind CSS** | 3.4+ | Utility-first CSS for styling |
| **shadcn/ui** | Latest | Pre-built accessible UI components |
| **Recharts** | 2.12+ | Data visualization library |
| **React Query** | 5.0+ | Server state management, caching, refetching |
| **React Hook Form** | 7.51+ | Performant form management |
| **Zod** | 3.22+ | Schema validation (shared with backend) |

### Backend Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 14.2+ | RESTful API endpoints |
| **NextAuth.js** | 4.24+ | Authentication (session management) |
| **Prisma** | 5.12+ | ORM for type-safe database access |
| **BullMQ** | 5.4+ | Job queue for background processing |
| **node-cron** | 3.0+ | Scheduled task execution |
| **bcrypt** | 5.1+ | Password hashing |

### Data Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | 16+ | Primary relational database |
| **Redis** | 7.2+ | Caching and job queue storage |

### External Services

| Service | Purpose | Rate Limits |
|---------|---------|-------------|
| **Plaid** | Bank account and transaction syncing | Varies by plan |
| **Yahoo Finance** | Stock/ETF real-time prices | Unofficial, rate limits vary |
| **CoinGecko** | Cryptocurrency prices | Free: 10-50 calls/min |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Application containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Reverse proxy, SSL termination |
| **Let's Encrypt** | Free SSL certificates |

---

## Application Layers

### 1. Presentation Layer (Frontend)

**Location:** `src/app/`, `src/components/`

**Responsibilities:**
- Render UI components
- Handle user interactions
- Client-side validation
- Optimistic UI updates
- Data fetching via React Query

**Key Patterns:**
- **Server Components by Default:** Leverage Next.js 14 server components for data fetching
- **Client Components for Interactivity:** Use `'use client'` directive only when needed
- **Atomic Design:** atoms → molecules → organisms → pages
- **Composition:** Prefer component composition over prop drilling

**Example Structure:**
```typescript
// Server Component (default)
export default async function DashboardPage() {
  const data = await fetchDashboardData() // Direct DB query
  return <DashboardView data={data} />
}

// Client Component (interactive)
'use client'
export function TransactionList() {
  const { data } = useQuery({ queryKey: ['transactions'], queryFn: fetchTransactions })
  // ...
}
```

---

### 2. API Layer

**Location:** `src/app/api/`

**Responsibilities:**
- Handle HTTP requests
- Authenticate and authorize users
- Validate input data
- Call business logic services
- Return standardized responses
- Error handling

**API Route Structure:**
```
src/app/api/
├── auth/
│   └── [...nextauth]/route.ts
├── transactions/
│   ├── route.ts              # GET (list), POST (create)
│   └── [id]/route.ts         # GET, PATCH, DELETE
├── budgets/
│   ├── route.ts
│   └── categories/
│       ├── route.ts
│       └── [id]/route.ts
├── investments/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── accounts/route.ts
├── assets/route.ts
├── liabilities/route.ts
├── dashboard/route.ts
├── plaid/
│   ├── link/
│   │   ├── token/route.ts
│   │   └── exchange/route.ts
│   └── sync/route.ts
└── webhooks/
    └── plaid/route.ts
```

**Standard Response Format:**
```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: {
    message: "User-friendly error message",
    code: "ERROR_CODE",
    details?: { ... }
  }
}
```

---

### 3. Business Logic Layer

**Location:** `src/lib/`

**Responsibilities:**
- Core business logic and calculations
- Data transformation
- External API integration
- Rule evaluation (transaction categorization)
- Financial calculations (net worth, ROI, etc.)

**Structure:**
```
src/lib/
├── auth/
│   ├── session.ts           # Session management
│   └── password.ts          # Password hashing/validation
├── db/
│   ├── client.ts            # Prisma client singleton
│   └── repositories/        # Data access layer
│       ├── transactions.ts
│       ├── budgets.ts
│       └── investments.ts
├── services/
│   ├── transaction-categorization.ts
│   ├── net-worth-calculator.ts
│   ├── budget-carry-over.ts
│   └── portfolio-calculator.ts
├── integrations/
│   ├── plaid.ts             # Plaid client wrapper
│   ├── yahoo-finance.ts     # Stock price fetching
│   └── coingecko.ts         # Crypto price fetching
├── jobs/
│   ├── queue.ts             # BullMQ queue setup
│   ├── plaid-sync.ts        # Plaid sync job
│   ├── price-update.ts      # Price update job
│   └── budget-reset.ts      # Monthly budget reset
├── utils/
│   ├── currency.ts          # Currency formatting
│   ├── date.ts              # Date utilities
│   └── validation.ts        # Shared validators
└── types/
    └── index.ts             # Shared TypeScript types
```

**Repository Pattern Example:**
```typescript
// src/lib/db/repositories/transactions.ts
export class TransactionRepository {
  async findByUserId(userId: string, filters?: TransactionFilters) {
    return prisma.transaction.findMany({
      where: {
        account: { userId },
        ...buildWhereClause(filters)
      },
      include: { category: true, account: true },
      orderBy: { date: 'desc' }
    })
  }

  async create(data: CreateTransactionInput) {
    return prisma.transaction.create({ data })
  }

  // ... other methods
}
```

---

### 4. Data Access Layer

**Location:** `src/lib/db/`, `prisma/`

**Responsibilities:**
- Database schema definition
- Database migrations
- Type-safe query building (Prisma)
- Connection pooling

**Prisma Client Usage:**
```typescript
// src/lib/db/client.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Data Flow

### Example: User Views Dashboard

```
1. User navigates to /dashboard
   │
   ▼
2. Next.js Server Component renders
   │
   ▼
3. Server fetches data directly (no API call needed)
   - Query database via Prisma
   - Aggregate net worth, transactions, investments
   │
   ▼
4. Data passed to client components as props
   │
   ▼
5. Client components render charts/cards
   │
   ▼
6. User sees dashboard
```

### Example: User Creates Transaction

```
1. User fills form and clicks "Save"
   │
   ▼
2. Client-side validation (React Hook Form + Zod)
   │
   ▼
3. Optimistic UI update (React Query)
   │
   ▼
4. POST /api/transactions
   │
   ▼
5. API Route:
   - Authenticate user (middleware)
   - Validate input (Zod)
   - Call TransactionRepository.create()
   │
   ▼
6. Repository:
   - Insert into PostgreSQL via Prisma
   - Return created transaction
   │
   ▼
7. API Route returns success response
   │
   ▼
8. Client updates UI (React Query invalidates cache)
   │
   ▼
9. Background: Categorization rule engine runs
   │
   ▼
10. Transaction categorized if rules match
```

### Example: Plaid Webhook Processing

```
1. Plaid sends webhook to /api/webhooks/plaid
   │
   ▼
2. API Route verifies webhook signature
   │
   ▼
3. Parse webhook payload
   │
   ▼
4. Add job to BullMQ queue: "plaid-sync"
   │
   ▼
5. Return 200 OK immediately (async processing)
   │
   ▼
6. BullMQ Worker picks up job:
   - Fetch new transactions from Plaid
   - Apply categorization rules
   - Insert into database
   - Log completion
   │
   ▼
7. User sees new transactions on next page load/refetch
```

---

## Background Jobs & Scheduling

### BullMQ Architecture

```
┌─────────────────────────────────────────────────┐
│             Application Process                  │
│  ┌───────────────────────────────────────────┐  │
│  │         API Routes (Job Producers)        │  │
│  │  - Add jobs to queue                      │  │
│  │  - Example: plaidSyncQueue.add(...)       │  │
│  └───────────────────────────────────────────┘  │
│                      │                           │
│                      ▼                           │
│  ┌───────────────────────────────────────────┐  │
│  │         BullMQ Workers (Consumers)        │  │
│  │  - Process jobs from queue                │  │
│  │  - Run in same process as Next.js        │  │
│  │  - Example: plaidSyncWorker.on('job')    │  │
│  └───────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │    Redis (Job Storage)  │
         │  - Job queue data       │
         │  - Job status tracking  │
         └─────────────────────────┘
```

### Job Types

| Job Name | Trigger | Frequency | Purpose |
|----------|---------|-----------|---------|
| **plaid-sync** | Webhook or scheduled | Daily at 3am | Fetch new transactions from Plaid |
| **price-update** | Scheduled | Every 15 min | Update stock/crypto prices |
| **budget-reset** | Scheduled | Monthly (1st, 12:01am) | Reset budgets, apply carry-over |
| **net-worth-snapshot** | Scheduled | Daily at midnight | Record daily net worth for history |

### Job Configuration Example

```typescript
// src/lib/jobs/price-update.ts
import { Queue, Worker } from 'bullmq'
import { updateStockPrices } from '@/lib/integrations/yahoo-finance'
import { updateCryptoPrices } from '@/lib/integrations/coingecko'

export const priceUpdateQueue = new Queue('price-update', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  }
})

export const priceUpdateWorker = new Worker('price-update', async (job) => {
  const { investments } = job.data

  await updateStockPrices(investments.filter(i => i.assetClass === 'stock'))
  await updateCryptoPrices(investments.filter(i => i.assetClass === 'crypto'))

  return { updatedCount: investments.length }
}, { connection: redisConnection })

// Schedule job every 15 minutes
priceUpdateQueue.add('update-all-prices', {}, {
  repeat: { pattern: '*/15 * * * *' } // cron format
})
```

### node-cron for Scheduled Tasks

For tasks that trigger jobs (rather than directly doing work):

```typescript
// src/lib/jobs/scheduler.ts
import cron from 'node-cron'
import { priceUpdateQueue } from './price-update'
import { budgetResetQueue } from './budget-reset'

export function initScheduledJobs() {
  // Every 15 minutes: trigger price updates
  cron.schedule('*/15 * * * *', async () => {
    await priceUpdateQueue.add('scheduled-price-update', {})
  })

  // Monthly on 1st at 12:01am: trigger budget reset
  cron.schedule('1 0 1 * *', async () => {
    await budgetResetQueue.add('monthly-reset', {})
  })

  // Daily at midnight: net worth snapshot
  cron.schedule('0 0 * * *', async () => {
    await netWorthSnapshotQueue.add('daily-snapshot', {})
  })
}
```

---

## Caching Strategy

### Cache Layers

1. **React Query (Client-Side)**
   - Cache API responses
   - Stale-while-revalidate pattern
   - Automatic background refetching

2. **Redis (Server-Side)**
   - Cache price data (15-min TTL)
   - Cache aggregated dashboard data (5-min TTL)
   - Store job queue data

### Redis Cache Keys

```
price:stock:{symbol}          # TTL: 15 minutes
price:crypto:{symbol}         # TTL: 15 minutes
dashboard:{userId}            # TTL: 5 minutes
net-worth:{userId}:{date}     # TTL: 1 day
```

### Cache Invalidation

- **Price updates:** Automatic expiration via TTL
- **User data changes:** Invalidate on mutation (React Query)
- **Dashboard:** Short TTL + manual invalidation on data changes

---

## Security Architecture

### Authentication Flow

```
1. User submits email/password
   │
   ▼
2. NextAuth credential provider validates
   │
   ▼
3. Compare password hash (bcrypt)
   │
   ▼
4. If valid: Generate JWT token
   │
   ▼
5. Store session in HTTP-only cookie
   │
   ▼
6. Return session to client
```

### Authorization Middleware

```typescript
// src/middleware.ts
import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/budget/:path*', '/investments/:path*']
}
```

### Row-Level Security

Every database query includes user context:

```typescript
// Bad: Can access any user's data
const transactions = await prisma.transaction.findMany()

// Good: Only user's own data
const transactions = await prisma.transaction.findMany({
  where: {
    account: { userId: session.user.id }
  }
})
```

### API Security Checklist

- ✅ Authentication required for all protected routes
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma parameterized queries)
- ✅ XSS protection (React auto-escaping)
- ✅ CSRF protection (NextAuth built-in)
- ✅ Rate limiting (API middleware)
- ✅ HTTPS enforcement (Nginx)
- ✅ Secure headers (CSP, X-Frame-Options)
- ✅ Encrypted Plaid tokens at rest

---

## Deployment Architecture

### Docker Compose Stack

```yaml
services:
  nextjs:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/wealthvue
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=wealthvue
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - nextjs
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Production Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

---

## Scalability Considerations

### Current Architecture (MVP)

- **Single Next.js container:** Handles 10-100 concurrent users
- **PostgreSQL:** Single instance with read replicas if needed
- **Redis:** Single instance with AOF persistence
- **Background jobs:** Run in-process with Next.js

### Future Scaling Paths

**1. Horizontal Scaling (Load Balancing)**
```
User → Load Balancer → Multiple Next.js Containers
                    ↓
                  PostgreSQL (Primary + Read Replicas)
                  Redis Cluster
```

**2. Separate Backend Workers**
```
Next.js App (Frontend + API)
      ↓
BullMQ Jobs → Separate Worker Containers
```

**3. Database Optimization**
- Connection pooling (PgBouncer)
- Read replicas for analytics queries
- Partitioning large tables (transactions)

**4. CDN for Static Assets**
- Cloudflare or CloudFront for Next.js static files
- Reduce load on application servers

---

## API Design Principles

### RESTful Conventions

- **GET** `/api/resources` - List all (with pagination)
- **POST** `/api/resources` - Create new
- **GET** `/api/resources/:id` - Get single
- **PATCH** `/api/resources/:id` - Update partial
- **DELETE** `/api/resources/:id` - Delete

### Pagination

```typescript
// Request
GET /api/transactions?limit=50&offset=0

// Response
{
  success: true,
  data: {
    transactions: [...],
    total: 523,
    hasMore: true
  }
}
```

### Filtering & Sorting

```typescript
// Request
GET /api/transactions?categoryId=123&startDate=2024-01-01&sortBy=date&order=desc

// Response
{
  success: true,
  data: {
    transactions: [...]
  }
}
```

### Error Responses

```typescript
// 400 Bad Request
{
  success: false,
  error: {
    message: "Invalid input",
    code: "VALIDATION_ERROR",
    details: {
      field: "amount",
      issue: "Must be a positive number"
    }
  }
}

// 401 Unauthorized
{
  success: false,
  error: {
    message: "Unauthorized",
    code: "AUTH_REQUIRED"
  }
}

// 403 Forbidden
{
  success: false,
  error: {
    message: "Access denied",
    code: "FORBIDDEN"
  }
}

// 404 Not Found
{
  success: false,
  error: {
    message: "Transaction not found",
    code: "NOT_FOUND"
  }
}

// 500 Internal Server Error
{
  success: false,
  error: {
    message: "An unexpected error occurred",
    code: "INTERNAL_ERROR"
  }
}
```

---

## Conclusion

This architecture provides a solid foundation for the WealthVue MVP with clear separation of concerns, scalability paths, and security best practices. The monolithic Next.js approach simplifies development while maintaining flexibility to evolve the architecture as the application grows.

**Next Steps:**
1. Implement core infrastructure (Phase 1)
2. Build out feature modules following this architecture
3. Monitor performance and optimize as needed
4. Refactor to microservices if scale demands it

---

**Document Ownership:** Engineering Team
**Review Schedule:** Quarterly or as needed for major architectural changes

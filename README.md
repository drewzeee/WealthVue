# WealthVue

A comprehensive personal financial dashboard that unifies budget management, investment tracking, and asset overview in a single, intuitive application.

## Features

- **Budget Management**: Create custom categories, set monthly budgets, and track spending
- **Transaction Sync**: Automatic bank account syncing via Plaid + manual entry + CSV import
- **Investment Tracking**: Multi-asset class support (stocks, crypto, real estate, metals, commodities) with real-time pricing
- **Net Worth Dashboard**: Complete financial overview with allocation charts and key metrics
- **Family Accounts**: Link accounts with family members for household finance management
- **Self-Hosted**: Run on your own infrastructure via Docker Compose

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, NextAuth.js, Prisma ORM
- **Database**: PostgreSQL 16+
- **Cache/Jobs**: Redis 7+, BullMQ
- **External APIs**: Plaid, Yahoo Finance, CoinGecko

## Project Status

✅ **Phase 4: Dashboard, Net Worth & Family Accounts** - Complete

See [TASKS.md](./TASKS.md) for detailed task breakdown and progress.

## Prerequisites

- Node.js 20+ and pnpm
- Docker and Docker Compose (for local database)
- PostgreSQL 16+
- Redis 7+

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for local)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `PLAID_CLIENT_ID`: Plaid API client ID
- `PLAID_SECRET`: Plaid API secret
- `PLAID_ENV`: Plaid environment (sandbox/development/production)

### 3. Set Up Database

Run database migrations:

```bash
npx prisma migrate dev
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
wealthvue/
├── .agents/plans/       # Feature implementation plans
├── reference/           # Technical documentation
├── src/
│   ├── app/            # Next.js App Router (pages, layouts, API routes)
│   ├── components/     # React components
│   │   └── ui/         # shadcn/ui components
│   ├── lib/            # Business logic and utilities
│   │   ├── auth/       # Authentication logic
│   │   ├── db/         # Database client and repositories
│   │   ├── jobs/       # Background jobs (BullMQ)
│   │   ├── services/   # Business logic services
│   │   ├── integrations/ # External API clients
│   │   └── utils/      # Helper functions
│   └── types/          # TypeScript type definitions
├── prisma/             # Database schema and migrations
├── docker/             # Docker configuration
├── PRD.md              # Product Requirements Document
├── TASKS.md            # Master task checklist
└── CLAUDE.md           # AI assistant instructions
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Run TypeScript type checking
```

## Prisma Commands

```bash
npx prisma studio          # Open Prisma Studio (database GUI)
npx prisma generate        # Generate Prisma Client
npx prisma migrate dev     # Create and apply migrations (dev)
npx prisma migrate deploy  # Apply migrations (production)
```

## Documentation

- [PRD.md](./PRD.md) - Complete product requirements
- [TASKS.md](./TASKS.md) - Task breakdown for all MVP phases
- [reference/technical-architecture.md](./reference/technical-architecture.md) - System architecture
- [reference/database-schema.md](./reference/database-schema.md) - Database design
- [CLAUDE.md](./CLAUDE.md) / [GEMINI.md](./GEMINI.md) - AI assistant workflows

## Development Workflow

1. Review [TASKS.md](./TASKS.md) for upcoming tasks
2. Create feature plan in `.agents/plans/` (for complex features)
3. Implement feature following architecture patterns
4. Update [TASKS.md](./TASKS.md) as tasks complete
5. Run tests and ensure type safety

## Production Deployment (Systemd)

For running WealthVue on a Linux server without Docker, you can use systemd to manage the application and worker processes.

### Setup

Run the automated setup script to build the app, run migrations, and install the services:

```bash
sudo ./scripts/setup-services.sh
```

### Management

```bash
# Update the application
sudo ./scripts/update-app.sh

# Check status
systemctl status wealthvue
systemctl status wealthvue-worker

# View logs
journalctl -u wealthvue -f
journalctl -u wealthvue-worker -f

# Restart services
sudo systemctl restart wealthvue wealthvue-worker
```

## Docker Deployment

## Contributing

This is a personal project, but suggestions and feedback are welcome via GitHub issues.

## License

Private project - All rights reserved

---

**Current Phase**: Polish, Testing & Deployment (Phase 5)
**Next Phase**: Production Release

See [TASKS.md](./TASKS.md) for detailed progress tracking.

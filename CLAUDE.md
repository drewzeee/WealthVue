# WealthVue - Claude Instructions

## Project Overview

WealthVue is a comprehensive personal financial dashboard that unifies budget management, investment tracking, and asset overview in a single, intuitive application. This document provides instructions for Claude on how to work effectively on this project.

---

## Project Structure

```
wealthvue/
├── .agents/
│   └── plans/              # Detailed feature implementation plans
├── reference/              # Technical documentation
│   ├── technical-architecture.md
│   └── database-schema.md
├── src/                    # Application source code
│   ├── app/               # Next.js 14 App Router
│   ├── components/        # React components
│   ├── lib/              # Business logic, services, utilities
│   └── types/            # TypeScript type definitions
├── prisma/                # Database schema and migrations
├── docker/                # Docker configuration
├── PRD.md                 # Product Requirements Document
├── TASKS.md              # Master task checklist for MVP
├── CLAUDE.md             # This file - Instructions for Claude
└── GEMINI.md             # Instructions for Gemini
```

---

## Development Workflow

### 1. Understanding the Project

**Read these documents first:**
- `PRD.md` - Comprehensive product requirements
- `TASKS.md` - Master task checklist for all MVP phases
- `reference/technical-architecture.md` - System architecture
- `reference/database-schema.md` - Database design

### 2. Working on Features

**Step-by-step process:**

#### A. Identify Feature from Task List
1. Open `TASKS.md`
2. Find the feature you're working on (or user requested)
3. Note all related tasks and dependencies

#### B. Create Detailed Feature Plan
1. **Before implementing**, create a detailed plan in `.agents/plans/`
2. **Naming convention:** `feature-name.md` (e.g., `plaid-integration.md`, `transaction-categorization.md`)
3. **Plan should include:**
   - Feature overview and goals
   - Data model changes (if any)
   - API endpoint specifications
   - UI component breakdown
   - Implementation steps (numbered, specific)
   - Testing requirements
   - Potential challenges and solutions

#### C. Get Plan Reviewed (if applicable)
- User may review the plan before implementation
- Make adjustments based on feedback

#### D. Implement Feature
1. Follow the plan step-by-step
2. Reference `reference/` docs for architecture patterns
3. Update `TASKS.md` as you complete tasks (change 🔲 to ✅)
4. Write tests as you go

#### E. Update Documentation
- Update relevant docs if you make architectural changes
- Keep `TASKS.md` current

---

## File Organization Rules

### Feature Plans (`.agents/plans/`)

**Purpose:** Detailed implementation plans for complex features

**When to create:**
- Any feature with 5+ tasks
- Features requiring database changes
- Features with complex business logic
- Features with API integrations

**Template structure:**
```markdown
# Feature Name

## Overview
Brief description

## Goals
- Goal 1
- Goal 2

## Data Model Changes
Prisma schema modifications

## API Endpoints
Detailed endpoint specs

## UI Components
Component breakdown

## Implementation Steps
1. Step 1
2. Step 2

## Testing Plan
What to test

## Potential Challenges
Known issues and solutions
```

**Examples:**
- `.agents/plans/plaid-integration.md`
- `.agents/plans/transaction-categorization-engine.md`
- `.agents/plans/budget-carry-over-logic.md`

---

### Reference Documentation (`reference/`)

**Purpose:** Technical documentation that spans the entire system

**What goes here:**
- Architecture diagrams and decisions
- Database schema documentation
- API design standards
- Security guidelines
- Deployment procedures
- Performance optimization guides

**Current files:**
- `technical-architecture.md` - System architecture
- `database-schema.md` - Database design

**Future files:**
- `api-documentation.md` - Complete API reference
- `security-guidelines.md` - Security best practices
- `deployment-guide.md` - Production deployment
- `performance-optimization.md` - Performance tips

---

## Task Management

### Using TASKS.md

`TASKS.md` is the **master checklist** for the entire MVP. Use it to:

1. **Track progress:** Update status symbols as you work
   - 🔲 Not Started
   - 🔄 In Progress
   - ✅ Completed
   - ⏸️ Blocked
   - ⏭️ Deferred

2. **Understand dependencies:** See what must be done before/after
3. **Plan work:** Break down phases into manageable chunks
4. **Report progress:** User can see what's done at a glance

**Important:** Keep TASKS.md updated in real-time as you complete work.

---

## Coding Standards

### TypeScript

- **Strict mode enabled** - No `any` types without justification
- **Use Zod for validation** - All API inputs and forms
- **Shared types** - Define in `src/types/index.ts`

### Next.js Patterns

- **Server Components by default** - Use `'use client'` only when needed
- **API Routes** - Follow RESTful conventions
- **File-based routing** - Leverage App Router

### Database

- **Prisma ORM** - All database access through Prisma
- **Decimal for money** - Never use `number` for currency
- **Row-level security** - Always filter by `userId`

### Error Handling

- **Consistent format:**
  ```typescript
  {
    success: false,
    error: {
      message: "User-friendly message",
      code: "ERROR_CODE"
    }
  }
  ```

### Security

- **Authenticate all protected routes**
- **Validate all inputs**
- **Never expose sensitive data**
- **Encrypt Plaid tokens**

---

## Common Commands

### Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Run Prisma Studio
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Run tests
pnpm test

# Lint
pnpm lint

# Format
pnpm format
```

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build
```

---

## When Working on Tasks

### Before Starting

1. ✅ Read `PRD.md` to understand the feature's purpose
2. ✅ Check `TASKS.md` for related tasks and dependencies
3. ✅ Review `reference/` docs for relevant architecture
4. ✅ Create feature plan in `.agents/plans/` if needed

### During Implementation

1. ✅ Follow the feature plan
2. ✅ Reference architecture docs for patterns
3. ✅ Update `TASKS.md` as you complete tasks
4. ✅ Write tests alongside code
5. ✅ Keep code organized per project structure

### After Completion

1. ✅ Mark all related tasks as complete in `TASKS.md`
2. ✅ Update documentation if architecture changed
3. ✅ Run tests to ensure nothing broke
4. ✅ Review code for security and performance

---

## Questions & Clarifications

If you need clarification:

1. **Check existing docs first:**
   - PRD.md for requirements
   - TASKS.md for task details
   - reference/ for technical guidance

2. **Ask the user:**
   - About business requirements
   - About design preferences
   - About prioritization

3. **Make reasonable assumptions:**
   - Document your assumptions
   - Proceed with best practices
   - Note in comments for review

---

## Best Practices

### Do's

- ✅ Create detailed feature plans before coding
- ✅ Follow established architecture patterns
- ✅ Write tests for business logic
- ✅ Keep TASKS.md updated
- ✅ Use TypeScript strictly
- ✅ Document complex logic with comments
- ✅ Follow security best practices

### Don'ts

- ❌ Skip planning for complex features
- ❌ Deviate from architecture without discussion
- ❌ Use `any` types or ignore TypeScript errors
- ❌ Leave TASKS.md outdated
- ❌ Skip validation on API inputs
- ❌ Store sensitive data unencrypted
- ❌ Use floats for monetary values

---

## Getting Help

**Documentation hierarchy:**
1. This file (CLAUDE.md) - Workflow and organization
2. PRD.md - Product requirements
3. TASKS.md - Task breakdown
4. reference/ - Technical details
5. .agents/plans/ - Feature-specific plans

**When stuck:**
- Review related feature plans
- Check similar implemented features
- Consult reference documentation
- Ask user for clarification

---

## Notes for Long-Running Sessions

- Periodically review TASKS.md to stay on track
- Keep feature plans updated if requirements change
- Document any architectural decisions in reference/
- Maintain clean git history with descriptive commits

---

**Remember:** Quality over speed. A well-planned, well-tested feature is better than rushing through multiple half-finished ones.



# Feature: Authentication System & Base Layout

## Feature Description

Implement the complete authentication system for WealthVue, including user registration, login, session management, protected routes, and navigation UI. This covers TASKS.md sections 1.4 (Authentication System) and 1.5 (Base Layout & Navigation), which are the critical path blockers for Phase 1 completion.

## User Story

As a WealthVue user,
I want to create an account and securely log in,
So that I can access my personal financial dashboard with my data protected.

## Problem Statement

The application has database schema, dependencies, and infrastructure ready, but no authentication flow exists. Users cannot create accounts, log in, or access protected features. This blocks all subsequent feature development.

## Solution Statement

Implement NextAuth.js with Credentials provider for email/password authentication, JWT-based sessions, protected route middleware, and a responsive navigation UI with user menu.

## Feature Metadata

- **Feature Type**: New Capability
- **Estimated Complexity**: Medium
- **Primary Systems Affected**: Authentication, Session Management, UI Layout, Routing
- **Dependencies**: next-auth (installed), bcrypt (installed), zod (installed), react-hook-form (installed)

---

## CONTEXT REFERENCES

### Relevant Codebase Files - READ BEFORE IMPLEMENTING

| File | Relevance |
|------|-----------|
| `prisma/schema.prisma` (lines 17-46) | User model with `passwordHash`, `email`, `name` fields |
| `prisma/seed.ts` | Test user creation pattern with bcrypt |
| `src/lib/db/client.ts` | Prisma client singleton to use for queries |
| `src/lib/utils/cn.ts` | Class name utility for Tailwind styling |
| `src/app/layout.tsx` | Root layout to update with SessionProvider |
| `src/app/page.tsx` | Home page to update with landing content |
| `components.json` | shadcn/ui configuration (style: default, baseColor: slate) |
| `.env.example` | NEXTAUTH_URL, NEXTAUTH_SECRET variables |
| `TASKS.md` (lines 45-66) | Specific tasks for sections 1.4 and 1.5 |

### New Files to Create

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts    # NextAuth API handler
│   ├── api/auth/signup/route.ts           # User registration endpoint
│   ├── (auth)/layout.tsx                  # Protected routes layout
│   ├── (auth)/dashboard/page.tsx          # Dashboard placeholder
│   ├── login/page.tsx                     # Login page
│   └── signup/page.tsx                    # Signup page
├── components/
│   ├── auth/LoginForm.tsx                 # Login form component
│   ├── auth/SignupForm.tsx                # Signup form component
│   ├── auth/index.ts                      # Auth component exports
│   ├── shared/Header.tsx                  # Navigation header
│   ├── shared/UserMenu.tsx                # User dropdown menu
│   └── shared/index.ts                    # Shared component exports
├── lib/
│   ├── auth/index.ts                      # NextAuth configuration
│   ├── auth/password.ts                   # Bcrypt hash/verify
│   ├── auth/schemas.ts                    # Zod validation schemas
│   └── providers/SessionProvider.tsx      # Client session provider
├── middleware.ts                          # Route protection
└── types/next-auth.d.ts                   # NextAuth type extensions
```

### Relevant Documentation

- [NextAuth.js Credentials Provider](https://next-auth.js.org/providers/credentials) - Authentication setup
- [NextAuth.js JWT Callbacks](https://next-auth.js.org/configuration/callbacks#jwt-callback) - Session customization
- [shadcn/ui Components](https://ui.shadcn.com/docs/components) - UI component installation

### Patterns to Follow

**Error Response Format** (from PRD.md):
```typescript
{ success: false, error: { message: "User-friendly message", code: "ERROR_CODE" } }
```

**Password Requirements** (from PRD.md):
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- Bcrypt with salt rounds = 10

**Form Pattern**:
```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
})
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (Tasks 1-4)
Set up shadcn components, TypeScript types, password utilities, and validation schemas.

### Phase 2: Core Authentication (Tasks 5-7)
Configure NextAuth, create API routes for auth and signup.

### Phase 3: Client Session (Tasks 8-9)
Create SessionProvider and update root layout.

### Phase 4: Route Protection (Task 10)
Implement middleware for protected routes.

### Phase 5: Authentication UI (Tasks 11-15)
Build login and signup forms and pages.

### Phase 6: Navigation & Layout (Tasks 16-21)
Create header, user menu, protected layout, and dashboard.

### Phase 7: Finalization (Task 22)
Update home page and verify complete flow.

---

## STEP-BY-STEP TASKS

### Task 1: Install shadcn/ui Components

**ACTION**: Run CLI to add required components

```bash
npx shadcn@latest add button input card form label
```

**VALIDATE**:
```bash
ls src/components/ui/
# Expected: button.tsx, input.tsx, card.tsx, form.tsx, label.tsx
```

---

### Task 2: CREATE `src/types/next-auth.d.ts`

**IMPLEMENT**: NextAuth type extensions to include user ID in session

```typescript
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    id: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
  }
}
```

**VALIDATE**: `pnpm type-check`

---

### Task 3: CREATE `src/lib/auth/password.ts`

**IMPLEMENT**: Bcrypt hash and verify utilities

```typescript
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

**VALIDATE**: `pnpm type-check`

---

### Task 4: CREATE `src/lib/auth/schemas.ts`

**IMPLEMENT**: Zod validation schemas for login and signup

```typescript
import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name too short'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
```

**VALIDATE**: `pnpm type-check`

---

### Task 5: CREATE `src/lib/auth/index.ts`

**IMPLEMENT**: NextAuth configuration with Credentials provider

- Use Prisma to find user by email
- Verify password with bcrypt
- JWT session strategy (30 days)
- Custom pages: `/login`
- Callbacks: Add user ID to token and session

**PATTERN**: Reference `prisma/seed.ts` for user query structure
**IMPORTS**: `next-auth`, `next-auth/providers/credentials`, `@/lib/db/client`, `./password`, `./schemas`

**VALIDATE**: `pnpm type-check`

---

### Task 6: CREATE `src/app/api/auth/[...nextauth]/route.ts`

**IMPLEMENT**: NextAuth route handler

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**VALIDATE**: `pnpm dev` then `curl http://localhost:3000/api/auth/providers`

---

### Task 7: CREATE `src/app/api/auth/signup/route.ts`

**IMPLEMENT**: User registration endpoint

- Validate input with signupSchema
- Check for existing email (409 Conflict)
- Hash password with bcrypt
- Create user in database
- Return success with user data

**PATTERN**: Follow PRD error format `{ success, error: { message, code } }`

**VALIDATE**: Test with curl POST request

---

### Task 8: CREATE `src/lib/providers/SessionProvider.tsx`

**IMPLEMENT**: Client-side session provider wrapper

```typescript
'use client'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
```

---

### Task 9: UPDATE `src/app/layout.tsx`

**IMPLEMENT**: Wrap children with SessionProvider

**IMPORTS**: Add `import { SessionProvider } from '@/lib/providers/SessionProvider'`

**VALIDATE**: `pnpm dev` - app should start without errors

---

### Task 10: CREATE `src/middleware.ts`

**IMPLEMENT**: Protected route middleware

- Protected routes: `/dashboard`, `/budget`, `/transactions`, `/investments`, `/assets`, `/settings`
- Auth routes: `/login`, `/signup`
- Redirect unauthenticated users to `/login?callbackUrl=...`
- Redirect authenticated users away from auth routes to `/dashboard`

**IMPORTS**: `next-auth/jwt`, `next/server`

**VALIDATE**: `curl -I http://localhost:3000/dashboard` should redirect to login

---

### Task 11: CREATE `src/components/auth/LoginForm.tsx`

**IMPLEMENT**: Login form component

- React Hook Form with Zod resolver
- Email and password fields
- Error display for invalid credentials
- Loading state during submission
- Sign in via `signIn('credentials', { redirect: false })`
- Redirect to callbackUrl on success
- Link to signup page

**IMPORTS**: `next-auth/react`, `react-hook-form`, `@hookform/resolvers/zod`, shadcn components

---

### Task 12: CREATE `src/components/auth/SignupForm.tsx`

**IMPLEMENT**: Signup form component

- React Hook Form with Zod resolver
- Name, email, password, confirmPassword fields
- Password requirements hint text
- POST to `/api/auth/signup`
- Auto-login after successful registration
- Link to login page

---

### Task 13: CREATE `src/components/auth/index.ts`

**IMPLEMENT**: Export auth components

```typescript
export { LoginForm } from './LoginForm'
export { SignupForm } from './SignupForm'
```

---

### Task 14: CREATE `src/app/login/page.tsx`

**IMPLEMENT**: Login page

- Metadata: title "Sign In - WealthVue"
- Centered layout with WealthVue branding
- Suspense boundary around LoginForm (required for useSearchParams)

---

### Task 15: CREATE `src/app/signup/page.tsx`

**IMPLEMENT**: Signup page

- Metadata: title "Create Account - WealthVue"
- Centered layout with WealthVue branding
- SignupForm component

**VALIDATE**: Navigate to `/login` and `/signup` in browser

---

### Task 16: Install Additional shadcn Components

**ACTION**: Add components for navigation

```bash
npx shadcn@latest add dropdown-menu avatar separator
```

---

### Task 17: CREATE `src/components/shared/UserMenu.tsx`

**IMPLEMENT**: User dropdown menu component

- Avatar with user initials fallback
- Show user name and email
- Settings link
- Sign out button (calls `signOut({ callbackUrl: '/login' })`)

**IMPORTS**: `next-auth/react`, `lucide-react` icons, shadcn dropdown components

---

### Task 18: CREATE `src/components/shared/Header.tsx`

**IMPLEMENT**: Navigation header component

- Logo linking to `/dashboard`
- Desktop nav: Dashboard, Budget, Transactions, Investments, Assets
- Active state highlighting based on pathname
- Mobile hamburger menu toggle
- UserMenu component

**IMPORTS**: `next/navigation`, `lucide-react` icons, `@/lib/utils`

---

### Task 19: CREATE `src/components/shared/index.ts`

**IMPLEMENT**: Export shared components

```typescript
export { Header } from './Header'
export { UserMenu } from './UserMenu'
```

---

### Task 20: CREATE `src/app/(auth)/layout.tsx`

**IMPLEMENT**: Protected layout with header

```typescript
import { Header } from '@/components/shared'

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container py-6">{children}</main>
    </div>
  )
}
```

---

### Task 21: CREATE `src/app/(auth)/dashboard/page.tsx`

**IMPLEMENT**: Dashboard placeholder page

- Server component with `getServerSession`
- Personalized welcome message
- Net worth card (placeholder $0.00)
- Metric cards: Cash, Credit, Investments, Real Estate (placeholders)
- Chart placeholders for future Phase 4

**VALIDATE**: Login and verify dashboard renders with user's name

---

### Task 22: UPDATE `src/app/page.tsx`

**IMPLEMENT**: Landing page for unauthenticated users

- Check session server-side, redirect to `/dashboard` if authenticated
- Hero section with WealthVue branding
- Sign In and Create Account buttons

**VALIDATE**: Full auth flow test (see Testing Strategy)

---

## TESTING STRATEGY

### Manual Testing Checklist

1. **Landing Page**: Visit `/` - see Sign In/Create Account buttons
2. **Protected Route**: Visit `/dashboard` unauthenticated - redirect to `/login`
3. **Signup Flow**:
   - Navigate to `/signup`
   - Test password validation (try "password" - should fail)
   - Create account with valid password (e.g., "Password123")
   - Should auto-login and redirect to `/dashboard`
4. **Login Flow**:
   - Sign out, navigate to `/login`
   - Test invalid credentials - see error message
   - Login with test user: `test@wealthvue.com` / `password123`
   - Should redirect to `/dashboard`
5. **Session Persistence**: Refresh `/dashboard` - should remain logged in
6. **Navigation**: Click nav items - active state updates
7. **Mobile Nav**: Resize browser, test hamburger menu
8. **Logout**: Click avatar > Sign out - redirect to `/login`
9. **Auth Route Guard**: While logged in, visit `/login` - redirect to `/dashboard`

### Test User Credentials

- **Email**: test@wealthvue.com
- **Password**: password123

---

## VALIDATION COMMANDS

### Level 1: Type Safety
```bash
pnpm type-check
```

### Level 2: Linting
```bash
pnpm lint
```

### Level 3: Dev Server
```bash
pnpm dev
```

### Level 4: API Tests
```bash
# Test providers endpoint
curl http://localhost:3000/api/auth/providers

# Test signup endpoint
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"newuser@test.com","password":"Password123","confirmPassword":"Password123"}'

# Test protected route redirect
curl -I http://localhost:3000/dashboard
```

---

## ACCEPTANCE CRITERIA

- [ ] User can create account with email/password
- [ ] Password validation enforces: 8+ chars, uppercase, lowercase, number
- [ ] User can log in with valid credentials
- [ ] Invalid credentials show user-friendly error
- [ ] Protected routes redirect to `/login` when unauthenticated
- [ ] Auth routes redirect to `/dashboard` when authenticated
- [ ] Session persists across page refreshes
- [ ] Navigation header shows on all protected pages
- [ ] User menu displays name, email, and logout option
- [ ] Logout clears session and redirects to `/login`
- [ ] Mobile navigation is functional
- [ ] Dashboard shows personalized welcome message
- [ ] All TypeScript checks pass
- [ ] All lint checks pass

---

## COMPLETION CHECKLIST

- [ ] All 22 tasks completed in order
- [ ] shadcn components installed (button, input, card, form, label, dropdown-menu, avatar, separator)
- [ ] NextAuth configured with Credentials provider
- [ ] Signup API creates users with hashed passwords
- [ ] Middleware protects routes correctly
- [ ] Login/Signup forms validate with Zod
- [ ] SessionProvider wraps entire app
- [ ] Header navigation responsive
- [ ] Dashboard placeholder renders
- [ ] Manual testing checklist passed
- [ ] TASKS.md updated (mark 1.4 and 1.5 items as ✅)

---

## NOTES

### Architecture Decisions

1. **JWT Strategy**: Chosen over database sessions for simpler deployment (no session table needed)
2. **Separate Signup Route**: NextAuth Credentials provider doesn't handle registration, so custom API route is required
3. **Route Groups**: Using `(auth)` folder for protected routes keeps URLs clean while sharing layout
4. **Suspense for useSearchParams**: Required in Next.js 14 for client components using URL search params

### Dependencies on Future Phases

- **Phase 2**: Plaid integration will use `session.user.id` for account linking
- **Phase 4**: Family account linking will use `linkedUserId` field from User model
- **Phase 5**: Rate limiting will wrap authentication endpoints

### Known Constraints

- No OAuth providers in MVP (email/password only per PRD)
- No password reset flow in MVP (can be added later)
- No email verification in MVP (field exists but not enforced)

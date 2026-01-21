# Project Structure & Organization

## Directory Structure

```
├── app/                    # Next.js App Router pages and layouts
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── billing-history/
│   │   ├── cancel-subscription/
│   │   ├── create-checkout-session/
│   │   └── stripe-webhook/
│   ├── auth/signin/       # Authentication pages
│   ├── dashboard/         # User dashboard
│   └── subscription/      # Subscription management
├── components/            # Reusable React components
├── lib/                   # Core application logic
│   ├── auth.ts           # Better-Auth configuration
│   ├── auth-client.ts    # Client-side auth utilities
│   └── db.ts             # Database connection and Kysely setup
├── __tests__/            # Test files
│   ├── unit/             # Unit tests for components/utilities
│   └── integration/      # Integration tests for APIs/database
├── e2e/                  # End-to-end Playwright tests
├── scripts/              # Build and setup scripts
├── docs/                 # Project documentation
└── .kiro/                # Kiro-specific files
    ├── specs/            # Feature specifications
    └── steering/         # Development guidelines (this file)
```

## File Naming Conventions

**Components:**
- PascalCase: `GoogleLoginButton.tsx`
- Co-located tests: `GoogleLoginButton.test.tsx`

**Pages (App Router):**
- Lowercase: `page.tsx`, `layout.tsx`
- Dynamic routes: `[...all]/route.ts`

**API Routes:**
- Lowercase directories: `api/auth/signin/`
- Route files: `route.ts`

**Tests:**
- Unit tests: `ComponentName.test.tsx`
- Integration tests: `feature-name.test.ts`
- E2E tests: `feature-name.spec.ts`

**Utilities & Libraries:**
- kebab-case: `auth-client.ts`
- Descriptive names: `db.ts`, `auth.ts`

## Code Organization Patterns

**Authentication Flow:**
- `lib/auth.ts` - Server-side Better-Auth configuration
- `lib/auth-client.ts` - Client-side authentication utilities
- `app/api/auth/[...all]/route.ts` - Auth API endpoints
- `app/auth/signin/page.tsx` - Sign-in page

**Database Layer:**
- `lib/db.ts` - Kysely database connection
- Database migrations handled by Better-Auth
- PostgreSQL running in Docker container

**Component Structure:**
- `components/` - Shared, reusable components
- Page-specific components in respective `app/` directories
- Component tests co-located with source files

**API Organization:**
- RESTful endpoints in `app/api/`
- Each feature gets its own directory
- `route.ts` files for HTTP methods
- Webhook handlers in dedicated directories

## Testing Organization

**Test Categories:**
- **Unit Tests** (`__tests__/unit/`): Component logic, utilities, isolated functions
- **Integration Tests** (`__tests__/integration/`): API endpoints, database operations, system integration
- **E2E Tests** (`e2e/`): Complete user journeys, browser automation

**Test File Patterns:**
- Unit: `ComponentName.test.tsx` or `utility-name.test.ts`
- Integration: `feature-api.test.ts` or `database-feature.test.ts`
- E2E: `user-journey.spec.ts`

**Non-Interactive Test Execution (REQUIRED):**
- **Unit/Integration**: `npm test -- --run` (never use `npm test` alone)
- **E2E Tests**: `npm run test:e2e` (runs headless by default, never use `npm run test:e2e -- --headed`)
- **Agent/Automation Rule**: All automated processes MUST use non-interactive flags
- **Rationale**: Prevents tests from hanging in watch mode or waiting for user input

## Configuration Files

**Build & Development:**
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration

**Testing:**
- `vitest.config.ts` - Unit/integration test configuration
- `playwright.config.ts` - E2E test configuration
- `vitest.setup.ts` - Test environment setup

**Infrastructure:**
- `docker-compose.yml` - PostgreSQL container
- `.env.local` - Environment variables (created by setup script)
- `scripts/setup-env.sh` - Environment setup automation

## Import Path Conventions

**Absolute Imports:**
- Use `@/` prefix for project root imports
- Example: `import { auth } from '@/lib/auth'`

**Relative Imports:**
- Use for same-directory or nearby files
- Example: `import './globals.css'`

**External Dependencies:**
- Standard npm package imports
- Example: `import { betterAuth } from 'better-auth'`

## Development Guidelines

**File Creation:**
- Follow established directory structure
- Use appropriate naming conventions
- Include tests for new components/utilities
- Update documentation when adding new patterns

**Code Organization:**
- Keep related functionality together
- Separate concerns (auth, database, UI)
- Use TypeScript for type safety
- Follow TDD methodology (tests first)

**Documentation:**
- Update this file when adding new patterns
- Document complex business logic
- Include setup instructions for new features
- Maintain API documentation for endpoints
# Technology Stack & Build System

## Core Technologies

**Framework & Runtime:**
- Next.js 16.1.3 with App Router
- React 19.2.3 with TypeScript 5
- Node.js runtime

**Authentication & Database:**
- Better-Auth 1.4.15 for authentication and OAuth
- PostgreSQL 16 (Docker containerized)
- Kysely 0.28.10 as query builder

**Payment Processing:**
- Stripe integration (@stripe/stripe-js, @stripe/react-stripe-js)
- Stripe webhooks for subscription management

**Styling & UI:**
- Tailwind CSS 4 for styling
- Responsive design with mobile-first approach

## Testing Framework

**Unit & Integration Testing:**
- Vitest 3.2.4 with jsdom environment
- @testing-library/react for component testing
- @testing-library/jest-dom for DOM assertions

**End-to-End Testing:**
- Playwright 1.57.0 for e2e testing
- Chromium browser automation
- HTML reporter for test results

**Test Structure:**
- Unit tests: `__tests__/unit/`
- Integration tests: `__tests__/integration/`
- E2E tests: `e2e/`

## Development Commands

**Project Setup:**
```bash
# Full automated setup
./setup.sh

# Manual setup steps
npm install
./scripts/setup-env.sh
npm run db:start
npm run db:migrate
```

**Development:**
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

**Database Management:**
```bash
npm run db:start     # Start PostgreSQL container
npm run db:stop      # Stop PostgreSQL container
npm run db:migrate   # Run Better-Auth migrations
```

**Testing:**
```bash
npm test             # Run unit/integration tests
npm run test:ui      # Run tests with Vitest UI
npm run test:e2e     # Run Playwright e2e tests
npm run test:e2e:ui  # Run e2e tests with UI
```

**Full Setup Command:**
```bash
npm run setup        # Runs: setup-env + db:start + db:migrate
```

## Build Configuration

**TypeScript Configuration:**
- Target: ES2017
- Module: ESNext with bundler resolution
- Path alias: `@/*` maps to project root
- Strict mode enabled

**Next.js Configuration:**
- App Router architecture
- Minimal configuration (default settings)

**Environment Variables:**
- Database: `DATABASE_URL`
- Auth: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

## Development Workflow

**TDD Methodology:**
1. Write failing tests first (RED phase)
2. Implement minimal code to pass (GREEN phase)
3. Refactor while keeping tests green (REFACTOR phase)

**Test Coverage Goals:**
- Unit tests: >80% coverage
- Integration tests: All critical paths
- E2E tests: Complete user journeys

**Git Workflow:**
- Feature branches: `feature/epic-X-description`
- Commit prefixes: `test:`, `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
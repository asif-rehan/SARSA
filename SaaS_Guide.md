# SaaS Application Implementation Guide

## Overview
This guide provides a structured approach to building a SaaS application using Test-Driven Development (TDD) with Next.js, Better-Auth, PostgreSQL, and Kysely.

To enable AI-assisted coding with Better-Auth, include these commands:
- `npx @better-auth/cli mcp --open-code`
- `npx skills add better-auth/skills`

## Tech Stack
- **Framework**: Next.js 16.1.1 (App Router)
- **Authentication**: Better-Auth (latest from demo)
- **Database**: PostgreSQL
- **Query Builder**: Kysely ^0.28.5
- **Testing**: Vitest, Playwright, Testing Library
- **Type Safety**: TypeScript

---

## 1. Project Setup Guide

### 1.1 Initialize the Project

Run the automated setup script which handles all project initialization:

```bash
# Make script executable and run
chmod +x setup.sh
./setup.sh
```

The script automatically:
- Creates Next.js project with TypeScript, Tailwind CSS, App Router, ESLint
- Installs all required dependencies (better-auth, kysely, pg, testing libraries)
- Creates `docker-compose.yml` for PostgreSQL
- Creates `scripts/setup-env.sh` for environment configuration
- Creates auth configuration files (`lib/auth.ts`, `lib/db.ts`, `lib/auth-client.ts`)
- Sets up testing configuration (Vitest, Playwright)
- Creates test directories (`__tests__/unit`, `__tests__/integration`, `e2e`)
- Updates `package.json` with necessary scripts

### 1.2 Database Setup

#### Start PostgreSQL

```bash
npm run db:start
```

#### Setup Environment Variables

```bash
./scripts/setup-env.sh
```

This creates `.env.local` with:
- Database URL for PostgreSQL
- Better-Auth secret
- Google OAuth placeholders (update these manually)

#### Run Database Migration

```bash
npm run db:migrate
```

This creates the Better-Auth schema in PostgreSQL.

**Note**: The files below are automatically created by the setup script, but are included here for reference.

---

#### Reference: docker-compose.yml

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: saas-postgres-dev
    environment:
      POSTGRES_USER: saas_user
      POSTGRES_PASSWORD: saas_password
      POSTGRES_DB: saas_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U saas_user -d saas_dev"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

#### Reference: scripts/setup-env.sh

```bash
#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Setting up environment variables...${NC}"

DB_USER="saas_user"
DB_PASSWORD="saas_password"
DB_NAME="saas_dev"
DB_HOST="localhost"
DB_PORT="5432"

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

BETTER_AUTH_SECRET=$(openssl rand -base64 32)
BETTER_AUTH_URL="http://localhost:3000"

cat > .env.local << EOF
DATABASE_URL=${DATABASE_URL}

BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
BETTER_AUTH_URL=${BETTER_AUTH_URL}

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo -e "${GREEN}✓ .env.local file created successfully!${NC}"
echo -e "${YELLOW}Note: Please update Google OAuth credentials manually${NC}"

chmod 600 .env.local

echo -e "${GREEN}✓ Environment setup complete!${NC}"
```

#### Reference: lib/db.ts

```typescript
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

export const db = new Kysely({
  dialect,
});
```

#### Reference: lib/auth.ts

```typescript
import { betterAuth } from "better-auth";
import { db } from "./db";

export const auth = betterAuth({
  database: db,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
```

#### Reference: lib/auth-client.ts

```typescript
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
```

### 1.3 Testing Configuration

The following files are automatically created by the setup script. Included for reference:

#### Reference: vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

#### Reference: vitest.setup.ts

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

#### Reference: playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Available Scripts

The setup script adds these scripts to `package.json`:

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run unit/integration tests
- `npm run test:ui` - Run tests with UI
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:e2e:ui` - Run e2e tests with UI
- `npm run db:start` - Start PostgreSQL container
- `npm run db:stop` - Stop PostgreSQL container
- `npm run db:migrate` - Run Better-Auth migrations
- `npm run setup` - Full setup (env + db + migrate)

---

## 2. Epics & Features with TDD Approach

### Epic 1: Project Foundation & Database Connectivity

**User Story**: As a developer, I need to ensure the project is properly set up with database connectivity so that I can build features on a stable foundation.

#### Tests to Write (Red Phase)

**Unit Tests** (`__tests__/unit/db.test.ts`):
```typescript
describe('Database Connection', () => {
  it('should connect to PostgreSQL successfully', async () => {
    // Test database connection
  });

  it('should execute a simple query', async () => {
    // Test basic query execution
  });

  it('should handle connection errors gracefully', async () => {
    // Test error handling
  });
});
```

**Integration Tests** (`__tests__/integration/db-health.test.ts`):
```typescript
describe('Database Health Check', () => {
  it('should verify all required tables exist', async () => {
    // Test Better-Auth tables creation
  });

  it('should perform CRUD operations on test table', async () => {
    // Test database operations
  });
});
```

#### Acceptance Criteria
- ✅ PostgreSQL runs in Docker
- ✅ Environment variables are properly configured
- ✅ Database connection is established
- ✅ Better-Auth schema is migrated
- ✅ All tests pass (Green phase)

---

### Epic 2: Landing Page with CTAs ✓

**User Story**: As a visitor, I want to see a compelling landing page with clear options to log in or subscribe, so that I understand the product value and can take action.

#### Tests to Write (Red Phase)

**Unit Tests** (`__tests__/unit/components/LandingPage.test.tsx`):
```typescript
describe('Landing Page Component', () => {
  it('should render the main heading', () => {
    // Test heading presence
  });

  it('should display login button', () => {
    // Test login button rendering
  });

  it('should display subscription button', () => {
    // Test subscription button rendering
  });

  it('should have correct button links', () => {
    // Test button href/onClick attributes
  });
});
```

**Integration Tests** (`__tests__/integration/landing-page.test.tsx`):
```typescript
describe('Landing Page Integration', () => {
  it('should navigate to login page when login button is clicked', () => {
    // Test navigation flow
  });

  it('should navigate to subscription page when subscribe button is clicked', () => {
    // Test navigation flow
  });
});
```

**E2E Tests** (`e2e/landing-page.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display all essential elements', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /subscribe/i })).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page).toHaveURL('/login');
  });

  test('should navigate to subscription page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /subscribe/i })).click();
    await expect(page).toHaveURL('/subscribe');
  });
});
```

#### Implementation Steps (Green Phase)
1. Create `app/page.tsx` with hero section
2. Add login and subscribe buttons
3. Implement navigation logic
4. Style with Tailwind CSS
5. Run tests and fix until green

#### Refactor Phase
- Extract reusable button components
- Optimize images and assets
- Improve accessibility
- Enhance responsive design

#### Acceptance Criteria
- ✅ Landing page loads under 2 seconds
- ✅ All CTAs are clearly visible
- ✅ Mobile responsive (tested on 3 viewport sizes)
- ✅ Accessibility score > 90 (Lighthouse)
- ✅ All tests pass

**Status**: ✅ **Completed**

**Summary**:
- Landing page with "Build Your SaaS in Minutes" heading ✓
- Sign In CTA button linking to `/auth/signin` ✓
- Get Started CTA button linking to `/auth/signup` ✓
- Value proposition text ✓
- Accessibility with semantic HTML (banner role) ✓

**Status**: 🚧 **In Progress** (RED/GREEN Complete)

**Summary (RED→GREEN):**
- 5 unit tests for Google Login Button ✓
- 3 integration tests for Google Login Button ✓
- Google Login Button component with loading/error states ✓
- Better-Auth signIn.social integration ✓
- Accessibility attributes (aria-label, type) ✓

**Next**: Create sign-in page, implement Better-Auth API routes

---

### Epic 3: Google Social Login

**User Story**: As a user, I want to log in using my Google account, so that I can access the application quickly without creating a new password.

#### Tests to Write (Red Phase)

**Unit Tests** (`__tests__/unit/components/GoogleLoginButton.test.tsx`):
```typescript
describe('Google Login Button', () => {
  it('should render Google login button', () => {
    // Test button rendering
  });

  it('should have Google branding', () => {
    // Test Google icon/text
  });

  it('should call signIn function on click', () => {
    // Test click handler
  });

  it('should disable button during loading state', () => {
    // Test loading state
  });
});
```

**Integration Tests** (`__tests__/integration/auth/google-login.test.ts`):
```typescript
describe('Google OAuth Flow', () => {
  it('should redirect to Google OAuth URL', async () => {
    // Test redirect initiation
  });

  it('should handle OAuth callback with valid code', async () => {
    // Mock Google callback with code
  });

  it('should create user session after successful auth', async () => {
    // Test session creation
  });

  it('should handle OAuth errors gracefully', async () => {
    // Test error scenarios
  });
});
```

**E2E Tests** (`e2e/google-login.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test.describe('Google Login Flow', () => {
  test('should show Google login option', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
  });

  test('should initiate Google OAuth flow', async ({ page }) => {
    await page.goto('/login');
    
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('button', { name: /continue with google/i }).click()
    ]);

    // Verify redirect to Google
    await expect(popup.url()).toContain('accounts.google.com');
  });

  // Note: Full OAuth flow testing requires mocking or test credentials
  test.skip('should complete authentication and redirect to dashboard', async ({ page }) => {
    // This would require Google test credentials or OAuth mocking
  });
});
```

**API Route Tests** (`__tests__/integration/api/auth.test.ts`):
```typescript
describe('Auth API Routes', () => {
  describe('GET /api/auth/google', () => {
    it('should return authorization URL', async () => {
      // Test OAuth URL generation
    });
  });

  describe('POST /api/auth/callback/google', () => {
    it('should exchange code for tokens', async () => {
      // Mock token exchange
    });

    it('should create or update user in database', async () => {
      // Test user persistence
    });

    it('should set session cookie', async () => {
      // Test cookie creation
    });
  });
});
```

#### Implementation Steps (Green Phase)

1. **Configure Google OAuth Console**
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs
   - Update .env.local with credentials

2. **Create Login Page** (`app/login/page.tsx`)
   ```typescript
   // Implement login UI with Google button
   ```

3. **Configure Better-Auth** (already in `lib/auth.ts`)
   - Verify Google provider setup

4. **Create Auth Client** (`lib/auth-client.ts`)
   ```typescript
   import { createAuthClient } from "better-auth/client";
   
   export const authClient = createAuthClient({
     baseURL: process.env.NEXT_PUBLIC_APP_URL,
   });
   ```

5. **Implement Google Login Component** (`components/GoogleLoginButton.tsx`)
   ```typescript
   // Component with Google branding and OAuth trigger
   ```

6. **Run Better-Auth Migration**
   ```bash
   npm run db:migrate
   ```

7. **Run tests and iterate until green**

#### Refactor Phase
- Extract auth logic into custom hooks
- Add loading states and error boundaries
- Improve error messages
- Add analytics tracking
- Implement rate limiting

#### Acceptance Criteria
- ✅ Google login button appears on login page
- ✅ Clicking button initiates OAuth flow
- ✅ Successful login creates user record in database
- ✅ User is redirected to dashboard after login
- ✅ Session persists across page refreshes
- ✅ Error states are handled gracefully
- ✅ All tests pass

---

### Epic 4: User Dashboard (Post-Login)

**User Story**: As an authenticated user, I want to see a personalized dashboard after logging in, so that I can access my account information and features.

#### Tests to Write (Red Phase)

**Unit Tests** (`__tests__/unit/components/Dashboard.test.tsx`):
```typescript
describe('Dashboard Component', () => {
  it('should display user name', () => {
    // Test user info display
  });

  it('should show logout button', () => {
    // Test logout button
  });

  it('should display user avatar', () => {
    // Test avatar rendering
  });
});
```

**Integration Tests** (`__tests__/integration/dashboard.test.tsx`):
```typescript
describe('Dashboard Integration', () => {
  it('should fetch and display user data', async () => {
    // Test data fetching
  });

  it('should redirect to login if not authenticated', async () => {
    // Test auth guard
  });

  it('should handle logout successfully', async () => {
    // Test logout flow
  });
});
```

**E2E Tests** (`e2e/dashboard.spec.ts`):
```typescript
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Setup authenticated session
  });

  test('should display user dashboard after login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL('/login');
  });
});
```

#### Acceptance Criteria
- ✅ Dashboard only accessible to authenticated users
- ✅ User information displays correctly
- ✅ Logout functionality works
- ✅ All tests pass

---

## 3. TDD Workflow Guide

### Red-Green-Refactor Cycle

For each feature:

1. **RED Phase**
   ```bash
   # Write failing tests first
   npm test -- --run
   # Expected: Tests fail (RED)
   ```

2. **GREEN Phase**
   ```bash
   # Implement minimal code to pass tests
   npm test -- --run
   # Expected: Tests pass (GREEN)
   ```

3. **REFACTOR Phase**
   ```bash
   # Improve code quality while keeping tests green
   npm test -- --run
   # Expected: Tests still pass (GREEN)
   ```

### Test Coverage Goals

- **Unit Tests**: > 80% coverage
- **Integration Tests**: All critical paths
- **E2E Tests**: All user journeys

Run coverage:
```bash
npm test -- --coverage
```

---

## 4. Git Workflow

### Branch Strategy

```bash
# Feature branch naming
git checkout -b feature/epic-3-google-login

# After RED phase
git add .
git commit -m "test: add failing tests for Google login"

# After GREEN phase
git add .
git commit -m "feat: implement Google OAuth login"

# After REFACTOR phase
git add .
git commit -m "refactor: extract auth logic into hooks"
```

### Commit Message Convention

- `test:` - Test files
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `chore:` - Maintenance tasks

---

## 5. Next Steps

After completing the foundation epics:

- [ ] Epic 5: Subscription Management (Stripe integration)
- [ ] Epic 6: User Profile Management
- [ ] Epic 7: Email Verification
- [ ] Epic 8: Password Reset Flow
- [ ] Epic 9: Admin Dashboard
- [ ] Epic 10: API Rate Limiting

---

## 6. Resources

- [Better-Auth Documentation](https://better-auth.com)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Kysely Documentation](https://kysely.dev)
- [Playwright Testing](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)

---

## Quick Start Checklist

- [ ] Clone/create repository
- [ ] Run `npm install`
- [ ] Run `./scripts/setup-env.sh`
- [ ] Run `npm run db:start`
- [ ] Run `npm run db:migrate`
- [ ] Update Google OAuth credentials in `.env.local`
- [ ] Run `npm test` (should see initial tests)
- [ ] Run `npm run dev` (verify app starts)
- [ ] Run `npx @better-auth/cli mcp --open-code` to enable AI-assisted coding
- [ ] Start Epic 1: Write RED tests first!

**Remember**: Never write implementation code before writing tests! TDD = Tests First, Code Second.
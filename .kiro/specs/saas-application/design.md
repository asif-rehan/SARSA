# Design Document

## Introduction

This document provides the technical design for a comprehensive SaaS application built using Test-Driven Development (TDD) methodology. The design covers architecture, implementation patterns, testing strategies, and correctness properties for all system components.

## Architecture Overview

### System Architecture

The SaaS application follows a modern web architecture pattern with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - Landing Page  │    │ - Auth API      │    │ - User Data     │
│ - Dashboard     │    │ - Stripe API    │    │ - Sessions      │
│ - Auth Pages    │    │ - Admin API     │    │ - Subscriptions │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ External APIs   │    │   Middleware    │    │   File Storage  │
│                 │    │                 │    │                 │
│ - Google OAuth  │    │ - Rate Limiting │    │ - Profile Pics  │
│ - Stripe        │    │ - Auth Guards   │    │ - Documents     │
│ - Email Service │    │ - CORS          │    │ - Backups       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Frontend Framework**: Next.js 16.1.1 with App Router
- **Authentication**: Better-Auth with OAuth providers
- **Database**: PostgreSQL with Kysely query builder
- **Payment Processing**: Stripe integration
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript throughout

## Component Design

### 1. Project Foundation (EPIC 1) - ✅ IMPLEMENTED

#### Database Layer Design

**Database Schema:**
```sql
-- Better-Auth managed tables
CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    emailVerified BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "session" (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    expiresAt TIMESTAMP NOT NULL,
    token TEXT UNIQUE NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "account" (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    expiresAt TIMESTAMP,
    UNIQUE(provider, providerAccountId)
);

CREATE TABLE "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW()
);
```

**Connection Management:**
```typescript
// lib/db.ts
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }),
});

export const db = new Kysely({ dialect });
```

**Correctness Properties:**
1. **Database Connectivity**: `∀ connection_attempt → (valid_credentials → successful_connection)`
2. **Schema Integrity**: `∀ table ∈ required_tables → table.exists ∧ table.schema_valid`
3. **Connection Pool**: `∀ concurrent_requests → response_time < 100ms`

### 2. Landing Page (EPIC 2) - ✅ IMPLEMENTED

#### Component Architecture

**Landing Page Structure:**
```typescript
// app/page.tsx
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <HeroSection />
      <CTASection />
      <Footer />
    </main>
  );
}

// Components breakdown
const HeroSection = () => (
  <section role="banner" className="text-center py-20">
    <h1 className="text-5xl font-bold text-gray-900 mb-6">
      Build Your SaaS in Minutes
    </h1>
    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
      Complete SaaS platform with authentication, payments, and dashboard
    </p>
  </section>
);

const CTASection = () => (
  <section className="flex flex-col sm:flex-row gap-4 justify-center">
    <Link href="/auth/signin" className="btn-primary">Sign In</Link>
    <Link href="/auth/signup" className="btn-secondary">Get Started</Link>
    <Link href="/subscription" className="btn-accent">Subscribe</Link>
  </section>
);
```

**Responsive Design System:**
```css
/* Breakpoint system */
.btn-primary {
  @apply px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold;
  @apply hover:bg-blue-700 focus:ring-4 focus:ring-blue-200;
  @apply transition-all duration-200;
}

/* Mobile-first responsive */
@media (max-width: 640px) {
  .btn-primary { @apply w-full text-center; }
}
```

**Correctness Properties:**
1. **Load Performance**: `∀ page_load → load_time < 2000ms`
2. **Accessibility**: `∀ element → (aria_label ∨ semantic_html) ∧ contrast_ratio ≥ 4.5`
3. **Responsive Design**: `∀ viewport ∈ [320px, 1920px] → layout.functional`

### 3. Google OAuth Authentication (EPIC 3) - ✅ IMPLEMENTED

#### Authentication Flow Design

**OAuth Flow Architecture:**
```
User → Sign In Button → Google OAuth → Callback → Session → Dashboard
  ↓         ↓              ↓           ↓         ↓         ↓
Click → Redirect → Google → Auth Code → JWT → Protected Route
```

**Better-Auth Configuration:**
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { db } from "./db";

export const auth = betterAuth({
  database: db,
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google`,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
});
```

**Google Login Component:**
```typescript
// components/GoogleLoginButton.tsx
"use client";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

export default function GoogleLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      console.error("Google login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      aria-label="Sign in with Google"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
      ) : (
        <>
          <GoogleIcon className="w-5 h-5 mr-2" />
          Sign in with Google
        </>
      )}
    </button>
  );
}
```

**Correctness Properties:**
1. **OAuth Security**: `∀ auth_attempt → (valid_token → successful_auth) ∧ (invalid_token → auth_failure)`
2. **Session Management**: `∀ session → (active ∧ ¬expired) → dashboard_access`
3. **Redirect Flow**: `∀ successful_auth → redirect_to_dashboard`

### 4. User Dashboard (EPIC 4) - ✅ IMPLEMENTED

#### Dashboard Architecture

**Protected Route Pattern:**
```typescript
// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (!session) {
    redirect("/auth/signin");
  }

  return <DashboardClient user={session.user} />;
}
```

**Dashboard Client Component:**
```typescript
// app/dashboard/DashboardClient.tsx
"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface DashboardClientProps {
  user: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.name || user.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard title="Profile" href="/profile" />
            <DashboardCard title="Subscription" href="/subscription" />
            <DashboardCard title="Settings" href="/settings" />
          </div>
        </div>
      </main>
    </div>
  );
}
```

**Correctness Properties:**
1. **Access Control**: `∀ dashboard_request → authenticated_user ∨ redirect_to_signin`
2. **Session Persistence**: `∀ page_refresh → session.valid → maintain_access`
3. **Logout Flow**: `∀ signout_action → session.invalidated ∧ redirect_to_landing`

### 5. Subscription Management (EPIC 5) - 🔄 IN PROGRESS

#### Stripe Integration Design

**Subscription Architecture:**
```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 9.99,
    priceId: 'price_basic_monthly',
    features: ['Feature 1', 'Feature 2'],
  },
  pro: {
    name: 'Pro',
    price: 19.99,
    priceId: 'price_pro_monthly',
    features: ['All Basic features', 'Feature 3', 'Feature 4'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 49.99,
    priceId: 'price_enterprise_monthly',
    features: ['All Pro features', 'Feature 5', 'Priority support'],
  },
};
```

**Checkout Session Creation:**
```typescript
// app/api/create-checkout-session/route.ts
import { stripe } from '@/lib/stripe';
import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId } = await request.json();

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      metadata: { userId: session.user.id },
    });

    return Response.json({ sessionId: checkoutSession.id });
  } catch (error) {
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
```

**Webhook Handler:**
```typescript
// app/api/stripe-webhook/route.ts
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json({ error: 'Webhook error' }, { status: 400 });
  }
}
```

**Correctness Properties:**
1. **Payment Security**: `∀ payment_attempt → stripe_validation ∧ secure_processing`
2. **Subscription State**: `∀ subscription_change → database_updated ∧ user_notified`
3. **Webhook Reliability**: `∀ webhook_event → idempotent_processing ∧ error_handling`

### 6. User Profile Management (EPIC 6) - 📋 PLANNED

#### Profile Management Design

**Profile Data Model:**
```typescript
interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

**Profile Form Component:**
```typescript
// components/ProfileForm.tsx
"use client";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileForm({ user }: { user: UserProfile }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email,
      bio: user.bio || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          {...register('name')}
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isLoading ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}
```

**Correctness Properties:**
1. **Data Validation**: `∀ profile_update → validation_passed ∧ sanitized_input`
2. **Email Verification**: `∀ email_change → verification_required ∧ old_email_notified`
3. **Avatar Upload**: `∀ image_upload → size_limit ∧ format_validation ∧ secure_storage`

### 7. Email Verification (EPIC 7) - 📋 PLANNED

#### Email Verification System Design

**Verification Token Model:**
```typescript
interface VerificationToken {
  id: string;
  identifier: string; // email address
  token: string; // secure random token
  type: 'email_verification' | 'password_reset';
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date;
}
```

**Email Service Integration:**
```typescript
// lib/email.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Verify your email address',
    html: `
      <h1>Verify your email address</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  });
}
```

**Correctness Properties:**
1. **Token Security**: `∀ verification_token → cryptographically_secure ∧ time_limited`
2. **Email Delivery**: `∀ verification_email → delivered ∨ error_logged`
3. **Single Use**: `∀ token_usage → token.used = true ∧ ¬reusable`

### 8. Password Reset Flow (EPIC 8) - 📋 PLANNED

#### Password Reset System Design

**Reset Flow Architecture:**
```
User Request → Email Sent → Token Validation → Password Update → Session Invalidation
```

**Password Reset API:**
```typescript
// app/api/auth/reset-password/route.ts
import { auth } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { generateSecureToken } from '@/lib/crypto';

export async function POST(request: Request) {
  const { email } = await request.json();
  
  // Check if user exists
  const user = await db
    .selectFrom('user')
    .where('email', '=', email)
    .selectAll()
    .executeTakeFirst();
    
  if (!user) {
    // Don't reveal if email exists
    return Response.json({ message: 'If the email exists, a reset link has been sent.' });
  }
  
  // Generate reset token
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  // Store token
  await db
    .insertInto('verification')
    .values({
      identifier: email,
      token,
      type: 'password_reset',
      expiresAt,
    })
    .execute();
    
  // Send email
  await sendPasswordResetEmail(email, token);
  
  return Response.json({ message: 'If the email exists, a reset link has been sent.' });
}
```

**Correctness Properties:**
1. **Reset Security**: `∀ reset_request → secure_token ∧ time_limited ∧ single_use`
2. **Password Strength**: `∀ new_password → meets_complexity_requirements`
3. **Session Invalidation**: `∀ password_change → all_sessions_invalidated`

### 9. Admin Dashboard (EPIC 9) - 📋 PLANNED

#### Admin System Design

**Role-Based Access Control:**
```typescript
enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
}

interface AdminUser extends User {
  role: UserRole;
  permissions: Permission[];
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}
```

**Admin Dashboard Components:**
```typescript
// app/admin/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: headers() });
  
  if (!session || !isAdmin(session.user)) {
    redirect('/dashboard');
  }
  
  return <AdminDashboard user={session.user} />;
}

// components/AdminDashboard.tsx
export default function AdminDashboard({ user }: { user: AdminUser }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <AdminHeader user={user} />
        <div className="admin-content">
          <UserManagement />
          <SystemMetrics />
          <ConfigurationPanel />
        </div>
      </main>
    </div>
  );
}
```

**Correctness Properties:**
1. **Access Control**: `∀ admin_request → user.role ∈ {admin, super_admin} ∨ access_denied`
2. **Audit Logging**: `∀ admin_action → logged_with_timestamp ∧ user_id ∧ action_details`
3. **Permission Validation**: `∀ operation → user.permissions.includes(required_permission)`

### 10. API Rate Limiting (EPIC 10) - 📋 PLANNED

#### Rate Limiting Design

**Rate Limiter Architecture:**
```typescript
// lib/rate-limiter.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

interface RateLimit {
  identifier: string; // user ID or IP
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
}

export class RateLimiter {
  async checkLimit(config: RateLimit): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const key = `rate_limit:${config.identifier}`;
    const window = Math.floor(Date.now() / config.windowMs);
    const windowKey = `${key}:${window}`;
    
    const current = await redis.incr(windowKey);
    
    if (current === 1) {
      await redis.expire(windowKey, Math.ceil(config.windowMs / 1000));
    }
    
    const allowed = current <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - current);
    const resetTime = (window + 1) * config.windowMs;
    
    return { allowed, remaining, resetTime };
  }
}
```

**Rate Limiting Middleware:**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { RateLimiter } from '@/lib/rate-limiter';

const rateLimiter = new RateLimiter();

export async function middleware(request: NextRequest) {
  // Skip rate limiting for static assets
  if (request.nextUrl.pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }
  
  const identifier = getIdentifier(request); // user ID or IP
  const limit = getRateLimit(request.nextUrl.pathname, identifier);
  
  const result = await rateLimiter.checkLimit(limit);
  
  if (!result.allowed) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': result.resetTime.toString(),
      },
    });
  }
  
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
  
  return response;
}
```

**Correctness Properties:**
1. **Rate Enforcement**: `∀ request_burst → requests_per_window ≤ configured_limit`
2. **Fair Usage**: `∀ user → rate_limit_applied_consistently`
3. **Graceful Degradation**: `∀ rate_limit_exceeded → informative_error_response`

## Testing Strategy

### Test-Driven Development Approach

**Red-Green-Refactor Cycle:**
1. **RED**: Write failing tests first
2. **GREEN**: Implement minimal code to pass tests
3. **REFACTOR**: Improve code quality while maintaining test coverage

### Testing Framework Configuration

**Unit Testing (Vitest):**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

**E2E Testing (Playwright):**
```typescript
// playwright.config.ts
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
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
});
```

### Property-Based Testing

**Testing Framework**: Fast-check for JavaScript/TypeScript

**Property Test Examples:**
```typescript
// __tests__/properties/auth.property.test.ts
import fc from 'fast-check';
import { describe, test } from 'vitest';

describe('Authentication Properties', () => {
  test('Valid sessions always grant dashboard access', () => {
    fc.assert(fc.property(
      fc.record({
        userId: fc.string({ minLength: 1 }),
        expiresAt: fc.date({ min: new Date() }), // Future date
        token: fc.string({ minLength: 32 }),
      }),
      (session) => {
        const hasAccess = checkDashboardAccess(session);
        return hasAccess === true;
      }
    ));
  });

  test('Expired sessions never grant access', () => {
    fc.assert(fc.property(
      fc.record({
        userId: fc.string({ minLength: 1 }),
        expiresAt: fc.date({ max: new Date() }), // Past date
        token: fc.string({ minLength: 32 }),
      }),
      (session) => {
        const hasAccess = checkDashboardAccess(session);
        return hasAccess === false;
      }
    ));
  });
});
```

## Correctness Properties

### Core System Properties

**Property 1.1: Database Connectivity**
- **Validates**: Requirements 1.1, 1.2, 1.6
- **Property**: `∀ connection_attempt → (valid_config → successful_connection) ∧ (invalid_config → descriptive_error)`
- **Test Strategy**: Generate various database configurations and verify connection behavior

**Property 1.2: Session Management**
- **Validates**: Requirements 3.3, 3.6, 4.7
- **Property**: `∀ session → (valid ∧ ¬expired → access_granted) ∧ (invalid ∨ expired → access_denied)`
- **Test Strategy**: Generate sessions with various validity states and expiration times

**Property 1.3: Authentication Flow**
- **Validates**: Requirements 3.1, 3.2, 3.3
- **Property**: `∀ oauth_attempt → (successful_auth → dashboard_redirect) ∧ (failed_auth → error_display)`
- **Test Strategy**: Simulate OAuth responses and verify routing behavior

**Property 1.4: Rate Limiting**
- **Validates**: Requirements 10.1, 10.2, 10.6
- **Property**: `∀ request_sequence → (within_limit → allowed) ∧ (exceeds_limit → 429_response)`
- **Test Strategy**: Generate request patterns and verify rate limiting enforcement

**Property 1.5: Payment Processing**
- **Validates**: Requirements 5.2, 5.3, 5.4
- **Property**: `∀ payment_attempt → (valid_payment → subscription_updated) ∧ (invalid_payment → error_handled)`
- **Test Strategy**: Generate payment scenarios and verify subscription state changes

**Property 1.6: Data Validation**
- **Validates**: Requirements 6.4, 12.4
- **Property**: `∀ user_input → (valid_format → accepted) ∧ (invalid_format → rejected_with_message)`
- **Test Strategy**: Generate various input formats and verify validation behavior

**Property 1.7: Access Control**
- **Validates**: Requirements 4.5, 9.1, 9.7
- **Property**: `∀ route_access → (authorized_user → access_granted) ∧ (unauthorized_user → redirect_to_auth)`
- **Test Strategy**: Generate user roles and verify route access permissions

**Property 1.8: Performance Requirements**
- **Validates**: Requirements 2.5, 13.1, 13.3
- **Property**: `∀ page_load → load_time < performance_threshold`
- **Test Strategy**: Measure page load times across different network conditions

## Implementation Guidelines

### Code Quality Standards

**TypeScript Configuration:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**ESLint Configuration:**
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Security Considerations

**Environment Variables:**
```bash
# Required for production
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_APP_URL=...
```

**Security Headers:**
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
```

## Deployment Architecture

### Production Environment

**Infrastructure Components:**
- **Application**: Next.js deployed on Vercel/AWS
- **Database**: PostgreSQL on AWS RDS or similar
- **Cache**: Redis for rate limiting and sessions
- **CDN**: CloudFront for static assets
- **Monitoring**: DataDog/New Relic for performance monitoring

**Environment Configuration:**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

This design document provides a comprehensive technical foundation for implementing the SaaS application with proper testing strategies and correctness properties. Each component is designed with testability, security, and scalability in mind.
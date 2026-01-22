/**
 * E2E Email Testing Utilities
 * 
 * Following Resend's recommendations for E2E testing with Playwright
 * https://resend.com/docs/knowledge-base/end-to-end-testing-with-playwright
 */

import { Page } from '@playwright/test';

/**
 * Resend test email addresses that don't count against quota
 * These are official Resend test addresses for E2E testing
 */
export const RESEND_TEST_EMAILS = {
  delivered: 'delivered@resend.dev',
  bounced: 'bounced@resend.dev',
  spam: 'spam@resend.dev',
} as const;

/**
 * Mock email verification API responses for server-side verification
 */
export async function mockEmailVerificationAPI(page: Page) {
  // Mock the server-side verification endpoint
  await page.route('/api/auth/verify-email*', async (route) => {
    const url = new URL(route.request().url());
    const token = url.searchParams.get('token');
    
    if (token && token !== 'invalid-token') {
      // Valid token - redirect to dashboard
      await route.fulfill({
        status: 302,
        headers: {
          location: '/dashboard'
        }
      });
    } else {
      // Invalid token - return error, page continues to load
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Invalid or expired verification token'
        }),
      });
    }
  });

  // Mock dashboard to handle redirects
  await page.route('/dashboard', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<html><body><h1>Dashboard</h1><p>Email verified successfully!</p></body></html>'
    });
  });
}

/**
 * Mock resend verification email API
 */
export async function mockResendVerificationAPI(page: Page, shouldFail = false) {
  await page.route('/api/auth/send-verification-email', async (route) => {
    if (shouldFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Failed to send verification email'
        }),
      });
    } else {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true,
          message: 'Verification email sent successfully'
        }),
      });
    }
  });
}

/**
 * Mock user session for testing - handles both server and client-side session checks
 */
export async function mockUserSession(page: Page, user: {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
}) {
  // Mock the server-side session API used by the page component
  await page.route('/api/auth/get-session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user }),
    });
  });

  // Mock the Better-Auth session endpoint that might be called
  await page.route('/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ user }),
    });
  });

  // Set session cookie
  await page.context().addCookies([
    {
      name: 'better-auth.session_token',
      value: `mock_session_${user.id}`,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * Mock sign-up API with Resend test email
 */
export async function mockSignUpAPI(page: Page) {
  await page.route('/api/auth/sign-up/email', async (route) => {
    const requestBody = await route.request().postDataJSON();
    
    // Only mock for Resend test emails
    if (Object.values(RESEND_TEST_EMAILS).includes(requestBody.email)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: `test-user-${Date.now()}`,
            email: requestBody.email,
            name: requestBody.name,
            emailVerified: false,
          },
          token: null, // No token until email is verified
        }),
      });
    } else {
      await route.continue();
    }
  });
}

/**
 * Clear browser storage safely (avoiding localStorage security errors)
 */
export async function clearBrowserStorage(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // Ignore localStorage access errors in some contexts
      console.log('Storage clear skipped due to security restrictions');
    }
  });
}

/**
 * Generate test user data with Resend test email
 */
export function generateTestUser(emailType: keyof typeof RESEND_TEST_EMAILS = 'delivered') {
  const timestamp = Date.now();
  return {
    id: `test-user-${timestamp}`,
    name: `Test User ${timestamp}`,
    email: RESEND_TEST_EMAILS[emailType],
    emailVerified: false,
  };
}
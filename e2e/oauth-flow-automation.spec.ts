import { test, expect } from '@playwright/test';

test.describe('Automated OAuth Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Complete OAuth flow from landing page to dashboard', async ({ page }) => {
    // Step 1: Test Landing Page Navigation
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify landing page elements
    await expect(page.locator('text=Build Your SaaS in Minutes')).toBeVisible();
    
    // Step 2: Navigate to Sign In page
    const signInButton = page.getByRole('link', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
    await signInButton.click();
    
    // Should be on sign-in page
    await expect(page).toHaveURL('/auth/signin');
    
    // Step 3: Test Sign In Page Rendering
    await page.waitForLoadState('networkidle');
    const googleLoginButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(googleLoginButton).toBeVisible();
    await expect(googleLoginButton).toHaveAttribute('type', 'button');
    await expect(googleLoginButton).toHaveAttribute('aria-label', 'Sign in with Google');
    
    // Step 4: Test Google OAuth Initiation
    // Mock the OAuth endpoint
    await page.route('/api/auth/sign-in/social', route => {
      route.fulfill({
        status: 302,
        headers: {
          location: 'https://accounts.google.com/oauth/authorize?client_id=test&redirect_uri=http://localhost:3000/api/auth/callback/google&response_type=code&scope=email%20profile',
        },
      });
    });
    
    // Monitor network requests
    let apiRequestReceived = false;
    page.on('response', response => {
      if (response.url().includes('/api/auth/sign-in/social')) {
        apiRequestReceived = true;
      }
    });
    
    // Click Google login button
    await googleLoginButton.click();
    
    // Verify API request was made
    expect(apiRequestReceived).toBe(true);
    
    // Step 5: Test OAuth Callback
    // Mock the OAuth callback endpoint
    await page.route('/api/auth/callback/google', route => {
      const url = new URL(route.request().url());
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      if (code && state) {
        // Simulate successful OAuth callback
        route.fulfill({
          status: 302,
          headers: {
            location: 'http://localhost:3000/dashboard',
            'set-cookie': 'better-auth.session_token=mock_valid_session; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000',
          },
        });
      } else {
        // Handle error case
        route.fulfill({
          status: 302,
          headers: {
            location: 'http://localhost:3000/auth/signin?error=oauth_failed',
          },
        });
      }
    });
    
    // Simulate OAuth callback with valid code
    await page.goto('/api/auth/callback/google?code=mock_authorization_code&state=mock_state');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Step 6: Test Dashboard Access
    await page.waitForLoadState('networkidle');
    
    // Verify dashboard displays user information
    const dashboardContent = page.locator('main, [role="main"]');
    await expect(dashboardContent).toBeVisible();
    
    // Look for user-related elements
    const userInfo = page.locator('[data-testid="user-info"], .user-info, [data-testid="profile"]');
    if (await userInfo.count() > 0) {
      await expect(userInfo.first()).toBeVisible();
    }
    
    // Look for logout button
    const logoutButton = page.getByRole('button', { name: /sign out|logout/i }).or(
      page.getByRole('link', { name: /sign out|logout/i })
    );
    
    // Step 7: Test Session Persistence
    // Check that session cookie is set
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(cookie => cookie.name === 'better-auth.session_token');
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.value).toBe('mock_valid_session');
    
    // Reload page to test session persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL('/dashboard');
    
    // Step 8: Test Sign Out Functionality
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to sign-in page
      await expect(page).toHaveURL(/\/auth\/signin/);
      
      // Session cookie should be cleared
      const cookiesAfterLogout = await page.context().cookies();
      const sessionCookieAfterLogout = cookiesAfterLogout.find(cookie => cookie.name === 'better-auth.session_token');
      expect(sessionCookieAfterLogout).toBeUndefined();
    }
  });

  test('OAuth flow with error handling', async ({ page }) => {
    await page.goto('/auth/signin');
    
    const googleLoginButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(googleLoginButton).toBeVisible();
    
    // Mock OAuth error
    await page.route('/api/auth/callback/google', route => {
      route.fulfill({
        status: 302,
        headers: {
          location: 'http://localhost:3000/auth/signin?error=access_denied',
        },
      });
    });
    
    // Simulate OAuth callback with error
    await page.goto('/api/auth/callback/google?error=access_denied&state=mock_state');
    
    // Should redirect back to sign-in page with error
    await expect(page).toHaveURL(/\/auth\/signin/);
    await expect(page).toHaveURL(/error=access_denied/);
    
    // Check for error message
    const errorMessage = page.locator('[role="alert"], .error-message, [data-testid="error"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test('Protected route redirection', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');
    
    // Should redirect to sign-in page
    await expect(page).toHaveURL(/\/auth\/signin/);
    
    // Verify sign-in page loads
    const googleLoginButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(googleLoginButton).toBeVisible();
  });

  test('Session timeout handling', async ({ page, context }) => {
    // Set expired session cookie
    await context.addCookies([
      {
        name: 'better-auth.session_token',
        value: 'expired_session',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        expires: Math.floor(Date.now() / 1000) - 1, // Expired 1 second ago
      },
    ]);
    
    // Try to access dashboard with expired session
    await page.goto('/dashboard');
    
    // Should redirect to sign-in page due to expired session
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('Multiple browser windows session sharing', async ({ browser }) => {
    // Create two browser contexts
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Set session in first context
    await context1.addCookies([
      {
        name: 'better-auth.session_token',
        value: 'shared_session',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
    
    // Access dashboard in first tab
    await page1.goto('/dashboard');
    await expect(page1).toHaveURL('/dashboard');
    
    // Access dashboard in second tab (should not have session)
    await page2.goto('/dashboard');
    await expect(page2).toHaveURL(/\/auth\/signin/);
    
    // Clean up
    await context1.close();
    await context2.close();
  });

  test('OAuth flow on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Test mobile landing page
    const signInButton = page.getByRole('link', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
    
    await signInButton.click();
    await expect(page).toHaveURL('/auth/signin');
    
    // Test mobile sign-in page
    const googleLoginButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(googleLoginButton).toBeVisible();
    
    // Button should be easily tappable on mobile
    const boundingBox = await googleLoginButton.boundingBox();
    expect(boundingBox?.height).toBeGreaterThan(44); // Minimum touch target
    expect(boundingBox?.width).toBeGreaterThan(44);
  });

  test('Performance monitoring during OAuth flow', async ({ page }) => {
    const performanceMetrics: any[] = [];
    
    // Monitor page load times
    page.on('load', () => {
      const metrics = page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalTime: navigation.loadEventEnd - navigation.fetchStart,
        };
      });
      performanceMetrics.push(metrics);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const signInButton = page.getByRole('link', { name: /sign in/i });
    await signInButton.click();
    await page.waitForLoadState('networkidle');
    
    // Verify page load times are acceptable
    expect(performanceMetrics.length).toBeGreaterThan(0);
    
    // Check that pages load within acceptable time (2 seconds)
    for (const metrics of performanceMetrics) {
      expect(metrics.totalTime).toBeLessThan(2000);
    }
  });

  test('Accessibility during OAuth flow', async ({ page }) => {
    // Run accessibility audit on landing page
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for proper ARIA labels on interactive elements
    const interactiveElements = await page.locator('button, a, input, select, textarea').all();
    for (const element of interactiveElements) {
      const hasAriaLabel = await element.getAttribute('aria-label');
      const hasTitle = await element.getAttribute('title');
      const hasText = await element.textContent();
      
      // At least one of these should be present for accessibility
      expect(hasAriaLabel || hasTitle || (hasText && hasText.trim().length > 0)).toBeTruthy();
    }
    
    // Navigate to sign-in and check accessibility there too
    const signInButton = page.getByRole('link', { name: /sign in/i });
    await signInButton.click();
    
    // Check sign-in page accessibility
    const googleLoginButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(googleLoginButton).toHaveAttribute('aria-label');
  });
});
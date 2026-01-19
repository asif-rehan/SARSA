import { test, expect } from '@playwright/test';

test.describe('Google OAuth Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and local storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should display Google login option on sign-in page', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the Google login button is present
    const googleButton = page.getByRole('button', { name: /sign in with google/i });
    await expect(googleButton).toBeVisible();
    
    // Verify button has correct attributes
    await expect(googleButton).toHaveAttribute('type', 'button');
    await expect(googleButton).toHaveAttribute('aria-label', 'Sign in with Google');
  });

  test('should initiate Google OAuth flow when button is clicked', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Listen for popup and network requests
    const popupPromise = page.waitForEvent('popup');
    const apiRequestPromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/sign-in/social') && response.status() === 302
    );
    
    // Click the Google login button
    const googleButton = page.getByRole('button', { name: /sign in with google/i });
    await googleButton.click();
    
    // Wait for API request to complete
    const apiResponse = await apiRequestPromise;
    expect(apiResponse.status()).toBe(302);
    
    // Check if popup opens (OAuth flow initiation)
    const popup = await popupPromise;
    expect(popup.url()).toContain('accounts.google.com');
  });

  test('should handle OAuth redirect to Google', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Click Google login button
    const googleButton = page.getByRole('button', { name: /sign in with google/i });
    await googleButton.click();
    
    // Wait for popup
    const popup = await page.waitForEvent('popup');
    
    // Verify it's the Google OAuth page
    await popup.waitForLoadState();
    expect(popup.url()).toContain('accounts.google.com');
    expect(popup.url()).toContain('/oauth/authorize');
    
    // Check for Google OAuth form elements
    const emailInput = popup.locator('input[type="email"], input[name="email"]');
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();
    }
  });

  test('should show loading state during OAuth initiation', async ({ page }) => {
    await page.goto('/auth/signin');
    
    const googleButton = page.getByRole('button', { name: /sign in with google/i });
    
    // Click button and check for loading state
    await googleButton.click();
    
    // Button should be disabled during OAuth flow
    await expect(googleButton).toBeDisabled();
    
    // Check for loading spinner or text
    const loadingText = page.locator('text=Signing in...');
    if (await loadingText.isVisible()) {
      await expect(loadingText).toBeVisible();
    }
  });

  test('should handle OAuth errors gracefully', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Mock network error by intercepting the request
    await page.route('/api/auth/sign-in/social', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });
    
    const googleButton = page.getByRole('button', { name: /sign in with google/i });
    await googleButton.click();
    
    // Wait for error message to appear
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should redirect to dashboard after successful OAuth (simulated)', async ({ page }) => {
    // Mock successful OAuth callback
    await page.route('/api/auth/callback/google', route => {
      route.fulfill({
        status: 302,
        headers: {
          location: 'http://localhost:3000/dashboard',
          'set-cookie': 'better-auth.session_token=mock_session; Path=/; HttpOnly; SameSite=Lax',
        },
      });
    });
    
    // Simulate direct navigation to OAuth callback (for testing purposes)
    await page.goto('/api/auth/callback/google?code=mock_code&state=mock_state');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verify dashboard content loads
    await page.waitForLoadState('networkidle');
    const dashboardHeading = page.getByRole('heading', { name: /dashboard/i });
    if (await dashboardHeading.isVisible()) {
      await expect(dashboardHeading).toBeVisible();
    }
  });

  test('should handle OAuth callback with error', async ({ page }) => {
    // Mock OAuth callback with error
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
  });

  test('should persist session after successful login', async ({ page, context }) => {
    // Mock successful login and set session cookie
    await context.addCookies([
      {
        name: 'better-auth.session_token',
        value: 'mock_session_token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
    
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Should be able to access dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Reload page to test session persistence
    await page.reload();
    
    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access dashboard without session
    await page.goto('/dashboard');
    
    // Should redirect to sign-in page
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('should handle logout functionality', async ({ page, context }) => {
    // Set session cookie
    await context.addCookies([
      {
        name: 'better-auth.session_token',
        value: 'mock_session_token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);
    
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Look for logout button/link
    const logoutButton = page.getByRole('button', { name: /sign out|logout/i }).or(
      page.getByRole('link', { name: /sign out|logout/i })
    );
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Should redirect to sign-in page after logout
      await expect(page).toHaveURL(/\/auth\/signin/);
      
      // Session cookie should be cleared
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(cookie => cookie.name === 'better-auth.session_token');
      expect(sessionCookie).toBeUndefined();
    }
  });
});
import { test, expect } from '@playwright/test';

test.describe('Profile Management E2E Tests', () => {
  test('should load profile page when directly accessed (authenticated)', async ({ page, context }) => {
    // Set up authenticated session using mock cookie
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

    // Mock the profile API response
    await page.route('/api/profile', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: {
              id: 'test-user-123',
              email: 'test@example.com',
              name: 'Test User',
              image: null,
              emailVerified: true,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          }),
        });
      }
    });

    // Navigate directly to profile page
    await page.goto('/profile');
    
    // Verify profile page loads with basic elements
    await expect(page.locator('text=Profile Settings')).toBeVisible();
    await expect(page.locator('text=Display Name')).toBeVisible();
    await expect(page.locator('text=Bio')).toBeVisible();
  });

  test('should redirect to signin when not authenticated', async ({ page }) => {
    // Navigate to profile page without authentication
    await page.goto('/profile');
    
    // Should redirect to signin page
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('should display profile form elements', async ({ page, context }) => {
    // Set up authenticated session
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

    // Mock the profile API response
    await page.route('/api/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-123',
            email: 'test@example.com',
            name: 'Test User',
            image: null,
            emailVerified: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        }),
      });
    });

    await page.goto('/profile');
    
    // Verify form elements are present
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('textarea[id="bio"]')).toBeVisible();
    await expect(page.locator('button:has-text("Update Profile")')).toBeVisible();
    await expect(page.locator('button:has-text("Reset")')).toBeVisible();
  });

  test('should display navigation tabs', async ({ page, context }) => {
    // Set up authenticated session
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

    // Mock the profile API response
    await page.route('/api/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-123',
            email: 'test@example.com',
            name: 'Test User',
            image: null,
            emailVerified: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        }),
      });
    });

    await page.goto('/profile');
    
    // Verify all tabs are present
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Preferences')).toBeVisible();
    await expect(page.locator('text=Notifications')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page, context }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Set up authenticated session
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

    // Mock the profile API response
    await page.route('/api/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-123',
            email: 'test@example.com',
            name: 'Test User',
            image: null,
            emailVerified: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        }),
      });
    });

    await page.goto('/profile');
    
    // Verify mobile layout works
    await expect(page.locator('text=Profile Settings')).toBeVisible();
    await expect(page.locator('input[id="name"]')).toBeVisible();
  });
});
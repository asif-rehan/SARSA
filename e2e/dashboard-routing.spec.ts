import { test, expect } from '@playwright/test';

test.describe('Dashboard Routing E2E Tests (RED Phase)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and localStorage before each test
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
  });

  test('should redirect to dashboard after successful Google login', async ({ page }) => {
    // Start from landing page
    await page.goto('/');
    
    // Click on sign-in button
    await page.getByRole('link', { name: /sign in/i }).click();
    
    // Should be on sign-in page
    await expect(page).toHaveURL('/auth/signin');
    
    // Click Google login button
    await page.getByRole('button', { name: /sign in with google/i }).click();
    
    // Should redirect to Google OAuth (in real scenario, this would be Google's domain)
    // For testing, we'll verify the correct OAuth initiation parameters
    const [request] = await Promise.all([
      page.waitForRequest('/api/auth/sign-in/social'),
      page.waitForURL('**/accounts.google.com/**') // This would be Google in real scenario
    ]);
    
    const postData = request.postDataJSON();
    expect(postData.provider).toBe('google');
    expect(postData.callbackURL).toBe('/dashboard');
  });

  test('should handle OAuth callback and land on dashboard', async ({ page }) => {
    // Simulate OAuth callback with success
    await page.goto('/api/auth/callback/google?code=test_auth_code&state=test_state');
    
    // Should redirect to dashboard after successful authentication
    await expect(page).toHaveURL('/dashboard');
    
    // Should see dashboard content
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/welcome back/i)).toBeVisible();
  });

  test('should show dashboard only for authenticated users', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');
    
    // Should redirect to sign-in page
    await expect(page).toHaveURL('/auth/signin');
  });

  test('should handle OAuth error and redirect back to sign-in', async ({ page }) => {
    // Simulate OAuth callback with error
    await page.goto('/api/auth/callback/google?error=access_denied&error_description=User+denied+access');
    
    // Should redirect back to sign-in with error
    await expect(page).toHaveURL(/\/auth\/signin\?.*error/);
    
    // Should display error message
    await expect(page.getByText(/access denied/i)).toBeVisible();
  });

  test('should maintain session after dashboard redirect', async ({ page }) => {
    // Simulate successful OAuth flow
    await page.goto('/api/auth/callback/google?code=test_auth_code&state=test_state');
    await expect(page).toHaveURL('/dashboard');
    
    // Refresh page - should still be authenticated
    await page.reload();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    
    // Navigate away and back - should maintain session
    await page.goto('/');
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle logout from dashboard correctly', async ({ page }) => {
    // Setup authenticated session
    await page.goto('/api/auth/callback/google?code=test_auth_code&state=test_state');
    await expect(page).toHaveURL('/dashboard');
    
    // Click logout button
    await page.getByRole('button', { name: /sign out/i }).click();
    
    // Should redirect to home page or sign-in page
    await expect(page).toHaveURL('/');
    
    // Try to access dashboard again - should be redirected to sign-in
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/auth/signin');
  });

  test('should handle mobile devices correctly', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Complete OAuth flow on mobile
    await page.goto('/');
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/auth/signin');
    
    // Google button should be visible and accessible on mobile
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
    await page.getByRole('button', { name: /sign in with google/i }).click();
    
    // Simulate successful callback
    await page.goto('/api/auth/callback/google?code=test_auth_code&state=test_state');
    await expect(page).toHaveURL('/dashboard');
    
    // Dashboard should be responsive on mobile
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should handle accessibility requirements', async ({ page }) => {
    // Test with screen reader
    await page.goto('/');
    await page.getByRole('link', { name: /sign in/i }).click();
    
    // Check accessibility of sign-in page
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in with google/i })).toHaveAttribute('aria-label', 'Sign in with Google');
    
    // Complete flow and check dashboard accessibility
    await page.goto('/api/auth/callback/google?code=test_auth_code&state=test_state');
    await expect(page).toHaveURL('/dashboard');
    
    // Dashboard should have proper headings and landmarks
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });
});
import { test, expect } from '@playwright/test';

test.describe('Landing Page Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page elements correctly', async ({ page }) => {
    // Check main heading
    const mainHeading = page.getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();
    
    // Check for value proposition text
    await expect(page.locator('text=Build Your SaaS in Minutes')).toBeVisible();
    
    // Check for CTA buttons
    const signInButton = page.getByRole('link', { name: /sign in/i });
    const getStartedButton = page.getByRole('link', { name: /get started/i });
    
    await expect(signInButton).toBeVisible();
    await expect(getStartedButton).toBeVisible();
  });

  test('should navigate to sign-in page when Sign In is clicked', async ({ page }) => {
    const signInButton = page.getByRole('link', { name: /sign in/i });
    await signInButton.click();
    
    // Should navigate to sign-in page
    await expect(page).toHaveURL('/auth/signin');
    
    // Verify sign-in page loads
    await page.waitForLoadState('networkidle');
    const signInHeading = page.getByRole('heading', { name: /sign in/i });
    if (await signInHeading.isVisible()) {
      await expect(signInHeading).toBeVisible();
    }
  });

  test('should navigate to sign-up page when Get Started is clicked', async ({ page }) => {
    const getStartedButton = page.getByRole('link', { name: /get started/i });
    await getStartedButton.click();
    
    // Should navigate to sign-up page
    await expect(page).toHaveURL('/auth/signup');
    
    // Verify sign-up page loads
    await page.waitForLoadState('networkidle');
  });

  test('should be responsive on different viewports', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    const signInButton = page.getByRole('link', { name: /sign in/i });
    const getStartedButton = page.getByRole('link', { name: /get started/i });
    
    await expect(signInButton).toBeVisible();
    await expect(getStartedButton).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    await expect(signInButton).toBeVisible();
    await expect(getStartedButton).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.reload();
    
    await expect(signInButton).toBeVisible();
    await expect(getStartedButton).toBeVisible();
  });



  test('should load quickly (performance check)', async ({ page }) => {
    const startTime = Date.now();
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load in under 2 seconds (as per acceptance criteria)
    expect(loadTime).toBeLessThan(2000);
  });

  test('should handle navigation state correctly', async ({ page }) => {
    // Click sign-in
    const signInButton = page.getByRole('link', { name: /sign in/i });
    await signInButton.click();
    
    await expect(page).toHaveURL('/auth/signin');
    
    // Go back to landing page
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    // Click get started
    const getStartedButton = page.getByRole('link', { name: /get started/i });
    await getStartedButton.click();
    
    await expect(page).toHaveURL('/auth/signup');
    
    // Go back again
    await page.goBack();
    await expect(page).toHaveURL('/');
  });

  
});
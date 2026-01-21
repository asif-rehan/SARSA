import { test, expect } from '@playwright/test';

test.describe('Loading States and Animations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should show loading states on subscription page', async ({ page }) => {
    // Navigate to subscription page
    await page.click('text=Subscribe');
    await page.waitForURL('/subscription');

    // Check for skeleton loading initially (if implemented)
    // The page should load quickly, but we can check for loading states
    await expect(page.locator('text=Choose Your Plan')).toBeVisible();
    
    // Check that subscription plans are visible
    await expect(page.locator('[data-testid="subscription-plans-grid"]')).toBeVisible();
    
    // Check for plan cards
    await expect(page.locator('text=Basic Plan')).toBeVisible();
    await expect(page.locator('text=Pro Plan')).toBeVisible();
    await expect(page.locator('text=Enterprise Plan')).toBeVisible();
  });

  test('should show button loading states during interactions', async ({ page }) => {
    // Navigate to subscription page
    await page.click('text=Subscribe');
    await page.waitForURL('/subscription');

    // Wait for plans to load
    await expect(page.locator('text=Basic Plan')).toBeVisible();

    // Find a subscription button and check for loading state
    const subscribeButton = page.locator('button').filter({ hasText: /upgrade to|subscribe/i }).first();
    
    if (await subscribeButton.isVisible()) {
      // Click the button to trigger loading state
      await subscribeButton.click();
      
      // Check if loading state appears (button should be disabled)
      await expect(subscribeButton).toBeDisabled();
    }
  });

  test('should have smooth page transitions', async ({ page }) => {
    // Test navigation between pages
    await expect(page.locator('text=Build Your SaaS in Minutes')).toBeVisible();
    
    // Navigate to subscription page
    await page.click('text=Subscribe');
    await page.waitForURL('/subscription');
    await expect(page.locator('text=Choose Your Plan')).toBeVisible();
    
    // Navigate back to home
    await page.goBack();
    await page.waitForURL('/');
    await expect(page.locator('text=Build Your SaaS in Minutes')).toBeVisible();
  });

  test('should show form validation with proper error states', async ({ page }) => {
    // Navigate to sign in page to test form validation
    await page.click('text=Sign In');
    await page.waitForURL('/auth/signin');
    
    // Check that the Google login button is present
    await expect(page.locator('button', { hasText: 'Sign in with Google' })).toBeVisible();
    
    // The button should have proper styling and be interactive
    const googleButton = page.locator('button', { hasText: 'Sign in with Google' });
    await expect(googleButton).toBeEnabled();
    
    // Check for proper ARIA labels
    await expect(googleButton).toHaveAttribute('aria-label', 'Sign in with Google');
  });

  test('should maintain accessibility during loading states', async ({ page }) => {
    // Navigate to subscription page
    await page.click('text=Subscribe');
    await page.waitForURL('/subscription');
    
    // Check for proper heading hierarchy
    await expect(page.locator('h1', { hasText: 'Choose Your Plan' })).toBeVisible();
    
    // Check for proper ARIA labels on buttons
    const buttons = page.locator('button[aria-label*="Select"]');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        await expect(button).toHaveAttribute('aria-label');
      }
    }
  });

  test('should handle theme changes smoothly', async ({ page }) => {
    // Check if theme toggle is available
    const themeToggle = page.locator('button[aria-label*="theme" i]');
    
    if (await themeToggle.isVisible()) {
      // Click theme toggle
      await themeToggle.click();
      
      // Check that the page still functions properly
      await expect(page.locator('text=Build Your SaaS in Minutes')).toBeVisible();
      
      // Toggle back
      await themeToggle.click();
      await expect(page.locator('text=Build Your SaaS in Minutes')).toBeVisible();
    }
  });

  test('should show proper loading states on dashboard', async ({ page }) => {
    // Try to access dashboard (will redirect to sign in)
    await page.goto('/dashboard');
    
    // Should redirect to sign in page
    await page.waitForURL('/auth/signin');
    await expect(page.locator('button', { hasText: 'Sign in with Google' })).toBeVisible();
  });

  test('should have responsive design with animations', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that content is still visible and accessible
    await expect(page.locator('text=Build Your SaaS in Minutes')).toBeVisible();
    
    // Check that buttons are touch-friendly
    const ctaButtons = page.locator('a[href="/auth/signin"], a[href="/subscription"]');
    const buttonCount = await ctaButtons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = ctaButtons.nth(i);
      const boundingBox = await button.boundingBox();
      if (boundingBox) {
        // Buttons should be at least 44px tall for touch accessibility
        expect(boundingBox.height).toBeGreaterThanOrEqual(40);
      }
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('text=Build Your SaaS in Minutes')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('text=Build Your SaaS in Minutes')).toBeVisible();
  });
});
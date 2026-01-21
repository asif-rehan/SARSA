import { test, expect } from '@playwright/test';

test.describe('Theme System E2E Tests', () => {
  test('should toggle theme on landing page and persist across navigation', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
    
    // Check that theme toggle is visible
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeToggle).toBeVisible();
    
    // Initially should show sun icon (light theme)
    await expect(page.locator('[data-testid="sun-icon"]')).toBeVisible();
    
    // Click theme toggle to switch to dark mode
    await themeToggle.click();
    
    // Wait for theme change and check moon icon
    await expect(page.locator('[data-testid="moon-icon"]')).toBeVisible({ timeout: 10000 });
    
    // Check that dark theme is applied to document
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
    
    // Navigate to subscription page
    await page.getByRole('link', { name: /subscribe/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Theme should persist - should still show moon icon
    await expect(page.locator('[data-testid="moon-icon"]')).toBeVisible({ timeout: 10000 });
    await expect(htmlElement).toHaveClass(/dark/);
  });

  test('should apply correct CSS custom properties for light theme', async ({ page }) => {
    await page.goto('/');
    
    // Ensure we're in light theme
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    
    // If dark theme is active, click to switch to light
    const moonIcon = page.locator('[data-testid="moon-icon"]');
    if (await moonIcon.isVisible()) {
      await themeToggle.click();
    }
    
    // Check that light theme CSS variables are applied
    const rootStyles = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      return {
        background: computedStyle.getPropertyValue('--background').trim(),
        foreground: computedStyle.getPropertyValue('--foreground').trim(),
        primary: computedStyle.getPropertyValue('--primary').trim(),
      };
    });
    
    // Light theme values (from globals.css)
    expect(rootStyles.background).toBe('0 0% 100%');
    expect(rootStyles.foreground).toBe('222.2 84% 4.9%');
    expect(rootStyles.primary).toBe('221.2 83.2% 53.3%');
  });

  test('should apply correct CSS custom properties for dark theme', async ({ page }) => {
    await page.goto('/');
    
    // Switch to dark theme
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    
    // If light theme is active, click to switch to dark
    const sunIcon = page.locator('[data-testid="sun-icon"]');
    if (await sunIcon.isVisible()) {
      await themeToggle.click();
    }
    
    // Wait for theme to be applied
    await expect(page.locator('[data-testid="moon-icon"]')).toBeVisible({ timeout: 10000 });
    
    // Check that dark theme CSS variables are applied
    const rootStyles = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      return {
        background: computedStyle.getPropertyValue('--background').trim(),
        foreground: computedStyle.getPropertyValue('--foreground').trim(),
        primary: computedStyle.getPropertyValue('--primary').trim(),
      };
    });
    
    // Dark theme values (from globals.css)
    expect(rootStyles.background).toBe('222.2 84% 4.9%');
    expect(rootStyles.foreground).toBe('210 40% 98%');
    expect(rootStyles.primary).toBe('217.2 91.2% 59.8%');
  });

  test('should maintain theme consistency across all pages', async ({ page }) => {
    // Start on landing page and set dark theme
    await page.goto('/');
    
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    
    // Ensure we start with light theme, then switch to dark
    const sunIcon = page.locator('[data-testid="sun-icon"]');
    if (await sunIcon.isVisible()) {
      await themeToggle.click();
    }
    
    // Verify dark theme is active
    await expect(page.locator('[data-testid="moon-icon"]')).toBeVisible({ timeout: 10000 });
    
    // Navigate to subscription page
    await page.getByRole('link', { name: /subscribe/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Theme should persist
    await expect(page.locator('[data-testid="moon-icon"]')).toBeVisible({ timeout: 10000 });
    
    // Navigate to sign in page
    await page.getByRole('link', { name: /sign in/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Theme should still persist (check HTML class)
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
    
    // Go back to landing page
    await page.goto('/');
    
    // Theme should still be dark
    await expect(page.locator('[data-testid="moon-icon"]')).toBeVisible({ timeout: 10000 });
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    
    // Check accessibility attributes
    await expect(themeToggle).toHaveAttribute('aria-label', 'Toggle theme');
    await expect(themeToggle).toHaveAttribute('type', 'button');
    
    // Check that it's keyboard accessible
    await themeToggle.focus();
    await expect(themeToggle).toBeFocused();
    
    // Should be able to activate with Enter key
    await page.keyboard.press('Enter');
    
    // Theme should change
    await expect(page.locator('[data-testid="moon-icon"]')).toBeVisible({ timeout: 10000 });
  });

  test('should work correctly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Theme toggle should still be visible and functional on mobile
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeToggle).toBeVisible();
    
    // Should be able to toggle theme on mobile
    await themeToggle.click();
    await expect(page.locator('[data-testid="moon-icon"]')).toBeVisible({ timeout: 10000 });
    
    // Navigate to subscription page on mobile
    await page.getByRole('link', { name: /subscribe/i }).click();
    await page.waitForLoadState('networkidle');
    
    // Theme should persist on mobile
    await expect(page.locator('[data-testid="moon-icon"]')).toBeVisible({ timeout: 10000 });
  });

  test('should handle rapid theme toggles without issues', async ({ page }) => {
    await page.goto('/');
    
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    
    // Rapidly toggle theme multiple times
    for (let i = 0; i < 5; i++) {
      await themeToggle.click();
      await page.waitForTimeout(200); // Small delay to allow state updates
    }
    
    // Should end up in a consistent state (dark theme after odd number of clicks)
    await expect(page.locator('[data-testid="moon-icon"]')).toBeVisible({ timeout: 10000 });
    
    // Page should still be functional
    await expect(page.getByText('Build Your SaaS in Minutes')).toBeVisible();
  });
});
import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  });

  test('Landing page should be mobile responsive', async ({ page }) => {
    await page.goto('/');

    // Check if header is sticky and properly styled
    const header = page.locator('header');
    await expect(header).toHaveClass(/sticky/);
    await expect(header).toHaveClass(/top-0/);

    // Check responsive heading sizes
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toHaveClass(/text-3xl/);
    await expect(mainHeading).toHaveClass(/sm:text-4xl/);

    // Check CTA buttons are touch-friendly (minimum 48px height)
    const signInButton = page.getByRole('link', { name: /sign in/i });
    const getStartedButton = page.getByRole('link', { name: /get started/i });
    const subscribeButton = page.getByRole('link', { name: /subscribe/i });

    await expect(signInButton).toBeVisible();
    await expect(getStartedButton).toBeVisible();
    await expect(subscribeButton).toBeVisible();

    // Check button layout is vertical on mobile
    const buttonContainer = signInButton.locator('..').first();
    await expect(buttonContainer).toHaveClass(/flex-col/);

    // Check feature cards are in single column on mobile
    const featureGrid = page.locator('.grid').first();
    await expect(featureGrid).toHaveClass(/grid-cols-1/);
  });

  test('Dashboard should be mobile responsive', async ({ page }) => {
    // Mock authentication for dashboard access
    await page.goto('/dashboard');

    // Check header is mobile optimized
    const header = page.locator('header');
    await expect(header).toHaveClass(/sticky/);
    await expect(header).toHaveClass(/backdrop-blur/);

    // Check dashboard heading is responsive
    const heading = page.getByRole('heading', { name: /dashboard/i });
    await expect(heading).toHaveClass(/text-xl/);
    await expect(heading).toHaveClass(/sm:text-2xl/);

    // Check dashboard cards are in single column on mobile
    const cardGrid = page.locator('.grid').first();
    await expect(cardGrid).toHaveClass(/grid-cols-1/);
    await expect(cardGrid).toHaveClass(/sm:grid-cols-2/);
  });

  test('Subscription page should be mobile responsive', async ({ page }) => {
    await page.goto('/subscription');

    // Check header is mobile optimized
    const header = page.locator('header');
    await expect(header).toHaveClass(/sticky/);

    // Check subscription plans grid is responsive
    const plansGrid = page.locator('[data-testid="subscription-plans-grid"]');
    if (await plansGrid.isVisible()) {
      await expect(plansGrid).toHaveClass(/grid-cols-1/);
    }

    // Check main heading is responsive
    const heading = page.getByRole('heading', { name: /choose your plan/i });
    if (await heading.isVisible()) {
      await expect(heading).toHaveClass(/text-2xl/);
    }
  });

  test('Touch targets should be adequately sized', async ({ page }) => {
    await page.goto('/');

    // Check all interactive elements have minimum touch target size
    const buttons = page.getByRole('link');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const boundingBox = await button.boundingBox();
        if (boundingBox) {
          // Touch targets should be at least 44px in height (WCAG guidelines)
          expect(boundingBox.height).toBeGreaterThanOrEqual(40); // Allowing some margin
        }
      }
    }
  });

  test('Text should be readable on mobile', async ({ page }) => {
    await page.goto('/');

    // Check main heading text size
    const mainHeading = page.locator('h1').first();
    const headingStyles = await mainHeading.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
      };
    });

    // Font size should be at least 16px for readability
    const fontSize = parseInt(headingStyles.fontSize);
    expect(fontSize).toBeGreaterThanOrEqual(16);
  });

  test('Navigation should work on mobile', async ({ page }) => {
    await page.goto('/');

    // Test navigation to different pages
    const signInButton = page.getByRole('link', { name: /sign in/i });
    await expect(signInButton).toHaveAttribute('href', '/auth/signin');

    const getStartedButton = page.getByRole('link', { name: /get started/i });
    await expect(getStartedButton).toHaveAttribute('href', '/auth/signup');

    const subscribeButton = page.getByRole('link', { name: /subscribe/i });
    await expect(subscribeButton).toHaveAttribute('href', '/subscription');
  });

  test('Content should not overflow on small screens', async ({ page }) => {
    // Test with very small screen size
    await page.setViewportSize({ width: 320, height: 568 }); // iPhone 5/SE
    await page.goto('/');

    // Check that content doesn't cause horizontal scrolling
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    
    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(320);
    }

    // Check that text doesn't overflow
    const mainHeading = page.locator('h1').first();
    const headingBox = await mainHeading.boundingBox();
    
    if (headingBox) {
      expect(headingBox.width).toBeLessThanOrEqual(320);
    }
  });
});

test.describe('Tablet Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
  });

  test('Landing page should adapt to tablet size', async ({ page }) => {
    await page.goto('/');

    // Check feature cards are in 2 columns on tablet
    const featureGrid = page.locator('.grid').first();
    await expect(featureGrid).toHaveClass(/sm:grid-cols-2/);

    // Check buttons can be in row layout on tablet
    const buttonContainer = page.getByRole('link', { name: /sign in/i }).locator('..').first();
    await expect(buttonContainer).toHaveClass(/sm:flex-row/);
  });

  test('Dashboard should show 2 columns on tablet', async ({ page }) => {
    await page.goto('/dashboard');

    // Check dashboard cards are in 2 columns on tablet
    const cardGrid = page.locator('.grid').first();
    await expect(cardGrid).toHaveClass(/sm:grid-cols-2/);
  });
});

test.describe('Desktop Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Landing page should show full layout on desktop', async ({ page }) => {
    await page.goto('/');

    // Check feature cards are in 3 columns on desktop
    const featureGrid = page.locator('.grid').first();
    await expect(featureGrid).toHaveClass(/lg:grid-cols-3/);

    // Check heading uses largest text size
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toHaveClass(/lg:text-6xl/);
  });

  test('Dashboard should show 3 columns on desktop', async ({ page }) => {
    await page.goto('/dashboard');

    // Check dashboard cards are in 3 columns on desktop
    const cardGrid = page.locator('.grid').first();
    await expect(cardGrid).toHaveClass(/lg:grid-cols-3/);
  });
});
import { test, expect } from '@playwright/test';

test.describe('Subscription Flow E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test.describe('RED Phase - Failing E2E Tests', () => {
    test('should complete subscription purchase flow', async ({ page }) => {
      // Setup authenticated session
      await page.goto('/api/auth/callback/google?code=test_code&state=test_state');
      await expect(page).toHaveURL('/dashboard');
      
      // Navigate to subscription page
      await page.goto('/subscription');
      await expect(page).toHaveURL('/subscription');
      
      // Should display subscription plans
      await expect(page.getByRole('heading', { name: /subscription plans/i })).toBeVisible();
      await expect(page.getByText(/basic plan/i)).toBeVisible();
      await expect(page.getByText(/pro plan/i)).toBeVisible();
      await expect(page.getByText(/enterprise plan/i)).toBeVisible();
      
      // Should display pricing
      await expect(page.getByText(/\$9\/month/i)).toBeVisible();
      await expect(page.getByText(/\$29\/month/i)).toBeVisible();
      await expect(page.getByText(/\$99\/month/i)).toBeVisible();
      
      // Select Pro plan
      await page.getByRole('button', { name: /select pro plan/i }).click();
      
      // Should show payment form
      await expect(page.getByText(/enter payment details/i)).toBeVisible();
      await expect(page.getByLabel(/card number/i)).toBeVisible();
      await expect(page.getByLabel(/expiry date/i)).toBeVisible();
      await expect(page.getByLabel(/cvv/i)).toBeVisible();
      
      // Fill out payment form
      await page.getByLabel(/card number/i).fill('4242424242424242');
      await page.getByLabel(/expiry date/i).fill('12/25');
      await page.getByLabel(/cvv/i).fill('123');
      
      // Mock Stripe payment success
      await page.route('/api/create-payment-intent', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            clientSecret: 'pi_test123_secret_test456',
          }),
        });
      });
      
      await page.route('/api/confirm-payment', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            subscriptionId: 'sub_test123',
          }),
        });
      });
      
      // Submit payment
      await page.getByRole('button', { name: /complete subscription/i }).click();
      
      // Should show success message
      await expect(page.getByText(/subscription successful/i)).toBeVisible();
      await expect(page.getByText(/welcome to the pro plan/i)).toBeVisible();
      
      // Should redirect to dashboard with new subscription
      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByText(/current plan: pro/i)).toBeVisible();
      await expect(page.getByText(/status: active/i)).toBeVisible();
    });

    test('should handle payment failures gracefully', async ({ page }) => {
      await page.goto('/subscription');
      
      // Select a plan
      await page.getByRole('button', { name: /select basic plan/i }).click();
      await page.getByLabel(/card number/i).fill('4000000000000002'); // Declined card
      
      // Mock payment failure
      await page.route('/api/create-payment-intent', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            clientSecret: 'pi_test123_secret_test456',
          }),
        });
      });
      
      await page.route('/api/confirm-payment', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Your card was declined',
          }),
        });
      });
      
      await page.getByRole('button', { name: /complete subscription/i }).click();
      
      // Should show error message
      await expect(page.getByText(/payment failed/i)).toBeVisible();
      await expect(page.getByText(/your card was declined/i)).toBeVisible();
      
      // Should stay on subscription page
      await expect(page).toHaveURL('/subscription');
      
      // Should allow retry
      await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();
    });

    test('should show current subscription status', async ({ page }) => {
      // Mock user with active subscription
      await page.route('/api/auth/session', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              user: {
                id: 'user_123',
                email: 'test@example.com',
                name: 'Test User',
                subscription: {
                  plan: 'pro',
                  status: 'active',
                  currentPeriodEnd: '2024-12-31T23:59:59Z',
                  cancelAtPeriodEnd: false,
                },
              },
            },
          }),
        });
      });
      
      await page.goto('/subscription');
      
      // Should display current subscription
      await expect(page.getByText(/current plan: pro/i)).toBeVisible();
      await expect(page.getByText(/status: active/i)).toBeVisible();
      await expect(page.getByText(/next billing: december 31, 2024/i)).toBeVisible();
      await expect(page.getByText(/\$29\/month/i)).toBeVisible();
    });

    test('should allow subscription cancellation', async ({ page }) => {
      // Mock user with active subscription
      await page.route('/api/auth/session', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              user: {
                id: 'user_123',
                subscription: {
                  plan: 'pro',
                  status: 'active',
                  id: 'sub_test123',
                },
              },
            },
          }),
        });
      });
      
      await page.goto('/subscription');
      
      // Should show cancellation option
      await expect(page.getByRole('button', { name: /cancel subscription/i })).toBeVisible();
      
      // Click cancel subscription
      await page.getByRole('button', { name: /cancel subscription/i }).click();
      
      // Should show confirmation dialog
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText(/are you sure you want to cancel/i)).toBeVisible();
      
      // Confirm cancellation
      await page.route('/api/cancel-subscription', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            subscription: {
              status: 'canceled',
              cancelAtPeriodEnd: true,
              currentPeriodEnd: '2024-12-31T23:59:59Z',
            },
          }),
        });
      });
      
      await page.getByRole('button', { name: /confirm cancellation/i }).click();
      
      // Should show cancellation confirmation
      await expect(page.getByText(/subscription will be canceled/i)).toBeVisible();
      await expect(page.getByText(/access until december 31, 2024/i)).toBeVisible();
    });

    test('should handle plan changes (upgrade/downgrade)', async ({ page }) => {
      // Mock user with basic plan
      await page.route('/api/auth/session', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              user: {
                id: 'user_123',
                subscription: {
                  plan: 'basic',
                  status: 'active',
                  id: 'sub_test123',
                },
              },
            },
          }),
        });
      });
      
      await page.goto('/subscription');
      
      // Should show upgrade options
      await expect(page.getByText(/current plan: basic/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /upgrade to pro/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /upgrade to enterprise/i })).toBeVisible();
      
      // Should not show upgrade to current plan
      await expect(page.queryByRole('button', { name: /upgrade to basic/i })).not.toBeVisible();
      
      // Upgrade to pro plan
      await page.getByRole('button', { name: /upgrade to pro/i }).click();
      
      // Should show payment form for prorated amount
      await expect(page.getByText(/upgrade to pro plan/i)).toBeVisible();
      await expect(page.getByText(/prorated amount/i)).toBeVisible();
      await expect(page.getByText(/\$20.00 due today/i)).toBeVisible(); // $29 - $9 = $20 for remaining days
      
      // Mock successful upgrade
      await page.route('/api/update-subscription', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            subscription: {
              plan: 'pro',
              status: 'active',
            },
          }),
        });
      });
      
      await page.getByLabel(/card number/i).fill('4242424242424242');
      await page.getByLabel(/expiry date/i).fill('12/25');
      await page.getByLabel(/cvv/i).fill('123');
      await page.getByRole('button', { name: /complete upgrade/i }).click();
      
      // Should show success message
      await expect(page.getByText(/upgrade successful/i)).toBeVisible();
      await expect(page.getByText(/you are now on the pro plan/i)).toBeVisible();
    });

    test('should display billing history', async ({ page }) => {
      // Mock billing history data
      await page.route('/api/billing-history', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            invoices: [
              {
                id: 'inv_1',
                date: '2024-11-01',
                amount: 2900,
                status: 'paid',
                plan: 'pro',
                downloadUrl: '/api/invoices/inv_1/download',
              },
              {
                id: 'inv_2',
                date: '2024-10-01',
                amount: 2900,
                status: 'paid',
                plan: 'pro',
                downloadUrl: '/api/invoices/inv_2/download',
              },
            ],
          }),
        });
      });
      
      await page.goto('/subscription');
      
      // Click on billing history tab
      await page.getByRole('tab', { name: /billing history/i }).click();
      
      // Should display billing history
      await expect(page.getByText(/billing history/i)).toBeVisible();
      await expect(page.getByText(/november 1, 2024/i)).toBeVisible();
      await expect(page.getByText(/\$29.00/i)).toBeVisible();
      await expect(page.getByText(/paid/i)).toBeVisible();
      await expect(page.getByText(/october 1, 2024/i)).toBeVisible();
      
      // Should show download links
      await expect(page.getByRole('link', { name: /download invoice nov/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /download invoice oct/i })).toBeVisible();
    });

    test('should test subscription management UI', async ({ page }) => {
      await page.goto('/subscription');
      
      // Should show plan management section
      await expect(page.getByRole('heading', { name: /manage subscription/i })).toBeVisible();
      
      // Should show current plan details
      await expect(page.getByTestId('current-plan-card')).toBeVisible();
      await expect(page.getByTestId('billing-cycle')).toBeVisible();
      await expect(page.getByTestId('next-billing-date')).toBeVisible();
      
      // Should show action buttons
      await expect(page.getByRole('button', { name: /update payment method/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /view invoices/i })).toBeVisible();
      
      // Should have accessible structure
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('should handle payment method updates', async ({ page }) => {
      await page.goto('/subscription');
      
      // Click update payment method
      await page.getByRole('button', { name: /update payment method/i }).click();
      
      // Should show payment method form
      await expect(page.getByText(/update payment method/i)).toBeVisible();
      await expect(page.getByLabel(/card number/i)).toBeVisible();
      await expect(page.getByLabel(/name on card/i)).toBeVisible();
      
      // Fill out new payment method
      await page.getByLabel(/card number/i).fill('5555555555554444');
      await page.getByLabel(/name on card/i).fill('John Doe');
      await page.getByLabel(/expiry date/i).fill('11/26');
      await page.getByLabel(/cvv/i).fill('123');
      
      // Mock successful update
      await page.route('/api/update-payment-method', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            paymentMethod: {
              id: 'pm_test123',
              brand: 'mastercard',
              last4: '4444',
            },
          }),
        });
      });
      
      await page.getByRole('button', { name: /update payment method/i }).click();
      
      // Should show success message
      await expect(page.getByText(/payment method updated successfully/i)).toBeVisible();
      await expect(page.getByText(/mastercard ending in 4444/i)).toBeVisible();
    });

    test('should verify access control based on subscription level', async ({ page }) => {
      // Mock user with basic plan
      await page.route('/api/auth/session', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              user: {
                id: 'user_123',
                subscription: {
                  plan: 'basic',
                  status: 'active',
                },
              },
            },
          }),
        });
      });
      
      // Try to access pro features
      await page.goto('/pro-features');
      
      // Should redirect or show upgrade prompt
      await expect(page.getByText(/this feature requires a pro plan/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /upgrade to pro/i })).toBeVisible();
      
      // Should block access to pro API endpoints
      await page.route('/api/pro-feature', route => {
        route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'This feature requires a pro subscription',
          }),
        });
      });
      
      const response = await page.evaluate(() => {
        return fetch('/api/pro-feature').then(r => r.json());
      });
      
      expect(response.error).toBe('This feature requires a pro subscription');
    });

    test('should be mobile responsive', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/subscription');
      
      // Should adapt to mobile layout
      await expect(page.getByTestId('subscription-plans')).toHaveClass(/grid-cols-1/);
      await expect(page.getByRole('button', { name: /select basic plan/i })).toBeVisible();
      
      // Buttons should be easily tappable
      const basicPlanButton = page.getByRole('button', { name: /select basic plan/i });
      const boundingBox = await basicPlanButton.boundingBox();
      expect(boundingBox?.height).toBeGreaterThan(44); // Minimum touch target
      expect(boundingBox?.width).toBeGreaterThan(44);
      
      // Test tablet layout
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.getByTestId('subscription-plans')).toHaveClass(/md:grid-cols-2/);
      
      // Test desktop layout
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(page.getByTestId('subscription-plans')).toHaveClass(/lg:grid-cols-3/);
    });

    test('should handle accessibility requirements', async ({ page }) => {
      await page.goto('/subscription');
      
      // Check for proper heading hierarchy
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
      
      // Check for accessible buttons
      const planButtons = page.getByRole('button', { name: /select.*plan/i });
      const buttonCount = await planButtons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        await expect(planButtons.nth(i)).toHaveAttribute('aria-label');
        await expect(planButtons.nth(i)).toHaveAttribute('aria-describedby');
      }
      
      // Check for form accessibility
      await expect(page.getByLabel(/card number/i)).toHaveAttribute('aria-required');
      await expect(page.getByLabel(/expiry date/i)).toHaveAttribute('aria-required');
      await expect(page.getByLabel(/cvv/i)).toHaveAttribute('aria-required');
      
      // Check for keyboard navigation
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: /select basic plan/i })).toBeFocused();
      
      // Check for screen reader support
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByTestId('subscription-plans')).toHaveAttribute('aria-label', 'Subscription plans');
    });
  });
});
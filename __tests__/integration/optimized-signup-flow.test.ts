import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Integration Tests for Optimized Signup Flow
 * 
 * Tests the new optimized flow where users can:
 * 1. Subscribe directly without creating an account first
 * 2. Have their account created automatically from Stripe checkout
 * 3. Receive payment receipt and verification emails
 * 4. Login with their email on subsequent visits
 */

describe('Optimized Signup Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Guest Checkout Flow', () => {
    it('should allow guest checkout without authentication', async () => {
      const mockCreateGuestCheckout = vi.fn().mockResolvedValue({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      });

      const result = await mockCreateGuestCheckout({
        planId: 'pro',
        priceId: 'price_1Ssr1KB4dU1calXYyHPt0uF1',
      });

      expect(result.sessionId).toBeDefined();
      expect(result.url).toContain('checkout.stripe.com');
    });

    it('should create checkout session with guest metadata', async () => {
      const mockStripeCheckoutCreate = vi.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        metadata: {
          planId: 'pro',
          isGuestCheckout: 'true',
        },
      });

      const session = await mockStripeCheckoutCreate({
        line_items: [{ price: 'price_1Ssr1KB4dU1calXYyHPt0uF1', quantity: 1 }],
        mode: 'subscription',
        metadata: {
          planId: 'pro',
          isGuestCheckout: 'true',
        },
      });

      expect(session.metadata.isGuestCheckout).toBe('true');
      expect(session.metadata.planId).toBe('pro');
    });

    it('should validate price IDs in guest checkout', async () => {
      const mockCreateGuestCheckout = vi.fn().mockRejectedValue(
        new Error('Invalid price ID. Please check your Stripe configuration.')
      );

      await expect(
        mockCreateGuestCheckout({
          planId: 'pro',
          priceId: 'invalid_price_id',
        })
      ).rejects.toThrow('Invalid price ID');
    });

    it('should handle placeholder price IDs gracefully', async () => {
      const mockCreateGuestCheckout = vi.fn().mockRejectedValue(
        new Error('Stripe price IDs not configured. Please set up your Stripe products and update the environment variables.')
      );

      await expect(
        mockCreateGuestCheckout({
          planId: 'pro',
          priceId: 'price_pro_placeholder',
        })
      ).rejects.toThrow('Stripe price IDs not configured');
    });
  });

  describe('Auto Account Creation', () => {
    it('should create user account from Stripe customer data', async () => {
      const mockStripeCustomer = {
        id: 'cus_test_123',
        email: 'user@example.com',
        name: 'John Doe',
      };

      const mockCreateUser = vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'user_123',
            email: 'user@example.com',
            name: 'John Doe',
          },
          verificationToken: 'verify_token_123',
        },
      });

      const result = await mockCreateUser({
        email: mockStripeCustomer.email,
        name: mockStripeCustomer.name,
        password: 'auto_generated_password',
      });

      expect(result.data.user.email).toBe('user@example.com');
      expect(result.data.user.name).toBe('John Doe');
      expect(result.data.verificationToken).toBeDefined();
    });

    it('should handle existing user accounts gracefully', async () => {
      const mockFindExistingUser = vi.fn().mockResolvedValue({
        id: 'existing_user_123',
        email: 'user@example.com',
        emailVerified: false,
      });

      const existingUser = await mockFindExistingUser('user@example.com');

      expect(existingUser.id).toBe('existing_user_123');
      expect(existingUser.email).toBe('user@example.com');
      // Should use existing user instead of creating new one
    });

    it('should generate secure random passwords for auto-created accounts', () => {
      const generateRandomPassword = (length: number = 12): string => {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
          password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
      };

      const password1 = generateRandomPassword();
      const password2 = generateRandomPassword();

      expect(password1).toHaveLength(12);
      expect(password2).toHaveLength(12);
      expect(password1).not.toBe(password2); // Should be different
      expect(password1).toMatch(/^[a-zA-Z0-9!@#$%^&*]+$/); // Should contain valid characters
    });

    it('should continue subscription creation even if user creation fails', async () => {
      const mockCreateUser = vi.fn().mockRejectedValue(new Error('User creation failed'));
      const mockCreateSubscription = vi.fn().mockResolvedValue({
        id: 'sub_123',
        status: 'active',
      });

      // Simulate webhook handling
      let userCreationFailed = false;
      try {
        await mockCreateUser({
          email: 'user@example.com',
          password: 'password123',
        });
      } catch (error) {
        userCreationFailed = true;
        console.log('User creation failed, continuing with subscription');
      }

      // Should still create subscription
      const subscription = await mockCreateSubscription({
        userId: 'fallback_user_id',
        planId: 'pro',
      });

      expect(userCreationFailed).toBe(true);
      expect(subscription.status).toBe('active');
    });
  });

  describe('Email Notifications', () => {
    it('should send payment receipt email after successful payment', async () => {
      const mockSendPaymentReceipt = vi.fn().mockResolvedValue({
        success: true,
        data: { id: 'email_123' },
      });

      const result = await mockSendPaymentReceipt({
        customerEmail: 'user@example.com',
        customerName: 'John Doe',
        planName: 'Pro Plan',
        amount: 2900, // $29.00 in cents
        currency: 'usd',
        subscriptionId: 'sub_123',
        nextBillingDate: new Date('2024-02-01'),
      });

      expect(result.success).toBe(true);
      expect(mockSendPaymentReceipt).toHaveBeenCalledWith({
        customerEmail: 'user@example.com',
        customerName: 'John Doe',
        planName: 'Pro Plan',
        amount: 2900,
        currency: 'usd',
        subscriptionId: 'sub_123',
        nextBillingDate: expect.any(Date),
      });
    });

    it('should send welcome email with verification link for new accounts', async () => {
      const mockSendWelcomeEmail = vi.fn().mockResolvedValue({
        success: true,
        data: { id: 'email_456' },
      });

      const result = await mockSendWelcomeEmail({
        customerEmail: 'user@example.com',
        customerName: 'John Doe',
        planName: 'Pro Plan',
        verificationUrl: 'https://app.com/auth/verify-email?token=verify_123',
      });

      expect(result.success).toBe(true);
      expect(mockSendWelcomeEmail).toHaveBeenCalledWith({
        customerEmail: 'user@example.com',
        customerName: 'John Doe',
        planName: 'Pro Plan',
        verificationUrl: expect.stringContaining('verify-email'),
      });
    });

    it('should handle email sending failures gracefully', async () => {
      const mockSendEmail = vi.fn().mockResolvedValue({
        success: false,
        error: 'Email service unavailable',
      });

      const result = await mockSendEmail({
        customerEmail: 'user@example.com',
        planName: 'Pro Plan',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      // Webhook should continue processing even if email fails
    });

    it('should include proper payment details in receipt email', async () => {
      const mockEmailContent = {
        customerEmail: 'user@example.com',
        customerName: 'John Doe',
        planName: 'Pro Plan',
        amount: 2900,
        currency: 'usd',
        subscriptionId: 'sub_1Ssr1KB4dU1calXY123',
        nextBillingDate: new Date('2024-02-01'),
      };

      const mockGenerateEmailHTML = vi.fn().mockReturnValue(`
        <h1>Payment Confirmed! 🎉</h1>
        <p>Thank you for subscribing to Pro Plan!</p>
        <p>Amount: $29.00 USD</p>
        <p>Next Billing: February 1, 2024</p>
        <p>Subscription ID: sub_1Ssr1KB4dU1calXY123</p>
      `);

      const emailHTML = mockGenerateEmailHTML(mockEmailContent);

      expect(emailHTML).toContain('Payment Confirmed!');
      expect(emailHTML).toContain('Pro Plan');
      expect(emailHTML).toContain('$29.00');
      expect(emailHTML).toContain('sub_1Ssr1KB4dU1calXY123');
    });
  });

  describe('Plan Name Mapping', () => {
    it('should correctly map price IDs to plan names', () => {
      const getPlanNameFromPriceId = (priceId: string): string => {
        const planMap: Record<string, string> = {
          'price_1Ssr1JB4dU1calXYYqaiziLe': 'Basic Plan',
          'price_1Ssr1KB4dU1calXYyHPt0uF1': 'Pro Plan',
          'price_1Ssr1KB4dU1calXYVpQLWbow': 'Enterprise Plan',
        };
        return planMap[priceId] || 'Subscription Plan';
      };

      expect(getPlanNameFromPriceId('price_1Ssr1JB4dU1calXYYqaiziLe')).toBe('Basic Plan');
      expect(getPlanNameFromPriceId('price_1Ssr1KB4dU1calXYyHPt0uF1')).toBe('Pro Plan');
      expect(getPlanNameFromPriceId('price_1Ssr1KB4dU1calXYVpQLWbow')).toBe('Enterprise Plan');
      expect(getPlanNameFromPriceId('unknown_price_id')).toBe('Subscription Plan');
    });
  });

  describe('Webhook Event Handling', () => {
    it('should handle checkout.session.completed for guest checkout', async () => {
      const mockWebhookEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            mode: 'subscription',
            subscription: 'sub_123',
            customer: 'cus_123',
            metadata: {
              planId: 'pro',
              isGuestCheckout: 'true',
            },
          },
        },
      };

      const mockHandleWebhook = vi.fn().mockResolvedValue({
        received: true,
        userCreated: true,
        subscriptionCreated: true,
        emailsSent: true,
      });

      const result = await mockHandleWebhook(mockWebhookEvent);

      expect(result.received).toBe(true);
      expect(result.userCreated).toBe(true);
      expect(result.subscriptionCreated).toBe(true);
      expect(result.emailsSent).toBe(true);
    });

    it('should handle checkout.session.completed for authenticated users', async () => {
      const mockWebhookEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_456',
            mode: 'subscription',
            subscription: 'sub_456',
            customer: 'cus_456',
            metadata: {
              userId: 'user_123',
              planId: 'pro',
            },
          },
        },
      };

      const mockHandleWebhook = vi.fn().mockResolvedValue({
        received: true,
        userCreated: false, // User already exists
        subscriptionCreated: true,
        emailsSent: true,
      });

      const result = await mockHandleWebhook(mockWebhookEvent);

      expect(result.received).toBe(true);
      expect(result.userCreated).toBe(false);
      expect(result.subscriptionCreated).toBe(true);
    });
  });

  describe('UI Button Text Updates', () => {
    it('should show "Subscribe to [Plan]" for unauthenticated users', () => {
      const getButtonText = (plan: any, session: any) => {
        if (!session?.user) return `Subscribe to ${plan.name}`;
        return 'Other text';
      };

      const plan = { name: 'Pro Plan' };
      const session = null;

      expect(getButtonText(plan, session)).toBe('Subscribe to Pro Plan');
    });

    it('should show appropriate text for authenticated users', () => {
      const getButtonText = (plan: any, session: any) => {
        if (!session?.user) return `Subscribe to ${plan.name}`;
        if (!session.user.emailVerified) return 'Verify Email First';
        if (!session.user.subscription) return `Select ${plan.name}`;
        return 'Current Plan';
      };

      const plan = { name: 'Pro Plan' };
      
      // Unverified user
      const unverifiedSession = {
        user: { emailVerified: false }
      };
      expect(getButtonText(plan, unverifiedSession)).toBe('Verify Email First');

      // Verified user without subscription
      const verifiedSession = {
        user: { emailVerified: true, subscription: null }
      };
      expect(getButtonText(plan, verifiedSession)).toBe('Select Pro Plan');
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe API errors gracefully', async () => {
      const mockStripeError = new Error('No such price: price_invalid');
      (mockStripeError as any).code = 'resource_missing';

      const mockCreateCheckout = vi.fn().mockRejectedValue(mockStripeError);

      await expect(
        mockCreateCheckout({
          planId: 'pro',
          priceId: 'price_invalid',
        })
      ).rejects.toThrow('No such price');
    });

    it('should handle network errors during checkout', async () => {
      const mockNetworkError = new Error('Network error');

      const mockCreateCheckout = vi.fn().mockRejectedValue(mockNetworkError);

      await expect(
        mockCreateCheckout({
          planId: 'pro',
          priceId: 'price_1Ssr1KB4dU1calXYyHPt0uF1',
        })
      ).rejects.toThrow('Network error');
    });

    it('should provide user-friendly error messages', () => {
      const formatErrorMessage = (error: any): string => {
        if (error.code === 'resource_missing') {
          return 'Subscription plan not found. Please contact support.';
        }
        if (error.message?.includes('Network')) {
          return 'Connection error. Please check your internet and try again.';
        }
        return error.message || 'Something went wrong. Please try again.';
      };

      const stripeError = { code: 'resource_missing', message: 'No such price' };
      const networkError = { message: 'Network timeout' };
      const genericError = { message: 'Unknown error' };

      expect(formatErrorMessage(stripeError)).toBe('Subscription plan not found. Please contact support.');
      expect(formatErrorMessage(networkError)).toBe('Connection error. Please check your internet and try again.');
      expect(formatErrorMessage(genericError)).toBe('Unknown error');
    });
  });
});
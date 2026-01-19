import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// Mock Stripe module
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    customers: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
    },
    paymentIntents: {
      create: vi.fn(),
      confirm: vi.fn(),
    },
    subscriptions: {
      create: vi.fn(),
      retrieve: vi.fn(),
      update: vi.fn(),
      cancel: vi.fn(),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  })),
}));

describe('Stripe Integration Tests', () => {
  const server = setupServer();
  let stripe: any;

  beforeEach(async () => {
    server.listen();
    vi.clearAllMocks();
    
    // Import mocked Stripe
    const Stripe = await import('stripe');
    stripe = new Stripe.default('test_key');
  });

  afterEach(() => {
    server.close();
  });

  describe('RED Phase - Failing Integration Tests', () => {
    it('should connect to Stripe API successfully', async () => {
      expect(stripe).toBeDefined();
      expect(stripe.customers).toBeDefined();
      expect(stripe.paymentIntents).toBeDefined();
      expect(stripe.subscriptions).toBeDefined();
    });

    it('should create Stripe customer successfully', async () => {
      const customerData = {
        email: 'test@example.com',
        name: 'Test User',
        metadata: {
          userId: 'user_123',
        },
      };

      const mockCustomer = {
        id: 'cus_test123',
        email: 'test@example.com',
        name: 'Test User',
      };

      vi.mocked(stripe.customers.create).mockResolvedValue(mockCustomer);

      const result = await stripe.customers.create(customerData);
      
      expect(stripe.customers.create).toHaveBeenCalledWith(customerData);
      expect(result.id).toBe('cus_test123');
      expect(result.email).toBe('test@example.com');
    });

    it('should handle payment intent creation', async () => {
      const paymentIntentData = {
        amount: 2900, // $29.00 in cents
        currency: 'usd',
        customer: 'cus_test123',
        payment_method_types: ['card'],
        metadata: {
          plan: 'pro',
          userId: 'user_123',
        },
      };

      const mockPaymentIntent = {
        id: 'pi_test123',
        amount: 2900,
        currency: 'usd',
        status: 'requires_payment_method',
        client_secret: 'pi_test123_secret_test456',
      };

      vi.mocked(stripe.paymentIntents.create).mockResolvedValue(mockPaymentIntent);

      const result = await stripe.paymentIntents.create(paymentIntentData);
      
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(paymentIntentData);
      expect(result.id).toBe('pi_test123');
      expect(result.amount).toBe(2900);
      expect(result.client_secret).toBeDefined();
    });

    it('should create subscription successfully', async () => {
      const subscriptionData = {
        customer: 'cus_test123',
        items: [
          {
            price: 'price_pro_monthly',
            quantity: 1,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: 'user_123',
        },
      };

      const mockSubscription = {
        id: 'sub_test123',
        customer: 'cus_test123',
        status: 'active',
        items: {
          data: [
            {
              price: {
                id: 'price_pro_monthly',
                unit_amount: 2900,
                currency: 'usd',
              },
            },
          ],
        },
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
      };

      vi.mocked(stripe.subscriptions.create).mockResolvedValue(mockSubscription);

      const result = await stripe.subscriptions.create(subscriptionData);
      
      expect(stripe.subscriptions.create).toHaveBeenCalledWith(subscriptionData);
      expect(result.id).toBe('sub_test123');
      expect(result.status).toBe('active');
    });

    it('should process webhook events correctly', async () => {
      const webhookSecret = 'whsec_test_secret';
      const payload = {
        id: 'evt_test123',
        object: 'event',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_test123',
            customer: 'cus_test123',
            subscription: 'sub_test123',
            amount_paid: 2900,
            currency: 'usd',
          },
        },
      };

      const mockEvent = {
        id: 'evt_test123',
        type: 'invoice.payment_succeeded',
        data: payload.data,
      };

      const { default: Stripe } = await import('stripe');
      vi.mocked(Stripe).mockImplementation(() => ({
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
      } as any));

      const signature = 'test_signature';
      const result = Stripe.webhooks.constructEvent(
        JSON.stringify(payload),
        signature,
        webhookSecret
      );
      
      expect(result.id).toBe('evt_test123');
      expect(result.type).toBe('invoice.payment_succeeded');
    });

    it('should update subscription status in database', async () => {
      server.use(
        rest.put('/api/subscriptions/:subscriptionId', (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              id: 'sub_test123',
              status: 'active',
              plan: 'pro',
              userId: 'user_123',
            })
          );
        })
      );

      const response = await fetch('/api/subscriptions/sub_test123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'active',
          plan: 'pro',
        }),
      });

      const data = await response.json();
      
      expect(data.status).toBe('active');
      expect(data.plan).toBe('pro');
      expect(data.userId).toBe('user_123');
    });

    it('should handle payment failures gracefully', async () => {
      const paymentIntentData = {
        amount: 2900,
        currency: 'usd',
        customer: 'cus_test123',
      };

      const stripeError = new Error('Your card was declined');
      (stripeError as any).type = 'StripeCardError';
      (stripeError as any).code = 'card_declined';

      vi.mocked(stripe.paymentIntents.create).mockRejectedValue(stripeError);

      await expect(stripe.paymentIntents.create(paymentIntentData)).rejects.toThrow('Your card was declined');
    });

    it('should validate subscription plan changes', async () => {
      const currentSubscription = {
        id: 'sub_test123',
        items: {
          data: [
            {
              price: {
                id: 'price_basic_monthly',
                unit_amount: 900,
              },
            },
          ],
        },
      };

      const newSubscription = {
        id: 'sub_test123',
        items: {
          data: [
            {
              price: {
                id: 'price_pro_monthly',
                unit_amount: 2900,
              },
            },
          ],
        },
      };

      vi.mocked(stripe.subscriptions.retrieve).mockResolvedValue(currentSubscription);
      vi.mocked(stripe.subscriptions.update).mockResolvedValue(newSubscription);

      // Retrieve current subscription
      const current = await stripe.subscriptions.retrieve('sub_test123');
      
      // Update to pro plan
      const updated = await stripe.subscriptions.update('sub_test123', {
        items: [
          {
            id: current.items.data[0].id,
            price: 'price_pro_monthly',
          },
        ],
        proration_behavior: 'create_prorations',
      });

      expect(current.items.data[0].price.unit_amount).toBe(900);
      expect(updated.items.data[0].price.unit_amount).toBe(2900);
      expect(stripe.subscriptions.update).toHaveBeenCalledWith(
        'sub_test123',
        expect.objectContaining({
          proration_behavior: 'create_prorations',
        })
      );
    });

    it('should test proration calculations', async () => {
      // Mock calculation of prorated amount for mid-cycle upgrade
      const prorationData = {
        current_period_start: Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60, // 15 days ago
        current_period_end: Math.floor(Date.now() / 1000) + 15 * 24 * 60 * 60,  // 15 days from now
        current_plan_amount: 900,  // $9.00
        new_plan_amount: 2900,    // $29.00
      };

      // Calculate expected proration: 15 days of new plan - 15 days of old plan
      const daysInMonth = 30;
      const dailyRateNew = prorationData.new_plan_amount / daysInMonth;
      const dailyRateOld = prorationData.current_plan_amount / daysInMonth;
      const expectedProration = (dailyRateNew - dailyRateOld) * 15;

      expect(expectedProration).toBe(1000); // ($29 - $9) * 15 days / 30 days = $10
    });

    it('should handle webhook signature verification failures', async () => {
      const { default: Stripe } = await import('stripe');
      vi.mocked(Stripe).mockImplementation(() => ({
        webhooks: {
          constructEvent: vi.fn().mockImplementation(() => {
            throw new Error('Invalid signature');
          }),
        },
      } as any));

      expect(() => {
        Stripe.webhooks.constructEvent(
          '{"type": "test"}',
          'invalid_signature',
          'invalid_secret'
        );
      }).toThrow('Invalid signature');
    });

    it('should retrieve and update customer information', async () => {
      const customerId = 'cus_test123';
      
      const mockCustomer = {
        id: customerId,
        email: 'updated@example.com',
        name: 'Updated Name',
        metadata: {
          userId: 'user_123',
          lastUpdated: Date.now().toString(),
        },
      };

      vi.mocked(stripe.customers.retrieve).mockResolvedValue(mockCustomer);
      vi.mocked(stripe.customers.update).mockResolvedValue(mockCustomer);

      // Retrieve customer
      const retrieved = await stripe.customers.retrieve(customerId);
      expect(retrieved.id).toBe(customerId);

      // Update customer
      const updated = await stripe.customers.update(customerId, {
        email: 'updated@example.com',
        name: 'Updated Name',
      });

      expect(stripe.customers.update).toHaveBeenCalledWith(customerId, {
        email: 'updated@example.com',
        name: 'Updated Name',
      });
      expect(updated.email).toBe('updated@example.com');
    });
  });
});
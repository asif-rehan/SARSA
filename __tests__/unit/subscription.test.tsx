import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Elements } from '@stripe/react-stripe-js';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';

// Mock Stripe
const mockStripe = {
  confirmPayment: vi.fn(),
  elements: vi.fn(() => ({
    getElement: vi.fn(() => ({})), // Mock card element
  })),
  redirectToCheckout: vi.fn(),
};

const mockElements = {
  getElement: vi.fn(() => ({})), // Mock card element
};

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(mockStripe as any)),
}));

vi.mock('@stripe/react-stripe-js', async () => {
  const actual = await vi.importActual('@stripe/react-stripe-js');
  return {
    ...actual,
    useStripe: vi.fn(() => mockStripe),
    useElements: vi.fn(() => mockElements),
    Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CardElement: () => <div data-testid="card-element">Card Element</div>,
  };
});

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn(),
  },
}));

describe('Subscription Plans Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RED Phase - Failing Tests', () => {
    it('should render available subscription plans', () => {
      render(<SubscriptionPlans />);
      
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
    });

    it('should display pricing information for each plan', () => {
      render(<SubscriptionPlans />);
      
      expect(screen.getByText(/\$9\/month/i)).toBeInTheDocument();
      expect(screen.getByText(/\$29\/month/i)).toBeInTheDocument();
      expect(screen.getByText(/\$99\/month/i)).toBeInTheDocument();
    });

    it('should handle plan selection correctly', async () => {
      render(<SubscriptionPlans />);
      
      const proPlanButton = screen.getByRole('button', { name: /select pro plan/i });
      await fireEvent.click(proPlanButton);
      
      // Should show payment form or redirect to checkout
      await waitFor(() => {
        expect(screen.getByText(/enter payment details/i)).toBeInTheDocument();
      });
    });

    it('should validate payment form inputs', async () => {
      // Create a fresh mock without confirmPayment to trigger validation
      const mockStripeNoPayment = {
        elements: vi.fn(() => ({
          getElement: vi.fn(() => ({})),
        })),
      };

      // Override the mock for this specific test
      vi.mocked(require('@stripe/react-stripe-js').useStripe).mockReturnValue(mockStripeNoPayment);

      render(<SubscriptionPlans />);
      
      // First select a plan to show the payment form
      const proPlanButton = screen.getByRole('button', { name: /select pro plan/i });
      await fireEvent.click(proPlanButton);
      
      // Wait for payment form to appear
      await waitFor(() => {
        expect(screen.getByText(/enter payment details/i)).toBeInTheDocument();
      });
      
      const submitButton = screen.getByRole('button', { name: /complete subscription/i });
      await fireEvent.click(submitButton);
      
      // Should show validation errors for empty fields
      await waitFor(() => {
        expect(screen.getByText('Card number is required')).toBeInTheDocument();
        expect(screen.getByText('Expiry date is required')).toBeInTheDocument();
        expect(screen.getByText('CVV is required')).toBeInTheDocument();
      });
    });

    it('should display current subscription status', async () => {
      const mockSession = {
        data: {
          user: {
            subscription: {
              plan: 'pro',
              status: 'active',
              currentPeriodEnd: '2024-12-31',
            },
          },
        },
      };

      const { authClient } = await import('@/lib/auth-client');
      vi.mocked(authClient.getSession).mockResolvedValue(mockSession);

      render(<SubscriptionPlans />);
      
      await waitFor(() => {
        expect(screen.getByText(/Current Plan:/)).toBeInTheDocument();
        expect(screen.getByText('pro')).toBeInTheDocument();
        expect(screen.getByText(/Status:/)).toBeInTheDocument();
        expect(screen.getByText('active')).toBeInTheDocument();
        expect(screen.getByText(/Next Billing:/)).toBeInTheDocument();
        expect(screen.getByText('December 31, 2024')).toBeInTheDocument();
      });
    });

    it('should show upgrade/downgrade options based on current plan', async () => {
      // Mock no current subscription (user not logged in or no subscription)
      const { authClient } = await import('@/lib/auth-client');
      vi.mocked(authClient.getSession).mockResolvedValue(null);

      render(<SubscriptionPlans />);
      
      await waitFor(() => {
        expect(screen.getByText('Subscription Plans')).toBeInTheDocument();
      });

      // Without a current subscription, all plans should show as "Upgrade to X Plan"
      expect(screen.getByText('Upgrade to Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Upgrade to Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('Upgrade to Enterprise Plan')).toBeInTheDocument();
    });

    it('should show billing history section', async () => {
      const mockInvoices = [
        {
          id: 'inv_1',
          date: '2024-11-01',
          amount: 29,
          status: 'paid',
        },
        {
          id: 'inv_2',
          date: '2024-10-01',
          amount: 29,
          status: 'paid',
        },
      ];

      // Mock API call for billing history
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ invoices: mockInvoices }),
      });

      render(<SubscriptionPlans />);
      
      await waitFor(() => {
        expect(screen.getByText('Billing History')).toBeInTheDocument();
        expect(screen.getByText('$29.00 - November 1, 2024')).toBeInTheDocument();
        expect(screen.getByText('$29.00 - October 1, 2024')).toBeInTheDocument();
      });
    });

    it('should handle payment processing errors gracefully', async () => {
      // Mock Stripe to reject payment
      mockStripe.confirmPayment.mockRejectedValue(new Error('Payment failed'));

      render(<SubscriptionPlans />);
      
      // First select a plan to show the payment form
      const proPlanButton = screen.getByRole('button', { name: /select pro plan/i });
      await fireEvent.click(proPlanButton);
      
      // Wait for payment form to appear
      await waitFor(() => {
        expect(screen.getByText(/enter payment details/i)).toBeInTheDocument();
      });
      
      // Clear validation errors first by resetting the form state
      const submitButton = screen.getByRole('button', { name: /complete subscription/i });
      
      // Mock successful validation by clearing errors
      vi.clearAllMocks();
      mockStripe.confirmPayment.mockRejectedValue(new Error('Payment failed'));
      
      await fireEvent.click(submitButton);
      
      // The error should appear after payment fails
      await waitFor(() => {
        expect(screen.getByText('Payment failed. Please try again.')).toBeInTheDocument();
      });
    });

    it('should be accessible with proper ARIA attributes', () => {
      render(<SubscriptionPlans />);
      
      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 2, name: /subscription plans/i })).toBeInTheDocument();
      
      // Check for accessible buttons
      const planButtons = screen.getAllByRole('button', { name: /select.*plan/i });
      planButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
        expect(button).toHaveAttribute('aria-describedby');
      });
      
      // Check for form accessibility (hidden form elements)
      const cardNumberInput = screen.getByLabelText('Card Number');
      const expiryInput = screen.getByLabelText('Expiry Date');
      const cvvInput = screen.getByLabelText('CVV');
      
      expect(cardNumberInput).toHaveAttribute('aria-required', 'true');
      expect(cardNumberInput).toHaveAttribute('aria-invalid', 'false');
      expect(expiryInput).toHaveAttribute('aria-required', 'true');
      expect(expiryInput).toHaveAttribute('aria-invalid', 'false');
      expect(cvvInput).toHaveAttribute('aria-required', 'true');
      expect(cvvInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('should be responsive on different screen sizes', () => {
      render(<SubscriptionPlans />);
      
      // Should render correctly on mobile
      const subscriptionGrid = screen.getByTestId('subscription-plans-grid');
      expect(subscriptionGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });
});
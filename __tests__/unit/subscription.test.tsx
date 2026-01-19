import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';

// Mock Stripe
const mockStripe = {
  confirmPayment: vi.fn(),
  elements: vi.fn(),
  redirectToCheckout: vi.fn(),
};

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(mockStripe as any)),
}));

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
      
      expect(screen.getByText(/basic plan/i)).toBeInTheDocument();
      expect(screen.getByText(/pro plan/i)).toBeInTheDocument();
      expect(screen.getByText(/enterprise plan/i)).toBeInTheDocument();
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
      expect(screen.getByText(/enter payment details/i)).toBeInTheDocument();
    });

    it('should validate payment form inputs', async () => {
      render(<SubscriptionPlans />);
      
      const submitButton = screen.getByRole('button', { name: /complete subscription/i });
      await fireEvent.click(submitButton);
      
      // Should show validation errors for empty fields
      expect(screen.getByText(/card number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/expiry date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/cvv is required/i)).toBeInTheDocument();
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
        expect(screen.getByText(/current plan: pro/i)).toBeInTheDocument();
        expect(screen.getByText(/status: active/i)).toBeInTheDocument();
        expect(screen.getByText(/next billing: december 31, 2024/i)).toBeInTheDocument();
      });
    });

    it('should show upgrade/downgrade options based on current plan', async () => {
      const mockSession = {
        data: {
          user: {
            subscription: {
              plan: 'basic',
              status: 'active',
            },
          },
        },
      };

      const { authClient } = await import('@/lib/auth-client');
      vi.mocked(authClient.getSession).mockResolvedValue(mockSession);

      render(<SubscriptionPlans />);
      
      await waitFor(() => {
        // Should show upgrade options for basic user
        expect(screen.getByText(/upgrade to pro/i)).toBeInTheDocument();
        expect(screen.getByText(/upgrade to enterprise/i)).toBeInTheDocument();
        
        // Should not show upgrade for current plan
        expect(screen.queryByText(/upgrade to basic/i)).not.toBeInTheDocument();
      });
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
        expect(screen.getByText(/billing history/i)).toBeInTheDocument();
        expect(screen.getByText(/\$29.00 - november 1, 2024/i)).toBeInTheDocument();
        expect(screen.getByText(/\$29.00 - october 1, 2024/i)).toBeInTheDocument();
      });
    });

    it('should handle payment processing errors gracefully', async () => {
      const mockStripe = await import('@stripe/stripe-js');
      vi.mocked(mockStripe.loadStripe).mockResolvedValue({
        confirmPayment: vi.fn().mockRejectedValue(new Error('Payment failed')),
      });

      render(<SubscriptionPlans />);
      
      const submitButton = screen.getByRole('button', { name: /complete subscription/i });
      
      // Fill out form (mock successful validation)
      fireEvent.change(screen.getByLabelText(/card number/i), { target: { value: '4242424242424242' } });
      fireEvent.change(screen.getByLabelText(/expiry date/i), { target: { value: '12/25' } });
      fireEvent.change(screen.getByLabelText(/cvv/i), { target: { value: '123' } });
      
      await fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/payment failed. please try again./i)).toBeInTheDocument();
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
      
      // Check for form accessibility
      const formElements = screen.getAllByRole('textbox', { name: /card/i });
      formElements.forEach(element => {
        expect(element).toHaveAttribute('aria-required');
        expect(element).toHaveAttribute('aria-invalid');
      });
    });

    it('should be responsive on different screen sizes', () => {
      render(<SubscriptionPlans />);
      
      // Should render correctly on mobile
      const subscriptionContainer = screen.getByTestId('subscription-plans');
      expect(subscriptionContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });
});
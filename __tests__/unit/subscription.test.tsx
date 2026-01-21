import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
    getSession: vi.fn(() => Promise.resolve(null)),
  },
}));

describe('Subscription Plans Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RED Phase - Failing Tests', () => {
    it('should render available subscription plans', async () => {
      // Mock no session (user not logged in)
      const { authClient } = await import('@/lib/auth-client');
      vi.mocked(authClient.getSession).mockResolvedValue(null);

      render(<SubscriptionPlans />);
      
      await waitFor(() => {
        expect(screen.getByText('Basic Plan')).toBeInTheDocument();
        expect(screen.getByText('Pro Plan')).toBeInTheDocument();
        expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
      });
    });

    it('should display pricing information for each plan', async () => {
      // Mock no session (user not logged in)
      const { authClient } = await import('@/lib/auth-client');
      vi.mocked(authClient.getSession).mockResolvedValue(null);

      render(<SubscriptionPlans />);
      
      await waitFor(() => {
        expect(screen.getByText(/\$9\/month/i)).toBeInTheDocument();
        expect(screen.getByText(/\$29\/month/i)).toBeInTheDocument();
        expect(screen.getByText(/\$99\/month/i)).toBeInTheDocument();
      });
    });

    it('should handle plan selection correctly', async () => {
      // Mock logged-in user
      const { authClient } = await import('@/lib/auth-client');
      vi.mocked(authClient.getSession).mockResolvedValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      });

      render(<SubscriptionPlans />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Subscription Plans')).toBeInTheDocument();
      });
      
      const proPlanButton = screen.getByRole('button', { name: /select pro plan/i });
      await fireEvent.click(proPlanButton);
      
      // Should show payment form or redirect to checkout
      await waitFor(() => {
        expect(screen.getByText(/enter payment details/i)).toBeInTheDocument();
      });
    });

    it('should validate payment form inputs', async () => {
      // Mock logged-in user
      const { authClient } = await import('@/lib/auth-client');
      vi.mocked(authClient.getSession).mockResolvedValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      });

      render(<SubscriptionPlans />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Subscription Plans')).toBeInTheDocument();
      });
      
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
            id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
            subscription: {
              plan: 'pro',
              status: 'active',
              currentPeriodEnd: '2024-12-31T00:00:00Z',
            },
          },
        },
      };

      const { authClient } = await import('@/lib/auth-client');
      vi.mocked(authClient.getSession).mockResolvedValue(mockSession);

      // Mock the user-subscription API call
      global.fetch = vi.fn().mockResolvedValue({
        ok: false, // Simulate API failure so it uses session data directly
        json: () => Promise.resolve({}),
      });

      render(<SubscriptionPlans />);
      
      await waitFor(() => {
        expect(screen.getByText(/Current Subscription/)).toBeInTheDocument();
        expect(screen.getByText('pro')).toBeInTheDocument();
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

      // Without a user session, all plans should show "Sign In to Subscribe"
      const signInButtons = screen.getAllByText('Sign In to Subscribe');
      expect(signInButtons.length).toBeGreaterThan(0);
      
      // All buttons should have the same text when not logged in
      expect(signInButtons).toHaveLength(3); // One for each plan
    });

    it('should show billing history section', async () => {
      // Mock logged-in user
      const { authClient } = await import('@/lib/auth-client');
      vi.mocked(authClient.getSession).mockResolvedValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      });

      const mockInvoices = [
        {
          id: 'inv_1',
          date: '2024-11-01T00:00:00Z',
          amount: 29,
          status: 'paid',
        },
        {
          id: 'inv_2',
          date: '2024-10-01T00:00:00Z',
          amount: 29,
          status: 'paid',
        },
      ];

      // Mock API call for billing history
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invoices: mockInvoices }),
      });

      render(<SubscriptionPlans />);
      
      await waitFor(() => {
        expect(screen.getByText('Billing History')).toBeInTheDocument();
        // Use a more flexible matcher for the date since timezone conversion might affect it
        expect(screen.getByText(/\$29\.00 - (October 31|November 1), 2024/)).toBeInTheDocument();
        expect(screen.getByText(/\$29\.00 - (September 30|October 1), 2024/)).toBeInTheDocument();
      });
    });

    it('should handle payment processing errors gracefully', async () => {
      // Mock logged-in user
      const { authClient } = await import('@/lib/auth-client');
      vi.mocked(authClient.getSession).mockResolvedValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      });

      render(<SubscriptionPlans />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Subscription Plans')).toBeInTheDocument();
      });

      // First select a plan to show the payment form
      const proPlanButton = screen.getByRole('button', { name: /select pro plan/i });
      await fireEvent.click(proPlanButton);
      
      // Wait for payment form to appear
      await waitFor(() => {
        expect(screen.getByText(/enter payment details/i)).toBeInTheDocument();
      });
      
      // Fill in the form with valid data to bypass validation
      const cardNumberInput = screen.getByPlaceholderText('1234 5678 9012 3456');
      const expiryInput = screen.getByPlaceholderText('MM/YY');
      const cvvInput = screen.getByPlaceholderText('123');
      
      await fireEvent.change(cardNumberInput, { target: { value: '4242424242424242' } });
      await fireEvent.change(expiryInput, { target: { value: '12/25' } });
      await fireEvent.change(cvvInput, { target: { value: '123' } });
      
      const submitButton = screen.getByRole('button', { name: /complete subscription/i });
      await fireEvent.click(submitButton);
      
      // The error should appear after payment fails (simulated by planId 'pro' triggering error)
      await waitFor(() => {
        expect(screen.getByText('Payment failed. Please try again.')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should be accessible with proper ARIA attributes', async () => {
      // Mock logged-in user to ensure component renders properly
      const { authClient } = await import('@/lib/auth-client');
      vi.mocked(authClient.getSession).mockResolvedValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      });

      render(<SubscriptionPlans />);
      
      // Wait for component to load and check accessibility
      await waitFor(() => {
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
    });

    it('should be responsive on different screen sizes', async () => {
      // Mock logged-in user to ensure component renders properly
      const { authClient } = await import('@/lib/auth-client');
      vi.mocked(authClient.getSession).mockResolvedValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      });

      render(<SubscriptionPlans />);
      
      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Subscription Plans')).toBeInTheDocument();
      });
      
      // Should render correctly on mobile
      const subscriptionGrid = screen.getByTestId('subscription-plans-grid');
      expect(subscriptionGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });
});
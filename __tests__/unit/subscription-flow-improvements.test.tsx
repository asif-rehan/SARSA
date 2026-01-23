import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn(),
  },
}));

import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { authClient } from '@/lib/auth-client';

// Get the mocked functions
const mockAuthClient = authClient as any;

describe('Subscription Flow Improvements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Debug Information Removal', () => {
    it('should not display debug information section', async () => {
      const mockSession = {
        data: {
          user: {
            id: 'user-1',
            email: 'user@test.com',
            name: 'Test User',
            emailVerified: true,
            subscription: {
              plan: 'pro',
              status: 'active',
              currentPeriodEnd: '2024-02-15T00:00:00Z',
            },
          },
        },
      };

      mockAuthClient.getSession.mockResolvedValue(mockSession);

      render(<SubscriptionPlans />);

      await waitFor(() => {
        expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
      });

      // Should NOT display debug information
      expect(screen.queryByText('Debug Info')).not.toBeInTheDocument();
      expect(screen.queryByText(/JSON\.stringify/)).not.toBeInTheDocument();
      expect(screen.queryByText(/subscription.*:/)).not.toBeInTheDocument();
    });

    it('should not display raw JSON subscription data', async () => {
      const mockSession = {
        data: {
          user: {
            id: 'user-1',
            email: 'user@test.com',
            name: 'Test User',
            emailVerified: true,
            subscription: {
              plan: 'basic',
              status: 'active',
              currentPeriodEnd: '2024-02-15T00:00:00Z',
              stripeSubscriptionId: 'sub_123456789',
            },
          },
        },
      };

      mockAuthClient.getSession.mockResolvedValue(mockSession);

      render(<SubscriptionPlans />);

      await waitFor(() => {
        expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
      });

      // Should NOT display raw JSON or technical data
      expect(screen.queryByText('sub_123456789')).not.toBeInTheDocument();
      expect(screen.queryByText(/\{.*\}/)).not.toBeInTheDocument();
      expect(screen.queryByText('stripeSubscriptionId')).not.toBeInTheDocument();
    });
  });

  describe('Current Subscription Display', () => {
    it('should display current subscription section when user has subscription', async () => {
      const mockSession = {
        data: {
          user: {
            id: 'user-1',
            email: 'user@test.com',
            name: 'Test User',
            emailVerified: true,
            subscription: {
              plan: 'pro',
              status: 'active',
              currentPeriodEnd: '2024-02-15T00:00:00Z',
            },
          },
        },
      };

      mockAuthClient.getSession.mockResolvedValue(mockSession);

      render(<SubscriptionPlans />);

      await waitFor(() => {
        expect(screen.getByText('Current Subscription')).toBeInTheDocument();
      });

      // Should display clean subscription information
      expect(screen.getByText('Current Subscription')).toBeInTheDocument();
      expect(screen.getAllByText('Pro Plan')).toHaveLength(2); // One in current subscription, one in plan card
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText(/February 15, 2024/)).toBeInTheDocument();
    });

    it('should not display current subscription section when user has no subscription', async () => {
      const mockSession = {
        data: {
          user: {
            id: 'user-1',
            email: 'user@test.com',
            name: 'Test User',
            emailVerified: true,
            // No subscription
          },
        },
      };

      mockAuthClient.getSession.mockResolvedValue(mockSession);

      render(<SubscriptionPlans />);

      await waitFor(() => {
        expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
      });

      // Should NOT display current subscription section
      expect(screen.queryByText('Current Subscription')).not.toBeInTheDocument();
    });
  });
});
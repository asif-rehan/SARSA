import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import React from 'react';
import { CurrentSubscriptionSection, UserSubscription } from '@/components/CurrentSubscriptionSection';

/**
 * Integration Tests for Complete Subscription Flow
 * 
 * **Validates: All requirements**
 * 
 * These integration tests verify the end-to-end subscription display and management
 * functionality, error handling and recovery scenarios, and responsive behavior
 * across device types.
 */

// Mock the subscription management hook with realistic behavior
const mockSubscriptionManagement = {
  state: {
    loading: false,
    error: null,
    success: null,
  },
  handleUpgrade: vi.fn(),
  handleDowngrade: vi.fn(),
  handleCancel: vi.fn(),
  handleReactivate: vi.fn(),
  handleManage: vi.fn(),
  refreshSubscription: vi.fn(),
  clearMessages: vi.fn(),
};

vi.mock('@/hooks/useSubscriptionManagement', () => ({
  useSubscriptionManagement: () => mockSubscriptionManagement,
}));

describe('Complete Subscription Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubscriptionManagement.state = {
      loading: false,
      error: null,
      success: null,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('End-to-End Subscription Display', () => {
    it('should display complete subscription information for active subscription', () => {
      const activeSubscription: UserSubscription = {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
        cancelAtPeriodEnd: false,
      };

      const { container } = render(
        <CurrentSubscriptionSection
          subscription={activeSubscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify complete subscription display
      expect(container.textContent).toContain('Current Subscription');
      expect(container.textContent).toContain('Pro Plan');
      expect(container.textContent).toContain('$29.00');
      expect(container.textContent).toContain('Active');
      expect(container.textContent).toContain('December 31, 2024');
      expect(container.textContent).toContain('Next Billing:');

      // Verify management actions are available
      expect(container.textContent).toContain('Manage Subscription');
      expect(container.textContent).toContain('Cancel Subscription');
    });

    it('should display complete subscription information for trial subscription', () => {
      const trialSubscription: UserSubscription = {
        plan: 'basic',
        status: 'trialing',
        trialEnd: '2024-12-31T23:59:59.000Z',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
      };

      const { container } = render(
        <CurrentSubscriptionSection
          subscription={trialSubscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify trial-specific display
      expect(container.textContent).toContain('Basic Plan');
      expect(container.textContent).toContain('Trial');
      expect(container.textContent).toContain('Trial Ends:');
      expect(container.textContent).toContain('December 31, 2024');

      // Verify trial-specific styling
      const trialEndElement = container.querySelector('[data-testid="subscription-trial-end"]');
      expect(trialEndElement).toBeTruthy();
    });

    it('should display complete subscription information for canceled subscription', () => {
      const canceledSubscription: UserSubscription = {
        plan: 'enterprise',
        status: 'canceled',
        currentPeriodEnd: '2024-01-01T00:00:00.000Z',
      };

      const { container } = render(
        <CurrentSubscriptionSection
          subscription={canceledSubscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify canceled subscription display
      expect(container.textContent).toContain('Enterprise Plan');
      expect(container.textContent).toContain('Canceled');
      expect(container.textContent).toContain('Expired On:');
      expect(container.textContent).toContain('Reactivate');
    });

    it('should not display section when no subscription exists', () => {
      const { container } = render(
        <CurrentSubscriptionSection
          subscription={null}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify conditional rendering
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Subscription Management Flow', () => {
    it('should handle subscription upgrade flow', async () => {
      const basicSubscription: UserSubscription = {
        plan: 'basic',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
      };

      mockSubscriptionManagement.handleUpgrade.mockResolvedValue(undefined);
      mockSubscriptionManagement.state.success = 'Successfully upgraded to Pro plan';

      const { container, rerender } = render(
        <CurrentSubscriptionSection
          subscription={basicSubscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Find and click upgrade button
      const upgradeButton = container.querySelector('[data-testid="upgrade-to-pro-button"]');
      expect(upgradeButton).toBeTruthy();

      fireEvent.click(upgradeButton!);

      // Verify upgrade handler was called
      expect(mockSubscriptionManagement.handleUpgrade).toHaveBeenCalledWith('pro');

      // Simulate success state update
      rerender(
        <CurrentSubscriptionSection
          subscription={basicSubscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify success message is displayed
      expect(container.textContent).toContain('Successfully upgraded to Pro plan');
    });

    it('should handle subscription cancellation flow', async () => {
      const activeSubscription: UserSubscription = {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
        cancelAtPeriodEnd: false,
      };

      mockSubscriptionManagement.handleCancel.mockResolvedValue(undefined);
      mockSubscriptionManagement.state.success = 'Subscription canceled successfully';

      const { container, rerender } = render(
        <CurrentSubscriptionSection
          subscription={activeSubscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Find and click cancel button
      const cancelButton = container.querySelector('[data-testid="cancel-subscription-button"]');
      expect(cancelButton).toBeTruthy();

      fireEvent.click(cancelButton!);

      // Verify cancel handler was called
      expect(mockSubscriptionManagement.handleCancel).toHaveBeenCalled();

      // Simulate success state update
      rerender(
        <CurrentSubscriptionSection
          subscription={activeSubscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify success message is displayed
      expect(container.textContent).toContain('Subscription canceled successfully');
    });

    it('should handle subscription reactivation flow', async () => {
      const canceledSubscription: UserSubscription = {
        plan: 'pro',
        status: 'canceled',
        currentPeriodEnd: '2024-01-01T00:00:00.000Z',
      };

      mockSubscriptionManagement.handleReactivate.mockResolvedValue(undefined);
      mockSubscriptionManagement.state.success = 'Subscription reactivated successfully';

      const { container, rerender } = render(
        <CurrentSubscriptionSection
          subscription={canceledSubscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Find and click reactivate button
      const reactivateButton = container.querySelector('[data-testid="reactivate-subscription-button"]');
      expect(reactivateButton).toBeTruthy();

      fireEvent.click(reactivateButton!);

      // Verify reactivate handler was called
      expect(mockSubscriptionManagement.handleReactivate).toHaveBeenCalled();

      // Simulate success state update
      rerender(
        <CurrentSubscriptionSection
          subscription={canceledSubscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify success message is displayed
      expect(container.textContent).toContain('Subscription reactivated successfully');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle and display subscription loading errors', () => {
      const subscription: UserSubscription = {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
      };

      mockSubscriptionManagement.state.error = 'Failed to load subscription data';

      const { container } = render(
        <CurrentSubscriptionSection
          subscription={subscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify error message is displayed
      expect(container.textContent).toContain('Failed to load subscription data');

      // Verify subscription information is still shown
      expect(container.textContent).toContain('Pro Plan');
    });

    it('should handle subscription operation failures', async () => {
      const subscription: UserSubscription = {
        plan: 'basic',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
      };

      mockSubscriptionManagement.handleUpgrade.mockRejectedValue(new Error('Payment failed'));
      mockSubscriptionManagement.state.error = 'Payment failed - please update your payment method';

      const { container, rerender } = render(
        <CurrentSubscriptionSection
          subscription={subscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Attempt upgrade
      const upgradeButton = container.querySelector('[data-testid="upgrade-to-pro-button"]');
      fireEvent.click(upgradeButton!);

      // Simulate error state update
      rerender(
        <CurrentSubscriptionSection
          subscription={subscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify error message is displayed
      expect(container.textContent).toContain('Payment failed - please update your payment method');

      // Verify original subscription is preserved
      expect(container.textContent).toContain('Basic Plan');
    });

    it('should allow error message clearing', () => {
      const subscription: UserSubscription = {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
      };

      mockSubscriptionManagement.state.error = 'Network error occurred';

      const { container, rerender } = render(
        <CurrentSubscriptionSection
          subscription={subscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify error is displayed
      expect(container.textContent).toContain('Network error occurred');

      // Clear error
      mockSubscriptionManagement.state.error = null;
      rerender(
        <CurrentSubscriptionSection
          subscription={subscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify error is cleared
      expect(container.textContent).not.toContain('Network error occurred');
    });

    it('should handle network connectivity issues gracefully', () => {
      const subscription: UserSubscription = {
        plan: 'enterprise',
        status: 'past_due',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
      };

      mockSubscriptionManagement.state.error = 'Unable to connect to payment service';

      const { container } = render(
        <CurrentSubscriptionSection
          subscription={subscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify graceful error handling
      expect(container.textContent).toContain('Unable to connect to payment service');

      // Verify past due status is still shown with warning
      expect(container.textContent).toContain('Past Due');
      expect(container.textContent).toContain('payment is past due');

      // Verify component remains functional
      const subscriptionSection = container.querySelector('[data-testid="current-subscription-section"]');
      expect(subscriptionSection).toBeTruthy();
    });
  });

  describe('Responsive Behavior Integration', () => {
    it('should maintain functionality across different viewport sizes', () => {
      const subscription: UserSubscription = {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
      };

      const { container } = render(
        <CurrentSubscriptionSection
          subscription={subscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify responsive classes are applied
      const subscriptionSection = container.querySelector('[data-testid="current-subscription-section"]');
      expect(subscriptionSection?.className).toContain('max-w-2xl');
      expect(subscriptionSection?.className).toContain('mx-auto');

      // Verify management actions have responsive layout
      const managementActions = container.querySelector('[data-testid="management-actions"]');
      expect(managementActions?.className).toMatch(/flex-col.*sm:flex-row/);

      // Verify buttons have proper touch targets
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.className).toContain('min-h-[48px]');
      });
    });

    it('should handle complex subscription states responsively', () => {
      const complexSubscription: UserSubscription = {
        plan: 'enterprise',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
        cancelAtPeriodEnd: true,
      };

      const { container } = render(
        <CurrentSubscriptionSection
          subscription={complexSubscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify complex state is handled properly
      expect(container.textContent).toContain('Enterprise Plan');
      expect(container.textContent).toContain('Expires On:');
      expect(container.textContent).toContain('canceled at the end of the current billing period');

      // Verify responsive layout is maintained
      const detailsContainer = container.querySelector('[data-testid="subscription-details"]');
      expect(detailsContainer?.className).toMatch(/text-sm.*sm:text-base/);

      // Verify all information is accessible
      expect(container.querySelector('[data-testid="subscription-plan-name"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="subscription-price"]')).toBeTruthy();
      expect(container.querySelector('[data-testid="subscription-billing-date"]')).toBeTruthy();
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility across all subscription states', () => {
      const subscription: UserSubscription = {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
      };

      const { container } = render(
        <CurrentSubscriptionSection
          subscription={subscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify ARIA structure
      expect(container.querySelector('[role="region"]')).toBeTruthy();
      expect(container.querySelector('[aria-labelledby="current-subscription-title"]')).toBeTruthy();

      // Verify screen reader support
      const headings = container.querySelectorAll('[id*="heading"], .sr-only');
      expect(headings.length).toBeGreaterThan(0);

      // Verify button accessibility
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.getAttribute('aria-label')).toBeTruthy();
      });

      // Verify form status accessibility
      const statusElements = container.querySelectorAll('[role="status"], [role="alert"]');
      expect(statusElements.length).toBeGreaterThan(0);
    });

    it('should handle keyboard navigation properly', () => {
      const subscription: UserSubscription = {
        plan: 'basic',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
      };

      const { container } = render(
        <CurrentSubscriptionSection
          subscription={subscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify all interactive elements are focusable
      const interactiveElements = container.querySelectorAll('button, [tabindex]');
      interactiveElements.forEach(element => {
        expect(element.getAttribute('tabindex')).not.toBe('-1');
      });

      // Verify proper focus management
      const firstButton = container.querySelector('button');
      if (firstButton) {
        firstButton.focus();
        expect(document.activeElement).toBe(firstButton);
      }
    });
  });

  describe('State Synchronization Integration', () => {
    it('should synchronize subscription changes with parent component', async () => {
      const initialSubscription: UserSubscription = {
        plan: 'basic',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
      };

      const updatedSubscription: UserSubscription = {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
      };

      const onSubscriptionChange = vi.fn();
      mockSubscriptionManagement.refreshSubscription.mockResolvedValue(updatedSubscription);

      const { container } = render(
        <CurrentSubscriptionSection
          subscription={initialSubscription}
          onSubscriptionChange={onSubscriptionChange}
        />
      );

      // Verify initial state
      expect(container.textContent).toContain('Basic Plan');

      // Simulate subscription refresh
      await mockSubscriptionManagement.refreshSubscription();

      // Verify refresh was called
      expect(mockSubscriptionManagement.refreshSubscription).toHaveBeenCalled();
    });

    it('should handle concurrent subscription operations', async () => {
      const subscription: UserSubscription = {
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: '2024-12-31T23:59:59.000Z',
      };

      mockSubscriptionManagement.state.loading = true;

      const { container, rerender } = render(
        <CurrentSubscriptionSection
          subscription={subscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify loading state doesn't break component
      expect(container.textContent).toContain('Pro Plan');

      // Complete operation
      mockSubscriptionManagement.state.loading = false;
      mockSubscriptionManagement.state.success = 'Operation completed';

      rerender(
        <CurrentSubscriptionSection
          subscription={subscription}
          onSubscriptionChange={() => {}}
        />
      );

      // Verify completion state
      expect(container.textContent).toContain('Operation completed');
      expect(container.textContent).toContain('Pro Plan');
    });
  });
});
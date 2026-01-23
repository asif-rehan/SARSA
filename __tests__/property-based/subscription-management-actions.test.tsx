import { describe, it, expect, vi, beforeEach } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import { ManagementActions, ManagementActionsProps } from '@/components/ManagementActions';
import { UserSubscription, SubscriptionStatus } from '@/components/CurrentSubscriptionSection';

/**
 * Property-Based Tests for Subscription Management Actions Availability
 * 
 * Feature: subscription-flow-improvement, Property 4: Subscription Management Actions Availability
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 * 
 * These tests verify that appropriate management actions (manage, cancel, upgrade/downgrade options)
 * are available with clear action descriptions for different subscription states.
 */

describe('Property 4: Subscription Management Actions Availability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Manage Subscription Button Availability (Requirement 3.1)', () => {
    it('should provide a "Manage Subscription" button when onManage callback is provided for any subscription state', () => {
      fc.assert(
        fc.property(
          fc.record({
            plan: fc.constantFrom('basic', 'pro', 'enterprise') as fc.Arbitrary<'basic' | 'pro' | 'enterprise'>,
            status: fc.constantFrom(
              'active', 'trialing', 'past_due', 'canceled', 
              'unpaid', 'incomplete', 'incomplete_expired'
            ) as fc.Arbitrary<SubscriptionStatus>,
            currentPeriodEnd: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }).map(d => d.toISOString()),
            cancelAtPeriodEnd: fc.boolean(),
          }),
          (data) => {
            const subscription: UserSubscription = {
              plan: data.plan,
              status: data.status,
              currentPeriodEnd: data.currentPeriodEnd,
              cancelAtPeriodEnd: data.cancelAtPeriodEnd,
            };

            const mockOnManage = vi.fn();

            const { container } = render(
              <ManagementActions
                subscription={subscription}
                onManage={mockOnManage}
              />
            );

            // Property: Manage Subscription button should be available when onManage is provided
            const manageButton = container.querySelector('[data-testid="manage-subscription-button"]');
            expect(manageButton).toBeTruthy();
            
            // Property: Button should have clear action description
            expect(manageButton?.textContent).toBe('Manage Subscription');
            
            // Property: Button should have proper accessibility attributes
            const ariaLabel = manageButton?.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel).toContain('subscription management');
            
            // Property: Button should be functional
            expect(manageButton?.tagName).toBe('BUTTON');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should not display manage button when onManage callback is not provided for any subscription state', () => {
      fc.assert(
        fc.property(
          fc.record({
            plan: fc.constantFrom('basic', 'pro', 'enterprise') as fc.Arbitrary<'basic' | 'pro' | 'enterprise'>,
            status: fc.constantFrom(
              'active', 'trialing', 'past_due', 'canceled'
            ) as fc.Arbitrary<SubscriptionStatus>,
          }),
          (data) => {
            const subscription: UserSubscription = {
              plan: data.plan,
              status: data.status,
              currentPeriodEnd: '2024-12-31T23:59:59.000Z',
            };

            const { container } = render(
              <ManagementActions
                subscription={subscription}
                // No onManage callback provided
              />
            );

            // Property: Manage button should not be present when callback is not provided
            const manageButton = container.querySelector('[data-testid="manage-subscription-button"]');
            expect(manageButton).toBeNull();
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Cancel Subscription Options (Requirement 3.2)', () => {
    it('should provide cancel options for active and trialing subscriptions when onCancel is provided', () => {
      fc.assert(
        fc.property(
          fc.record({
            plan: fc.constantFrom('basic', 'pro', 'enterprise') as fc.Arbitrary<'basic' | 'pro' | 'enterprise'>,
            status: fc.constantFrom('active', 'trialing') as fc.Arbitrary<SubscriptionStatus>,
            cancelAtPeriodEnd: fc.constant(false), // Not already set to cancel
          }),
          (data) => {
            const subscription: UserSubscription = {
              plan: data.plan,
              status: data.status,
              currentPeriodEnd: '2024-12-31T23:59:59.000Z',
              cancelAtPeriodEnd: data.cancelAtPeriodEnd,
            };

            const mockOnCancel = vi.fn();

            const { container } = render(
              <ManagementActions
                subscription={subscription}
                onCancel={mockOnCancel}
              />
            );

            // Property: Cancel button should be available for active/trialing subscriptions
            const cancelButton = container.querySelector('[data-testid="cancel-subscription-button"]');
            expect(cancelButton).toBeTruthy();
            
            // Property: Button should have clear action description
            expect(cancelButton?.textContent).toBe('Cancel Subscription');
            
            // Property: Button should clearly indicate what the action will do
            const ariaLabel = cancelButton?.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel).toContain('Cancel your current subscription');
            expect(ariaLabel).toContain('retain access until');
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should provide reactivate options for canceled subscriptions or subscriptions set to cancel', () => {
      fc.assert(
        fc.property(
          fc.record({
            plan: fc.constantFrom('basic', 'pro', 'enterprise') as fc.Arbitrary<'basic' | 'pro' | 'enterprise'>,
            scenario: fc.constantFrom(
              'canceled_status',
              'cancel_at_period_end',
              'past_due',
              'unpaid'
            ),
          }),
          (data) => {
            let subscription: UserSubscription;
            
            switch (data.scenario) {
              case 'canceled_status':
                subscription = {
                  plan: data.plan,
                  status: 'canceled',
                  currentPeriodEnd: '2024-12-31T23:59:59.000Z',
                };
                break;
              case 'cancel_at_period_end':
                subscription = {
                  plan: data.plan,
                  status: 'active',
                  currentPeriodEnd: '2024-12-31T23:59:59.000Z',
                  cancelAtPeriodEnd: true,
                };
                break;
              case 'past_due':
                subscription = {
                  plan: data.plan,
                  status: 'past_due',
                  currentPeriodEnd: '2024-12-31T23:59:59.000Z',
                };
                break;
              case 'unpaid':
                subscription = {
                  plan: data.plan,
                  status: 'unpaid',
                  currentPeriodEnd: '2024-12-31T23:59:59.000Z',
                };
                break;
            }

            const mockOnReactivate = vi.fn();

            const { container } = render(
              <ManagementActions
                subscription={subscription}
                onReactivate={mockOnReactivate}
              />
            );

            // Property: Reactivate button should be available for appropriate subscription states
            const reactivateButton = container.querySelector('[data-testid="reactivate-subscription-button"]');
            expect(reactivateButton).toBeTruthy();
            
            // Property: Button should have clear action description
            expect(reactivateButton?.textContent).toBe('Reactivate Subscription');
            
            // Property: Button should clearly indicate what the action will do
            const ariaLabel = reactivateButton?.getAttribute('aria-label');
            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel).toContain('Reactivate your');
            expect(ariaLabel).toContain('restore access');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  describe('Plan Upgrade and Downgrade Options (Requirement 3.3)', () => {
    it('should allow plan upgrades for active subscriptions when higher tier plans are available', () => {
      fc.assert(
        fc.property(
          fc.record({
            currentPlan: fc.constantFrom('basic', 'pro') as fc.Arbitrary<'basic' | 'pro'>, // Plans that can be upgraded
            status: fc.constantFrom('active', 'trialing') as fc.Arbitrary<SubscriptionStatus>,
          }),
          (data) => {
            const subscription: UserSubscription = {
              plan: data.currentPlan,
              status: data.status,
              currentPeriodEnd: '2024-12-31T23:59:59.000Z',
            };

            const mockOnUpgrade = vi.fn();

            const { container } = render(
              <ManagementActions
                subscription={subscription}
                onUpgrade={mockOnUpgrade}
              />
            );

            // Property: Upgrade options should be available for plans with higher tiers
            const upgradeButtons = container.querySelectorAll('[data-testid*="upgrade-to-"]');
            expect(upgradeButtons.length).toBeGreaterThan(0);
            
            // Property: Upgrade buttons should have clear action descriptions
            upgradeButtons.forEach((button) => {
              expect(button.textContent).toMatch(/^Upgrade to (Pro|Enterprise)$/);
              
              const ariaLabel = button.getAttribute('aria-label');
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel).toContain('Upgrade to');
              expect(ariaLabel).toContain('plan for additional features');
            });

            // Property: Should only show upgrades to higher tier plans
            if (data.currentPlan === 'basic') {
              // Basic can upgrade to Pro and Enterprise
              expect(upgradeButtons.length).toBeGreaterThanOrEqual(1);
              const upgradeTexts = Array.from(upgradeButtons).map(btn => btn.textContent);
              expect(upgradeTexts.some(text => text?.includes('Pro'))).toBe(true);
            } else if (data.currentPlan === 'pro') {
              // Pro can upgrade to Enterprise
              expect(upgradeButtons.length).toBeGreaterThanOrEqual(1);
              const upgradeTexts = Array.from(upgradeButtons).map(btn => btn.textContent);
              expect(upgradeTexts.some(text => text?.includes('Enterprise'))).toBe(true);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should allow plan downgrades for active subscriptions when lower tier plans are available', () => {
      fc.assert(
        fc.property(
          fc.record({
            currentPlan: fc.constantFrom('pro', 'enterprise') as fc.Arbitrary<'pro' | 'enterprise'>, // Plans that can be downgraded
            status: fc.constantFrom('active', 'trialing') as fc.Arbitrary<SubscriptionStatus>,
          }),
          (data) => {
            const subscription: UserSubscription = {
              plan: data.currentPlan,
              status: data.status,
              currentPeriodEnd: '2024-12-31T23:59:59.000Z',
            };

            const mockOnDowngrade = vi.fn();

            const { container } = render(
              <ManagementActions
                subscription={subscription}
                onDowngrade={mockOnDowngrade}
              />
            );

            // Property: Downgrade options should be available for plans with lower tiers
            const downgradeButtons = container.querySelectorAll('[data-testid*="downgrade-to-"]');
            expect(downgradeButtons.length).toBeGreaterThan(0);
            
            // Property: Downgrade buttons should have clear action descriptions
            downgradeButtons.forEach((button) => {
              expect(button.textContent).toMatch(/^Downgrade to (Basic|Pro)$/);
              
              const ariaLabel = button.getAttribute('aria-label');
              expect(ariaLabel).toBeTruthy();
              expect(ariaLabel).toContain('Downgrade to');
              expect(ariaLabel).toContain('plan to reduce costs');
            });

            // Property: Should only show downgrades to lower tier plans
            if (data.currentPlan === 'enterprise') {
              // Enterprise can downgrade to Pro and Basic
              expect(downgradeButtons.length).toBeGreaterThanOrEqual(1);
              const downgradeTexts = Array.from(downgradeButtons).map(btn => btn.textContent);
              expect(downgradeTexts.some(text => text?.includes('Pro') || text?.includes('Basic'))).toBe(true);
            } else if (data.currentPlan === 'pro') {
              // Pro can downgrade to Basic
              expect(downgradeButtons.length).toBeGreaterThanOrEqual(1);
              const downgradeTexts = Array.from(downgradeButtons).map(btn => btn.textContent);
              expect(downgradeTexts.some(text => text?.includes('Basic'))).toBe(true);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should not show upgrade options for enterprise plan (highest tier)', () => {
      fc.assert(
        fc.property(
          fc.record({
            status: fc.constantFrom('active', 'trialing') as fc.Arbitrary<SubscriptionStatus>,
          }),
          (data) => {
            const subscription: UserSubscription = {
              plan: 'enterprise',
              status: data.status,
              currentPeriodEnd: '2024-12-31T23:59:59.000Z',
            };

            const mockOnUpgrade = vi.fn();

            const { container } = render(
              <ManagementActions
                subscription={subscription}
                onUpgrade={mockOnUpgrade}
              />
            );

            // Property: No upgrade options should be available for the highest tier plan
            const upgradeButtons = container.querySelectorAll('[data-testid*="upgrade-to-"]');
            expect(upgradeButtons.length).toBe(0);
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should not show downgrade options for basic plan (lowest tier)', () => {
      fc.assert(
        fc.property(
          fc.record({
            status: fc.constantFrom('active', 'trialing') as fc.Arbitrary<SubscriptionStatus>,
          }),
          (data) => {
            const subscription: UserSubscription = {
              plan: 'basic',
              status: data.status,
              currentPeriodEnd: '2024-12-31T23:59:59.000Z',
            };

            const mockOnDowngrade = vi.fn();

            const { container } = render(
              <ManagementActions
                subscription={subscription}
                onDowngrade={mockOnDowngrade}
              />
            );

            // Property: No downgrade options should be available for the lowest tier plan
            const downgradeButtons = container.querySelectorAll('[data-testid*="downgrade-to-"]');
            expect(downgradeButtons.length).toBe(0);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Clear Action Descriptions (Requirement 3.4)', () => {
    it('should clearly indicate what each management action will do for any subscription state', () => {
      fc.assert(
        fc.property(
          fc.record({
            plan: fc.constantFrom('basic', 'pro', 'enterprise') as fc.Arbitrary<'basic' | 'pro' | 'enterprise'>,
            status: fc.constantFrom('active', 'trialing', 'canceled', 'past_due') as fc.Arbitrary<SubscriptionStatus>,
            cancelAtPeriodEnd: fc.boolean(),
          }),
          (data) => {
            const subscription: UserSubscription = {
              plan: data.plan,
              status: data.status,
              currentPeriodEnd: '2024-12-31T23:59:59.000Z',
              cancelAtPeriodEnd: data.cancelAtPeriodEnd,
            };

            const mockCallbacks = {
              onManage: vi.fn(),
              onCancel: vi.fn(),
              onReactivate: vi.fn(),
              onUpgrade: vi.fn(),
              onDowngrade: vi.fn(),
            };

            const { container } = render(
              <ManagementActions
                subscription={subscription}
                {...mockCallbacks}
              />
            );

            // Property: All visible buttons should have clear, descriptive text
            const allButtons = container.querySelectorAll('button');
            allButtons.forEach((button) => {
              const buttonText = button.textContent || '';
              const ariaLabel = button.getAttribute('aria-label') || '';
              
              // Property: Button text should be descriptive and action-oriented
              expect(buttonText.length).toBeGreaterThan(0);
              expect(buttonText).toMatch(/^(Manage|Cancel|Reactivate|Upgrade|Downgrade)/);
              
              // Property: Aria labels should provide additional context about what the action will do
              expect(ariaLabel.length).toBeGreaterThan(buttonText.length);
              
              // Property: Action descriptions should be specific to the action type
              if (buttonText.includes('Cancel')) {
                expect(ariaLabel).toContain('retain access until');
              } else if (buttonText.includes('Reactivate')) {
                expect(ariaLabel).toContain('restore access');
              } else if (buttonText.includes('Upgrade')) {
                expect(ariaLabel).toContain('additional features');
              } else if (buttonText.includes('Downgrade')) {
                expect(ariaLabel).toContain('reduce costs');
              } else if (buttonText.includes('Manage')) {
                expect(ariaLabel).toContain('subscription management');
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide appropriate no-actions message when no management actions are available', () => {
      fc.assert(
        fc.property(
          fc.record({
            plan: fc.constantFrom('basic', 'pro', 'enterprise') as fc.Arbitrary<'basic' | 'pro' | 'enterprise'>,
            status: fc.constantFrom('incomplete', 'incomplete_expired') as fc.Arbitrary<SubscriptionStatus>,
          }),
          (data) => {
            const subscription: UserSubscription = {
              plan: data.plan,
              status: data.status,
              currentPeriodEnd: '2024-12-31T23:59:59.000Z',
            };

            // Don't provide any callback functions
            const { container } = render(
              <ManagementActions
                subscription={subscription}
              />
            );

            // Property: Should show clear message when no actions are available
            const noActionsMessage = container.querySelector('[data-testid="no-actions-message"]');
            expect(noActionsMessage).toBeTruthy();
            
            // Property: Message should be clear and informative
            expect(noActionsMessage?.textContent).toContain('No management actions available');
            
            // Property: Message should have proper accessibility attributes
            expect(noActionsMessage?.getAttribute('role')).toBe('status');
            expect(noActionsMessage?.getAttribute('aria-live')).toBe('polite');
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('Comprehensive Management Actions Properties', () => {
    it('should provide appropriate actions based on subscription status for any valid subscription state', () => {
      fc.assert(
        fc.property(
          fc.record({
            plan: fc.constantFrom('basic', 'pro', 'enterprise') as fc.Arbitrary<'basic' | 'pro' | 'enterprise'>,
            status: fc.constantFrom(
              'active', 'trialing', 'past_due', 'canceled', 
              'unpaid', 'incomplete', 'incomplete_expired'
            ) as fc.Arbitrary<SubscriptionStatus>,
            cancelAtPeriodEnd: fc.boolean(),
          }),
          (data) => {
            const subscription: UserSubscription = {
              plan: data.plan,
              status: data.status,
              currentPeriodEnd: '2024-12-31T23:59:59.000Z',
              cancelAtPeriodEnd: data.cancelAtPeriodEnd,
            };

            const mockCallbacks = {
              onManage: vi.fn(),
              onCancel: vi.fn(),
              onReactivate: vi.fn(),
              onUpgrade: vi.fn(),
              onDowngrade: vi.fn(),
            };

            const { container } = render(
              <ManagementActions
                subscription={subscription}
                {...mockCallbacks}
              />
            );

            // Property: Actions should be appropriate for the subscription status
            const cancelButton = container.querySelector('[data-testid="cancel-subscription-button"]');
            const reactivateButton = container.querySelector('[data-testid="reactivate-subscription-button"]');
            const upgradeButtons = container.querySelectorAll('[data-testid*="upgrade-to-"]');
            const downgradeButtons = container.querySelectorAll('[data-testid*="downgrade-to-"]');

            if (data.status === 'active' || data.status === 'trialing') {
              if (!data.cancelAtPeriodEnd) {
                // Should show cancel option for active subscriptions not set to cancel
                expect(cancelButton).toBeTruthy();
                expect(reactivateButton).toBeNull();
              } else {
                // Should show reactivate option for subscriptions set to cancel at period end
                expect(reactivateButton).toBeTruthy();
                expect(cancelButton).toBeNull();
              }
              
              // Should show upgrade/downgrade options for active subscriptions
              if (data.plan !== 'enterprise') {
                expect(upgradeButtons.length).toBeGreaterThan(0);
              }
              if (data.plan !== 'basic') {
                expect(downgradeButtons.length).toBeGreaterThan(0);
              }
            } else if (data.status === 'canceled' || data.status === 'past_due' || data.status === 'unpaid') {
              // Should show reactivate option for problematic statuses
              expect(reactivateButton).toBeTruthy();
              expect(cancelButton).toBeNull();
            } else if (data.status === 'incomplete' || data.status === 'incomplete_expired') {
              // Should not show cancel/reactivate for incomplete subscriptions
              expect(cancelButton).toBeNull();
              expect(reactivateButton).toBeNull();
            }

            // Property: Manage button should always be available when callback is provided
            const manageButton = container.querySelector('[data-testid="manage-subscription-button"]');
            expect(manageButton).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure all management actions meet accessibility requirements for any subscription configuration', () => {
      fc.assert(
        fc.property(
          fc.record({
            plan: fc.constantFrom('basic', 'pro', 'enterprise') as fc.Arbitrary<'basic' | 'pro' | 'enterprise'>,
            status: fc.constantFrom('active', 'trialing', 'canceled') as fc.Arbitrary<SubscriptionStatus>,
          }),
          (data) => {
            const subscription: UserSubscription = {
              plan: data.plan,
              status: data.status,
              currentPeriodEnd: '2024-12-31T23:59:59.000Z',
            };

            const mockCallbacks = {
              onManage: vi.fn(),
              onCancel: vi.fn(),
              onReactivate: vi.fn(),
              onUpgrade: vi.fn(),
              onDowngrade: vi.fn(),
            };

            const { container } = render(
              <ManagementActions
                subscription={subscription}
                {...mockCallbacks}
              />
            );

            // Property: All buttons should meet minimum touch target size (48px)
            const allButtons = container.querySelectorAll('button');
            allButtons.forEach((button) => {
              // Should have minimum height class set (48px requirement)
              expect(button.className).toContain('min-h-[48px]');
            });

            // Property: Management actions container should have proper ARIA structure
            const actionsContainer = container.querySelector('[data-testid="management-actions"]');
            expect(actionsContainer?.getAttribute('role')).toBe('group');
            expect(actionsContainer?.getAttribute('aria-labelledby')).toBe('management-actions-heading');

            // Property: Should have screen reader accessible heading (if present)
            const heading = container.querySelector('#management-actions-heading');
            if (heading) {
              expect(heading.className).toContain('sr-only');
            } else {
              // If heading is not found, at least the container should have proper ARIA
              expect(actionsContainer?.getAttribute('aria-labelledby')).toBeTruthy();
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
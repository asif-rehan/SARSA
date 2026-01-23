import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import React from 'react';
import { SubscriptionDetails } from '@/components/SubscriptionDetails';
import { StatusBadge } from '@/components/StatusBadge';
import { ManagementActions } from '@/components/ManagementActions';
import { SubscriptionStatus, UserSubscription } from '@/components/CurrentSubscriptionSection';

/**
 * Property-Based Tests for Status-Appropriate Content Display
 * 
 * Feature: subscription-flow-improvement, Property 8: Status-Appropriate Content Display
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4**
 * 
 * These tests verify that subscription displays show status-appropriate content
 * and available actions for all subscription statuses, ensuring proper state handling.
 */

describe('Property 8: Status-Appropriate Content Display', () => {
  describe('Active Subscription Content (Requirement 7.1)', () => {
    it('should display renewal information and management options for active subscriptions', () => {
      fc.assert(
        fc.property(
          fc.record({
            planName: fc.constantFrom('basic', 'pro', 'enterprise'),
            price: fc.float({ min: Math.fround(1), max: Math.fround(199), noNaN: true }),
            nextBillingDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())).map(d => d.toISOString()),
            cancelAtPeriodEnd: fc.boolean(),
          }),
          (data) => {
            const { container } = render(
              <SubscriptionDetails
                planName={data.planName}
                price={data.price}
                status="active"
                nextBillingDate={data.nextBillingDate}
                cancelAtPeriodEnd={data.cancelAtPeriodEnd}
              />
            );

            // Property: Active subscriptions should show renewal information
            const billingDateElement = container.querySelector('[data-testid="subscription-billing-date"]');
            expect(billingDateElement).toBeTruthy();
            
            // Property: Should show appropriate billing date label based on cancellation status
            const allText = container.textContent || '';
            if (data.cancelAtPeriodEnd) {
              expect(allText).toContain('Expires On:');
              expect(allText).toContain('canceled at the end of the current billing period');
            } else {
              expect(allText).toContain('Next Billing:');
            }
            
            // Property: Active subscriptions should not show trial-specific content
            expect(allText).not.toContain('Trial Ends:');
            expect(allText).not.toContain('trial period');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide appropriate management actions for active subscriptions', () => {
      fc.assert(
        fc.property(
          fc.record({
            plan: fc.constantFrom('basic', 'pro', 'enterprise') as fc.Arbitrary<'basic' | 'pro' | 'enterprise'>,
            cancelAtPeriodEnd: fc.boolean(),
          }),
          (data) => {
            const mockSubscription: UserSubscription = {
              plan: data.plan,
              status: 'active',
              currentPeriodEnd: '2024-12-31T23:59:59.000Z',
              cancelAtPeriodEnd: data.cancelAtPeriodEnd,
            };

            const { container } = render(
              <ManagementActions
                subscription={mockSubscription}
                onUpgrade={() => {}}
                onDowngrade={() => {}}
                onCancel={() => {}}
                onReactivate={() => {}}
                onManage={() => {}}
              />
            );

            const allText = container.textContent || '';
            
            // Property: Active subscriptions should have management options
            if (data.cancelAtPeriodEnd) {
              // For subscriptions that are canceled at period end, should show reactivate
              expect(allText).toContain('Reactivate');
            } else {
              // For active subscriptions, should show cancel option
              expect(allText).toContain('Cancel');
            }
            
            // Property: Should always have manage subscription option
            expect(allText).toContain('Manage');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Canceled Subscription Content (Requirement 7.2)', () => {
    it('should display cancellation information and reactivation options for canceled subscriptions', () => {
      fc.assert(
        fc.property(
          fc.record({
            planName: fc.constantFrom('basic', 'pro', 'enterprise'),
            price: fc.float({ min: Math.fround(1), max: Math.fround(199), noNaN: true }),
            cancelationDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())).map(d => d.toISOString()),
          }),
          (data) => {
            const { container } = render(
              <SubscriptionDetails
                planName={data.planName}
                price={data.price}
                status="canceled"
                nextBillingDate={data.cancelationDate}
              />
            );

            const allText = container.textContent || '';
            
            // Property: Canceled subscriptions should show expiration information
            expect(allText).toContain('Expired On:');
            
            // Property: Should not show active billing information
            expect(allText).not.toContain('Next Billing:');
            expect(allText).not.toContain('Trial Ends:');
            
            // Property: Should display the cancellation date
            const dateElement = container.querySelector('[data-testid="subscription-billing-date"]');
            expect(dateElement).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide reactivation options for canceled subscriptions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('basic', 'pro', 'enterprise') as fc.Arbitrary<'basic' | 'pro' | 'enterprise'>,
          (plan) => {
            const mockSubscription: UserSubscription = {
              plan,
              status: 'canceled',
              currentPeriodEnd: '2024-01-01T00:00:00.000Z',
            };

            const { container } = render(
              <ManagementActions
                subscription={mockSubscription}
                onUpgrade={() => {}}
                onDowngrade={() => {}}
                onCancel={() => {}}
                onReactivate={() => {}}
                onManage={() => {}}
              />
            );

            const allText = container.textContent || '';
            
            // Property: Canceled subscriptions should show reactivation options
            expect(allText).toContain('Reactivate');
            
            // Property: Should not show cancel option for already canceled subscriptions
            expect(allText).not.toContain('Cancel Subscription');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Past Due Subscription Content (Requirement 7.3)', () => {
    it('should display payment retry options and status warnings for past due subscriptions', () => {
      fc.assert(
        fc.property(
          fc.record({
            planName: fc.constantFrom('basic', 'pro', 'enterprise'),
            price: fc.float({ min: Math.fround(1), max: Math.fround(199), noNaN: true }),
            dueDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())).map(d => d.toISOString()),
          }),
          (data) => {
            const { container } = render(
              <SubscriptionDetails
                planName={data.planName}
                price={data.price}
                status="past_due"
                nextBillingDate={data.dueDate}
              />
            );

            const allText = container.textContent || '';
            
            // Property: Past due subscriptions should show payment due information
            expect(allText).toContain('Payment Due:');
            
            // Property: Should display warning about past due status
            expect(allText).toContain('payment is past due');
            expect(allText).toContain('update your payment method');
            
            // Property: Should not show normal billing information
            expect(allText).not.toContain('Next Billing:');
            expect(allText).not.toContain('Trial Ends:');
            
            // Property: Warning should be prominently displayed
            const warningElement = container.querySelector('[role="alert"]');
            expect(warningElement).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show appropriate status styling for past due subscriptions', () => {
      fc.assert(
        fc.property(
          fc.constant('past_due' as SubscriptionStatus),
          (status) => {
            const { container } = render(<StatusBadge status={status} />);

            const badgeElement = container.querySelector('[data-testid="subscription-status-badge"]');
            expect(badgeElement).toBeTruthy();
            
            const badgeClasses = badgeElement?.className || '';
            const displayedText = badgeElement?.textContent || '';
            
            // Property: Past due status should have destructive/warning styling
            expect(badgeClasses).toContain('destructive');
            
            // Property: Should display clear past due status
            expect(displayedText).toContain('Past Due');
            
            // Property: Should include warning icon
            expect(displayedText).toContain('⚠️');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Trial Subscription Content (Requirement 7.4)', () => {
    it('should display trial end date and upgrade prompts for trial subscriptions', () => {
      fc.assert(
        fc.property(
          fc.record({
            planName: fc.constantFrom('basic', 'pro', 'enterprise'),
            price: fc.float({ min: Math.fround(1), max: Math.fround(199), noNaN: true }),
            trialEndDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())).map(d => d.toISOString()),
          }),
          (data) => {
            const { container } = render(
              <SubscriptionDetails
                planName={data.planName}
                price={data.price}
                status="trialing"
                trialEndDate={data.trialEndDate}
              />
            );

            const allText = container.textContent || '';
            
            // Property: Trial subscriptions should show trial end information
            expect(allText).toContain('Trial Ends:');
            
            // Property: Should display the trial end date
            const trialEndElement = container.querySelector('[data-testid="subscription-trial-end"]');
            expect(trialEndElement).toBeTruthy();
            
            // Property: Should not show regular billing information
            expect(allText).not.toContain('Next Billing:');
            expect(allText).not.toContain('Payment Due:');
            
            // Property: Trial information should be prominently displayed
            const trialSection = container.querySelector('[role="alert"]');
            expect(trialSection).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should show appropriate status styling for trial subscriptions', () => {
      fc.assert(
        fc.property(
          fc.constant('trialing' as SubscriptionStatus),
          (status) => {
            const { container } = render(<StatusBadge status={status} />);

            const badgeElement = container.querySelector('[data-testid="subscription-status-badge"]');
            expect(badgeElement).toBeTruthy();
            
            const badgeClasses = badgeElement?.className || '';
            const displayedText = badgeElement?.textContent || '';
            
            // Property: Trial status should have secondary styling (not destructive)
            expect(badgeClasses).toContain('secondary');
            expect(badgeClasses).not.toContain('destructive');
            
            // Property: Should display clear trial status
            expect(displayedText).toContain('Trial');
            
            // Property: Should include clock icon for trial
            expect(displayedText).toContain('⏱️');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Comprehensive Status Content Properties', () => {
    it('should display appropriate content for all subscription statuses', () => {
      fc.assert(
        fc.property(
          fc.record({
            status: fc.constantFrom('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete') as fc.Arbitrary<SubscriptionStatus>,
            planName: fc.constantFrom('basic', 'pro', 'enterprise'),
            price: fc.float({ min: Math.fround(1), max: Math.fround(199), noNaN: true }),
            date: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())).map(d => d.toISOString()),
          }),
          (data) => {
            const props = {
              planName: data.planName,
              price: data.price,
              status: data.status,
              ...(data.status === 'trialing' ? { trialEndDate: data.date } : { nextBillingDate: data.date }),
            };

            const { container } = render(<SubscriptionDetails {...props} />);

            const allText = container.textContent || '';
            
            // Property: Each status should have appropriate content
            switch (data.status) {
              case 'active':
                expect(allText).toContain('Next Billing:');
                expect(allText).not.toContain('Trial Ends:');
                break;
              case 'trialing':
                expect(allText).toContain('Trial Ends:');
                expect(allText).not.toContain('Next Billing:');
                break;
              case 'past_due':
                expect(allText).toContain('Payment Due:');
                expect(allText).toContain('payment is past due');
                break;
              case 'canceled':
                expect(allText).toContain('Expired On:');
                expect(allText).not.toContain('Next Billing:');
                break;
              case 'unpaid':
              case 'incomplete':
                // These statuses should show payment due or warning content
                expect(allText).toContain('Payment Due:');
                break;
            }
            
            // Property: All statuses should show basic subscription information
            expect(allText).toContain('Plan');
            expect(allText).toContain('$');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide status-appropriate management actions for all subscription states', () => {
      fc.assert(
        fc.property(
          fc.record({
            status: fc.constantFrom('active', 'trialing', 'canceled', 'past_due') as fc.Arbitrary<SubscriptionStatus>,
            plan: fc.constantFrom('basic', 'pro', 'enterprise') as fc.Arbitrary<'basic' | 'pro' | 'enterprise'>,
            cancelAtPeriodEnd: fc.boolean(),
          }),
          (data) => {
            const mockSubscription: UserSubscription = {
              plan: data.plan,
              status: data.status,
              currentPeriodEnd: '2024-12-31T23:59:59.000Z',
              cancelAtPeriodEnd: data.status === 'active' ? data.cancelAtPeriodEnd : false,
            };

            const { container } = render(
              <ManagementActions
                subscription={mockSubscription}
                onUpgrade={() => {}}
                onDowngrade={() => {}}
                onCancel={() => {}}
                onReactivate={() => {}}
                onManage={() => {}}
              />
            );

            const allText = container.textContent || '';
            
            // Property: Each status should have appropriate management actions
            switch (data.status) {
              case 'active':
                if (data.cancelAtPeriodEnd) {
                  expect(allText).toContain('Reactivate');
                } else {
                  expect(allText).toContain('Cancel');
                }
                break;
              case 'canceled':
                expect(allText).toContain('Reactivate');
                expect(allText).not.toContain('Cancel Subscription');
                break;
              case 'trialing':
                // Trialing subscriptions should have cancel option
                expect(allText).toContain('Cancel');
                break;
              case 'past_due':
                // Past due should have reactivate option
                expect(allText).toContain('Reactivate');
                break;
            }
            
            // Property: All statuses should have some management option
            expect(allText.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { render } from '@testing-library/react';
import React from 'react';
import { SubscriptionDetails } from '@/components/SubscriptionDetails';
import { StatusBadge } from '@/components/StatusBadge';
import { SubscriptionStatus } from '@/components/CurrentSubscriptionSection';

/**
 * Property-Based Tests for Human-Readable Formatting
 * 
 * Feature: subscription-flow-improvement, Property 6: Human-Readable Formatting
 * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
 * 
 * These tests verify that subscription information is formatted for human readability
 * across all possible input values, ensuring proper plan names, formatted dates,
 * currency symbols, and styled status indicators.
 */

describe('Property 6: Human-Readable Formatting', () => {
  describe('Plan Name Formatting (Requirement 5.1)', () => {
    it('should format plan names to human-readable titles for any valid plan input', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constantFrom('basic', 'pro', 'enterprise', 'starter', 'premium', 'business'),
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => 
              /^[a-zA-Z]+$/.test(s) && 
              !['constructor', 'prototype', 'toString', 'valueOf'].includes(s.toLowerCase())
            )
          ),
          (planName) => {
            const { container } = render(
              <SubscriptionDetails
                planName={planName}
                price={29}
                status="active"
              />
            );

            const planNameElement = container.querySelector('[data-testid="subscription-plan-name"]');
            expect(planNameElement).toBeTruthy();
            
            const displayedText = planNameElement?.textContent || '';
            
            // Property: Plan names should be human-readable titles
            expect(displayedText).toMatch(/^[A-Z][a-zA-Z\s]*Plan$/);
            
            // Property: Should not display raw lowercase plan names
            expect(displayedText).not.toBe(planName.toLowerCase());
            
            // Property: Should contain the word "Plan"
            expect(displayedText).toContain('Plan');
            
            // Property: Should start with capital letter
            expect(displayedText.charAt(0)).toMatch(/[A-Z]/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Date Formatting (Requirement 5.2)', () => {
    it('should format dates in user-friendly format for any valid date input', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
          (date) => {
            const dateString = date.toISOString();
            
            const { container } = render(
              <SubscriptionDetails
                planName="pro"
                price={29}
                status="active"
                nextBillingDate={dateString}
              />
            );

            const billingDateElement = container.querySelector('[data-testid="subscription-billing-date"]');
            expect(billingDateElement).toBeTruthy();
            
            const displayedDate = billingDateElement?.textContent || '';
            
            // Property: Dates should be in human-readable format (Month Day, Year)
            expect(displayedDate).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
            
            // Property: Should not display raw ISO date strings
            expect(displayedDate).not.toContain('T');
            expect(displayedDate).not.toContain('Z');
            
            // Property: Should contain valid month names
            const monthNames = [
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ];
            const hasValidMonth = monthNames.some(month => displayedDate.includes(month));
            expect(hasValidMonth).toBe(true);
            
            // Property: Should contain comma between day and year
            expect(displayedDate).toContain(',');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format trial end dates consistently with billing dates', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }).filter(d => !isNaN(d.getTime())),
          (trialEndDate) => {
            const dateString = trialEndDate.toISOString();
            
            const { container } = render(
              <SubscriptionDetails
                planName="pro"
                price={29}
                status="trialing"
                trialEndDate={dateString}
              />
            );

            const trialEndElement = container.querySelector('[data-testid="subscription-trial-end"]');
            expect(trialEndElement).toBeTruthy();
            
            const displayedDate = trialEndElement?.textContent || '';
            
            // Property: Trial end dates should follow same formatting as billing dates
            expect(displayedDate).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
            
            // Property: Should be human-readable, not technical format
            expect(displayedDate).not.toContain('T');
            expect(displayedDate).not.toContain('Z');
            expect(displayedDate).not.toContain('-');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Status Indicator Formatting (Requirement 5.3)', () => {
    it('should display clear status indicators with appropriate colors for any subscription status', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            'active', 'trialing', 'past_due', 'canceled', 
            'unpaid', 'incomplete', 'incomplete_expired'
          ) as fc.Arbitrary<SubscriptionStatus>,
          (status) => {
            const { container } = render(<StatusBadge status={status} />);

            const badgeElement = container.querySelector('[data-testid="subscription-status-badge"]');
            expect(badgeElement).toBeTruthy();
            
            const displayedText = badgeElement?.textContent || '';
            const badgeClasses = badgeElement?.className || '';
            
            // Property: Status should be human-readable (not raw status values)
            expect(displayedText).not.toBe(status); // Should be formatted, not raw
            
            // Extract text without icon (icons may be present)
            const textWithoutIcon = displayedText.replace(/^[^\w]*/, ''); // Remove leading non-word characters (icons)
            expect(textWithoutIcon).toMatch(/^[A-Z]/); // Should start with capital
            
            // Property: Should not contain underscores (technical format)
            expect(displayedText).not.toContain('_');
            
            // Property: Should have appropriate visual styling based on status
            if (status === 'active') {
              expect(textWithoutIcon).toBe('Active');
              // Should have positive/success styling
              expect(badgeClasses).not.toContain('destructive');
            } else if (status === 'trialing') {
              expect(textWithoutIcon).toBe('Trial');
            } else if (status === 'past_due' || status === 'unpaid') {
              expect(textWithoutIcon).toMatch(/Past Due|Unpaid/);
              // Should have warning/error styling for problematic states
              expect(badgeClasses).toContain('destructive');
            } else if (status === 'canceled') {
              expect(textWithoutIcon).toBe('Canceled');
            }
            
            // Property: All statuses should have some visual indicator (icon or text)
            expect(displayedText.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Price Formatting (Requirement 5.4)', () => {
    it('should display prices with currency symbols and proper formatting for any valid price', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: Math.fround(999.99), noNaN: true }),
          (price) => {
            const { container } = render(
              <SubscriptionDetails
                planName="pro"
                price={price}
                status="active"
              />
            );

            const priceElement = container.querySelector('[data-testid="subscription-price"]');
            expect(priceElement).toBeTruthy();
            
            const displayedPrice = priceElement?.textContent || '';
            
            // Property: Prices should include currency symbol
            expect(displayedPrice).toContain('$');
            
            // Property: Prices should be formatted with proper decimal places
            expect(displayedPrice).toMatch(/^\$\d+\.\d{2}$/);
            
            // Property: Should not display raw numbers without formatting
            expect(displayedPrice).not.toBe(price.toString());
            
            // Property: Should handle edge cases properly
            if (price === 0) {
              expect(displayedPrice).toBe('$0.00');
            }
            
            // Property: Should format decimal places consistently
            const numericPart = displayedPrice.replace('$', '');
            const decimalPart = numericPart.split('.')[1];
            expect(decimalPart).toHaveLength(2);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle integer prices by adding proper decimal formatting', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 999 }),
          (integerPrice) => {
            const { container } = render(
              <SubscriptionDetails
                planName="pro"
                price={integerPrice}
                status="active"
              />
            );

            const priceElement = container.querySelector('[data-testid="subscription-price"]');
            const displayedPrice = priceElement?.textContent || '';
            
            // Property: Integer prices should be formatted with .00 decimal places
            expect(displayedPrice).toBe(`$${integerPrice}.00`);
            
            // Property: Should not display integers without decimal formatting
            expect(displayedPrice).not.toBe(`$${integerPrice}`);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Comprehensive Formatting Properties', () => {
    it('should maintain consistent human-readable formatting across all subscription data elements', () => {
      fc.assert(
        fc.property(
          fc.record({
            planName: fc.constantFrom('basic', 'pro', 'enterprise'),
            price: fc.float({ min: 0, max: Math.fround(199.99), noNaN: true }),
            status: fc.constantFrom('active', 'trialing', 'canceled') as fc.Arbitrary<SubscriptionStatus>,
            nextBillingDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }).map(d => d.toISOString()),
          }),
          (subscriptionData) => {
            const { container } = render(
              <SubscriptionDetails
                planName={subscriptionData.planName}
                price={subscriptionData.price}
                status={subscriptionData.status}
                nextBillingDate={subscriptionData.nextBillingDate}
              />
            );

            // Property: All text content should be human-readable (no technical formats)
            const allText = container.textContent || '';
            
            // Should not contain technical formats (but allow "Trial Ends:" text)
            expect(allText).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // No ISO datetime format
            expect(allText).not.toContain('Z'); // No timezone indicators
            
            // Should contain properly formatted elements
            expect(allText).toContain('Plan'); // Formatted plan name
            expect(allText).toContain('$'); // Currency symbol
            expect(allText).toMatch(/[A-Z][a-z]+ \d{1,2}, \d{4}/); // Formatted date
            
            // Property: All displayed information should be accessible and clear
            const planElement = container.querySelector('[data-testid="subscription-plan-name"]');
            const priceElement = container.querySelector('[data-testid="subscription-price"]');
            const dateElement = container.querySelector('[data-testid="subscription-billing-date"]');
            
            expect(planElement?.textContent).toMatch(/^[A-Z][a-zA-Z\s]*Plan$/);
            expect(priceElement?.textContent).toMatch(/^\$\d+\.\d{2}$/);
            expect(dateElement?.textContent).toMatch(/^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure all formatting is consistent regardless of input variations', () => {
      fc.assert(
        fc.property(
          fc.record({
            planName: fc.string({ minLength: 1, maxLength: 15 }).filter(s => 
              /^[a-zA-Z]+$/.test(s) && 
              !['constructor', 'prototype', 'toString', 'valueOf'].includes(s.toLowerCase())
            ),
            price: fc.oneof(
              fc.integer({ min: 0, max: 100 }),
              fc.float({ min: Math.fround(0.01), max: Math.fround(99.99), noNaN: true })
            ),
          }),
          (data) => {
            const { container } = render(
              <SubscriptionDetails
                planName={data.planName}
                price={data.price}
                status="active"
              />
            );

            const planElement = container.querySelector('[data-testid="subscription-plan-name"]');
            const priceElement = container.querySelector('[data-testid="subscription-price"]');
            
            // Property: Formatting should be consistent regardless of input case or format
            const planText = planElement?.textContent || '';
            const priceText = priceElement?.textContent || '';
            
            // Plan formatting consistency
            expect(planText).toMatch(/^[A-Z]/); // Always starts with capital
            expect(planText).toContain('Plan'); // Always contains "Plan"
            
            // Price formatting consistency
            expect(priceText).toMatch(/^\$/); // Always starts with $
            expect(priceText).toMatch(/\.\d{2}$/); // Always ends with .XX
            
            // Property: No raw input values should be displayed
            expect(planText).not.toBe(data.planName);
            expect(priceText).not.toBe(data.price.toString());
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
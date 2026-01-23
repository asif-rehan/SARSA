'use client';

import React from 'react';
import { UserSubscription, SubscriptionStatus } from './CurrentSubscriptionSection';

export interface SubscriptionDetailsProps {
  planName: string;
  price: number;
  status: SubscriptionStatus;
  nextBillingDate?: string;
  trialEndDate?: string;
  cancelAtPeriodEnd?: boolean;
  className?: string;
}

/**
 * SubscriptionDetails Component
 * 
 * Formats and displays subscription information with proper responsive design.
 * Handles different subscription states appropriately.
 * 
 * Requirements: 5.1, 5.2, 5.4, 7.1, 7.2, 7.3, 7.4
 */
export function SubscriptionDetails({
  planName,
  price,
  status,
  nextBillingDate,
  trialEndDate,
  cancelAtPeriodEnd,
  className = ""
}: SubscriptionDetailsProps) {
  
  return (
    <div 
      className={`space-y-3 text-sm sm:text-base ${className}`} 
      data-testid="subscription-details"
      role="group"
      aria-labelledby="subscription-info-heading"
    >
      <h4 id="subscription-info-heading" className="sr-only">
        Subscription Information
      </h4>
      
      {/* Plan Name Display - Requirement 5.1 - Mobile-optimized */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-md bg-muted/30"
        role="group"
        aria-labelledby="plan-name-label"
      >
        <span id="plan-name-label" className="font-medium text-muted-foreground">Plan:</span>
        <span 
          data-testid="subscription-plan-name"
          className="font-semibold text-foreground text-base sm:text-lg"
          aria-describedby="plan-name-label"
        >
          {formatPlanName(planName)}
        </span>
      </div>
      
      {/* Price Display - Requirement 5.4 - Mobile-optimized */}
      <div 
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-md bg-muted/30"
        role="group"
        aria-labelledby="monthly-price-label"
      >
        <span id="monthly-price-label" className="font-medium text-muted-foreground">Monthly Price:</span>
        <span 
          data-testid="subscription-price"
          className="font-semibold text-foreground text-lg sm:text-xl text-primary"
          aria-describedby="monthly-price-label"
          aria-label={`Monthly price is ${price} dollars`}
        >
          ${formatPrice(price)}
        </span>
      </div>
      
      {/* Billing Date Display - Requirement 5.2, 7.1, 7.2 - Mobile-optimized */}
      {nextBillingDate && (
        <div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-md bg-muted/30"
          role="group"
          aria-labelledby="billing-date-label"
        >
          <span id="billing-date-label" className="font-medium text-muted-foreground">
            {getBillingDateLabel(status, cancelAtPeriodEnd)}
          </span>
          <span 
            data-testid="subscription-billing-date"
            className="font-semibold text-foreground"
            aria-describedby="billing-date-label"
          >
            {formatDate(nextBillingDate)}
          </span>
        </div>
      )}
      
      {/* Trial End Display - Requirement 7.4 - Mobile-optimized */}
      {trialEndDate && status === 'trialing' && (
        <div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
          role="alert"
          aria-labelledby="trial-end-label"
        >
          <span id="trial-end-label" className="font-medium text-blue-700 dark:text-blue-300">Trial Ends:</span>
          <span 
            data-testid="subscription-trial-end"
            className="font-semibold text-blue-900 dark:text-blue-100"
            aria-describedby="trial-end-label"
          >
            {formatDate(trialEndDate)}
          </span>
        </div>
      )}

      {/* Cancellation Notice - Requirement 7.2 - Mobile-optimized */}
      {cancelAtPeriodEnd && (
        <div 
          className="p-4 rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800"
          role="alert"
          aria-live="polite"
        >
          <p className="text-sm sm:text-base text-yellow-800 dark:text-yellow-200 font-medium">
            ⚠️ Your subscription will be canceled at the end of the current billing period.
          </p>
        </div>
      )}

      {/* Past Due Warning - Requirement 7.3 - Mobile-optimized */}
      {(status === 'past_due' || status === 'unpaid' || status === 'incomplete') && (
        <div 
          className="p-4 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm sm:text-base text-red-800 dark:text-red-200 font-medium">
            ⚠️ Your payment is past due. Please update your payment method to continue service.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Format plan names for human readability
 * Requirements: 5.1 - Human-readable titles
 */
function formatPlanName(planName: string): string {
  // Handle common plan name formats
  const planMap: Record<string, string> = {
    'basic': 'Basic Plan',
    'pro': 'Pro Plan',
    'enterprise': 'Enterprise Plan',
    'starter': 'Starter Plan',
    'premium': 'Premium Plan',
    'business': 'Business Plan'
  };

  const normalized = planName.toLowerCase().trim();
  return planMap[normalized] || planName.charAt(0).toUpperCase() + planName.slice(1) + ' Plan';
}

/**
 * Format prices with currency symbols and proper formatting
 * Requirements: 5.4 - Currency symbols and proper formatting
 */
function formatPrice(price: number): string {
  return price.toFixed(2);
}

/**
 * Format dates for user-friendly display
 * Requirements: 5.2 - User-friendly date formatting
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC', // Use UTC to avoid timezone issues
  });
}

/**
 * Get appropriate billing date label based on subscription state
 * Requirements: 7.1, 7.2 - Status-appropriate content
 */
function getBillingDateLabel(status: SubscriptionStatus, cancelAtPeriodEnd?: boolean): string {
  if (cancelAtPeriodEnd) {
    return 'Expires On:';
  }
  
  switch (status) {
    case 'active':
      return 'Next Billing:';
    case 'canceled':
      return 'Expired On:';
    case 'past_due':
    case 'unpaid':
    case 'incomplete':
      return 'Payment Due:';
    case 'trialing':
      return 'Trial Ends:';
    default:
      return 'Next Billing:';
  }
}
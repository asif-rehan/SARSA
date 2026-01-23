'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FadeIn } from '@/components/transitions/fade-in';
import { SubscriptionDetails } from './SubscriptionDetails';
import { StatusBadge } from './StatusBadge';
import { ManagementActions } from './ManagementActions';
import { useSubscriptionManagement } from '@/hooks/useSubscriptionManagement';
import { FormStatus } from '@/components/forms/form-status';

// TypeScript interfaces for subscription data
export interface UserSubscription {
  plan: 'basic' | 'pro' | 'enterprise';
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
  currentPeriodStart?: string;
  cancelAtPeriodEnd?: boolean;
  trialEnd?: string;
  stripeSubscriptionId?: string;
}

export type SubscriptionStatus = 
  | 'active'
  | 'trialing' 
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired';

export interface CurrentSubscriptionSectionProps {
  subscription: UserSubscription | null;
  onSubscriptionChange?: (subscription: UserSubscription | null) => void;
  className?: string;
}

export interface PlanDetails {
  id: string;
  name: string;
  displayName: string;
  price: number;
  features: string[];
  priceId: string;
  popular?: boolean;
}

// Plan configuration for display formatting
const PLAN_DETAILS: Record<string, PlanDetails> = {
  basic: {
    id: 'basic',
    name: 'basic',
    displayName: 'Basic Plan',
    price: 9,
    features: ['Basic features', 'Email support', '1 user', '5 projects'],
    priceId: 'price_1QdGHDB4dU1calXYtest_basic',
  },
  pro: {
    id: 'pro',
    name: 'pro',
    displayName: 'Pro Plan',
    price: 29,
    features: ['All basic features', 'Priority support', '5 users', '20 projects', 'Advanced analytics'],
    priceId: 'price_1QdGHDB4dU1calXYtest_pro',
    popular: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise Plan',
    price: 99,
    features: ['All pro features', '24/7 support', 'Unlimited users', '100 projects', 'Custom integrations'],
    priceId: 'price_1QdGHDB4dU1calXYtest_enterprise',
  },
};

/**
 * CurrentSubscriptionSection Component
 * 
 * Displays clean, user-friendly subscription information with conditional rendering
 * based on subscription state. Implements mobile-first responsive design.
 * 
 * Requirements: 2.1, 2.5 - Conditional rendering and responsive design
 */
export function CurrentSubscriptionSection({ 
  subscription, 
  onSubscriptionChange,
  className = ""
}: CurrentSubscriptionSectionProps) {
  const subscriptionManagement = useSubscriptionManagement();
  
  // Handle subscription changes and notify parent component
  const handleSubscriptionUpdate = async () => {
    const updatedSubscription = await subscriptionManagement.refreshSubscription();
    if (onSubscriptionChange) {
      onSubscriptionChange(updatedSubscription);
    }
  };

  // Conditional rendering - only show if user has a subscription (Requirement 2.5)
  if (!subscription) {
    return null;
  }

  const planDetails = PLAN_DETAILS[subscription.plan];
  const displayName = planDetails?.displayName || subscription.plan;
  const price = planDetails?.price || 0;

  return (
    <FadeIn delay={0.2}>
      <Card 
        className={`mb-6 sm:mb-8 max-w-2xl mx-auto ${className}`} 
        data-testid="current-subscription-section"
        role="region"
        aria-labelledby="current-subscription-title"
      >
        <CardHeader className="pb-4">
          <CardTitle 
            id="current-subscription-title"
            className="text-lg sm:text-xl"
          >
            Current Subscription
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Your active subscription details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error/Success Messages */}
          <FormStatus 
            error={subscriptionManagement.state.error}
            success={subscriptionManagement.state.success}
            onClearError={subscriptionManagement.clearMessages}
            onClearSuccess={subscriptionManagement.clearMessages}
          />

          {/* Mobile-optimized subscription information layout */}
          <div className="space-y-4" role="group" aria-labelledby="subscription-details-heading">
            <h3 id="subscription-details-heading" className="sr-only">
              Subscription Details
            </h3>
            
            {/* Subscription Information Display - Requirements 2.2, 2.3, 2.4, 5.1, 5.2, 5.4 */}
            <SubscriptionDetails
              planName={subscription.plan}
              price={price}
              status={subscription.status}
              nextBillingDate={subscription.currentPeriodEnd}
              trialEndDate={subscription.trialEnd}
              cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
            />

            {/* Status Badge Display - Mobile-optimized */}
            <div 
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-md bg-muted/30"
              role="group"
              aria-labelledby="subscription-status-label"
            >
              <span 
                id="subscription-status-label"
                className="font-medium text-muted-foreground text-sm sm:text-base"
              >
                Status:
              </span>
              <StatusBadge status={subscription.status} />
            </div>

            {/* Management Actions - Mobile-optimized */}
            <div role="group" aria-labelledby="subscription-actions-heading">
              <h3 id="subscription-actions-heading" className="sr-only">
                Subscription Management Actions
              </h3>
              <ManagementActions
                subscription={subscription}
                onUpgrade={subscriptionManagement.handleUpgrade}
                onDowngrade={subscriptionManagement.handleDowngrade}
                onCancel={subscriptionManagement.handleCancel}
                onReactivate={subscriptionManagement.handleReactivate}
                onManage={subscriptionManagement.handleManage}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
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
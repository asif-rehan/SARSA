'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { UserSubscription } from './CurrentSubscriptionSection';

export interface ManagementActionsProps {
  subscription: UserSubscription;
  onUpgrade?: (planId: string) => void;
  onDowngrade?: (planId: string) => void;
  onCancel?: () => void;
  onReactivate?: () => void;
  onManage?: () => void;
  className?: string;
}

/**
 * ManagementActions Component
 * 
 * Provides subscription management options with proper accessibility.
 * Ensures minimum touch target sizes (48px) for mobile devices.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 6.4
 */
export function ManagementActions({
  subscription,
  onUpgrade,
  onDowngrade,
  onCancel,
  onReactivate,
  onManage,
  className = ""
}: ManagementActionsProps) {
  
  const availableActions = getAvailableActions(subscription);
  
  return (
    <div 
      className={`flex flex-col sm:flex-row gap-3 pt-4 border-t ${className}`} 
      data-testid="management-actions"
      role="group"
      aria-labelledby="management-actions-heading"
    >
      <h4 id="management-actions-heading" className="sr-only">
        Available subscription management actions
      </h4>
      
      {/* Manage Subscription Button - Requirements 3.1, 6.4 */}
      {onManage && (
        <Button
          onClick={onManage}
          variant="outline"
          className="w-full sm:w-auto min-h-[48px]"
          data-testid="manage-subscription-button"
          aria-label="Open subscription management portal to update payment methods, billing information, and other settings"
        >
          Manage Subscription
        </Button>
      )}
      
      {/* Cancel Subscription Button - Requirements 3.2, 6.4 */}
      {onCancel && availableActions.canCancel && (
        <Button
          onClick={onCancel}
          variant="destructive"
          className="w-full sm:w-auto min-h-[48px]"
          data-testid="cancel-subscription-button"
          aria-label="Cancel your current subscription. You will retain access until the end of your billing period"
          aria-describedby="cancel-warning"
        >
          Cancel Subscription
        </Button>
      )}
      
      {/* Reactivate Subscription Button - Requirements 3.2, 6.4 */}
      {onReactivate && availableActions.canReactivate && (
        <Button
          onClick={onReactivate}
          variant="default"
          className="w-full sm:w-auto min-h-[48px]"
          data-testid="reactivate-subscription-button"
          aria-label="Reactivate your canceled subscription to restore access to all features"
        >
          Reactivate Subscription
        </Button>
      )}
      
      {/* Upgrade Options - Requirements 3.3, 6.4 */}
      {onUpgrade && availableActions.upgradeOptions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2" role="group" aria-label="Upgrade options">
          {availableActions.upgradeOptions.map((planId) => (
            <Button
              key={planId}
              onClick={() => onUpgrade(planId)}
              variant="default"
              className="w-full sm:w-auto min-h-[48px]"
              data-testid={`upgrade-to-${planId}-button`}
              aria-label={`Upgrade to ${formatPlanName(planId)} plan for additional features and benefits`}
            >
              Upgrade to {formatPlanName(planId)}
            </Button>
          ))}
        </div>
      )}
      
      {/* Downgrade Options - Requirements 3.3, 6.4 */}
      {onDowngrade && availableActions.downgradeOptions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2" role="group" aria-label="Downgrade options">
          {availableActions.downgradeOptions.map((planId) => (
            <Button
              key={planId}
              onClick={() => onDowngrade(planId)}
              variant="outline"
              className="w-full sm:w-auto min-h-[48px]"
              data-testid={`downgrade-to-${planId}-button`}
              aria-label={`Downgrade to ${formatPlanName(planId)} plan to reduce costs`}
            >
              Downgrade to {formatPlanName(planId)}
            </Button>
          ))}
        </div>
      )}
      
      {/* No Actions Available Message */}
      {!hasAnyActions(availableActions, { onManage, onCancel, onReactivate, onUpgrade, onDowngrade }) && (
        <div 
          className="text-sm text-muted-foreground p-2" 
          data-testid="no-actions-message"
          role="status"
          aria-live="polite"
        >
          No management actions available for this subscription.
        </div>
      )}
      
      {/* Hidden warning text for screen readers */}
      <div id="cancel-warning" className="sr-only">
        Canceling your subscription will stop future billing but you will retain access until the end of your current billing period.
      </div>
    </div>
  );
}

/**
 * Determine available actions based on subscription status
 * Requirements: 3.1, 3.2, 3.3, 3.4 - Status-appropriate actions
 */
function getAvailableActions(subscription: UserSubscription) {
  const planHierarchy = ['basic', 'pro', 'enterprise'];
  const currentPlanIndex = planHierarchy.indexOf(subscription.plan);
  
  const actions = {
    canCancel: false,
    canReactivate: false,
    upgradeOptions: [] as string[],
    downgradeOptions: [] as string[]
  };
  
  switch (subscription.status) {
    case 'active':
    case 'trialing':
      // If subscription is set to cancel at period end, show reactivate instead of cancel
      if (subscription.cancelAtPeriodEnd) {
        actions.canReactivate = true;
      } else {
        actions.canCancel = true;
      }
      // Add upgrade options (higher tier plans)
      actions.upgradeOptions = planHierarchy.slice(currentPlanIndex + 1);
      // Add downgrade options (lower tier plans)
      actions.downgradeOptions = planHierarchy.slice(0, currentPlanIndex);
      break;
      
    case 'canceled':
      actions.canReactivate = true;
      break;
      
    case 'past_due':
    case 'unpaid':
      // Only allow reactivation for past due subscriptions
      actions.canReactivate = true;
      break;
      
    case 'incomplete':
    case 'incomplete_expired':
      // No actions available for incomplete subscriptions
      break;
      
    default:
      break;
  }
  
  return actions;
}

/**
 * Check if any actions are available
 * Requirements: 3.4 - Clear action descriptions
 */
function hasAnyActions(
  availableActions: ReturnType<typeof getAvailableActions>,
  callbacks: {
    onManage?: () => void;
    onCancel?: () => void;
    onReactivate?: () => void;
    onUpgrade?: (planId: string) => void;
    onDowngrade?: (planId: string) => void;
  }
): boolean {
  return !!(
    callbacks.onManage ||
    (callbacks.onCancel && availableActions.canCancel) ||
    (callbacks.onReactivate && availableActions.canReactivate) ||
    (callbacks.onUpgrade && availableActions.upgradeOptions.length > 0) ||
    (callbacks.onDowngrade && availableActions.downgradeOptions.length > 0)
  );
}

/**
 * Format plan names for display
 * Requirements: 3.4 - Clear action descriptions
 */
function formatPlanName(planId: string): string {
  const planNames: Record<string, string> = {
    'basic': 'Basic',
    'pro': 'Pro',
    'enterprise': 'Enterprise'
  };
  
  return planNames[planId] || planId.charAt(0).toUpperCase() + planId.slice(1);
}
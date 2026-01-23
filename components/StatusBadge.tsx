'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SubscriptionStatus } from './CurrentSubscriptionSection';

export interface StatusBadgeProps {
  status: SubscriptionStatus;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

/**
 * StatusBadge Component
 * 
 * Displays subscription status with appropriate visual styling using shadcn/ui Badge.
 * Maps subscription statuses to visual indicators with accessibility compliance.
 * 
 * Requirements: 5.3, 7.1, 7.2, 7.3, 7.4
 */
export function StatusBadge({ 
  status, 
  variant, 
  className = "" 
}: StatusBadgeProps) {
  const badgeVariant = variant || getStatusVariant(status);
  const formattedStatus = formatStatus(status);
  const statusIcon = getStatusIcon(status);

  return (
    <Badge 
      variant={badgeVariant}
      className={`font-medium ${className}`}
      data-testid="subscription-status-badge"
      aria-label={getStatusDescription(status)}
      role="status"
    >
      {statusIcon && <span className="mr-1" aria-hidden="true">{statusIcon}</span>}
      {formattedStatus}
    </Badge>
  );
}

/**
 * Format subscription status for human readability
 * Requirements: 5.3 - Clear status indicators
 */
function formatStatus(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Trial';
    case 'past_due':
      return 'Past Due';
    case 'canceled':
      return 'Canceled';
    case 'unpaid':
      return 'Unpaid';
    case 'incomplete':
      return 'Incomplete';
    case 'incomplete_expired':
      return 'Expired';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Get appropriate badge variant for subscription status
 * Requirements: 5.3 - Appropriate colors, 7.1, 7.2, 7.3, 7.4 - Status-appropriate styling
 */
function getStatusVariant(status: SubscriptionStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'active':
      return 'default'; // Green/primary color for active subscriptions
    case 'trialing':
      return 'secondary'; // Blue/secondary color for trial period
    case 'past_due':
    case 'unpaid':
    case 'incomplete':
    case 'incomplete_expired':
      return 'destructive'; // Red color for problematic states
    case 'canceled':
      return 'outline'; // Neutral/gray for canceled subscriptions
    default:
      return 'outline';
  }
}

/**
 * Get status icon for visual indication
 * Requirements: 5.3 - Visual indicators, accessibility compliance
 */
function getStatusIcon(status: SubscriptionStatus): string | null {
  switch (status) {
    case 'active':
      return '✓'; // Checkmark for active
    case 'trialing':
      return '⏱️'; // Clock for trial
    case 'past_due':
    case 'unpaid':
      return '⚠️'; // Warning for payment issues
    case 'canceled':
      return '✕'; // X for canceled
    case 'incomplete':
    case 'incomplete_expired':
      return '⚠️'; // Warning for incomplete states
    default:
      return null;
  }
}

/**
 * Get accessible description for screen readers
 * Requirements: 7.1, 7.2, 7.3, 7.4 - Accessibility compliance
 */
export function getStatusDescription(status: SubscriptionStatus): string {
  switch (status) {
    case 'active':
      return 'Your subscription is active and current';
    case 'trialing':
      return 'You are currently in a trial period';
    case 'past_due':
      return 'Your payment is overdue, please update your payment method';
    case 'canceled':
      return 'Your subscription has been canceled';
    case 'unpaid':
      return 'Your subscription is unpaid, please complete payment';
    case 'incomplete':
      return 'Your subscription setup is incomplete';
    case 'incomplete_expired':
      return 'Your subscription setup has expired';
    default:
      return `Subscription status: ${formatStatus(status)}`;
  }
}
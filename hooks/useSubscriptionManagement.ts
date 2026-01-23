'use client';

import { useState, useCallback } from 'react';
import { UserSubscription } from '@/components/CurrentSubscriptionSection';

export interface SubscriptionChangeState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export interface UseSubscriptionManagementReturn {
  state: SubscriptionChangeState;
  handleUpgrade: (planId: string) => Promise<void>;
  handleDowngrade: (planId: string) => Promise<void>;
  handleCancel: () => Promise<void>;
  handleReactivate: () => Promise<void>;
  handleManage: () => void;
  clearMessages: () => void;
  refreshSubscription: () => Promise<UserSubscription | null>;
}

/**
 * Custom hook for managing subscription state changes
 * 
 * Handles subscription updates, error/success messages, and data refresh
 * without requiring page reload.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export function useSubscriptionManagement(): UseSubscriptionManagementReturn {
  const [state, setState] = useState<SubscriptionChangeState>({
    loading: false,
    error: null,
    success: null
  });

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, error: null, success: null }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, loading: false, error, success: null }));
  }, []);

  const setSuccess = useCallback((success: string) => {
    setState(prev => ({ ...prev, loading: false, error: null, success }));
  }, []);

  /**
   * Refresh subscription data from API
   * Requirements: 4.3 - Refresh subscription data without page reload
   */
  const refreshSubscription = useCallback(async (): Promise<UserSubscription | null> => {
    try {
      const response = await fetch('/api/user-subscription');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription data');
      }
      const data = await response.json();
      return data.subscription;
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
      return null;
    }
  }, []);

  /**
   * Handle subscription upgrade
   * Requirements: 4.1, 4.2 - Update component state after subscription changes
   */
  const handleUpgrade = useCallback(async (planId: string) => {
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, action: 'upgrade' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create upgrade session');
      }

      const { url } = await response.json();
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      setError(`Failed to upgrade subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [clearMessages, setLoading, setError]);

  /**
   * Handle subscription downgrade
   * Requirements: 4.1, 4.2 - Update component state after subscription changes
   */
  const handleDowngrade = useCallback(async (planId: string) => {
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/change-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, action: 'downgrade' }),
      });

      if (!response.ok) {
        throw new Error('Failed to downgrade subscription');
      }

      setSuccess(`Successfully downgraded to ${formatPlanName(planId)} plan`);
      
      // Refresh subscription data
      await refreshSubscription();
    } catch (error) {
      setError(`Failed to downgrade subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [clearMessages, setLoading, setError, setSuccess, refreshSubscription]);

  /**
   * Handle subscription cancellation
   * Requirements: 4.1, 4.2 - Update component state after subscription changes
   */
  const handleCancel = useCallback(async () => {
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      setSuccess('Subscription canceled successfully. You will retain access until the end of your billing period.');
      
      // Refresh subscription data
      await refreshSubscription();
    } catch (error) {
      setError(`Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [clearMessages, setLoading, setError, setSuccess, refreshSubscription]);

  /**
   * Handle subscription reactivation
   * Requirements: 4.1, 4.2 - Update component state after subscription changes
   */
  const handleReactivate = useCallback(async () => {
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      setSuccess('Subscription reactivated successfully!');
      
      // Refresh subscription data
      await refreshSubscription();
    } catch (error) {
      setError(`Failed to reactivate subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [clearMessages, setLoading, setError, setSuccess, refreshSubscription]);

  /**
   * Handle manage subscription (redirect to Stripe portal)
   * Requirements: 4.4 - Success and error message handling
   */
  const handleManage = useCallback(() => {
    // Open Stripe Customer Portal in new tab
    window.open('https://billing.stripe.com/p/login/test_...', '_blank');
  }, []);

  return {
    state,
    handleUpgrade,
    handleDowngrade,
    handleCancel,
    handleReactivate,
    handleManage,
    clearMessages,
    refreshSubscription
  };
}

/**
 * Format plan names for display
 */
function formatPlanName(planId: string): string {
  const planNames: Record<string, string> = {
    'basic': 'Basic',
    'pro': 'Pro',
    'enterprise': 'Enterprise'
  };
  
  return planNames[planId] || planId.charAt(0).toUpperCase() + planId.slice(1);
}
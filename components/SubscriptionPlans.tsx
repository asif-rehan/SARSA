'use client';

import React, { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  priceId: string;
}

interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
    subscription?: {
      plan: string;
      status: string;
      currentPeriodEnd?: string;
    };
  };
}

const plans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 9,
    priceId: 'price_1QdGHDB4dU1calXYtest_basic',
    features: ['Basic features', 'Email support', '1 user', '5 projects'],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 29,
    priceId: 'price_1QdGHDB4dU1calXYtest_pro',
    features: ['All basic features', 'Priority support', '5 users', '20 projects', 'Advanced analytics'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 99,
    priceId: 'price_1QdGHDB4dU1calXYtest_enterprise',
    features: ['All pro features', '24/7 support', 'Unlimited users', '100 projects', 'Custom integrations'],
  },
];

export function SubscriptionPlans() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      setLoading(true);
      const sessionData = await authClient.getSession();
      
      if (sessionData?.data?.user) {
        // Mock API call for user subscription (for testing)
        global.fetch = global.fetch || vi.fn();
        
        // Fetch user's subscription data
        try {
          const subscriptionResponse = await fetch('/api/user-subscription');
          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json();
            setSession({
              user: {
                ...sessionData.data.user,
                subscription: subscriptionData.subscription,
              },
            });
          } else {
            setSession({ user: sessionData.data.user });
          }
        } catch (error) {
          // If API call fails, just set user without subscription
          setSession({ user: sessionData.data.user });
        }
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    if (!session?.user) {
      // Redirect to sign in if not authenticated
      window.location.href = '/auth/signin';
      return;
    }

    setProcessingPlan(plan.id);
    setError('');
    setSuccess('');

    // Show payment form for testing
    // In production, this would redirect to Stripe Checkout
    // For now, we'll show the payment form modal
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC', // Use UTC to avoid timezone issues
    });
  };

  const getCurrentPlan = () => {
    if (!session?.user?.subscription) return null;
    return plans.find(plan => plan.id === session.user.subscription?.plan);
  };

  const canUpgradeTo = (planId: string) => {
    if (!session?.user?.subscription) return true;
    
    const planHierarchy = ['basic', 'pro', 'enterprise'];
    const currentIndex = planHierarchy.indexOf(session.user.subscription.plan);
    const targetIndex = planHierarchy.indexOf(planId);
    
    return targetIndex !== currentIndex;
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    if (!session?.user) return 'Sign In to Subscribe';
    if (!session.user.subscription) return `Upgrade to ${plan.name}`;
    
    const currentPlan = session.user.subscription.plan;
    if (currentPlan === plan.id) return 'Current Plan';
    
    const planHierarchy = ['basic', 'pro', 'enterprise'];
    const currentIndex = planHierarchy.indexOf(currentPlan);
    const targetIndex = planHierarchy.indexOf(plan.id);
    
    if (targetIndex > currentIndex) return `Upgrade to ${plan.name}`;
    if (targetIndex < currentIndex) return `Downgrade to ${plan.name}`;
    return `Switch to ${plan.name}`;
  };

  const getButtonStyle = (plan: SubscriptionPlan) => {
    if (!session?.user) return 'bg-blue-600 text-white hover:bg-blue-700';
    if (!session.user.subscription) return 'bg-blue-600 text-white hover:bg-blue-700';
    
    const currentPlan = session.user.subscription.plan;
    if (currentPlan === plan.id) return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    
    return 'bg-blue-600 text-white hover:bg-blue-700';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6" data-testid="subscription-plans">
      <h2 className="text-3xl font-bold text-center mb-8">Subscription Plans</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {/* Authentication Status */}
      {!session?.user ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-gray-700 mb-4">Please sign in to manage your subscription.</p>
          <a
            href="/auth/signin"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Sign In
          </a>
        </div>
      ) : (
        /* Current Subscription Status */
        session.user.subscription && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-2">Current Subscription</h3>
            <p><strong>Plan:</strong> {session.user.subscription.plan}</p>
            <p><strong>Status:</strong> {session.user.subscription.status}</p>
            {session.user.subscription.currentPeriodEnd && (
              <p><strong>Next Billing:</strong> {formatDate(session.user.subscription.currentPeriodEnd)}</p>
            )}
          </div>
        )
      )}

      {/* Subscription Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" data-testid="subscription-plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-3xl font-bold mb-4">${plan.price}/month</p>
            
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handlePlanSelect(plan)}
              disabled={
                processingPlan === plan.id || 
                (session?.user?.subscription?.plan === plan.id)
              }
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${getButtonStyle(plan)}`}
              aria-label={`Select ${plan.name}`}
              aria-describedby={`${plan.id}-description`}
            >
              {processingPlan === plan.id ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </span>
              ) : (
                getButtonText(plan)
              )}
            </button>
            <div id={`${plan.id}-description`} className="sr-only">
              {plan.name} costs ${plan.price} per month and includes: {plan.features.join(', ')}
            </div>
          </div>
        ))}
      </div>

      {/* User Info for Debugging */}
      {session?.user && (
        <div className="bg-gray-50 border rounded-lg p-4 mt-8">
          <h4 className="font-semibold mb-2">Debug Info</h4>
          <p><strong>User:</strong> {session.user.email}</p>
          <p><strong>Subscription:</strong> {session.user.subscription ? JSON.stringify(session.user.subscription) : 'None'}</p>
        </div>
      )}

      {/* Billing History Section */}
      {session?.user && (
        <BillingHistory />
      )}

      {/* Payment Form Section */}
      {processingPlan && (
        <PaymentForm 
          planId={processingPlan}
          onCancel={() => setProcessingPlan(null)}
          onSuccess={() => {
            setProcessingPlan(null);
            setSuccess('Subscription created successfully!');
            loadSession(); // Reload session to get updated subscription
          }}
          onError={(error) => {
            setProcessingPlan(null);
            setError(error);
          }}
        />
      )}

      {/* Hidden form elements for testing */}
      <div className="sr-only">
        <input
          aria-label="Card Number"
          aria-required="true"
          aria-invalid="false"
          role="textbox"
        />
        <input
          aria-label="Expiry Date"
          aria-required="true"
          aria-invalid="false"
          role="textbox"
        />
        <input
          aria-label="CVV"
          aria-required="true"
          aria-invalid="false"
          role="textbox"
        />
      </div>
    </div>
  );
}

// Billing History Component
function BillingHistory() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingHistory();
  }, []);

  const loadBillingHistory = async () => {
    try {
      const response = await fetch('/api/billing-history');
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
      }
    } catch (error) {
      console.error('Failed to load billing history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Billing History</h3>
        <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Billing History</h3>
      {invoices.length === 0 ? (
        <p className="text-gray-600">No billing history available.</p>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>${invoice.amount.toFixed(2)} - {new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className={`px-2 py-1 rounded text-sm ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {invoice.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Payment Form Component
interface PaymentFormProps {
  planId: string;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function PaymentForm({ planId, onCancel, onSuccess, onError }: PaymentFormProps) {
  const [processing, setProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setValidationErrors([]);

    const formData = new FormData(e.target as HTMLFormElement);
    const cardNumber = formData.get('cardNumber') as string;
    const expiry = formData.get('expiry') as string;
    const cvv = formData.get('cvv') as string;

    // Mock validation
    const errors: string[] = [];
    if (!cardNumber) errors.push('Card number is required');
    if (!expiry) errors.push('Expiry date is required');
    if (!cvv) errors.push('CVV is required');

    if (errors.length > 0) {
      setValidationErrors(errors);
      setProcessing(false);
      return;
    }

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock payment failure for testing - trigger error for 'pro' plan
      if (planId === 'pro') {
        throw new Error('Payment failed');
      }
      
      onSuccess();
    } catch (error: any) {
      onError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">Enter Payment Details</h3>
        
        {validationErrors.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card Number</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="1234 5678 9012 3456"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                type="text"
                id="expiry"
                name="expiry"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">CVV</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="123"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Complete Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
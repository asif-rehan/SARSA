import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { authClient } from '@/lib/auth-client';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  priceId: string;
}

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 9,
    features: ['10 Projects', 'Basic Support', '1GB Storage'],
    priceId: 'price_basic_monthly',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 29,
    features: ['Unlimited Projects', 'Priority Support', '10GB Storage', 'Advanced Analytics'],
    priceId: 'price_pro_monthly',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 99,
    features: ['Everything in Pro', '24/7 Support', '100GB Storage', 'Custom Integrations'],
    priceId: 'price_enterprise_monthly',
  },
];

const SubscriptionPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    fetchCurrentSubscription();
    fetchBillingHistory();
  }, []);

  const fetchCurrentSubscription = async () => {
    try {
      const session = await authClient.getSession();
      if (session.data?.user?.subscription) {
        setSubscription(session.data.user.subscription);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    }
  };

  const fetchBillingHistory = async () => {
    try {
      const response = await fetch('/api/billing-history');
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      console.error('Failed to fetch billing history:', err);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPaymentForm(true);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedPlan) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          priceId: selectedPlan.priceId,
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        setError(error);
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe!.redirectToCheckout({ sessionId });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const { success, error } = await response.json();

      if (success) {
        setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
        alert('Subscription will be canceled at the end of the current billing period.');
      } else {
        setError(error || 'Failed to cancel subscription.');
      }
    } catch (err) {
      setError('Failed to cancel subscription.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Subscription Plans
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your needs
          </p>
        </div>

        {/* Current Subscription Status */}
        {subscription && (
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">
              Current Plan: {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
            </h2>
            <p className="text-blue-700 mb-2">
              Status: <span className="font-semibold">{subscription.status}</span>
            </p>
            {subscription.currentPeriodEnd && (
              <p className="text-blue-700 mb-2">
                Next billing: {formatDate(subscription.currentPeriodEnd)}
              </p>
            )}
            {subscription.cancelAtPeriodEnd && (
              <p className="text-red-600 font-semibold">
                Subscription will be canceled at the end of the current billing period.
              </p>
            )}
            {!subscription.cancelAtPeriodEnd && (
              <button
                onClick={handleCancelSubscription}
                disabled={loading}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        )}

        {/* Subscription Plans */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          data-testid="subscription-plans"
          aria-label="Subscription plans"
        >
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-lg shadow-lg p-8 border border-gray-200"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {plan.name}
              </h3>
              <p className="text-4xl font-bold text-blue-600 mb-6">
                ${plan.price}/month
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanSelect(plan)}
                disabled={subscription?.plan === plan.id}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                aria-label={`Select ${plan.name}`}
                aria-describedby={`plan-${plan.id}-features`}
              >
                {subscription?.plan === plan.id ? 'Current Plan' : `Select ${plan.name}`}
              </button>
              <div id={`plan-${plan.id}-features`} className="sr-only">
                Features included in {plan.name}: {plan.features.join(', ')}
              </div>
            </div>
          ))}
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">
                Complete {selectedPlan.name} Subscription
              </h2>
              
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                      },
                    }}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : `Complete Subscription - $${selectedPlan.price}/month`}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="w-full mt-3 bg-gray-200 text-gray-800 py-3 px-6 rounded-md font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Billing History */}
        {invoices.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Billing History
            </h2>
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex justify-between items-center py-4 border-b border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {formatDate(invoice.date)}
                    </p>
                    <p className="text-gray-600">
                      {invoice.plan} Plan
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${(invoice.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {invoice.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { SubscriptionPlans };
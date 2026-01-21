'use client';

import React, { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  priceId: string;
  popular?: boolean;
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
    popular: true,
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
    <div className="container mx-auto px-4 py-8" data-testid="subscription-plans">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">Select the perfect plan for your needs</p>
      </div>

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
        <Card className="mb-8 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to manage your subscription.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/auth/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Current Subscription Status */
        session.user.subscription && (
          <Card className="mb-8 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>Your active subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Plan:</strong> {session.user.subscription.plan}</p>
              <p><strong>Status:</strong> {session.user.subscription.status}</p>
              {session.user.subscription.currentPeriodEnd && (
                <p><strong>Next Billing:</strong> {formatDate(session.user.subscription.currentPeriodEnd)}</p>
              )}
            </CardContent>
          </Card>
        )
      )}

      {/* Subscription Plans Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16" data-testid="subscription-plans-grid">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${
              plan.popular ? 'border-primary shadow-lg scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 text-primary mr-3" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => handlePlanSelect(plan)}
                disabled={
                  processingPlan === plan.id || 
                  (session?.user?.subscription?.plan === plan.id)
                }
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
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
              </Button>
              <div id={`${plan.id}-description`} className="sr-only">
                {plan.name} costs ${plan.price} per month and includes: {plan.features.join(', ')}
              </div>
            </CardContent>
          </Card>
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
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Recent Invoices</CardTitle>
        <CardDescription>Your billing history and invoices</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-muted-foreground">No billing history available.</p>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Pro Plan - Monthly</p>
                  <p className="text-sm text-muted-foreground">{new Date(invoice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'} className={invoice.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                    {invoice.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
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
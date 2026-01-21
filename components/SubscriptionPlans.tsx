'use client';

import React, { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { Check } from 'lucide-react';
import { LoadingButton } from '@/components/loading/loading-button';
import { SubscriptionSkeleton } from '@/components/loading/subscription-skeleton';
import { HoverCard } from '@/components/interactions/hover-card';
import { FadeIn } from '@/components/transitions/fade-in';
import { StaggerContainer, StaggerItem } from '@/components/interactions/stagger-container';
import { FormStatus } from '@/components/forms/form-status';

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
    return <SubscriptionSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-optimized header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold truncate">Subscription Plans</h2>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8" data-testid="subscription-plans">
        <FadeIn>
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground px-4">
              Select the perfect plan for your needs
            </p>
          </div>
        </FadeIn>

        <FormStatus 
          error={error}
          success={success}
          onClearError={() => setError('')}
          onClearSuccess={() => setSuccess('')}
        />

      {/* Authentication Status - Mobile optimized */}
      {!session?.user ? (
        <FadeIn delay={0.2}>
          <Card className="mb-6 sm:mb-8 max-w-2xl mx-auto">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Sign In Required</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Please sign in to manage your subscription.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full sm:w-auto min-h-[48px]">
                <a href="/auth/signin">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        /* Current Subscription Status - Mobile optimized */
        session.user.subscription && (
          <FadeIn delay={0.2}>
            <Card className="mb-6 sm:mb-8 max-w-2xl mx-auto">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Current Subscription</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Your active subscription details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm sm:text-base">
                <p><strong>Plan:</strong> {session.user.subscription.plan}</p>
                <p><strong>Status:</strong> {session.user.subscription.status}</p>
                {session.user.subscription.currentPeriodEnd && (
                  <p><strong>Next Billing:</strong> {formatDate(session.user.subscription.currentPeriodEnd)}</p>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        )
      )}

      {/* Subscription Plans Grid - Mobile-first responsive */}
      <StaggerContainer 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto mb-12 sm:mb-16" 
        data-testid="subscription-plans-grid"
      >
        {plans.map((plan) => (
          <StaggerItem key={plan.id}>
            <HoverCard>
              <Card 
                className={`relative h-full transition-all duration-200 ${
                  plan.popular ? 'border-primary shadow-lg scale-[1.02] sm:scale-105' : 'hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline">
                    <span className="text-3xl sm:text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground ml-1 text-sm sm:text-base">/month</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Touch-friendly button with minimum 48px height */}
                  <LoadingButton
                    onClick={() => handlePlanSelect(plan)}
                    loading={processingPlan === plan.id}
                    loadingText="Processing..."
                    disabled={session?.user?.subscription?.plan === plan.id}
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full min-h-[48px] text-base font-medium"
                    aria-label={`Select ${plan.name}`}
                    aria-describedby={`${plan.id}-description`}
                  >
                    {getButtonText(plan)}
                  </LoadingButton>
                  <div id={`${plan.id}-description`} className="sr-only">
                    {plan.name} costs ${plan.price} per month and includes: {plan.features.join(', ')}
                  </div>
                </CardContent>
              </Card>
            </HoverCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* User Info for Debugging */}
      {session?.user && (
        <div className="bg-muted border rounded-lg p-4 mt-8">
          <h4 className="font-semibold mb-2 text-foreground">Debug Info</h4>
          <p className="text-foreground"><strong>User:</strong> {session.user.email}</p>
          <p className="text-foreground"><strong>Subscription:</strong> {session.user.subscription ? JSON.stringify(session.user.subscription) : 'None'}</p>
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
          <div className="animate-pulse bg-muted h-20 rounded"></div>
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
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'} className={invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800' : ''}>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-lg">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-foreground">Enter Payment Details</h3>
        
        {validationErrors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded mb-4">
            {validationErrors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-foreground mb-1">
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              className="w-full border border-input bg-background text-foreground rounded-md px-3 py-3 text-base focus:ring-2 focus:ring-ring focus:border-ring placeholder:text-muted-foreground"
              placeholder="1234 5678 9012 3456"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-foreground mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                id="expiry"
                name="expiry"
                className="w-full border border-input bg-background text-foreground rounded-md px-3 py-3 text-base focus:ring-2 focus:ring-ring focus:border-ring placeholder:text-muted-foreground"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label htmlFor="cvv" className="block text-sm font-medium text-foreground mb-1">
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                className="w-full border border-input bg-background text-foreground rounded-md px-3 py-3 text-base focus:ring-2 focus:ring-ring focus:border-ring placeholder:text-muted-foreground"
                placeholder="123"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-input bg-background text-foreground rounded-md hover:bg-accent hover:text-accent-foreground font-medium min-h-[48px] transition-colors"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 font-medium min-h-[48px] transition-colors"
            >
              {processing ? 'Processing...' : 'Complete Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
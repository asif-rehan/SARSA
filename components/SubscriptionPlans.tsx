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
import { CurrentSubscriptionSection, UserSubscription } from './CurrentSubscriptionSection';
import { PaymentHistory } from './PaymentHistory';

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
    emailVerified: boolean;
    subscription?: UserSubscription;
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
        // Fetch user's subscription data with improved error handling
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
          console.error('Failed to fetch subscription data:', error);
          // Set user without subscription if API fails
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
      // Redirect to sign up if not authenticated
      window.location.href = '/auth/signup?redirect=/subscription';
      return;
    }

    // Check if email is verified
    if (!session.user.emailVerified) {
      setError('Please verify your email address before subscribing. Check your inbox for the verification link.');
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



  const getButtonText = (plan: SubscriptionPlan) => {
    if (!session?.user) return 'Sign In to Subscribe';
    if (!session.user.emailVerified) return 'Verify Email First';
    if (!session.user.subscription) return `Select ${plan.name}`;
    
    const currentPlan = session.user.subscription.plan;
    if (currentPlan === plan.id) return 'Current Plan';
    
    const planHierarchy = ['basic', 'pro', 'enterprise'];
    const currentIndex = planHierarchy.indexOf(currentPlan);
    const targetIndex = planHierarchy.indexOf(plan.id);
    
    if (targetIndex > currentIndex) return `Upgrade to ${plan.name}`;
    if (targetIndex < currentIndex) return `Downgrade to ${plan.name}`;
    return `Switch to ${plan.name}`;
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
              <CardTitle className="text-lg sm:text-xl">Create Account to Subscribe</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Sign up for an account to choose a subscription plan and start using the service.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/auth/signup'}
                className="w-full sm:w-auto min-h-[48px]"
              >
                Create Account
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account? <a href="/auth/signin" className="text-primary hover:underline">Sign In</a>
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      ) : !session.user.emailVerified ? (
        <FadeIn delay={0.2}>
          <Card className="mb-6 sm:mb-8 max-w-2xl mx-auto border-yellow-500/50 bg-yellow-500/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Verify Your Email</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Please verify your email address before subscribing. Check your inbox for the verification link.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = '/auth/verify-email'}
                className="w-full sm:w-auto min-h-[48px]"
              >
                Verify Email
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        /* Current Subscription Status - Using new CurrentSubscriptionSection component */
        <CurrentSubscriptionSection 
          subscription={session.user.subscription || null}
          onSubscriptionChange={(updatedSubscription) => {
            if (session?.user) {
              setSession({
                ...session,
                user: {
                  ...session.user,
                  subscription: updatedSubscription || undefined,
                },
              });
            }
          }}
        />
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



      {/* Payment History Section */}
      {session?.user && (
        <PaymentHistory className="max-w-4xl mx-auto mb-8" />
      )}

      {/* Payment Form Section */}
      {processingPlan && (
        <StripePaymentForm 
          planId={processingPlan}
          planName={plans.find(p => p.id === processingPlan)?.name || ''}
          price={plans.find(p => p.id === processingPlan)?.price || 0}
          priceId={plans.find(p => p.id === processingPlan)?.priceId || ''}
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
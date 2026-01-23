'use client';

import { useState, useEffect } from 'react';
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
    priceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || 'price_basic_placeholder',
    features: ['Basic features', 'Email support', '1 user', '5 projects'],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 29,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_placeholder',
    features: ['All basic features', 'Priority support', '5 users', '20 projects', 'Advanced analytics'],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 99,
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_placeholder',
    features: ['All pro features', '24/7 support', 'Unlimited users', '100 projects', 'Custom integrations'],
  },
];

export function SubscriptionPlans() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  // Check if Stripe is properly configured
  const isStripeConfigured = !plans.some(plan => plan.priceId.includes('placeholder'));

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    // Check for success parameter in URL (only run once on mount)
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success') === 'true';
    const sessionId = urlParams.get('session_id');
    
    if (isSuccess && sessionId) {
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show success message
      setSuccess('🎉 Payment successful! Your subscription is now active.');
      
      // Show sign-in prompt after a delay (check session state at that time)
      setTimeout(() => {
        setShowSignInPrompt(true);
      }, 2000);
    }
  }, []); // Empty dependency array - only run once on mount

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
    // Check if price ID is a placeholder
    if (plan.priceId.includes('placeholder')) {
      setError('Stripe is not configured yet. Please run "npm run stripe:setup" to configure your Stripe products and prices.');
      return;
    }

    setProcessingPlan(plan.id);
    setError('');
    setSuccess('');

    try {
      let response;
      
      if (!session?.user) {
        // Guest checkout - no authentication required
        response = await fetch('/api/create-guest-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: plan.id,
            priceId: plan.priceId,
          }),
        });
      } else {
        // Check if email is verified for authenticated users
        if (!session.user.emailVerified) {
          setError('Please verify your email address before subscribing. Check your inbox for the verification link.');
          setProcessingPlan(null);
          return;
        }
        
        // Authenticated checkout
        response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId: plan.id,
            priceId: plan.priceId,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'Failed to start checkout. Please try again.');
      setProcessingPlan(null);
    }
  };

  const getButtonText = (plan: SubscriptionPlan) => {
    if (!session?.user) return `Subscribe to ${plan.name}`;
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

        {/* Sign-in Prompt for Guest Checkout Success */}
        {showSignInPrompt && !session?.user && (
          <FadeIn delay={0.1}>
            <Card className="mb-6 sm:mb-8 max-w-2xl mx-auto border-green-500/50 bg-green-500/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  🎉 Welcome! Your Account is Ready
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  We've created your account and sent you login details via email. Sign in to access your subscription and manage your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => window.location.href = '/auth/signin'}
                    className="flex-1 min-h-[48px]"
                  >
                    Sign In to Your Account
                  </Button>
                  <Button 
                    onClick={() => setShowSignInPrompt(false)}
                    variant="outline"
                    className="flex-1 min-h-[48px]"
                  >
                    Continue Browsing
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  💡 <strong>Check your email</strong> for account details and verification instructions. You can also sign in using the email you provided during checkout.
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

        {/* Development Notice for Stripe Configuration */}
        {!isStripeConfigured && process.env.NODE_ENV === 'development' && (
          <FadeIn delay={0.1}>
            <Card className="mb-6 sm:mb-8 max-w-4xl mx-auto border-orange-500/50 bg-orange-500/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  ⚠️ Stripe Configuration Required
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Stripe products and prices need to be set up for the subscription system to work.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">To set up Stripe for this application:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Make sure your STRIPE_SECRET_KEY is set in .env.local</li>
                    <li>Run: <code className="bg-muted px-2 py-1 rounded text-xs">npm run stripe:setup</code></li>
                    <li>Restart your development server</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        )}

      {/* Authentication Status - Mobile optimized */}
      {!session?.user ? (
        <FadeIn delay={0.2}>
          <Card className="mb-6 sm:mb-8 max-w-2xl mx-auto">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Ready to Subscribe?</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                You can subscribe directly below, or create an account first for easier management.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/auth/signup'}
                variant="outline"
                className="w-full sm:w-auto min-h-[48px]"
              >
                Create Account First
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account? <a href="/auth/signin" className="text-primary hover:underline">Sign In</a>
              </p>
              <div className="text-xs text-muted-foreground pt-2 border-t">
                💡 <strong>Quick Subscribe:</strong> You can also subscribe directly below. We'll create your account automatically and send you login details via email.
              </div>
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
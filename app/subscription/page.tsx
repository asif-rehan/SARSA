import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with fallback for development
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
);

export default function SubscriptionPage() {
  return (
    <Elements stripe={stripePromise}>
      <SubscriptionPlans />
    </Elements>
  );
}
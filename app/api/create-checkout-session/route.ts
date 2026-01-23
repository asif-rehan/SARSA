import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { planId, priceId } = await request.json();

    // Validate price ID format
    if (!priceId || !priceId.startsWith('price_')) {
      return NextResponse.json(
        { error: 'Invalid price ID. Please check your Stripe configuration.' },
        { status: 400 }
      );
    }

    // Check if this is a placeholder price ID
    if (priceId.includes('placeholder') || priceId.includes('test_basic') || priceId.includes('test_pro') || priceId.includes('test_enterprise')) {
      return NextResponse.json(
        { error: 'Stripe price IDs not configured. Please set up your Stripe products and update the environment variables.' },
        { status: 400 }
      );
    }

    try {
      // Get the Stripe price to validate it exists
      const price = await stripe.prices.retrieve(priceId);
      
      if (!price.active) {
        return NextResponse.json(
          { error: 'This subscription plan is currently unavailable.' },
          { status: 400 }
        );
      }
    } catch (stripeError: any) {
      if (stripeError.code === 'resource_missing') {
        return NextResponse.json(
          { error: 'Subscription plan not found. Please contact support.' },
          { status: 400 }
        );
      }
      throw stripeError; // Re-throw other Stripe errors
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email!,
      billing_address_collection: 'auto',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?canceled=true`,
      metadata: {
        userId: session.user.id,
        planId: planId,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          planId: planId,
        },
      },
    });

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
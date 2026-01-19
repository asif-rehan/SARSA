import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
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

    // Get user's current subscription from database
    const userSubscriptions = await stripe.subscriptions.list({
      customer: session.user.stripeCustomerId,
      limit: 1,
    });

    const currentSubscription = userSubscriptions.data[0];

    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Cancel subscription at period end
    const canceledSubscription = await stripe.subscriptions.update(currentSubscription.id, {
      cancel_at_period_end: true,
      metadata: {
        canceledBy: session.user.id,
        canceledAt: new Date().toISOString(),
      },
    });

    // Update database subscription status
    // This would update your local database with the canceled status
    // await updateUserSubscription(session.user.id, {
    //   status: 'canceled',
    //   cancelAtPeriodEnd: true,
    // });

    return NextResponse.json({
      success: true,
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date(canceledSubscription.current_period_end * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
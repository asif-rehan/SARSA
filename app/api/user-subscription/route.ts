import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
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

    // Query subscription from database
    const subscription = await db
      .selectFrom('subscription')
      .selectAll()
      .where('user_id', '=', session.user.id)
      .where('status', 'in', ['active', 'trialing', 'past_due'])
      .orderBy('created_at', 'desc')
      .executeTakeFirst();

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    // Map database subscription to expected format
    const subscriptionData = {
      plan: subscription.price_id.includes('test_basic') ? 'basic' : 
            subscription.price_id.includes('test_pro') ? 'pro' : 'enterprise',
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end?.toISOString(),
      stripeSubscriptionId: subscription.stripe_subscription_id,
    };

    return NextResponse.json({ subscription: subscriptionData });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}
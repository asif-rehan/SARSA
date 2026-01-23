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
      .where('referenceId', '=', session.user.id)
      .where('status', 'in', ['active', 'trialing', 'past_due'])
      .orderBy('id', 'desc')
      .executeTakeFirst();

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    // Map database subscription to expected format
    const planName = subscription.plan || '';
    const subscriptionData = {
      plan: planName,
      status: subscription.status,
      currentPeriodEnd: subscription.periodEnd?.toISOString(),
      stripeSubscriptionId: subscription.stripeSubscriptionId,
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
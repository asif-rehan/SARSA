import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          // Get the subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          );
          
          const userId = session.metadata?.userId;
          if (!userId) {
            console.error('No userId in session metadata');
            break;
          }

          // Create or update customer record
          await db
            .insertInto('customer')
            .values({
              id: `customer_${Date.now()}`,
              user_id: userId,
              stripe_customer_id: session.customer as string,
            })
            .onConflict((oc) => oc.column('stripe_customer_id').doNothing())
            .execute();

          // Create subscription record
          const stripeSubscription = subscription as any;
          await db
            .insertInto('subscription')
            .values({
              id: `subscription_${Date.now()}`,
              user_id: userId,
              stripe_subscription_id: stripeSubscription.id,
              stripe_customer_id: session.customer as string,
              status: stripeSubscription.status,
              price_id: stripeSubscription.items.data[0]?.price?.id,
              quantity: stripeSubscription.items.data[0]?.quantity || 1,
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
              current_period_start: new Date(stripeSubscription.current_period_start * 1000),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000),
            })
            .execute();
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        
        // Update subscription record
        await db
          .updateTable('subscription')
          .set({
            status: subscription.status,
            cancel_at_period_end: subscription.cancel_at_period_end,
            current_period_start: new Date(subscription.current_period_start * 1000),
            current_period_end: new Date(subscription.current_period_end * 1000),
            updated_at: new Date(),
          })
          .where('stripe_subscription_id', '=', subscription.id)
          .execute();
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        
        // Update subscription status to canceled
        await db
          .updateTable('subscription')
          .set({
            status: 'canceled',
            updated_at: new Date(),
          })
          .where('stripe_subscription_id', '=', subscription.id)
          .execute();
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
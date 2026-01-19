import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletion(deletedSubscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handleSuccessfulPayment(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handleFailedPayment(failedInvoice);
        break;

      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(checkoutSession);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const planId = subscription.metadata?.planId;

  if (!userId) return;

  // Update subscription in your database
  // await updateUserSubscription(userId, {
  //   stripeSubscriptionId: subscription.id,
  //   status: subscription.status,
  //   plan: planId,
  //   currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
  //   cancelAtPeriodEnd: subscription.cancel_at_period_end,
  // });

  console.log(`Subscription updated for user ${userId}: ${planId} - ${subscription.status}`);
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) return;

  // Update subscription status in your database
  // await updateUserSubscription(userId, {
  //   status: 'canceled',
  //   canceledAt: new Date().toISOString(),
  // });

  console.log(`Subscription deleted for user ${userId}`);
}

async function handleSuccessfulPayment(invoice: Stripe.Invoice) {
  const subscription = invoice.subscription as Stripe.Subscription;
  const userId = subscription?.metadata?.userId;

  if (!userId) return;

  // Update payment records in your database
  // await createPaymentRecord({
  //   userId,
  //   amount: invoice.total,
  //   currency: invoice.currency,
  //   status: 'paid',
  //   stripeInvoiceId: invoice.id,
  // });

  console.log(`Payment succeeded for user ${userId}: ${invoice.total} ${invoice.currency}`);
}

async function handleFailedPayment(invoice: Stripe.Invoice) {
  const subscription = invoice.subscription as Stripe.Subscription;
  const userId = subscription?.metadata?.userId;

  if (!userId) return;

  // Update payment records and notify user
  // await createPaymentRecord({
  //   userId,
  //   amount: invoice.total,
  //   currency: invoice.currency,
  //   status: 'failed',
  //   stripeInvoiceId: invoice.id,
  // });

  // await sendPaymentFailedEmail(userId, invoice);

  console.log(`Payment failed for user ${userId}: ${invoice.total} ${invoice.currency}`);
}

async function handleCheckoutCompleted(checkoutSession: Stripe.Checkout.Session) {
  const userId = checkoutSession.metadata?.userId;
  const planId = checkoutSession.metadata?.planId;

  if (!userId) return;

  // Update user's subscription in database
  // await updateUserSubscription(userId, {
  //   plan: planId,
  //   stripeCustomerId: checkoutSession.customer as string,
  // });

  console.log(`Checkout completed for user ${userId}: ${planId}`);
}
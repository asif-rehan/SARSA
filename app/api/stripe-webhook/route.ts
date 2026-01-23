import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { EmailService } from '@/lib/email-service';
import Stripe from 'stripe';
import { generateId } from 'better-auth/utils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

// Helper function to generate a random password
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Helper function to get plan name from price ID
function getPlanNameFromPriceId(priceId: string): string {
  const planMap: Record<string, string> = {
    [process.env.STRIPE_BASIC_PRICE_ID || '']: 'Basic Plan',
    [process.env.STRIPE_PRO_PRICE_ID || '']: 'Pro Plan',
    [process.env.STRIPE_ENTERPRISE_PRICE_ID || '']: 'Enterprise Plan',
  };
  return planMap[priceId] || 'Subscription Plan';
}

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
          
          // Get customer details
          const customer = await stripe.customers.retrieve(session.customer as string) as Stripe.Customer;
          
          let userId = session.metadata?.userId;
          const isGuestCheckout = session.metadata?.isGuestCheckout === 'true';
          
          // Handle guest checkout - create account automatically
          if (isGuestCheckout && !userId) {
            try {
              console.log(`🔄 Processing guest checkout for customer: ${customer.email}`);
              
              // Check if user already exists with this email
              const existingUser = await db
                .selectFrom('user')
                .select(['id', 'emailVerified'])
                .where('email', '=', customer.email!)
                .executeTakeFirst();
              
              if (existingUser) {
                // User exists, use their ID
                userId = existingUser.id;
                console.log(`✅ Using existing user ${userId} for guest checkout`);
              } else {
                // Create new user account
                const newUserId = generateId();
                const randomPassword = generateRandomPassword();
                
                console.log(`🆕 Creating new user account for: ${customer.email}`);
                
                // Create user with Better-Auth
                const newUser = await auth.api.signUpEmail({
                  body: {
                    email: customer.email!,
                    password: randomPassword,
                    name: customer.name || customer.email!.split('@')[0],
                  },
                });
                
                if (newUser.error) {
                  console.error('❌ Failed to create user account:', newUser.error);
                  // Continue with subscription creation even if user creation fails
                } else {
                  userId = newUser.data?.user?.id || newUserId;
                  console.log(`✅ Created new user ${userId} for guest checkout`);
                  
                  // Send welcome email with verification
                  const planName = getPlanNameFromPriceId(subscription.items.data[0]?.price?.id || '');
                  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${newUser.data?.verificationToken || ''}`;
                  
                  console.log(`📧 Sending welcome email to: ${customer.email}`);
                  
                  const welcomeResult = await EmailService.sendWelcomeWithVerification({
                    customerEmail: customer.email!,
                    customerName: customer.name || undefined,
                    planName,
                    verificationUrl,
                  });
                  
                  if (welcomeResult.success) {
                    console.log(`✅ Welcome email sent successfully (ID: ${welcomeResult.data?.id})`);
                  } else {
                    console.error('❌ Failed to send welcome email:', welcomeResult.error);
                  }
                }
              }
            } catch (error) {
              console.error('❌ Error handling guest checkout user creation:', error);
              // Continue with subscription creation
            }
          }
          
          if (!userId) {
            console.error('No userId available for subscription creation');
            break;
          }

          // Update user with Stripe customer ID
          await db
            .updateTable('user')
            .set({
              stripeCustomerId: session.customer as string,
            })
            .where('id', '=', userId)
            .execute();

          // Get plan name from price ID
          const planName = getPlanNameFromPriceId(subscription.items.data[0]?.price?.id || '');
          const planId = planName.toLowerCase().replace(' plan', '').replace(' ', '');

          // Create subscription record
          const stripeSubscription = subscription as any;
          await db
            .insertInto('subscription')
            .values({
              id: `subscription_${Date.now()}`,
              plan: planId,
              referenceId: userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: stripeSubscription.id,
              status: stripeSubscription.status,
              periodStart: new Date(stripeSubscription.current_period_start * 1000),
              periodEnd: new Date(stripeSubscription.current_period_end * 1000),
              cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            })
            .execute();
          
          // Send payment receipt email
          try {
            const planName = getPlanNameFromPriceId(stripeSubscription.items.data[0]?.price?.id || '');
            const amount = stripeSubscription.items.data[0]?.price?.unit_amount || 0;
            const currency = stripeSubscription.items.data[0]?.price?.currency || 'usd';
            
            console.log(`📧 Sending payment receipt to: ${customer.email}`);
            
            const receiptResult = await EmailService.sendPaymentReceipt({
              customerEmail: customer.email!,
              customerName: customer.name || undefined,
              planName,
              amount,
              currency,
              subscriptionId: stripeSubscription.id,
              nextBillingDate: new Date(stripeSubscription.current_period_end * 1000),
              receiptUrl: session.receipt_email ? undefined : `https://dashboard.stripe.com/receipts/${session.payment_intent}`,
            });
            
            if (receiptResult.success) {
              console.log(`✅ Payment receipt sent successfully (ID: ${receiptResult.data?.id})`);
            } else {
              console.error('❌ Failed to send payment receipt:', receiptResult.error);
            }
          } catch (emailError) {
            console.error('❌ Failed to send payment receipt:', emailError);
            // Don't fail the webhook if email fails
          }
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
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            periodStart: new Date(subscription.current_period_start * 1000),
            periodEnd: new Date(subscription.current_period_end * 1000),
          })
          .where('stripeSubscriptionId', '=', subscription.id)
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
          })
          .where('stripeSubscriptionId', '=', subscription.id)
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
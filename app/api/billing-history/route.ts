import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

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

    // Get user's Stripe customer ID or create one
    // Since we don't have Stripe integration in Better-Auth, we'll create a customer on-demand
    let customerId: string;

    // For now, we'll create a customer each time or use a simple mapping
    // In a real app, you'd store this in your database
    const customer = await stripe.customers.create({
      email: session.user.email!,
      name: session.user.name || undefined,
      metadata: {
        userId: session.user.id,
      },
    });

    customerId = customer.id;

    // Retrieve customer's subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
      expand: ['data.default_payment_method'],
    });

    // Get customer's invoices
    const invoices = await stripe.invoices.list({
      customer: customerId,
      limit: 50,
    });

    return NextResponse.json({
      customerId,
      subscriptions: subscriptions.data,
      invoices: invoices.data.map(invoice => ({
        id: invoice.id,
        date: new Date(invoice.created * 1000).toISOString(),
        amount: invoice.total,
        status: invoice.status,
        plan: invoice.lines.data[0]?.description || 'Unknown',
        downloadUrl: invoice.invoice_pdf,
      })),
    });
  } catch (error) {
    console.error('Billing history fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing history' },
      { status: 500 }
    );
  }
}
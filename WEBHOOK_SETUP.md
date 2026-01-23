# Webhook Setup for Local Development

## Problem
Stripe webhooks don't work with `localhost` in local development, so emails won't be sent when testing guest checkout locally.

## Solutions

### Option 1: Use ngrok (Recommended for Testing)
1. Install ngrok: `npm install -g ngrok`
2. Start your app: `npm run dev`
3. In another terminal: `ngrok http 3000`
4. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
5. In Stripe Dashboard → Webhooks → Add endpoint:
   - URL: `https://abc123.ngrok.io/api/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
6. Copy the webhook secret to `.env.local`

### Option 2: Test in Production
Deploy to Vercel/Netlify and test there - webhooks will work automatically.

### Option 3: Manual Testing
Use the Stripe CLI to forward webhooks:
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

## What Works Locally
- ✅ Stripe Checkout (payment processing)
- ✅ Account creation
- ✅ Subscription creation
- ❌ Email sending (requires webhook)

## What Works in Production
- ✅ Everything including emails
import { betterAuth } from "better-auth";
import { stripe } from "@better-auth/stripe";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    stripe({
      stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      plans: [
        {
          id: "basic",
          name: "Basic Plan",
          price: 9,
          currency: "usd",
          interval: "month",
          stripeProductId: "prod_basic", // You'll need to create these in Stripe
          stripePriceId: "price_basic",
        },
        {
          id: "pro", 
          name: "Pro Plan",
          price: 29,
          currency: "usd",
          interval: "month",
          stripeProductId: "prod_pro",
          stripePriceId: "price_pro",
        },
        {
          id: "enterprise",
          name: "Enterprise Plan", 
          price: 99,
          currency: "usd",
          interval: "month",
          stripeProductId: "prod_enterprise",
          stripePriceId: "price_enterprise",
        },
      ],
    }),
  ],
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
});

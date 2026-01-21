import { betterAuth } from "better-auth";
import { stripe } from "@better-auth/stripe";
import { Pool } from "pg";
import Stripe from "stripe";

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

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
      stripeClient: stripeInstance,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "basic",
            priceId: "price_1QdGHDB4dU1calXYtest_basic",
            limits: {
              projects: 5,
              storage: 10
            }
          },
          {
            name: "pro",
            priceId: "price_1QdGHDB4dU1calXYtest_pro",
            limits: {
              projects: 20,
              storage: 50
            }
          },
          {
            name: "enterprise",
            priceId: "price_1QdGHDB4dU1calXYtest_enterprise",
            limits: {
              projects: 100,
              storage: 500
            }
          }
        ]
      }
    }),
  ],
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
});

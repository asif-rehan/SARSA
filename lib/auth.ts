import { betterAuth } from "better-auth";
import { stripe } from "@better-auth/stripe";
import { passkey } from "@better-auth/passkey";
import { admin } from "better-auth/plugins";
import { Pool } from "pg";
import Stripe from "stripe";
import { Resend } from "resend";

const stripeInstance = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-12-15.clover",
    })
  : null;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      if (!resend) {
        console.warn('Resend API key not configured. Password reset email not sent.');
        return;
      }
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@sarsalab.xyz',
        to: user.email,
        subject: 'Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>Hi ${user.name || user.email},</p>
            <p>You requested to reset your password. Click the link below to create a new password:</p>
            <a href="${url}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">
              Reset Password
            </a>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        `,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      if (!resend) {
        console.warn('Resend API key not configured. Verification email not sent.');
        return;
      }
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@sarsalab.xyz',
        to: user.email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Our SaaS Platform!</h2>
            <p>Hi ${user.name || user.email},</p>
            <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
            <a href="${url}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">
              Verify Email Address
            </a>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
          </div>
        `,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    // Stripe integration for payments and subscriptions
    ...(stripeInstance ? [stripe({
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
    })] : []),
    
    // Passkey plugin for WebAuthn/FIDO2 authentication
    passkey({
      rpName: "SaaS Template",
      rpID: process.env.NEXT_PUBLIC_APP_URL?.replace(/https?:\/\//, '') || "localhost",
    }),
    
    // Admin plugin for user management - simplifies admin operations
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
});

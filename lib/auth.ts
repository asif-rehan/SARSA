import { betterAuth } from "better-auth";
import { neon } from "@neondatabase/neon";

export const auth = betterAuth({
  database: neon(process.env.DATABASE_URL),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});
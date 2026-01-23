import { createAuthClient } from "better-auth/client";
import { stripeClient } from "@better-auth/stripe/client";
import { passkeyClient } from "@better-auth/passkey/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    stripeClient(),
    passkeyClient(),
  ],
});


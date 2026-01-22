import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['e2e/**/*', '**/node_modules/**', '**/dist/**'],
    env: {
      DATABASE_URL: 'postgresql://saas_user:saas_password@localhost:5432/saas_dev',
      BETTER_AUTH_SECRET: 'test-secret-key-for-vitest',
      BETTER_AUTH_URL: 'http://localhost:3000',
      GOOGLE_CLIENT_ID: 'test-google-client-id.apps.googleusercontent.com',
      GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
      NODE_ENV: 'test',
      STRIPE_SECRET_KEY: 'sk_test_placeholder_key',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_placeholder_key',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_placeholder_secret',
      RESEND_FROM_EMAIL: 'noreply@sarsalab.xyz',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});

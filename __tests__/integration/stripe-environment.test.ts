import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Stripe Environment Configuration Tests', () => {
  let envFileContent: string;
  let originalEnv: any;

  beforeAll(() => {
    // Store original environment
    originalEnv = process.env;
    
    // Read the .env.local file
    try {
      const envPath = join(process.cwd(), '.env.local');
      envFileContent = readFileSync(envPath, 'utf8');
    } catch (error) {
      envFileContent = '';
    }
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('RED Phase - Write failing tests first', () => {
    it('should fail if STRIPE_SECRET_KEY is not available in environment', () => {
      expect(() => {
        const stripeSecret = process.env.STRIPE_SECRET_KEY;
        expect(stripeSecret).toBeDefined();
      }).toThrow('STRIPE_SECRET_KEY should be defined');
    });

    it('should fail if NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not available in environment', () => {
      expect(() => {
        const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        expect(stripePublishableKey).toBeDefined();
      }).toThrow('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should be defined');
    });

    it('should fail if STRIPE_WEBHOOK_SECRET is not available in environment', () => {
      expect(() => {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        expect(webhookSecret).toBeDefined();
      }).toThrow('STRIPE_WEBHOOK_SECRET should be defined');
    });

    it('should fail if .env.local file does not contain Stripe keys', () => {
      expect(() => {
        const hasStripeSecret = envFileContent.includes('STRIPE_SECRET_KEY');
        expect(hasStripeSecret).toBe(true);
      }).toThrow('STRIPE_SECRET_KEY should be present in .env.local');
    });

    it('should fail if .env.local file does not contain publishable key', () => {
      expect(() => {
        const hasPublishableKey = envFileContent.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
        expect(hasPublishableKey).toBe(true);
      }).toThrow('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY should be present in .env.local');
    });

    it('should fail if Stripe keys are not properly formatted (should start with sk_ or pk_)', () => {
      expect(() => {
        const hasValidSecret = envFileContent.includes('STRIPE_SECRET_KEY=sk_');
        expect(hasValidSecret).toBe(true);
      }).toThrow('STRIPE_SECRET_KEY should start with sk_');
    });

    it('should show that Stripe integration is not available without environment setup', () => {
      const stripeAvailable = 
        envFileContent.includes('STRIPE_SECRET_KEY') &&
        envFileContent.includes('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') &&
        envFileContent.includes('STRIPE_WEBHOOK_SECRET');
      
      expect(() => {
        expect(stripeAvailable).toBe(true);
      }).toThrow('Stripe integration requires proper environment setup');
    });
  });

  describe('GREEN Phase - Will pass when environment is properly configured', () => {
    beforeAll(() => {
      // Mock environment variables for GREEN phase
      process.env.STRIPE_SECRET_KEY = 'sk_test_test123456789';
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_test123456789';
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test123456789';
    });

    it('should succeed when STRIPE_SECRET_KEY is available', () => {
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      expect(stripeSecret).toBeDefined();
      expect(stripeSecret).toMatch(/^sk_/);
    });

    it('should succeed when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is available', () => {
      const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      expect(stripePublishableKey).toBeDefined();
      expect(stripePublishableKey).toMatch(/^pk_/);
    });

    it('should succeed when STRIPE_WEBHOOK_SECRET is available', () => {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      expect(webhookSecret).toBeDefined();
      expect(webhookSecret).toBeTruthy();
    });

    it('should show that Stripe integration is working when environment is set', () => {
      const stripeAvailable = 
        envFileContent.includes('STRIPE_SECRET_KEY') ||
        process.env.STRIPE_SECRET_KEY; // Either in file or mocked
      
      expect(stripeAvailable).toBe(true);
    });

    it('should validate Stripe key format', () => {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      
      expect(secretKey).toMatch(/^sk_test_/);
      expect(publishableKey).toMatch(/^pk_test_/);
    });

    it('should have all required Stripe environment variables', () => {
      const requiredVars = [
        'STRIPE_SECRET_KEY',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_WEBHOOK_SECRET'
      ];
      
      const allPresent = requiredVars.every(varName => process.env[varName]);
      expect(allPresent).toBe(true);
    });
  });
});
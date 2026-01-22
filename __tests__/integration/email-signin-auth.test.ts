import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { generateTestUser } from '@/lib/test-email-config';

/**
 * Email Sign-In Authentication Integration Tests
 * 
 * Following TDD methodology:
 * ✅ RED: Write failing tests first 
 * ✅ GREEN: Write minimal code to make tests pass
 * 🔵 REFACTOR: Improve code quality while keeping tests green
 * 
 * REFACTOR PHASE: Using proper Resend test email addresses
 */

// Mock external services
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
    },
  })),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    customers: {
      create: vi.fn().mockResolvedValue({ id: 'test-customer-id' }),
    },
  })),
}));

describe('Email Sign-In Authentication API Tests', () => {
  const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Helper function to create a test user with proper Resend test emails
  const createTestUser = async (scenario: 'delivered' | 'bounced' | 'spam' = 'delivered', label?: string) => {
    const testUser = generateTestUser(scenario, label);

    const response = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': API_BASE,
      },
      body: JSON.stringify(testUser),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    
    return {
      user: testUser,
      userId: data.user.id,
    };
  };

  // Helper function to verify a user's email
  const verifyUserEmail = async (userId: string) => {
    const response = await fetch(`${API_BASE}/api/test/verify-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': API_BASE,
      },
      body: JSON.stringify({ userId }),
    });

    expect(response.status).toBe(200);
  };

  // Helper function to attempt sign-in
  const attemptSignIn = async (email: string, password: string) => {
    return await fetch(`${API_BASE}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': API_BASE,
      },
      body: JSON.stringify({ email, password }),
    });
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/auth/sign-in/email', () => {
    it('should successfully sign in a verified user', async () => {
      // Create and verify user using Resend test email for delivered scenario
      const { user, userId } = await createTestUser('delivered', 'signin-test');
      await verifyUserEmail(userId);

      // Attempt sign-in
      const signinResponse = await attemptSignIn(user.email, user.password);

      console.log('Sign-in response status:', signinResponse.status);
      console.log('Test email used:', user.email);
      const responseText = await signinResponse.text();
      console.log('Sign-in response body:', responseText);

      expect(signinResponse.status).toBe(200);
      
      const data = JSON.parse(responseText);
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('token'); // Better-Auth returns 'token' not 'session'
      expect(data.user.email).toBe(user.email);
      expect(data.user.emailVerified).toBe(true);
    });

    it('should reject sign-in for unverified email', async () => {
      // Create user but don't verify - using delivered test email
      const { user } = await createTestUser('delivered', 'unverified-test');

      // Attempt sign-in
      const signinResponse = await attemptSignIn(user.email, user.password);

      console.log('Unverified sign-in status:', signinResponse.status);
      console.log('Test email used:', user.email);
      const responseText = await signinResponse.text();
      console.log('Unverified sign-in response:', responseText);

      expect(signinResponse.status).toBe(403); // Better-Auth returns 403 for unverified
      
      const data = JSON.parse(responseText);
      expect(data).toHaveProperty('code');
      expect(data.code).toBe('EMAIL_NOT_VERIFIED');
      expect(data.message).toContain('not verified');
    });

    it('should reject invalid credentials', async () => {
      // Use bounced test email to simulate invalid user
      const bouncedEmail = 'bounced+invalid-credentials@resend.dev';
      const signinResponse = await attemptSignIn(bouncedEmail, 'wrongpassword');

      console.log('Invalid credentials status:', signinResponse.status);
      console.log('Test email used:', bouncedEmail);
      const responseText = await signinResponse.text();
      console.log('Invalid credentials response:', responseText);

      expect(signinResponse.status).toBe(401);
      
      const data = JSON.parse(responseText);
      expect(data).toHaveProperty('code');
      expect(data.code).toBe('INVALID_EMAIL_OR_PASSWORD'); // Better-Auth uses this code
      expect(data.message).toContain('Invalid email or password');
    });

    it('should handle missing email field', async () => {
      const signinResponse = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': API_BASE,
        },
        body: JSON.stringify({
          password: 'somepassword',
        }),
      });

      console.log('Missing email status:', signinResponse.status);
      const responseText = await signinResponse.text();
      console.log('Missing email response:', responseText);

      expect(signinResponse.status).toBe(400);
      
      const data = JSON.parse(responseText);
      expect(data).toHaveProperty('code');
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(data.message).toContain('email');
    });

    it('should handle missing password field', async () => {
      const signinResponse = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': API_BASE,
        },
        body: JSON.stringify({
          email: 'test@example.com',
        }),
      });

      console.log('Missing password status:', signinResponse.status);
      const responseText = await signinResponse.text();
      console.log('Missing password response:', responseText);

      expect(signinResponse.status).toBe(400);
      
      const data = JSON.parse(responseText);
      expect(data).toHaveProperty('code');
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(data.message).toContain('password');
    });
  });
});
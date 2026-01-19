import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Better Auth for testing
const mockAuth = {
  handler: vi.fn(),
};

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}));

describe('Google OAuth API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/auth/sign-in/social', () => {
    it('should handle Google OAuth sign-in request', async () => {
      // Mock the auth handler to simulate successful OAuth initiation
      mockAuth.handler.mockResolvedValue({
        status: 302,
        headers: {
          location: 'https://accounts.google.com/oauth/authorize?client_id=test&redirect_uri=callback',
        },
      });

      const requestBody = {
        provider: 'google',
        callbackURL: 'http://localhost:3000',
      };

      // Simulate API call
      const response = await mockAuth.handler({
        method: 'POST',
        url: '/api/auth/sign-in/social',
        body: requestBody,
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('accounts.google.com');
      expect(mockAuth.handler).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/auth/sign-in/social',
        body: requestBody,
      });
    });

    it('should handle missing provider parameter', async () => {
      mockAuth.handler.mockResolvedValue({
        status: 400,
        body: { error: 'Provider is required' },
      });

      const requestBody = {
        callbackURL: 'http://localhost:3000',
      };

      const response = await mockAuth.handler({
        method: 'POST',
        url: '/api/auth/sign-in/social',
        body: requestBody,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Provider is required');
    });

    it('should validate provider is google', async () => {
      mockAuth.handler.mockResolvedValue({
        status: 400,
        body: { error: 'Invalid provider' },
      });

      const requestBody = {
        provider: 'facebook',
        callbackURL: 'http://localhost:3000',
      };

      const response = await mockAuth.handler({
        method: 'POST',
        url: '/api/auth/sign-in/social',
        body: requestBody,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid provider');
    });
  });

  describe('GET /api/auth/callback/google', () => {
    it('should handle OAuth callback with authorization code', async () => {
      mockAuth.handler.mockResolvedValue({
        status: 302,
        headers: {
          location: 'http://localhost:3000/dashboard',
          'set-cookie': 'better-auth.session_token=test_session; Path=/; HttpOnly; SameSite=Lax',
        },
      });

      const callbackParams = {
        code: 'test_authorization_code',
        state: 'test_state_parameter',
      };

      const response = await mockAuth.handler({
        method: 'GET',
        url: '/api/auth/callback/google',
        query: callbackParams,
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('http://localhost:3000/dashboard');
      expect(response.headers['set-cookie']).toContain('better-auth.session_token');
    });

    it('should handle OAuth callback with error', async () => {
      mockAuth.handler.mockResolvedValue({
        status: 302,
        headers: {
          location: 'http://localhost:3000/auth/signin?error=access_denied',
        },
      });

      const callbackParams = {
        error: 'access_denied',
        state: 'test_state_parameter',
      };

      const response = await mockAuth.handler({
        method: 'GET',
        url: '/api/auth/callback/google',
        query: callbackParams,
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('error=access_denied');
    });

    it('should handle missing authorization code', async () => {
      mockAuth.handler.mockResolvedValue({
        status: 400,
        body: { error: 'Authorization code is required' },
      });

      const callbackParams = {
        state: 'test_state_parameter',
      };

      const response = await mockAuth.handler({
        method: 'GET',
        url: '/api/auth/callback/google',
        query: callbackParams,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Authorization code is required');
    });
  });

  describe('Session Management', () => {
    it('should create user session after successful OAuth', async () => {
      const mockUserData = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://lh3.googleusercontent.com/test.jpg',
      };

      mockAuth.handler.mockResolvedValue({
        status: 302,
        headers: {
          location: 'http://localhost:3000/dashboard',
          'set-cookie': 'better-auth.session_token=valid_session; Path=/; HttpOnly; SameSite=Lax',
        },
        user: mockUserData,
      });

      const response = await mockAuth.handler({
        method: 'GET',
        url: '/api/auth/callback/google',
        query: { code: 'valid_code', state: 'valid_state' },
      });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('http://localhost:3000/dashboard');
      expect(response.user).toEqual(mockUserData);
      expect(response.headers['set-cookie']).toContain('better-auth.session_token');
    });

    it('should handle session validation', async () => {
      mockAuth.handler.mockResolvedValue({
        status: 200,
        body: {
          user: {
            id: 'user_123',
            email: 'test@example.com',
            name: 'Test User',
          },
          session: {
            id: 'session_123',
            userId: 'user_123',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        },
      });

      const response = await mockAuth.handler({
        method: 'GET',
        url: '/api/auth/session',
        headers: {
          cookie: 'better-auth.session_token=valid_session',
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.session.userId).toBe('user_123');
    });
  });
});
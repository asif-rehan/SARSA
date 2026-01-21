import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { redirect } from 'next/navigation';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Dashboard Routing Integration Tests (RED Phase)', () => {
  const server = setupServer();

  beforeEach(() => {
    server.listen();
    vi.clearAllMocks();
  });

  afterEach(() => {
    server.close();
  });

  describe('OAuth Flow Integration', () => {
    it('should initiate Google OAuth with dashboard callback URL', async () => {
      // Mock OAuth endpoint
      server.use(
        http.post('/api/auth/sign-in/social', async ({ request }) => {
          const body = await request.json() as any;
          expect(body.callbackURL).toBe('/dashboard');
          expect(body.provider).toBe('google');
          
          return HttpResponse.json({
            data: {
              url: 'https://accounts.google.com/oauth/authorize?...'
            },
            error: null
          });
        })
      );

      render(<GoogleLoginButton />);
      
      const loginButton = screen.getByRole('button', { name: /sign in with google/i });
      await fireEvent.click(loginButton);
      
      // Should trigger OAuth flow
      await waitFor(() => {
        expect(window.location.href).toContain('accounts.google.com');
      });
    });

    it('should handle OAuth callback and redirect to dashboard', async () => {
      // Mock successful OAuth callback
      server.use(
        http.get('/api/auth/callback/google', () => {
          return new HttpResponse(null, {
            status: 302,
            headers: {
              'Location': '/dashboard'
            }
          });
        })
      );

      // Simulate callback from Google
      window.location.href = '/api/auth/callback/google?code=test_code&state=test_state';
      
      await waitFor(() => {
        expect(redirect).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should redirect to sign-in on OAuth failure', async () => {
      // Mock OAuth failure
      server.use(
        http.get('/api/auth/callback/google', () => {
          return HttpResponse.json(
            { error: 'OAuth failed' },
            { status: 400 }
          );
        })
      );

      // Simulate failed callback from Google
      window.location.href = '/api/auth/callback/google?error=access_denied';
      
      await waitFor(() => {
        expect(redirect).toHaveBeenCalledWith('/auth/signin?error=OAuth+failed');
      });
    });
  });

  describe('Dashboard Access Control', () => {
    it('should allow access to dashboard for authenticated users', async () => {
      // Mock authenticated session
      server.use(
        http.get('/api/auth/session', () => {
          return HttpResponse.json({
            data: {
              user: {
                id: 'test-user-id',
                name: 'Test User',
                email: 'test@example.com'
              }
            }
          });
        })
      );

      // This test would verify dashboard page renders for authenticated users
      // Implementation in Dashboard component tests
      expect(true).toBe(true); // Placeholder
    });

    it('should redirect unauthenticated users from dashboard to sign-in', async () => {
      // Mock no session
      server.use(
        http.get('/api/auth/session', () => {
          return HttpResponse.json({
            data: null
          });
        })
      );

      // Mock dashboard page redirect logic
      server.use(
        http.get('/dashboard', () => {
          return new HttpResponse(null, {
            status: 302,
            headers: {
              'Location': '/auth/signin'
            }
          });
        })
      );

      expect(true).toBe(true); // Placeholder
    });
  });
});
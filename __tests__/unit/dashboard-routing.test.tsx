import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GoogleLoginButton from '@/components/GoogleLoginButton';

// Mock the auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      social: vi.fn(),
    },
  },
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Dashboard Routing after Google Sign-In', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RED Phase Tests - Should Fail Initially', () => {
    it('should redirect to dashboard after successful Google login', async () => {
      const { authClient } = await import('@/lib/auth-client');
      
      // Mock successful sign-in with dashboard redirect
      authClient.signIn.social.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      render(<GoogleLoginButton />);
      
      const loginButton = screen.getByRole('button', { name: /sign in with google/i });
      
      await fireEvent.click(loginButton);
      
      // Should call signIn.social with callbackURL set to '/dashboard'
      expect(authClient.signIn.social).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    });

    it('should handle sign-in failure gracefully', async () => {
      const { authClient } = await import('@/lib/auth-client');
      
      // Mock failed sign-in
      authClient.signIn.social.mockResolvedValueOnce({
        data: null,
        error: new Error('Google login failed'),
      });

      render(<GoogleLoginButton />);
      
      const loginButton = screen.getByRole('button', { name: /sign in with google/i });
      
      await fireEvent.click(loginButton);
      
      // Should display error message
      await waitFor(() => {
        expect(screen.getByText(/google login failed/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during authentication', async () => {
      const { authClient } = await import('@/lib/auth-client');
      
      // Mock slow authentication
      authClient.signIn.social.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      render(<GoogleLoginButton />);
      
      const loginButton = screen.getByRole('button', { name: /sign in with google/i });
      
      await fireEvent.click(loginButton);
      
      // Should show loading state
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(loginButton).toBeDisabled();
    });

    it('should use correct environment variables for callback URL', async () => {
      const { authClient } = await import('@/lib/auth-client');
      
      authClient.signIn.social.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      });

      render(<GoogleLoginButton />);
      
      const loginButton = screen.getByRole('button', { name: /sign in with google/i });
      
      await fireEvent.click(loginButton);
      
      // Should explicitly use '/dashboard' regardless of environment
      expect(authClient.signIn.social).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    });
  });
});
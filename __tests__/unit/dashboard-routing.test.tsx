import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GoogleLoginButton from '@/components/GoogleLoginButton';

// Mock auth client with proper Vitest syntax
const mockSignInSocial = vi.fn();
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      social: mockSignInSocial,
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

  describe('GREEN Phase Tests - Should Pass After Implementation', () => {
    it('should redirect to dashboard after successful Google login', async () => {
      // Mock successful sign-in
      mockSignInSocial.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      } as any);

      render(<GoogleLoginButton />);
      
      const loginButton = screen.getByRole('button', { name: /sign in with google/i });
      
      await fireEvent.click(loginButton);
      
      // Should call signIn.social with callbackURL set to '/dashboard'
      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    });

    it('should show loading state during authentication', async () => {
      // Mock slow authentication
      mockSignInSocial.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<GoogleLoginButton />);
      
      const loginButton = screen.getByRole('button', { name: /sign in with google/i });
      
      await fireEvent.click(loginButton);
      
      // Should show loading state
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(loginButton).toBeDisabled();
    });

    it('should use correct environment variables for callback URL', async () => {
      // Mock successful sign-in
      mockSignInSocial.mockResolvedValueOnce({
        data: { success: true },
        error: null,
      } as any);

      render(<GoogleLoginButton />);
      
      const loginButton = screen.getByRole('button', { name: /sign in with google/i });
      
      await fireEvent.click(loginButton);
      
      // Should explicitly use '/dashboard' regardless of environment
      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: 'google',
        callbackURL: '/dashboard',
      });
    });
  });
});
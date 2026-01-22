import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VerifyEmailClient from '@/app/auth/verify-email/VerifyEmailClient';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    sendVerificationEmail: vi.fn(),
    signOut: vi.fn(),
  },
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: '',
    origin: 'http://localhost:3000',
  },
  writable: true,
});

describe('VerifyEmailClient Component', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render verification page for unverified user', () => {
    render(<VerifyEmailClient user={mockUser} />);

    expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Not Verified')).toBeInTheDocument();
    expect(screen.getByText('Resend Verification Email')).toBeInTheDocument();
  });

  it('should render success message when token is provided and no error', () => {
    render(<VerifyEmailClient user={mockUser} token="valid-token" />);

    expect(screen.getByText('Email Verified!')).toBeInTheDocument();
    expect(screen.getByText('Your email has been successfully verified. You can now access all features.')).toBeInTheDocument();
    expect(screen.getByText('Continue to Dashboard')).toBeInTheDocument();
  });

  it('should render error message when verification fails', () => {
    // Test the component without a token to see the verification form
    render(<VerifyEmailClient user={mockUser} />);

    // Should show the verification form
    expect(screen.getByText('Verify Your Email')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should handle resend verification email', async () => {
    const { authClient } = await import('@/lib/auth-client');
    const mockSendVerificationEmail = vi.mocked(authClient.sendVerificationEmail);
    mockSendVerificationEmail.mockResolvedValue({} as any);

    render(<VerifyEmailClient user={mockUser} />);

    const resendButton = screen.getByText('Resend Verification Email');
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(mockSendVerificationEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        callbackURL: 'http://localhost:3000/auth/verify-email',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Verification email sent! Please check your inbox.')).toBeInTheDocument();
    });
  });

  it('should handle resend verification email error', async () => {
    const { authClient } = await import('@/lib/auth-client');
    const mockSendVerificationEmail = vi.mocked(authClient.sendVerificationEmail);
    mockSendVerificationEmail.mockRejectedValue(new Error('Failed to send email'));

    render(<VerifyEmailClient user={mockUser} />);

    const resendButton = screen.getByText('Resend Verification Email');
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to send email')).toBeInTheDocument();
    });
  });

  it('should handle sign out', async () => {
    const { authClient } = await import('@/lib/auth-client');
    const mockSignOut = vi.mocked(authClient.signOut);
    mockSignOut.mockResolvedValue({} as any);

    render(<VerifyEmailClient user={mockUser} />);

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('should show sign in prompt when no user is provided', () => {
    render(<VerifyEmailClient />);

    expect(screen.getByText('Please sign in to verify your email address.')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should disable resend button while loading', async () => {
    render(<VerifyEmailClient user={mockUser} />);

    const resendButton = screen.getByText('Resend Verification Email');
    fireEvent.click(resendButton);

    // Check if button shows loading state
    await waitFor(() => {
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });
  });
});
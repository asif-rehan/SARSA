import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GoogleLoginButton from '../../components/GoogleLoginButton';

vi.mock('../../lib/auth-client', () => ({
  authClient: {
    signIn: {
      social: vi.fn(),
    },
  },
}));

describe('Google Login Button', () => {
  it('should render Google login button', () => {
    render(<GoogleLoginButton />);
    
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('should show loading state when isLoading is true', () => {
    render(<GoogleLoginButton isLoading={true} />);
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();
  });

  it('should have accessible attributes', () => {
    render(<GoogleLoginButton />);
    
    const button = screen.getByRole('button', { name: /sign in with google/i });
    
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('aria-label', 'Sign in with Google');
  });
});

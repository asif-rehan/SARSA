import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GoogleLoginButton from '../../components/GoogleLoginButton';

vi.mock('../../lib/auth-client', () => ({
  authClient: {
    signIn: {
      social: vi.fn(),
    },
  },
}));

describe('Google Login Integration', () => {
  it('should render Google login button', () => {
    render(<GoogleLoginButton />);
    
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });
});

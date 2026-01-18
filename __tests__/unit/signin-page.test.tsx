import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignInPage from '../../app/auth/signin/page';

describe('Sign In Page', () => {
  it('should render page heading', () => {
    render(<SignInPage />);
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/sign in/i);
  });

  it('should render Google Login Button', () => {
    render(<SignInPage />);
    
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('should have link to home page', () => {
    render(<SignInPage />);
    
    expect(screen.getByRole('link', { name: /home|back/i })).toBeInTheDocument();
  });

  it('should have accessible structure', () => {
    render(<SignInPage />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should display welcome message', () => {
    render(<SignInPage />);
    
    expect(screen.getByText(/welcome|sign in to your account/i)).toBeInTheDocument();
  });
});

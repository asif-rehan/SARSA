import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Home from '@/app/page';

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

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('Signup Button Functionality', () => {
  const mockPush = vi.fn();
  
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    });
  });

  it('should render signup button in hero section', () => {
    render(<Home />);
    
    const signupButtons = screen.getAllByRole('link', { name: /sign up/i });
    expect(signupButtons.length).toBeGreaterThanOrEqual(1);
    
    // Check that at least one signup button has correct href
    const hasCorrectHref = signupButtons.some(button => 
      button.getAttribute('href') === '/auth/signup'
    );
    expect(hasCorrectHref).toBe(true);
  });

  it('should render signup button in secondary CTA section', () => {
    render(<Home />);
    
    const startBuildingButton = screen.getByRole('link', { name: /start building now/i });
    expect(startBuildingButton).toBeInTheDocument();
    expect(startBuildingButton).toHaveAttribute('href', '/auth/signup');
  });

  it('should navigate to signup page when clicked', () => {
    render(<Home />);
    
    const signupButtons = screen.getAllByRole('link', { name: /sign up/i });
    expect(signupButtons.length).toBeGreaterThanOrEqual(1);
    
    // All signup buttons should have correct href
    signupButtons.forEach(button => {
      expect(button).toHaveAttribute('href', '/auth/signup');
    });
  });

  it('should have proper accessibility attributes', () => {
    render(<Home />);
    
    const signupButtons = screen.getAllByRole('link', { name: /sign up/i });
    expect(signupButtons.length).toBeGreaterThanOrEqual(1);
    
    signupButtons.forEach(button => {
      expect(button).toBeVisible();
      expect(button).not.toHaveAttribute('aria-disabled');
    });
  });
});
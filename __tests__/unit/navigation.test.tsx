import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Navigation from '@/components/Navigation';

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

describe('Navigation Component', () => {
  it('should render navigation menu with all required links', () => {
    render(<Navigation />);
    
    // Should have logo/brand
    expect(screen.getByText('SaaS Template')).toBeInTheDocument();
    
    // Should have main navigation links
    expect(screen.getByRole('link', { name: /features/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pricing/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /docs/i })).toBeInTheDocument();
    
    // Should have auth buttons
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    
    // Should have theme toggle (there are two - desktop and mobile)
    expect(screen.getAllByRole('button', { name: /toggle theme/i })).toHaveLength(2);
  });

  it('should be responsive with mobile menu', () => {
    render(<Navigation />);
    
    // Should have mobile menu button (hidden on desktop)
    const mobileMenuButton = screen.getByRole('button', { name: /open menu/i });
    expect(mobileMenuButton).toBeInTheDocument();
  });

  it('should highlight current page in navigation', () => {
    render(<Navigation currentPath="/subscription" />);
    
    const pricingLink = screen.getByRole('link', { name: /pricing/i });
    expect(pricingLink).toHaveClass('text-primary'); // Active state
  });
});
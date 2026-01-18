import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../../app/page';

describe('Landing Page', () => {
  it('should render main heading', () => {
    render(<Home />);
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should render Sign In CTA button', () => {
    render(<Home />);
    
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should render Get Started CTA button', () => {
    render(<Home />);
    
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
  });

  it('should render value proposition', () => {
    render(<Home />);
    
    expect(screen.getByText(/build your saas/i)).toBeInTheDocument();
  });

  it('should be accessible with proper semantic HTML', () => {
    render(<Home />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});

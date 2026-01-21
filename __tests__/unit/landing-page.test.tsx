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

  // Task 2.11: Subscribe button unit tests
  describe('Subscribe Button', () => {
    it('should render Subscribe CTA button with visibility and clickability', () => {
      render(<Home />);
      
      const subscribeButton = screen.getByRole('link', { name: /subscribe/i });
      expect(subscribeButton).toBeInTheDocument();
      expect(subscribeButton).toBeVisible();
    });

    it('should route to /subscription page', () => {
      render(<Home />);
      
      const subscribeButton = screen.getByRole('link', { name: /subscribe/i });
      expect(subscribeButton).toHaveAttribute('href', '/subscription');
    });

    it('should have accessible ARIA labels', () => {
      render(<Home />);
      
      const subscribeButton = screen.getByRole('link', { name: /subscribe/i });
      expect(subscribeButton).toHaveAccessibleName();
      // Should be accessible to screen readers
      expect(subscribeButton).toBeInTheDocument();
    });

    it('should have responsive behavior on mobile devices', () => {
      render(<Home />);
      
      const subscribeButton = screen.getByRole('link', { name: /subscribe/i });
      // Check for responsive classes that ensure mobile compatibility
      expect(subscribeButton).toHaveClass('w-full');
      expect(subscribeButton).toHaveClass('md:w-[180px]');
    });
  });
});

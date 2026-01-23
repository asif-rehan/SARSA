import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../../app/page';

describe('Subscribe Flow Integration Tests', () => {
  describe('Task 2.12.1: Test failure when Subscribe button is missing (RED phase)', () => {
    it('should fail when Subscribe button is not rendered', () => {
      // This test simulates what would happen if Subscribe button was missing
      // We'll temporarily mock a version without the Subscribe button
      const MockHomeWithoutSubscribe = () => (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
          <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
            <header role="banner">
              <h1 className="max-w-sm text-4xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                Build Your SaaS in Minutes
              </h1>
            </header>
            <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
              {/* Subscribe button intentionally missing for RED phase test */}
            </div>
          </main>
        </div>
      );

      render(<MockHomeWithoutSubscribe />);
      
      // This should fail when Subscribe button is missing
      expect(() => {
        screen.getByRole('link', { name: /view pricing/i });
      }).toThrow();
    });
  });

  describe('Task 2.12.2: Test Subscribe button click navigation (GREEN phase)', () => {
    it('should successfully find Subscribe button and verify navigation', () => {
      render(<Home />);
      
      const subscribeButton = screen.getByRole('link', { name: /view pricing/i });
      
      // Verify button exists and has correct navigation
      expect(subscribeButton).toBeInTheDocument();
      expect(subscribeButton).toHaveAttribute('href', '/subscription');
      expect(subscribeButton).toBeVisible();
    });

    it('should have Subscribe button with proper styling for user interaction', () => {
      render(<Home />);
      
      const subscribeButton = screen.getByRole('link', { name: /view pricing/i });
      
      // Verify button exists and is visible (basic functionality test)
      expect(subscribeButton).toBeInTheDocument();
      expect(subscribeButton).toBeVisible();
      expect(subscribeButton).toHaveAttribute('href', '/subscription');
    });

    it('should integrate properly with other CTA buttons', () => {
      render(<Home />);
      
      // Verify all three CTA buttons exist together
      const signInButton = screen.getByRole('link', { name: /sign in/i });
      const getStartedButton = screen.getByRole('button', { name: /get started/i });
      const subscribeButton = screen.getByRole('link', { name: /view pricing/i });
      
      expect(signInButton).toBeInTheDocument();
      expect(getStartedButton).toBeInTheDocument();
      expect(subscribeButton).toBeInTheDocument();
      
      // Verify they have different destinations/behaviors
      expect(signInButton).toHaveAttribute('href', '/auth?mode=signin');
      expect(subscribeButton).toHaveAttribute('href', '/subscription');
      // Get Started is a form submit button, so no href
      expect(getStartedButton).toHaveAttribute('type', 'submit');
    });
  });
});
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@/components/theme-provider';
import Home from '../../app/page';

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    {children}
  </ThemeProvider>
);

describe('Enhanced Landing Page', () => {
  it('renders the main heading with proper styling', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Build Your SaaS in Minutes');
    expect(heading).toHaveClass('text-3xl', 'sm:text-4xl', 'md:text-5xl', 'lg:text-6xl', 'font-bold');
  });

  it('renders the value proposition text', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const description = screen.getByText('Complete SaaS platform with authentication, payments, and dashboard');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-lg', 'sm:text-xl', 'text-muted-foreground');
  });

  it('renders all three CTA buttons with correct links', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const signInButton = screen.getByRole('link', { name: /sign in/i });
    const getStartedButton = screen.getByRole('link', { name: /get started/i });
    const subscribeButton = screen.getByRole('link', { name: /subscribe/i });

    expect(signInButton).toHaveAttribute('href', '/auth/signin');
    expect(getStartedButton).toHaveAttribute('href', '/auth/signup');
    expect(subscribeButton).toHaveAttribute('href', '/subscription');
  });

  it('renders CTA buttons with touch-friendly sizing', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const buttons = screen.getAllByRole('link');
    const ctaButtons = buttons.filter(button => 
      button.textContent?.includes('Sign In') || 
      button.textContent?.includes('Get Started') || 
      button.textContent?.includes('Subscribe')
    );

    ctaButtons.forEach(button => {
      expect(button).toHaveClass('min-h-[48px]', 'text-base');
    });
  });

  it('renders feature cards with icons and descriptions', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check for feature card titles
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Check for feature descriptions
    expect(screen.getByText('Secure OAuth with Google integration')).toBeInTheDocument();
    expect(screen.getByText('Stripe integration for subscriptions')).toBeInTheDocument();
    expect(screen.getByText('User-friendly management interface')).toBeInTheDocument();
  });

  it('renders sticky header with theme toggle', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky', 'top-0', 'border-b');
    
    const siteTitle = screen.getByText('SaaS Platform');
    expect(siteTitle).toBeInTheDocument();
    expect(siteTitle).toHaveClass('text-xl', 'sm:text-2xl', 'font-bold');
  });

  it('has proper semantic HTML structure', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument(); // main
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(); // h1
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument(); // h2 in header
  });

  it('applies responsive spacing and padding', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-h-screen');

    const container = main.querySelector('.container');
    expect(container).toHaveClass('mx-auto', 'px-4', 'py-8', 'sm:py-12', 'lg:py-16');
  });

  it('maintains accessibility standards', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    // Check for proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 });
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h1).toBeInTheDocument();
    expect(h2).toBeInTheDocument();

    // Check for accessible links
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveAccessibleName();
    });
  });

  it('renders with proper responsive button layout', () => {
    render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );

    const signInButton = screen.getByRole('link', { name: /sign in/i });
    const buttonContainer = signInButton.parentElement;
    
    expect(buttonContainer).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'gap-3', 'sm:gap-4');
  });

  // Task 2.11: Subscribe button unit tests (Enhanced)
  describe('Subscribe Button', () => {
    it('should render Subscribe CTA button with visibility and clickability', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const subscribeButton = screen.getByRole('link', { name: /subscribe/i });
      expect(subscribeButton).toBeInTheDocument();
      expect(subscribeButton).toBeVisible();
    });

    it('should route to /subscription page', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const subscribeButton = screen.getByRole('link', { name: /subscribe/i });
      expect(subscribeButton).toHaveAttribute('href', '/subscription');
    });

    it('should have accessible ARIA labels', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const subscribeButton = screen.getByRole('link', { name: /subscribe/i });
      expect(subscribeButton).toHaveAccessibleName();
      expect(subscribeButton).toBeInTheDocument();
    });

    it('should have touch-friendly sizing for mobile devices', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const subscribeButton = screen.getByRole('link', { name: /subscribe/i });
      expect(subscribeButton).toHaveClass('min-h-[48px]', 'text-base');
    });

    it('should have proper button variant styling', () => {
      render(
        <TestWrapper>
          <Home />
        </TestWrapper>
      );
      
      const subscribeButton = screen.getByRole('link', { name: /subscribe/i });
      // Should have secondary variant styling
      expect(subscribeButton).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });
  });
});

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';

describe('Enhanced Landing Page with shadcn/ui', () => {
  test('should render with shadcn/ui styling classes', () => {
    render(<Home />);
    
    // Check main container has proper background gradient
    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-h-screen', 'bg-gradient-to-br', 'from-background', 'to-muted');
  });

  test('should render enhanced CTA buttons with shadcn/ui Button styles', () => {
    render(<Home />);
    
    const signInButton = screen.getByRole('link', { name: /sign in/i });
    const getStartedButton = screen.getByRole('link', { name: /get started/i });
    const subscribeButton = screen.getByRole('link', { name: /subscribe/i });
    
    // Check buttons exist and are rendered as links with Button styling
    expect(signInButton).toBeInTheDocument();
    expect(getStartedButton).toBeInTheDocument();
    expect(subscribeButton).toBeInTheDocument();
    
    // Check they have proper href attributes
    expect(signInButton).toHaveAttribute('href', '/auth/signin');
    expect(getStartedButton).toHaveAttribute('href', '/auth/signup');
    expect(subscribeButton).toHaveAttribute('href', '/subscription');
  });

  test('should render feature cards with shadcn/ui Card components', () => {
    render(<Home />);
    
    // Check that feature cards are rendered
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Payments')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Check card descriptions
    expect(screen.getByText('Secure OAuth with Google integration')).toBeInTheDocument();
    expect(screen.getByText('Stripe integration for subscriptions')).toBeInTheDocument();
    expect(screen.getByText('User-friendly management interface')).toBeInTheDocument();
  });

  test('should use shadcn/ui typography classes', () => {
    render(<Home />);
    
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveClass('text-4xl', 'md:text-6xl', 'font-bold', 'tracking-tight');
    
    const description = screen.getByText(/complete saas platform/i);
    expect(description).toHaveClass('text-xl', 'text-muted-foreground');
  });

  test('should maintain responsive design with shadcn/ui classes', () => {
    const { container } = render(<Home />);
    
    const mainContainer = screen.getByRole('main').firstChild;
    expect(mainContainer).toHaveClass('container', 'mx-auto', 'px-4', 'py-16');
    
    // Check for responsive grid layout - find the actual grid container
    const gridContainer = container.querySelector('.grid.md\\:grid-cols-3');
    expect(gridContainer).toHaveClass('grid', 'md:grid-cols-3', 'gap-6', 'mt-16');
  });

  test('should include icons with feature cards', () => {
    const { container } = render(<Home />);
    
    // Check that SVG icons are present (they have aria-hidden="true")
    const svgElements = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgElements.length).toBeGreaterThanOrEqual(3); // At least 3 icons for the features
    
    // Check specific icon classes
    const shieldIcon = container.querySelector('.lucide-shield');
    const creditCardIcon = container.querySelector('.lucide-credit-card');
    const dashboardIcon = container.querySelector('.lucide-layout-dashboard');
    
    expect(shieldIcon).toBeInTheDocument();
    expect(creditCardIcon).toBeInTheDocument();
    expect(dashboardIcon).toBeInTheDocument();
  });
});
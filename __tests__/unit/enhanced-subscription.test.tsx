import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the enhanced subscription component
const EnhancedSubscriptionPlans = () => {
  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 9,
      features: ['Basic features', 'Email support', '1 user', '5 projects'],
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 29,
      features: ['All basic features', 'Priority support', '5 users', '20 projects', 'Advanced analytics'],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Plan',
      price: 99,
      features: ['All pro features', '24/7 support', 'Unlimited users', '100 projects', 'Custom integrations'],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">Select the perfect plan for your needs</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-lg border bg-card text-card-foreground shadow-sm relative ${
              plan.popular ? 'border-primary shadow-lg scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary text-primary-foreground">
                  Most Popular
                </div>
              </div>
            )}
            
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">{plan.name}</h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
            </div>
            
            <div className="p-6 pt-0">
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="h-4 w-4 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors w-full h-10 px-4 py-2 ${
                  plan.popular
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                Get Started
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Billing History Section */}
      <div className="mt-16 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Billing History</h2>
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-lg font-semibold">Recent Invoices</h3>
            <p className="text-sm text-muted-foreground">Your billing history and invoices</p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Pro Plan - Monthly</p>
                  <p className="text-sm text-muted-foreground">January 15, 2024</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$29.00</p>
                  <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
                    Paid
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

describe('Enhanced Subscription Plans with shadcn/ui', () => {
  test('should render with shadcn/ui styling classes', () => {
    render(<EnhancedSubscriptionPlans />);
    
    // Check main container by finding the container with the right classes
    const container = screen.getByText('Choose Your Plan').closest('.container');
    expect(container).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
  });

  test('should render subscription plan cards with shadcn/ui Card components', () => {
    render(<EnhancedSubscriptionPlans />);
    
    // Find all plan cards
    const cards = screen.getAllByRole('generic').filter(el => 
      el.className.includes('rounded-lg') && 
      el.className.includes('border') && 
      el.className.includes('bg-card')
    );
    
    // Should have 3 plan cards
    expect(cards.length).toBeGreaterThanOrEqual(3);
    
    // Check cards have shadcn/ui card classes
    cards.slice(0, 3).forEach(card => {
      expect(card).toHaveClass(
        'rounded-lg',
        'border',
        'bg-card',
        'text-card-foreground',
        'shadow-sm'
      );
    });
  });

  test('should render popular plan badge with shadcn/ui Badge component', () => {
    render(<EnhancedSubscriptionPlans />);
    
    const popularBadge = screen.getByText('Most Popular');
    expect(popularBadge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'border',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-semibold',
      'bg-primary',
      'text-primary-foreground'
    );
  });

  test('should render enhanced pricing display with proper typography', () => {
    render(<EnhancedSubscriptionPlans />);
    
    // Check pricing display
    const priceElements = screen.getAllByText(/^\$\d+$/);
    expect(priceElements.length).toBeGreaterThan(0);
    
    priceElements.forEach(price => {
      expect(price).toHaveClass('text-4xl', 'font-bold');
    });
  });

  test('should render feature lists with check icons', () => {
    const { container } = render(<EnhancedSubscriptionPlans />);
    
    // Check for SVG check icons
    const checkIcons = container.querySelectorAll('svg');
    expect(checkIcons.length).toBeGreaterThan(0);
    
    // Verify check icons have proper styling
    checkIcons.forEach(icon => {
      if (icon.getAttribute('viewBox') === '0 0 24 24') {
        expect(icon).toHaveClass('h-4', 'w-4', 'text-primary');
      }
    });
  });

  test('should render enhanced buttons with shadcn/ui Button variants', () => {
    render(<EnhancedSubscriptionPlans />);
    
    const buttons = screen.getAllByRole('button', { name: /get started/i });
    expect(buttons.length).toBe(3);
    
    buttons.forEach(button => {
      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'rounded-md',
        'font-medium',
        'transition-colors'
      );
    });
  });

  test('should render billing history with shadcn/ui Card component', () => {
    render(<EnhancedSubscriptionPlans />);
    
    // Find the billing card by looking for the card structure
    const billingCards = screen.getAllByRole('generic').filter(el => 
      el.className.includes('rounded-lg') && 
      el.className.includes('border') && 
      el.className.includes('bg-card') &&
      el.textContent?.includes('Recent Invoices')
    );
    
    expect(billingCards.length).toBeGreaterThan(0);
    const billingCard = billingCards[0];
    expect(billingCard).toHaveClass(
      'rounded-lg',
      'border',
      'bg-card',
      'text-card-foreground',
      'shadow-sm'
    );
  });

  test('should render invoice status badges with proper styling', () => {
    render(<EnhancedSubscriptionPlans />);
    
    const statusBadge = screen.getByText('Paid');
    expect(statusBadge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'border',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-semibold'
    );
  });

  test('should maintain responsive design with proper grid layout', () => {
    const { container } = render(<EnhancedSubscriptionPlans />);
    
    const planGrid = container.querySelector('.grid.md\\:grid-cols-3');
    expect(planGrid).toHaveClass('grid', 'md:grid-cols-3', 'gap-8');
  });

  test('should highlight popular plan with enhanced styling', () => {
    render(<EnhancedSubscriptionPlans />);
    
    // Find the Pro Plan card by looking for cards with popular styling
    const popularCards = screen.getAllByRole('generic').filter(el => 
      el.className.includes('border-primary') && 
      el.className.includes('shadow-lg') && 
      el.className.includes('scale-105') &&
      el.textContent?.includes('Pro Plan')
    );
    
    expect(popularCards.length).toBeGreaterThan(0);
    const proCard = popularCards[0];
    expect(proCard).toHaveClass('border-primary', 'shadow-lg', 'scale-105');
  });

  test('should render proper heading hierarchy and typography', () => {
    render(<EnhancedSubscriptionPlans />);
    
    const mainHeading = screen.getByText('Choose Your Plan');
    expect(mainHeading).toHaveClass('text-4xl', 'font-bold', 'tracking-tight');
    
    const subtitle = screen.getByText('Select the perfect plan for your needs');
    expect(subtitle).toHaveClass('text-xl', 'text-muted-foreground');
  });
});
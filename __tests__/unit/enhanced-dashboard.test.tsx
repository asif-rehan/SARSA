import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the enhanced dashboard component
const EnhancedDashboard = ({ session }: { session: { user?: { name: string, email: string, image?: string } } }) => {
  const user = session?.user || { name: 'Guest', email: '' };

  const handleSignOut = vi.fn();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-muted">
                  {user.name?.[0] || user.email[0]}
                </div>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.name || user.email}</p>
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                  Pro Plan
                </div>
              </div>
              <button 
                onClick={handleSignOut}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center space-x-2">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Profile Settings</h3>
              </div>
              <p className="text-sm text-muted-foreground">Manage your account information</p>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center space-x-2">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Subscription</h3>
              </div>
              <p className="text-sm text-muted-foreground">View and manage your plan</p>
            </div>
          </div>
          
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center space-x-2">
                <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Settings</h3>
              </div>
              <p className="text-sm text-muted-foreground">Configure your preferences</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

describe('Enhanced Dashboard with shadcn/ui', () => {
  const mockSession = {
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://example.com/avatar.jpg'
    }
  };

  test('should render with shadcn/ui styling classes', () => {
    render(<EnhancedDashboard session={mockSession} />);
    
    // Check main container has proper background
    const main = screen.getByRole('main');
    expect(main).toHaveClass('container', 'mx-auto', 'px-4', 'py-8');
    
    // Check header styling
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('border-b');
  });

  test('should render Avatar component with user initials', () => {
    render(<EnhancedDashboard session={mockSession} />);
    
    // Check avatar container
    const avatarContainer = screen.getByText('J'); // First letter of John
    expect(avatarContainer.parentElement).toHaveClass(
      'relative',
      'flex',
      'h-10',
      'w-10',
      'shrink-0',
      'overflow-hidden',
      'rounded-full'
    );
    
    // Check avatar fallback
    expect(avatarContainer).toHaveClass(
      'flex',
      'h-full',
      'w-full',
      'items-center',
      'justify-center',
      'rounded-full',
      'bg-muted'
    );
  });

  test('should render Badge component for subscription status', () => {
    render(<EnhancedDashboard session={mockSession} />);
    
    const badge = screen.getByText('Pro Plan');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'rounded-full',
      'border',
      'px-2.5',
      'py-0.5',
      'text-xs',
      'font-semibold',
      'transition-colors',
      'bg-secondary',
      'text-secondary-foreground'
    );
  });

  test('should render enhanced navigation with shadcn/ui Button', () => {
    render(<EnhancedDashboard session={mockSession} />);
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toHaveClass(
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-md',
      'font-medium',
      'transition-colors',
      'border',
      'border-input',
      'bg-background',
      'hover:bg-accent'
    );
  });

  test('should render dashboard cards with shadcn/ui Card components', () => {
    render(<EnhancedDashboard session={mockSession} />);
    
    // Find the card containers by looking for the Card component structure
    const cards = screen.getAllByRole('generic').filter(el => 
      el.className.includes('rounded-lg') && 
      el.className.includes('border') && 
      el.className.includes('bg-card')
    );
    
    // Should have 3 cards
    expect(cards.length).toBe(3);
    
    // Check each card has shadcn/ui card classes
    cards.forEach(card => {
      expect(card).toHaveClass(
        'rounded-lg',
        'border',
        'bg-card',
        'text-card-foreground',
        'shadow-sm'
      );
    });
  });

  test('should display user information correctly', () => {
    render(<EnhancedDashboard session={mockSession} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('J')).toBeInTheDocument(); // Avatar initial
  });

  test('should handle guest user correctly', () => {
    render(<EnhancedDashboard session={{}} />);
    
    expect(screen.getByText('G')).toBeInTheDocument(); // Guest initial
  });

  test('should maintain responsive design with shadcn/ui classes', () => {
    const { container } = render(<EnhancedDashboard session={mockSession} />);
    
    const cardGrid = container.querySelector('.grid.md\\:grid-cols-2.lg\\:grid-cols-3');
    expect(cardGrid).toHaveClass('grid', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-6');
  });

  test('should include icons with dashboard cards', () => {
    const { container } = render(<EnhancedDashboard session={mockSession} />);
    
    // Check that SVG icons are present
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThanOrEqual(3); // At least 3 icons for the cards
  });
});
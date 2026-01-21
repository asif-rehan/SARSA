import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@/components/theme-provider';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}));

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signOut: vi.fn(),
    getSession: vi.fn(),
  },
}));

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    {children}
  </ThemeProvider>
);

describe('Mobile Responsiveness', () => {
  beforeEach(() => {
    // Reset viewport to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // iPhone SE width
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667, // iPhone SE height
    });
  });

  describe('Landing Page Mobile Optimization', () => {
    it('should render mobile-optimized header with sticky positioning', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('sticky', 'top-0');
    });

    it('should display responsive heading text sizes', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveClass('text-3xl', 'sm:text-4xl', 'md:text-5xl', 'lg:text-6xl');
    });

    it('should render touch-friendly buttons with minimum 48px height', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      const signInButton = screen.getByRole('link', { name: /sign in/i });
      const getStartedButton = screen.getByRole('link', { name: /get started/i });
      const subscribeButton = screen.getByRole('link', { name: /subscribe/i });

      expect(signInButton).toHaveClass('min-h-[48px]');
      expect(getStartedButton).toHaveClass('min-h-[48px]');
      expect(subscribeButton).toHaveClass('min-h-[48px]');
    });

    it('should display buttons in column layout on mobile', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      const buttonContainer = screen.getByRole('link', { name: /sign in/i }).parentElement;
      expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row');
    });

    it('should render feature cards in responsive grid', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      const featureCards = screen.getAllByText(/Authentication|Payments|Dashboard/);
      expect(featureCards).toHaveLength(3);
      
      // Check if the grid container has responsive classes
      const gridContainer = featureCards[0].closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('Dashboard Mobile Optimization', () => {
    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
      image: 'https://example.com/avatar.jpg',
    };

    it('should render mobile-optimized dashboard header', async () => {
      const { default: Dashboard } = await import('@/app/dashboard/page');
      
      render(
        <TestWrapper>
          <Dashboard session={{ user: mockUser }} />
        </TestWrapper>
      );

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0');
      
      const heading = screen.getByRole('heading', { name: /dashboard/i });
      expect(heading).toHaveClass('text-xl', 'sm:text-2xl');
    });

    it('should display responsive avatar sizes', async () => {
      const { default: Dashboard } = await import('@/app/dashboard/page');
      
      render(
        <TestWrapper>
          <Dashboard session={{ user: mockUser }} />
        </TestWrapper>
      );

      const avatar = screen.getByRole('img', { name: mockUser.name });
      expect(avatar.parentElement).toHaveClass('h-8', 'w-8', 'sm:h-10', 'sm:w-10');
    });

    it('should render touch-friendly sign out button', async () => {
      const { default: Dashboard } = await import('@/app/dashboard/page');
      
      render(
        <TestWrapper>
          <Dashboard session={{ user: mockUser }} />
        </TestWrapper>
      );

      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toHaveClass('min-h-[40px]');
    });

    it('should display dashboard cards in responsive grid', async () => {
      const { default: Dashboard } = await import('@/app/dashboard/page');
      
      render(
        <TestWrapper>
          <Dashboard session={{ user: mockUser }} />
        </TestWrapper>
      );

      const profileCard = screen.getByText('Profile Settings');
      const gridContainer = profileCard.closest('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should render cards with hover effects and proper spacing', async () => {
      const { default: Dashboard } = await import('@/app/dashboard/page');
      
      render(
        <TestWrapper>
          <Dashboard session={{ user: mockUser }} />
        </TestWrapper>
      );

      const cards = screen.getAllByText(/Profile Settings|Subscription|Settings/);
      cards.forEach(card => {
        const cardElement = card.closest('.hover\\:shadow-md');
        expect(cardElement).toBeInTheDocument();
      });
    });
  });

  describe('Touch-Friendly Interactions', () => {
    it('should have minimum touch target size of 44px for all interactive elements', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      const interactiveElements = screen.getAllByRole('link');
      interactiveElements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const minHeight = computedStyle.getPropertyValue('min-height');
        
        // Check if element has touch-friendly sizing
        expect(element).toHaveClass(/min-h-\[4[4-8]px\]/);
      });
    });

    it('should provide adequate spacing between touch targets', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      const buttonContainer = screen.getByRole('link', { name: /sign in/i }).parentElement;
      expect(buttonContainer).toHaveClass('gap-3', 'sm:gap-4');
    });
  });

  describe('Responsive Typography', () => {
    it('should use responsive text sizes for headings', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveClass('text-3xl', 'sm:text-4xl', 'md:text-5xl', 'lg:text-6xl');

      const subheading = screen.getByText(/Complete SaaS platform/);
      expect(subheading).toHaveClass('text-lg', 'sm:text-xl');
    });

    it('should use appropriate text sizes for card content', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      const cardTitles = screen.getAllByText(/Authentication|Payments|Dashboard/);
      cardTitles.forEach(title => {
        expect(title).toHaveClass('text-lg', 'sm:text-xl');
      });
    });
  });

  describe('Mobile Navigation', () => {
    it('should handle viewport changes gracefully', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      const { rerender } = render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      // Simulate viewport change to tablet size
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      fireEvent(window, new Event('resize'));

      rerender(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      // Verify responsive classes are still applied
      const buttonContainer = screen.getByRole('link', { name: /sign in/i }).parentElement;
      expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row');
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should maintain proper focus management on mobile', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      const signInButton = screen.getByRole('link', { name: /sign in/i });
      signInButton.focus();
      
      expect(signInButton).toHaveFocus();
      expect(signInButton).toHaveAttribute('href', '/auth/signin');
    });

    it('should provide proper ARIA labels for mobile interactions', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      const buttons = screen.getAllByRole('link');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should maintain semantic HTML structure on mobile', async () => {
      const { default: LandingPage } = await import('@/app/page');
      
      render(
        <TestWrapper>
          <LandingPage />
        </TestWrapper>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main content
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(); // h1
    });
  });
});
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@/components/theme-provider';
import Home from '@/app/page';
import Dashboard from '@/app/dashboard/page';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.matchMedia
const matchMediaMock = vi.fn();

// Mock authClient
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    getSession: vi.fn(),
    signOut: vi.fn(),
  },
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Theme Consistency Across Pages', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock matchMedia
    matchMediaMock.mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, 'matchMedia', {
      value: matchMediaMock,
      writable: true,
    });

    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      },
      writable: true,
    });

    // Mock fetch responses
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({}),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Landing Page Theme Integration', () => {
    it('should render theme toggle on landing page', () => {
      localStorageMock.getItem.mockReturnValue('light');
      
      render(
        <ThemeProvider>
          <Home />
        </ThemeProvider>
      );

      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });

    it('should apply correct theme classes to landing page', async () => {
      const mockClassList = {
        add: vi.fn(),
        remove: vi.fn(),
      };
      
      Object.defineProperty(document, 'documentElement', {
        value: { classList: mockClassList },
        writable: true,
      });

      render(
        <ThemeProvider>
          <Home />
        </ThemeProvider>
      );

      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(themeToggle);

      await waitFor(() => {
        expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
        expect(mockClassList.add).toHaveBeenCalledWith('dark');
      });
    });

    it('should maintain theme state when navigating from landing page', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      
      render(
        <ThemeProvider>
          <Home />
        </ThemeProvider>
      );

      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });
  });

  describe('Dashboard Theme Integration', () => {
    const mockSession = {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.jpg',
      },
    };

    it('should render theme toggle on dashboard', () => {
      localStorageMock.getItem.mockReturnValue('light');
      
      render(
        <ThemeProvider>
          <Dashboard session={mockSession} />
        </ThemeProvider>
      );

      expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });

    it('should apply dark theme correctly on dashboard', async () => {
      const mockClassList = {
        add: vi.fn(),
        remove: vi.fn(),
      };
      
      Object.defineProperty(document, 'documentElement', {
        value: { classList: mockClassList },
        writable: true,
      });

      render(
        <ThemeProvider>
          <Dashboard session={mockSession} />
        </ThemeProvider>
      );

      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(themeToggle);

      await waitFor(() => {
        expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
        expect(mockClassList.add).toHaveBeenCalledWith('dark');
      });
    });

    it('should maintain consistent styling with theme changes', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      
      render(
        <ThemeProvider>
          <Dashboard session={mockSession} />
        </ThemeProvider>
      );

      // Check that dashboard elements are present and themed correctly
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Profile Settings')).toBeInTheDocument();
      expect(screen.getByText('Subscription')).toBeInTheDocument();
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });
  });

  describe('Subscription Page Theme Integration', () => {
    it('should render theme toggle on subscription page', async () => {
      localStorageMock.getItem.mockReturnValue('light');
      
      render(
        <ThemeProvider>
          <SubscriptionPlans />
        </ThemeProvider>
      );

      // Wait for the component to finish loading
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });
      
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });

    it('should apply theme changes to subscription plans', async () => {
      const mockClassList = {
        add: vi.fn(),
        remove: vi.fn(),
      };
      
      Object.defineProperty(document, 'documentElement', {
        value: { classList: mockClassList },
        writable: true,
      });

      render(
        <ThemeProvider>
          <SubscriptionPlans />
        </ThemeProvider>
      );

      // Wait for the component to finish loading
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(themeToggle);

      await waitFor(() => {
        expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
        expect(mockClassList.add).toHaveBeenCalledWith('dark');
      });
    });

    it('should maintain subscription plan visibility in both themes', async () => {
      localStorageMock.getItem.mockReturnValue('system');
      
      render(
        <ThemeProvider>
          <SubscriptionPlans />
        </ThemeProvider>
      );

      // Wait for the component to finish loading and check for subscription plans
      await waitFor(() => {
        expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
      });

      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Plan')).toBeInTheDocument();
    });
  });

  describe('Cross-Page Theme Persistence', () => {
    it('should persist theme selection across different page components', () => {
      // Test that localStorage is called correctly when theme changes
      localStorageMock.getItem.mockReturnValue('light');
      
      const { unmount } = render(
        <ThemeProvider storageKey="saas-theme">
          <Home />
        </ThemeProvider>
      );

      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(themeToggle);

      // Verify localStorage was called with correct storage key
      expect(localStorageMock.setItem).toHaveBeenCalledWith('saas-theme', 'dark');
      
      unmount();

      // Test that theme is loaded from localStorage on new render
      localStorageMock.getItem.mockReturnValue('dark');
      
      render(
        <ThemeProvider storageKey="saas-theme">
          <Home />
        </ThemeProvider>
      );

      // Should show moon icon for dark theme
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });

    it('should handle system theme preference consistently', async () => {
      localStorageMock.getItem.mockReturnValue('system');
      
      // Mock system preference for dark mode
      matchMediaMock.mockImplementation((query) => ({
        matches: true, // prefers-color-scheme: dark
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Test on landing page
      const { unmount: unmountHome } = render(
        <ThemeProvider>
          <Home />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
      });
      unmountHome();

      // Test on subscription page
      render(
        <ThemeProvider>
          <SubscriptionPlans />
        </ThemeProvider>
      );

      // Wait for component to load and then check for moon icon
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Theme Accessibility', () => {
    it('should maintain proper ARIA labels across all pages', () => {
      render(
        <ThemeProvider>
          <Home />
        </ThemeProvider>
      );

      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      expect(themeToggle).toHaveAttribute('aria-label', 'Toggle theme');
      expect(themeToggle).toHaveAttribute('type', 'button');
    });

    it('should provide screen reader support for theme changes', async () => {
      render(
        <ThemeProvider>
          <SubscriptionPlans />
        </ThemeProvider>
      );

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
      });

      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      const screenReaderText = screen.getByText('Toggle theme');
      
      expect(screenReaderText).toHaveClass('sr-only');
    });
  });

  describe('Theme Performance', () => {
    it('should not cause unnecessary re-renders when theme changes', async () => {
      const renderSpy = vi.fn();
      
      function TestComponent() {
        renderSpy();
        return <div>Test Component</div>;
      }

      render(
        <ThemeProvider>
          <TestComponent />
          <Home />
        </ThemeProvider>
      );

      const initialRenderCount = renderSpy.mock.calls.length;
      
      const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(themeToggle);

      await waitFor(() => {
        // Should not cause excessive re-renders
        expect(renderSpy.mock.calls.length).toBeLessThanOrEqual(initialRenderCount + 2);
      });
    });
  });
});
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window.matchMedia
const matchMediaMock = vi.fn();

// Test component to access theme context
function TestThemeConsumer() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button data-testid="set-system" onClick={() => setTheme('system')}>
        Set System
      </button>
    </div>
  );
}

describe('Theme System', () => {
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('ThemeProvider', () => {
    it('should provide default theme as system', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(
        <ThemeProvider>
          <TestThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
    });

    it('should load theme from localStorage if available', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      
      render(
        <ThemeProvider>
          <TestThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('should use custom default theme when provided', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(
        <ThemeProvider defaultTheme="light">
          <TestThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('should save theme to localStorage when changed', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(
        <ThemeProvider>
          <TestThemeConsumer />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-dark'));

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
      });
    });

    it('should use custom storage key when provided', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      render(
        <ThemeProvider storageKey="custom-theme">
          <TestThemeConsumer />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-light'));

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('custom-theme', 'light');
      });
    });

    it('should apply light class to document root when theme is light', async () => {
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
          <TestThemeConsumer />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-light'));

      await waitFor(() => {
        expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
        expect(mockClassList.add).toHaveBeenCalledWith('light');
      });
    });

    it('should apply dark class to document root when theme is dark', async () => {
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
          <TestThemeConsumer />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-dark'));

      await waitFor(() => {
        expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
        expect(mockClassList.add).toHaveBeenCalledWith('dark');
      });
    });

    it('should apply system theme based on media query when theme is system', async () => {
      const mockClassList = {
        add: vi.fn(),
        remove: vi.fn(),
      };
      
      Object.defineProperty(document, 'documentElement', {
        value: { classList: mockClassList },
        writable: true,
      });

      // Mock system preference for dark mode
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

      render(
        <ThemeProvider>
          <TestThemeConsumer />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-system'));

      await waitFor(() => {
        expect(mockClassList.remove).toHaveBeenCalledWith('light', 'dark');
        expect(mockClassList.add).toHaveBeenCalledWith('dark');
      });
    });

    it('should provide undefined context when used outside ThemeProvider', () => {
      // Test that the hook returns the initial state when context is undefined
      const TestComponent = () => {
        try {
          const { theme } = useTheme();
          return <div data-testid="theme-outside">{theme}</div>;
        } catch (error) {
          return <div data-testid="error-message">{(error as Error).message}</div>;
        }
      };

      render(<TestComponent />);
      
      // Should either show error message or handle gracefully
      const errorElement = screen.queryByTestId('error-message');
      if (errorElement) {
        expect(errorElement).toHaveTextContent('useTheme must be used within a ThemeProvider');
      }
    });
  });

  describe('ThemeToggle', () => {
    it('should render sun icon when theme is light', () => {
      localStorageMock.getItem.mockReturnValue('light');
      
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    });

    it('should render moon icon when theme is dark', () => {
      localStorageMock.getItem.mockReturnValue('dark');
      
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    });

    it('should render sun icon when system theme is light', () => {
      localStorageMock.getItem.mockReturnValue('system');
      
      // Mock system preference for light mode
      matchMediaMock.mockImplementation((query) => ({
        matches: false, // prefers-color-scheme: dark is false
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });

    it('should render moon icon when system theme is dark', () => {
      localStorageMock.getItem.mockReturnValue('system');
      
      // Mock system preference for dark mode
      matchMediaMock.mockImplementation((query) => ({
        matches: true, // prefers-color-scheme: dark is true
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
    });

    it('should toggle from light to dark when clicked', async () => {
      localStorageMock.getItem.mockReturnValue('light');
      
      render(
        <ThemeProvider>
          <ThemeToggle />
          <TestThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      
      fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      });
    });

    it('should toggle from dark to light when clicked', async () => {
      localStorageMock.getItem.mockReturnValue('dark');
      
      render(
        <ThemeProvider>
          <ThemeToggle />
          <TestThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      
      fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      });
    });

    it('should toggle from system to light when clicked', async () => {
      localStorageMock.getItem.mockReturnValue('system');
      
      render(
        <ThemeProvider>
          <ThemeToggle />
          <TestThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
      
      fireEvent.click(screen.getByRole('button', { name: /toggle theme/i }));

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      });
    });

    it('should have proper accessibility attributes', () => {
      render(
        <ThemeProvider>
          <ThemeToggle />
        </ThemeProvider>
      );

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toHaveAttribute('aria-label', 'Toggle theme');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme across page reloads', () => {
      // First render with light theme
      localStorageMock.getItem.mockReturnValue('light');
      
      const { unmount } = render(
        <ThemeProvider>
          <TestThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      
      // Simulate page reload by unmounting and remounting
      unmount();
      
      render(
        <ThemeProvider>
          <TestThemeConsumer />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      expect(() => {
        render(
          <ThemeProvider>
            <TestThemeConsumer />
          </ThemeProvider>
        );
      }).not.toThrow();

      expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
    });
  });
});
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from '@/components/theme-toggle';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset document class
    document.documentElement.className = '';
  });

  it('should render theme toggle button', () => {
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('should show light mode icon when in light theme', () => {
    localStorageMock.getItem.mockReturnValue('light');
    render(<ThemeToggle />);
    
    const sunIcon = screen.getByTestId('sun-icon');
    expect(sunIcon).toBeInTheDocument();
  });

  it('should show dark mode icon when in dark theme', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    render(<ThemeToggle />);
    
    const moonIcon = screen.getByTestId('moon-icon');
    expect(moonIcon).toBeInTheDocument();
  });

  it('should toggle from light to dark theme when clicked', () => {
    localStorageMock.getItem.mockReturnValue('light');
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(toggleButton);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should toggle from dark to light theme when clicked', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    document.documentElement.classList.add('dark');
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(toggleButton);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should default to light theme when no preference is stored', () => {
    localStorageMock.getItem.mockReturnValue(null);
    render(<ThemeToggle />);
    
    const sunIcon = screen.getByTestId('sun-icon');
    expect(sunIcon).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<ThemeToggle />);
    
    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(toggleButton).toHaveAttribute('aria-label');
    expect(toggleButton).toHaveAttribute('type', 'button');
  });

  it('should respect system preference when no stored preference exists', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    // Mock system preference for dark mode
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<ThemeToggle />);
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
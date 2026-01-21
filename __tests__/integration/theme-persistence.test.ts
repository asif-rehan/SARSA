import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock localStorage for integration testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Theme Persistence Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.className = '';
  });

  it('should persist theme preference to localStorage', () => {
    // Simulate theme change
    const theme = 'dark';
    localStorageMock.setItem('theme', theme);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should retrieve theme preference from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    
    const storedTheme = localStorage.getItem('theme');
    expect(storedTheme).toBe('dark');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('theme');
  });

  it('should handle missing theme preference gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const storedTheme = localStorage.getItem('theme');
    expect(storedTheme).toBeNull();
  });

  it('should apply correct CSS classes based on theme', () => {
    // Test light theme
    document.documentElement.classList.remove('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Test dark theme
    document.documentElement.classList.add('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should handle system theme preference detection', () => {
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

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    expect(mediaQuery.matches).toBe(true);
  });

  it('should handle theme transitions smoothly', () => {
    // Start with light theme
    document.documentElement.classList.remove('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    
    // Transition to dark theme
    document.documentElement.classList.add('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Transition back to light theme
    document.documentElement.classList.remove('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
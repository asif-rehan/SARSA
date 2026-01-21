import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileForm } from '@/components/forms/profile-form';

// Mock the auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    // Mock any auth client methods if needed
  },
}));

// Mock fetch
global.fetch = vi.fn();

describe('ProfileForm Component', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    bio: 'Test bio',
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render profile form with user data', () => {
    render(<ProfileForm user={mockUser} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should show validation errors for invalid input', async () => {
    render(<ProfileForm user={mockUser} onUpdate={mockOnUpdate} />);

    const nameInput = screen.getByLabelText('Display Name');
    fireEvent.change(nameInput, { target: { value: 'A' } }); // Too short
    
    // Try to submit the form to trigger validation
    const submitButton = screen.getByRole('button', { name: /update profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Profile updated successfully',
        user: { ...mockUser, name: 'Updated Name' },
      }),
    } as Response);

    render(<ProfileForm user={mockUser} onUpdate={mockOnUpdate} />);

    const nameInput = screen.getByLabelText('Display Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    const submitButton = screen.getByRole('button', { name: /update profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Updated Name',
          bio: 'Test bio',
        }),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('should handle form submission errors', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Failed to update profile',
      }),
    } as Response);

    render(<ProfileForm user={mockUser} onUpdate={mockOnUpdate} />);

    const nameInput = screen.getByLabelText('Display Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    const submitButton = screen.getByRole('button', { name: /update profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
    });
  });

  it('should disable submit button when form is not dirty', () => {
    render(<ProfileForm user={mockUser} onUpdate={mockOnUpdate} />);

    const submitButton = screen.getByRole('button', { name: /update profile/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when form is dirty', async () => {
    render(<ProfileForm user={mockUser} onUpdate={mockOnUpdate} />);

    const nameInput = screen.getByLabelText('Display Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /update profile/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('should reset form to original values', async () => {
    render(<ProfileForm user={mockUser} onUpdate={mockOnUpdate} />);

    const nameInput = screen.getByLabelText('Display Name');
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } });

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(nameInput).toHaveValue('Test User');
    });
  });
});
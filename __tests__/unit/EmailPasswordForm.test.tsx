import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmailPasswordForm from '@/components/EmailPasswordForm';

// Mock the auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    signUp: {
      email: vi.fn(),
    },
    signIn: {
      email: vi.fn(),
    },
  },
}));

describe('EmailPasswordForm Component (RED PHASE)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  describe('Form Rendering', () => {
    it('should render sign in form by default', () => {
      render(<EmailPasswordForm />);
      
      // Check for tab buttons using getAllByText since there are multiple "Sign In" elements
      const signInElements = screen.getAllByText('Sign In');
      const signUpElements = screen.getAllByText('Sign Up');
      
      expect(signInElements.length).toBeGreaterThan(0);
      expect(signUpElements.length).toBeGreaterThan(0);
      
      // Check for form fields
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
      
      // Check for submit button - should be the only "Sign In" button with type="submit"
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => 
        btn.textContent === 'Sign In' && btn.getAttribute('type') === 'submit'
      );
      expect(submitButton).toBeInTheDocument();
    });

    it('should switch to sign up form when Sign Up tab is clicked', async () => {
      const user = userEvent.setup();
      render(<EmailPasswordForm />);
      
      // Click the Sign Up tab - find the button that's NOT the submit button
      const buttons = screen.getAllByRole('button');
      const signUpTab = buttons.find(btn => 
        btn.textContent === 'Sign Up' && btn.getAttribute('type') === 'button'
      );
      await user.click(signUpTab!);
      
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('should switch back to sign in form when Sign In tab is clicked', async () => {
      const user = userEvent.setup();
      render(<EmailPasswordForm />);
      
      // Switch to sign up first
      const buttons = screen.getAllByRole('button');
      const signUpTab = buttons.find(btn => 
        btn.textContent === 'Sign Up' && btn.getAttribute('type') === 'button'
      );
      await user.click(signUpTab!);
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      
      // Switch back to sign in
      const signInTab = buttons.find(btn => 
        btn.textContent === 'Sign In' && btn.getAttribute('type') === 'button'
      );
      await user.click(signInTab!);
      expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
      
      // Check that submit button is now "Sign In"
      const submitButton = buttons.find(btn => 
        btn.textContent === 'Sign In' && btn.getAttribute('type') === 'submit'
      );
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require email field', async () => {
      render(<EmailPasswordForm />);
      
      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toBeRequired();
    });

    it('should require password field', async () => {
      render(<EmailPasswordForm />);
      
      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toBeRequired();
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });

    it('should require name field in sign up mode', async () => {
      const user = userEvent.setup();
      render(<EmailPasswordForm />);
      
      const buttons = screen.getAllByRole('button');
      const signUpTab = buttons.find(btn => 
        btn.textContent === 'Sign Up' && btn.getAttribute('type') === 'button'
      );
      await user.click(signUpTab!);
      
      const nameInput = screen.getByLabelText('Name');
      expect(nameInput).toBeRequired();
    });

    it('should validate email format', async () => {
      render(<EmailPasswordForm />);
      
      const emailInput = screen.getByLabelText('Email');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should enforce minimum password length', async () => {
      render(<EmailPasswordForm />);
      
      const passwordInput = screen.getByLabelText('Password');
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });
  });

  describe('Sign Up Functionality', () => {
    it('should call signUp.email with correct parameters', async () => {
      const mockSignUp = vi.fn().mockResolvedValue({ 
        data: { user: { email: 'test@example.com' } },
        error: null 
      });
      
      const { authClient } = await import('@/lib/auth-client');
      authClient.signUp.email = mockSignUp;

      const user = userEvent.setup();
      render(<EmailPasswordForm />);
      
      // Switch to sign up mode
      const buttons = screen.getAllByRole('button');
      const signUpTab = buttons.find(btn => 
        btn.textContent === 'Sign Up' && btn.getAttribute('type') === 'button'
      );
      await user.click(signUpTab!);
      
      // Fill out form
      await user.type(screen.getByLabelText('Name'), 'Test User');
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      // Submit form
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        });
      });
    });

    it('should display success message on successful signup', async () => {
      const mockSignUp = vi.fn().mockResolvedValue({ 
        data: { user: { email: 'test@example.com' } },
        error: null 
      });
      
      const { authClient } = await import('@/lib/auth-client');
      authClient.signUp.email = mockSignUp;

      const user = userEvent.setup();
      render(<EmailPasswordForm />);
      
      const buttons = screen.getAllByRole('button');
      const signUpTab = buttons.find(btn => 
        btn.textContent === 'Sign Up' && btn.getAttribute('type') === 'button'
      );
      await user.click(signUpTab!);
      await user.type(screen.getByLabelText('Name'), 'Test User');
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      await waitFor(() => {
        expect(screen.getByText(/Account created! Please check your email for verification link/)).toBeInTheDocument();
      });
    });

    it('should display error message on signup failure', async () => {
      const mockSignUp = vi.fn().mockResolvedValue({ 
        data: null,
        error: { message: 'Email already exists' }
      });
      
      const { authClient } = await import('@/lib/auth-client');
      authClient.signUp.email = mockSignUp;

      const user = userEvent.setup();
      render(<EmailPasswordForm />);
      
      const buttons = screen.getAllByRole('button');
      const signUpTab = buttons.find(btn => 
        btn.textContent === 'Sign Up' && btn.getAttribute('type') === 'button'
      );
      await user.click(signUpTab!);
      await user.type(screen.getByLabelText('Name'), 'Test User');
      await user.type(screen.getByLabelText('Email'), 'existing@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));
      
      await waitFor(() => {
        expect(screen.getByText(/Error: Email already exists/)).toBeInTheDocument();
      });
    });
  });

  describe('Sign In Functionality', () => {
    it('should call signIn.email with correct parameters', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ 
        data: { user: { email: 'test@example.com' } },
        error: null 
      });
      
      const { authClient } = await import('@/lib/auth-client');
      authClient.signIn.email = mockSignIn;

      const user = userEvent.setup();
      render(<EmailPasswordForm />);
      
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      // Click the submit button (type="submit")
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => 
        btn.textContent === 'Sign In' && btn.getAttribute('type') === 'submit'
      );
      await user.click(submitButton!);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });

    it('should redirect to dashboard on successful signin', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ 
        data: { user: { email: 'test@example.com' } },
        error: null 
      });
      
      const { authClient } = await import('@/lib/auth-client');
      authClient.signIn.email = mockSignIn;

      const user = userEvent.setup();
      render(<EmailPasswordForm />);
      
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => 
        btn.textContent === 'Sign In' && btn.getAttribute('type') === 'submit'
      );
      await user.click(submitButton!);
      
      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard');
      });
    });

    it('should display error message on signin failure', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({ 
        data: null,
        error: { message: 'Invalid credentials' }
      });
      
      const { authClient } = await import('@/lib/auth-client');
      authClient.signIn.email = mockSignIn;

      const user = userEvent.setup();
      render(<EmailPasswordForm />);
      
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpassword');
      
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => 
        btn.textContent === 'Sign In' && btn.getAttribute('type') === 'submit'
      );
      await user.click(submitButton!);
      
      await waitFor(() => {
        expect(screen.getByText(/Error: Invalid credentials/)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during signup', async () => {
      const mockSignUp = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100))
      );
      
      const { authClient } = await import('@/lib/auth-client');
      authClient.signUp.email = mockSignUp;

      const user = userEvent.setup();
      render(<EmailPasswordForm />);
      
      const buttons = screen.getAllByRole('button');
      const signUpTab = buttons.find(btn => 
        btn.textContent === 'Sign Up' && btn.getAttribute('type') === 'button'
      );
      await user.click(signUpTab!);
      await user.type(screen.getByLabelText('Name'), 'Test User');
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      await user.click(submitButton);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should show loading state during signin', async () => {
      const mockSignIn = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ data: null, error: null }), 100))
      );
      
      const { authClient } = await import('@/lib/auth-client');
      authClient.signIn.email = mockSignIn;

      const user = userEvent.setup();
      render(<EmailPasswordForm />);
      
      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password123');
      
      const buttons = screen.getAllByRole('button');
      const submitButton = buttons.find(btn => 
        btn.textContent === 'Sign In' && btn.getAttribute('type') === 'submit'
      );
      await user.click(submitButton!);
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });
});
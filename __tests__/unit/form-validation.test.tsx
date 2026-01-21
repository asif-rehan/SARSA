import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorMessage } from '@/components/forms/error-message'
import { SuccessMessage } from '@/components/forms/success-message'
import { FieldError } from '@/components/forms/field-error'
import { FormStatus } from '@/components/forms/form-status'
import { ContactForm } from '@/components/forms/contact-form'

describe('Form Validation Components', () => {
  describe('ErrorMessage', () => {
    it('renders error message with icon', () => {
      render(<ErrorMessage message="Something went wrong" />)
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      // Check for AlertCircle icon
      expect(document.querySelector('svg')).toBeInTheDocument()
    })

    it('renders banner variant with proper styling', () => {
      render(<ErrorMessage message="Error" variant="banner" />)
      
      const container = screen.getByText('Error').closest('div')
      expect(container).toHaveClass('border-destructive/20')
    })

    it('shows dismiss button when onDismiss provided', () => {
      const handleDismiss = vi.fn()
      render(<ErrorMessage message="Error" onDismiss={handleDismiss} />)
      
      const dismissButton = screen.getByLabelText('Dismiss error')
      expect(dismissButton).toBeInTheDocument()
      
      fireEvent.click(dismissButton)
      expect(handleDismiss).toHaveBeenCalledOnce()
    })

    it('applies custom className', () => {
      render(<ErrorMessage message="Error" className="custom-class" />)
      
      const container = screen.getByText('Error').closest('div')
      expect(container).toHaveClass('custom-class')
    })
  })

  describe('SuccessMessage', () => {
    it('renders success message with check icon', () => {
      render(<SuccessMessage message="Success!" />)
      
      expect(screen.getByText('Success!')).toBeInTheDocument()
      // Check for CheckCircle icon
      expect(document.querySelector('svg')).toBeInTheDocument()
    })

    it('renders toast variant with proper styling', () => {
      render(<SuccessMessage message="Success" variant="toast" />)
      
      const container = screen.getByText('Success').closest('div')
      expect(container).toHaveClass('bg-green-600')
    })

    it('shows dismiss button when onDismiss provided', () => {
      const handleDismiss = vi.fn()
      render(<SuccessMessage message="Success" onDismiss={handleDismiss} />)
      
      const dismissButton = screen.getByLabelText('Dismiss success message')
      expect(dismissButton).toBeInTheDocument()
      
      fireEvent.click(dismissButton)
      expect(handleDismiss).toHaveBeenCalledOnce()
    })
  })

  describe('FieldError', () => {
    it('renders nothing when no error', () => {
      const { container } = render(<FieldError />)
      expect(container.firstChild).toBeNull()
    })

    it('renders error with icon when error provided', () => {
      render(<FieldError error="Field is required" />)
      
      expect(screen.getByText('Field is required')).toBeInTheDocument()
      expect(document.querySelector('svg')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<FieldError error="Error" className="custom-error" />)
      
      const container = screen.getByText('Error').closest('div')
      expect(container).toHaveClass('custom-error')
    })
  })

  describe('FormStatus', () => {
    it('shows error message when error provided', () => {
      render(<FormStatus error="Form error" />)
      expect(screen.getByText('Form error')).toBeInTheDocument()
    })

    it('shows success message when success provided', () => {
      render(<FormStatus success="Form submitted successfully" />)
      expect(screen.getByText('Form submitted successfully')).toBeInTheDocument()
    })

    it('calls onClearError when error is dismissed', () => {
      const handleClearError = vi.fn()
      render(<FormStatus error="Error" onClearError={handleClearError} />)
      
      const dismissButton = screen.getByLabelText('Dismiss error')
      fireEvent.click(dismissButton)
      
      expect(handleClearError).toHaveBeenCalledOnce()
    })

    it('calls onClearSuccess when success is dismissed', () => {
      const handleClearSuccess = vi.fn()
      render(<FormStatus success="Success" onClearSuccess={handleClearSuccess} />)
      
      const dismissButton = screen.getByLabelText('Dismiss success message')
      fireEvent.click(dismissButton)
      
      expect(handleClearSuccess).toHaveBeenCalledOnce()
    })

    it('auto-hides success message after delay', async () => {
      const handleClearSuccess = vi.fn()
      render(
        <FormStatus 
          success="Success" 
          onClearSuccess={handleClearSuccess}
          autoHideDelay={100}
        />
      )
      
      expect(screen.getByText('Success')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(handleClearSuccess).toHaveBeenCalledOnce()
      }, { timeout: 200 })
    })
  })

  describe('ContactForm', () => {
    const user = userEvent.setup()

    it('renders all form fields', () => {
      render(<ContactForm />)
      
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    })

    it('shows validation errors for empty required fields', async () => {
      render(<ContactForm />)
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
        expect(screen.getByText(/subject must be at least 5 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      render(<ContactForm />)
      
      const emailInput = screen.getByLabelText(/email address/i)
      await user.type(emailInput, 'invalid-email')
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument()
      })
    })

    it('validates field length constraints', async () => {
      render(<ContactForm />)
      
      const nameInput = screen.getByLabelText(/full name/i)
      const subjectInput = screen.getByLabelText(/subject/i)
      const messageInput = screen.getByLabelText(/message/i)
      
      await user.type(nameInput, 'A') // Too short
      await user.type(subjectInput, 'Hi') // Too short
      await user.type(messageInput, 'Short') // Too short
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/subject must be at least 5 characters/i)).toBeInTheDocument()
        expect(screen.getByText(/message must be at least 10 characters/i)).toBeInTheDocument()
      })
    })

    it('submits form with valid data', async () => {
      const handleSubmit = vi.fn().mockResolvedValue(undefined)
      render(<ContactForm onSubmit={handleSubmit} />)
      
      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email address/i)
      const subjectInput = screen.getByLabelText(/subject/i)
      const messageInput = screen.getByLabelText(/message/i)
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(subjectInput, 'Test Subject')
      await user.type(messageInput, 'This is a test message with enough characters')
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: 'This is a test message with enough characters'
        })
      })
    })

    it('shows loading state during submission', async () => {
      const handleSubmit = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      render(<ContactForm onSubmit={handleSubmit} />)
      
      // Fill form with valid data
      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email address/i)
      const subjectInput = screen.getByLabelText(/subject/i)
      const messageInput = screen.getByLabelText(/message/i)
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(subjectInput, 'Test Subject')
      await user.type(messageInput, 'This is a test message with enough characters')
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      // Check for loading state
      expect(screen.getByText(/sending\.\.\./i)).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      
      await waitFor(() => {
        expect(screen.getByText(/send message/i)).toBeInTheDocument()
      })
    })

    it('shows success message after successful submission', async () => {
      const handleSubmit = vi.fn().mockResolvedValue(undefined)
      render(<ContactForm onSubmit={handleSubmit} />)
      
      // Fill and submit form
      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email address/i)
      const subjectInput = screen.getByLabelText(/subject/i)
      const messageInput = screen.getByLabelText(/message/i)
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(subjectInput, 'Test Subject')
      await user.type(messageInput, 'This is a test message with enough characters')
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/thank you for your message/i)).toBeInTheDocument()
      })
    })

    it('shows error message when submission fails', async () => {
      const handleSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'))
      render(<ContactForm onSubmit={handleSubmit} />)
      
      // Fill and submit form
      const nameInput = screen.getByLabelText(/full name/i)
      const emailInput = screen.getByLabelText(/email address/i)
      const subjectInput = screen.getByLabelText(/subject/i)
      const messageInput = screen.getByLabelText(/message/i)
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(subjectInput, 'Test Subject')
      await user.type(messageInput, 'This is a test message with enough characters')
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/submission failed/i)).toBeInTheDocument()
      })
    })

    it('clears form after successful submission', async () => {
      const handleSubmit = vi.fn().mockResolvedValue(undefined)
      render(<ContactForm onSubmit={handleSubmit} />)
      
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
      const subjectInput = screen.getByLabelText(/subject/i) as HTMLInputElement
      const messageInput = screen.getByLabelText(/message/i) as HTMLTextAreaElement
      
      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(subjectInput, 'Test Subject')
      await user.type(messageInput, 'This is a test message with enough characters')
      
      const submitButton = screen.getByRole('button', { name: /send message/i })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(nameInput.value).toBe('')
        expect(emailInput.value).toBe('')
        expect(subjectInput.value).toBe('')
        expect(messageInput.value).toBe('')
      })
    })

    it('clears form when clear button is clicked', async () => {
      render(<ContactForm />)
      
      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
      const clearButton = screen.getByRole('button', { name: /clear/i })
      
      await user.type(nameInput, 'John Doe')
      expect(nameInput.value).toBe('John Doe')
      
      await user.click(clearButton)
      expect(nameInput.value).toBe('')
    })
  })
})
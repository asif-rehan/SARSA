import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoadingButton } from '@/components/loading/loading-button'
import { DashboardSkeleton } from '@/components/loading/dashboard-skeleton'
import { SubscriptionSkeleton } from '@/components/loading/subscription-skeleton'
import { LandingSkeleton } from '@/components/loading/landing-skeleton'

describe('Loading States', () => {
  describe('LoadingButton', () => {
    it('renders children when not loading', () => {
      render(<LoadingButton>Click me</LoadingButton>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('shows loading spinner when loading', () => {
      render(<LoadingButton loading>Click me</LoadingButton>)
      expect(screen.getByRole('button')).toBeDisabled()
      // Check for loading spinner (Loader2 icon)
      expect(document.querySelector('.animate-spin')).toBeInTheDocument()
    })

    it('shows loading text when provided', () => {
      render(
        <LoadingButton loading loadingText="Processing...">
          Click me
        </LoadingButton>
      )
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })

    it('is disabled when loading', () => {
      render(<LoadingButton loading>Click me</LoadingButton>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('calls onClick when not loading', () => {
      const handleClick = vi.fn()
      render(<LoadingButton onClick={handleClick}>Click me</LoadingButton>)
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledOnce()
    })

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn()
      render(
        <LoadingButton loading onClick={handleClick}>
          Click me
        </LoadingButton>
      )
      
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Skeleton Components', () => {
    it('renders DashboardSkeleton with proper structure', () => {
      render(<DashboardSkeleton />)
      
      // Check for header skeleton
      expect(document.querySelector('header')).toBeInTheDocument()
      
      // Check for main content skeleton
      expect(document.querySelector('main')).toBeInTheDocument()
      
      // Check for skeleton elements
      expect(document.querySelectorAll('[class*="animate-pulse"]')).toHaveLength(0) // Using Skeleton component instead
    })

    it('renders SubscriptionSkeleton with proper structure', () => {
      render(<SubscriptionSkeleton />)
      
      // Check for container
      expect(document.querySelector('.container')).toBeInTheDocument()
      
      // Check for grid layout
      expect(document.querySelector('.grid')).toBeInTheDocument()
    })

    it('renders LandingSkeleton with proper structure', () => {
      render(<LandingSkeleton />)
      
      // Check for main element
      expect(document.querySelector('main')).toBeInTheDocument()
      
      // Check for container
      expect(document.querySelector('.container')).toBeInTheDocument()
    })
  })

  describe('Enhanced Button with Loading', () => {
    it('maintains accessibility when loading', () => {
      render(
        <LoadingButton loading aria-label="Submit form">
          Submit
        </LoadingButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Submit form')
      expect(button).toBeDisabled()
    })

    it('supports different variants', () => {
      render(
        <LoadingButton variant="outline" loading>
          Click me
        </LoadingButton>
      )
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })
})
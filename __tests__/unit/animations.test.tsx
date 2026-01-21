import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HoverCard } from '@/components/interactions/hover-card'
import { AnimatedButton } from '@/components/interactions/animated-button'
import { FadeIn } from '@/components/transitions/fade-in'
import { StaggerContainer, StaggerItem } from '@/components/interactions/stagger-container'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
    button: ({ children, className, ...props }: any) => (
      <button className={className} data-testid="motion-button" {...props}>
        {children}
      </button>
    ),
  },
  AnimatePresence: ({ children }: any) => <div data-testid="animate-presence">{children}</div>,
}))

describe('Animation Components', () => {
  describe('HoverCard', () => {
    it('renders children correctly', () => {
      render(
        <HoverCard>
          <div>Test content</div>
        </HoverCard>
      )
      
      expect(screen.getByText('Test content')).toBeInTheDocument()
      expect(screen.getByTestId('motion-div')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <HoverCard className="custom-class">
          <div>Test content</div>
        </HoverCard>
      )
      
      const motionDiv = screen.getByTestId('motion-div')
      expect(motionDiv).toHaveClass('custom-class')
      expect(motionDiv).toHaveClass('cursor-pointer')
    })

    it('has cursor-pointer class by default', () => {
      render(
        <HoverCard>
          <div>Test content</div>
        </HoverCard>
      )
      
      expect(screen.getByTestId('motion-div')).toHaveClass('cursor-pointer')
    })
  })

  describe('AnimatedButton', () => {
    it('renders button with children', () => {
      render(<AnimatedButton>Click me</AnimatedButton>)
      
      expect(screen.getByText('Click me')).toBeInTheDocument()
      expect(screen.getByTestId('motion-div')).toBeInTheDocument()
    })

    it('passes button props correctly', () => {
      const handleClick = vi.fn()
      render(
        <AnimatedButton onClick={handleClick} disabled>
          Click me
        </AnimatedButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled() // Because it's disabled
    })

    it('applies custom className to button', () => {
      render(
        <AnimatedButton className="custom-button">
          Click me
        </AnimatedButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-button')
    })

    it('supports different button variants', () => {
      render(
        <AnimatedButton variant="outline">
          Click me
        </AnimatedButton>
      )
      
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('FadeIn', () => {
    it('renders children with motion wrapper', () => {
      render(
        <FadeIn>
          <div>Fade in content</div>
        </FadeIn>
      )
      
      expect(screen.getByText('Fade in content')).toBeInTheDocument()
      expect(screen.getByTestId('motion-div')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <FadeIn className="fade-class">
          <div>Content</div>
        </FadeIn>
      )
      
      expect(screen.getByTestId('motion-div')).toHaveClass('fade-class')
    })

    it('accepts delay and duration props', () => {
      render(
        <FadeIn delay={0.5} duration={1.0}>
          <div>Content</div>
        </FadeIn>
      )
      
      expect(screen.getByTestId('motion-div')).toBeInTheDocument()
    })
  })

  describe('StaggerContainer and StaggerItem', () => {
    it('renders container with children', () => {
      render(
        <StaggerContainer>
          <StaggerItem>
            <div>Item 1</div>
          </StaggerItem>
          <StaggerItem>
            <div>Item 2</div>
          </StaggerItem>
        </StaggerContainer>
      )
      
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getAllByTestId('motion-div')).toHaveLength(3) // Container + 2 items
    })

    it('applies custom className to container', () => {
      render(
        <StaggerContainer className="stagger-container">
          <div>Content</div>
        </StaggerContainer>
      )
      
      expect(screen.getByTestId('motion-div')).toHaveClass('stagger-container')
    })

    it('applies custom className to items', () => {
      render(
        <StaggerContainer>
          <StaggerItem className="stagger-item">
            <div>Item</div>
          </StaggerItem>
        </StaggerContainer>
      )
      
      const motionDivs = screen.getAllByTestId('motion-div')
      const itemDiv = motionDivs.find(div => div.classList.contains('stagger-item'))
      expect(itemDiv).toBeInTheDocument()
    })

    it('accepts custom stagger delay', () => {
      render(
        <StaggerContainer staggerDelay={0.2}>
          <div>Content</div>
        </StaggerContainer>
      )
      
      expect(screen.getByTestId('motion-div')).toBeInTheDocument()
    })
  })

  describe('Animation Integration', () => {
    it('works with nested animations', () => {
      render(
        <FadeIn>
          <StaggerContainer>
            <StaggerItem>
              <HoverCard>
                <div>Nested content</div>
              </HoverCard>
            </StaggerItem>
          </StaggerContainer>
        </FadeIn>
      )
      
      expect(screen.getByText('Nested content')).toBeInTheDocument()
      expect(screen.getAllByTestId('motion-div')).toHaveLength(3) // FadeIn + StaggerContainer + StaggerItem
    })

    it('maintains accessibility with animations', () => {
      render(
        <FadeIn>
          <AnimatedButton aria-label="Animated submit button">
            Submit
          </AnimatedButton>
        </FadeIn>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Animated submit button')
    })
  })
})
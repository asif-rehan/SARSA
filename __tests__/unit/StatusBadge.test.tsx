import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge, getStatusDescription } from '@/components/StatusBadge';

describe('StatusBadge', () => {
  it('should render active status with correct styling', () => {
    render(<StatusBadge status="active" />);
    
    const badge = screen.getByTestId('subscription-status-badge');
    expect(badge).toHaveTextContent('Active');
    expect(badge).toHaveAttribute('aria-label', 'Your subscription is active and current');
  });

  it('should render trial status with appropriate styling', () => {
    render(<StatusBadge status="trialing" />);
    
    const badge = screen.getByTestId('subscription-status-badge');
    expect(badge).toHaveTextContent('Trial');
    expect(badge).toHaveAttribute('aria-label', 'You are currently in a trial period');
  });

  it('should render past due status with warning styling', () => {
    render(<StatusBadge status="past_due" />);
    
    const badge = screen.getByTestId('subscription-status-badge');
    expect(badge).toHaveTextContent('Past Due');
    expect(badge).toHaveAttribute('aria-label', 'Your payment is overdue, please update your payment method');
  });

  it('should render canceled status with neutral styling', () => {
    render(<StatusBadge status="canceled" />);
    
    const badge = screen.getByTestId('subscription-status-badge');
    expect(badge).toHaveTextContent('Canceled');
    expect(badge).toHaveAttribute('aria-label', 'Your subscription has been canceled');
  });

  it('should accept custom variant override', () => {
    render(<StatusBadge status="active" variant="destructive" />);
    
    const badge = screen.getByTestId('subscription-status-badge');
    expect(badge).toHaveTextContent('Active');
  });

  it('should include status icons for visual indication', () => {
    render(<StatusBadge status="active" />);
    
    const badge = screen.getByTestId('subscription-status-badge');
    expect(badge).toHaveTextContent('✓'); // Checkmark icon
  });

  describe('getStatusDescription', () => {
    it('should return appropriate descriptions for accessibility', () => {
      expect(getStatusDescription('active')).toBe('Your subscription is active and current');
      expect(getStatusDescription('trialing')).toBe('You are currently in a trial period');
      expect(getStatusDescription('past_due')).toBe('Your payment is overdue, please update your payment method');
      expect(getStatusDescription('canceled')).toBe('Your subscription has been canceled');
    });
  });
});
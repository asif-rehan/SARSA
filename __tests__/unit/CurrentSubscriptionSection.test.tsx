import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { CurrentSubscriptionSection, UserSubscription } from '@/components/CurrentSubscriptionSection';

describe('CurrentSubscriptionSection', () => {
  const mockActiveSubscription: UserSubscription = {
    plan: 'pro',
    status: 'active',
    currentPeriodEnd: '2024-02-15T00:00:00.000Z',
  };

  const mockTrialSubscription: UserSubscription = {
    plan: 'basic',
    status: 'trialing',
    trialEnd: '2024-01-30T00:00:00.000Z',
  };

  it('should not render when subscription is null', () => {
    render(<CurrentSubscriptionSection subscription={null} />);
    expect(screen.queryByTestId('current-subscription-section')).not.toBeInTheDocument();
  });

  it('should render subscription information for active subscription', () => {
    render(<CurrentSubscriptionSection subscription={mockActiveSubscription} />);
    
    expect(screen.getByTestId('current-subscription-section')).toBeInTheDocument();
    expect(screen.getByTestId('subscription-plan-name')).toHaveTextContent('Pro Plan');
    expect(screen.getByTestId('subscription-price')).toHaveTextContent('$29.00');
    expect(screen.getByTestId('subscription-status-badge')).toHaveTextContent('Active');
    expect(screen.getByTestId('subscription-billing-date')).toHaveTextContent('February 15, 2024');
  });

  it('should render trial information for trial subscription', () => {
    render(<CurrentSubscriptionSection subscription={mockTrialSubscription} />);
    
    expect(screen.getByTestId('subscription-plan-name')).toHaveTextContent('Basic Plan');
    expect(screen.getByTestId('subscription-status-badge')).toHaveTextContent('Trial');
    expect(screen.getByTestId('subscription-trial-end')).toHaveTextContent('January 30, 2024');
  });

  it('should render management buttons when callbacks provided', () => {
    render(
      <CurrentSubscriptionSection 
        subscription={mockActiveSubscription}
      />
    );
    
    expect(screen.getByTestId('manage-subscription-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-subscription-button')).toBeInTheDocument();
  });

  it('should not render cancel button for canceled subscriptions', () => {
    const mockCanceledSubscription: UserSubscription = {
      plan: 'pro',
      status: 'canceled',
      currentPeriodEnd: '2024-02-15T00:00:00.000Z',
    };

    render(
      <CurrentSubscriptionSection 
        subscription={mockCanceledSubscription}
      />
    );
    
    expect(screen.queryByTestId('cancel-subscription-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('reactivate-subscription-button')).toBeInTheDocument();
  });
});
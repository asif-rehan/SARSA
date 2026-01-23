import React from 'react';
import { render, screen } from '@testing-library/react';
import { SubscriptionDetails } from '@/components/SubscriptionDetails';

describe('SubscriptionDetails', () => {
  const defaultProps = {
    planName: 'pro',
    price: 29,
    status: 'active' as const,
  };

  it('should render plan name and price', () => {
    render(<SubscriptionDetails {...defaultProps} />);
    
    expect(screen.getByTestId('subscription-plan-name')).toHaveTextContent('Pro Plan');
    expect(screen.getByTestId('subscription-price')).toHaveTextContent('$29.00');
  });

  it('should render billing date when provided', () => {
    render(
      <SubscriptionDetails 
        {...defaultProps} 
        nextBillingDate="2024-02-15T00:00:00.000Z"
      />
    );
    
    expect(screen.getByTestId('subscription-billing-date')).toHaveTextContent('February 15, 2024');
    expect(screen.getByText('Next Billing:')).toBeInTheDocument();
  });

  it('should render trial end date for trial subscriptions', () => {
    render(
      <SubscriptionDetails 
        {...defaultProps}
        status="trialing"
        trialEndDate="2024-01-30T00:00:00.000Z"
      />
    );
    
    expect(screen.getByTestId('subscription-trial-end')).toHaveTextContent('January 30, 2024');
    expect(screen.getByText('Trial Ends:')).toBeInTheDocument();
  });

  it('should show cancellation notice when cancelAtPeriodEnd is true', () => {
    render(
      <SubscriptionDetails 
        {...defaultProps}
        cancelAtPeriodEnd={true}
        nextBillingDate="2024-02-15T00:00:00.000Z"
      />
    );
    
    expect(screen.getByText(/will be canceled at the end/)).toBeInTheDocument();
    expect(screen.getByText('Expires On:')).toBeInTheDocument();
  });

  it('should show past due warning for past_due status', () => {
    render(
      <SubscriptionDetails 
        {...defaultProps}
        status="past_due"
      />
    );
    
    expect(screen.getByText(/payment is past due/)).toBeInTheDocument();
  });

  it('should format different plan names correctly', () => {
    const { rerender } = render(
      <SubscriptionDetails {...defaultProps} planName="basic" />
    );
    expect(screen.getByTestId('subscription-plan-name')).toHaveTextContent('Basic Plan');

    rerender(<SubscriptionDetails {...defaultProps} planName="enterprise" />);
    expect(screen.getByTestId('subscription-plan-name')).toHaveTextContent('Enterprise Plan');

    rerender(<SubscriptionDetails {...defaultProps} planName="custom" />);
    expect(screen.getByTestId('subscription-plan-name')).toHaveTextContent('Custom Plan');
  });
});
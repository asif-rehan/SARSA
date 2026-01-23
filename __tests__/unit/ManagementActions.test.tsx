import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ManagementActions } from '@/components/ManagementActions';
import { UserSubscription } from '@/components/CurrentSubscriptionSection';

describe('ManagementActions', () => {
  const mockActiveSubscription: UserSubscription = {
    plan: 'pro',
    status: 'active',
    currentPeriodEnd: '2024-02-15T00:00:00.000Z',
  };

  const mockCanceledSubscription: UserSubscription = {
    plan: 'pro',
    status: 'canceled',
    currentPeriodEnd: '2024-02-15T00:00:00.000Z',
  };

  const mockTrialSubscription: UserSubscription = {
    plan: 'basic',
    status: 'trialing',
    trialEnd: '2024-01-30T00:00:00.000Z',
  };

  it('should render manage subscription button when callback provided', () => {
    const mockManage = vi.fn();
    
    render(
      <ManagementActions 
        subscription={mockActiveSubscription}
        onManage={mockManage}
      />
    );
    
    expect(screen.getByTestId('manage-subscription-button')).toBeInTheDocument();
  });

  it('should render cancel button for active subscriptions', () => {
    const mockCancel = vi.fn();
    
    render(
      <ManagementActions 
        subscription={mockActiveSubscription}
        onCancel={mockCancel}
      />
    );
    
    expect(screen.getByTestId('cancel-subscription-button')).toBeInTheDocument();
  });

  it('should render reactivate button for canceled subscriptions', () => {
    const mockReactivate = vi.fn();
    
    render(
      <ManagementActions 
        subscription={mockCanceledSubscription}
        onReactivate={mockReactivate}
      />
    );
    
    expect(screen.getByTestId('reactivate-subscription-button')).toBeInTheDocument();
  });

  it('should render upgrade options for lower tier plans', () => {
    const mockUpgrade = vi.fn();
    
    render(
      <ManagementActions 
        subscription={mockTrialSubscription} // basic plan
        onUpgrade={mockUpgrade}
      />
    );
    
    expect(screen.getByTestId('upgrade-to-pro-button')).toBeInTheDocument();
    expect(screen.getByTestId('upgrade-to-enterprise-button')).toBeInTheDocument();
  });

  it('should render downgrade options for higher tier plans', () => {
    const mockDowngrade = vi.fn();
    
    render(
      <ManagementActions 
        subscription={mockActiveSubscription} // pro plan
        onDowngrade={mockDowngrade}
      />
    );
    
    expect(screen.getByTestId('downgrade-to-basic-button')).toBeInTheDocument();
  });

  it('should call appropriate callbacks when buttons are clicked', () => {
    const mockManage = vi.fn();
    const mockCancel = vi.fn();
    const mockUpgrade = vi.fn();
    
    render(
      <ManagementActions 
        subscription={mockActiveSubscription}
        onManage={mockManage}
        onCancel={mockCancel}
        onUpgrade={mockUpgrade}
      />
    );
    
    fireEvent.click(screen.getByTestId('manage-subscription-button'));
    expect(mockManage).toHaveBeenCalled();
    
    fireEvent.click(screen.getByTestId('cancel-subscription-button'));
    expect(mockCancel).toHaveBeenCalled();
    
    fireEvent.click(screen.getByTestId('upgrade-to-enterprise-button'));
    expect(mockUpgrade).toHaveBeenCalledWith('enterprise');
  });

  it('should show no actions message when no callbacks provided', () => {
    render(
      <ManagementActions subscription={mockActiveSubscription} />
    );
    
    expect(screen.getByTestId('no-actions-message')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    const mockManage = vi.fn();
    
    render(
      <ManagementActions 
        subscription={mockActiveSubscription}
        onManage={mockManage}
      />
    );
    
    const button = screen.getByTestId('manage-subscription-button');
    expect(button).toHaveAttribute('aria-label', 'Open subscription management portal to update payment methods, billing information, and other settings');
  });
});
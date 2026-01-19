import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Application Routes', () => {
  it('should render home page', () => {
    const Home = require('../../app/page').default;
    render(<Home />);
    
    expect(screen.getByText(/build your saas/i)).toBeInTheDocument();
  });

  it('should render sign in page', () => {
    const SignInPage = require('../../app/auth/signin/page').default;
    render(<SignInPage />);
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('should render dashboard page', () => {
    const Dashboard = require('../../app/dashboard/page').default;
    render(<Dashboard session={{ user: { name: 'Test User' }} />);
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });

  it('should have working navigation between pages', () => {
    const Home = require('../../app/page').default;
    render(<Home />);
    
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get started/i })).toBeInTheDocument();
  });
});

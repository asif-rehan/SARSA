import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock the auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    admin: {
      listUsers: vi.fn(),
      setRole: vi.fn(),
      banUser: vi.fn(),
      unbanUser: vi.fn(),
      impersonateUser: vi.fn(),
    },
  },
}));

// Mock the permissions module
vi.mock('@/lib/permissions', () => ({
  canManageUsers: vi.fn(),
  canBanUsers: vi.fn(),
  canImpersonateUsers: vi.fn(),
  canManageSessions: vi.fn(),
}));

import AdminDashboard from '@/app/admin/AdminDashboard';
import { authClient } from '@/lib/auth-client';
import { canManageUsers, canBanUsers, canImpersonateUsers, canManageSessions } from '@/lib/permissions';

// Get the mocked functions
const mockAuthClient = authClient as any;
const mockPermissions = {
  canManageUsers: canManageUsers as any,
  canBanUsers: canBanUsers as any,
  canImpersonateUsers: canImpersonateUsers as any,
  canManageSessions: canManageSessions as any,
};

describe('AdminDashboard', () => {
  const mockUser = {
    id: 'admin-1',
    email: 'admin@test.com',
    name: 'Admin User',
    role: 'admin',
  };

  const mockUsers = [
    {
      id: 'user-1',
      email: 'user1@test.com',
      name: 'User One',
      role: 'user',
      banned: false,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'user-2',
      email: 'user2@test.com',
      name: 'User Two',
      role: 'admin',
      banned: false,
      createdAt: '2024-01-02T00:00:00Z',
    },
    {
      id: 'user-3',
      email: 'user3@test.com',
      name: 'User Three',
      role: 'user',
      banned: true,
      banReason: 'Violation of terms',
      createdAt: '2024-01-03T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default permission setup
    mockPermissions.canManageUsers.mockResolvedValue(true);
    mockPermissions.canBanUsers.mockResolvedValue(true);
    mockPermissions.canImpersonateUsers.mockResolvedValue(true);
    mockPermissions.canManageSessions.mockResolvedValue(true);
    
    // Default API responses
    mockAuthClient.admin.listUsers.mockResolvedValue({
      data: { users: mockUsers },
    });
  });

  describe('Component Rendering', () => {
    it('should render admin dashboard with user information', async () => {
      render(<AdminDashboard user={mockUser} />);
      
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/Welcome, Admin User/)).toBeInTheDocument();
    });

    it('should render dashboard content after loading', async () => {
      render(<AdminDashboard user={mockUser} />);
      
      // Should render the main dashboard content (not loading state)
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/Welcome, Admin User/)).toBeInTheDocument();
      
      // Should show permission summary
      await waitFor(() => {
        expect(screen.getByText('Your Permissions')).toBeInTheDocument();
      });
    });

    it('should display permission summary after loading', async () => {
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Your Permissions')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Manage Users')).toBeInTheDocument();
      expect(screen.getByText('Ban Users')).toBeInTheDocument();
      expect(screen.getByText('Impersonate Users')).toBeInTheDocument();
      expect(screen.getByText('Manage Sessions')).toBeInTheDocument();
    });
  });

  describe('Permission Checking', () => {
    it('should check all permissions on component mount', async () => {
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        expect(mockPermissions.canManageUsers).toHaveBeenCalled();
        expect(mockPermissions.canBanUsers).toHaveBeenCalled();
        expect(mockPermissions.canImpersonateUsers).toHaveBeenCalled();
        expect(mockPermissions.canManageSessions).toHaveBeenCalled();
      });
    });

    it('should show no permission message when user cannot manage users', async () => {
      mockPermissions.canManageUsers.mockResolvedValue(false);
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText("You don't have permission to manage users.")).toBeInTheDocument();
      });
    });

    it('should not load users when user lacks manage users permission', async () => {
      mockPermissions.canManageUsers.mockResolvedValue(false);
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        expect(mockAuthClient.admin.listUsers).not.toHaveBeenCalled();
      });
    });
  });

  describe('User Management', () => {
    it('should load and display users when user has permissions', async () => {
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        expect(mockAuthClient.admin.listUsers).toHaveBeenCalledWith({
          query: {
            limit: 50,
            sortBy: 'createdAt',
            sortDirection: 'desc',
          },
        });
      });
      
      await waitFor(() => {
        expect(screen.getByText('User One')).toBeInTheDocument();
        expect(screen.getByText('User Two')).toBeInTheDocument();
        expect(screen.getByText('User Three')).toBeInTheDocument();
      });
    });

    it('should display user roles correctly', async () => {
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        const userBadges = screen.getAllByText('user');
        const adminBadges = screen.getAllByText('admin');
        
        expect(userBadges).toHaveLength(2); // user-1 and user-3
        expect(adminBadges).toHaveLength(1); // user-2
      });
    });

    it('should display banned status and reason', async () => {
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText('Banned')).toBeInTheDocument();
        expect(screen.getByText('Ban reason: Violation of terms')).toBeInTheDocument();
      });
    });

    it('should show user count in header', async () => {
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Managing 3 users/)).toBeInTheDocument();
      });
    });
  });

  describe('Role Management', () => {
    it('should handle role changes for users', async () => {
      mockAuthClient.admin.setRole.mockResolvedValue({});
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        // Get all Make Admin buttons and click the first one (for user-1)
        const makeAdminButtons = screen.getAllByRole('button', { name: 'Make Admin' });
        fireEvent.click(makeAdminButtons[0]);
      });
      
      expect(mockAuthClient.admin.setRole).toHaveBeenCalledWith({
        userId: 'user-1',
        role: 'admin',
      });
    });

    it('should handle removing admin role', async () => {
      mockAuthClient.admin.setRole.mockResolvedValue({});
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        // Get the Remove Admin button (should be only one for user-2)
        const removeAdminButton = screen.getByRole('button', { name: 'Remove Admin' });
        fireEvent.click(removeAdminButton);
      });
      
      expect(mockAuthClient.admin.setRole).toHaveBeenCalledWith({
        userId: 'user-2',
        role: 'user',
      });
    });

    it('should not show role management buttons for current user', async () => {
      const currentUserMock = { ...mockUser, id: 'user-1' };
      
      render(<AdminDashboard user={currentUserMock} />);
      
      await waitFor(() => {
        // Should not find role management buttons for the current user (user-1)
        // Only user-2 and user-3 should have role buttons (1 Remove Admin + 1 Make Admin)
        const roleButtons = screen.queryAllByText(/Make Admin|Remove Admin/);
        expect(roleButtons).toHaveLength(2); // Remove Admin for user-2, Make Admin for user-3
      });
    });
  });

  describe('User Banning', () => {
    it('should handle banning users', async () => {
      mockAuthClient.admin.banUser.mockResolvedValue({});
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        // Get all Ban buttons and click the first one (for user-1)
        const banButtons = screen.getAllByRole('button', { name: 'Ban' });
        fireEvent.click(banButtons[0]);
      });
      
      expect(mockAuthClient.admin.banUser).toHaveBeenCalledWith({
        userId: 'user-1',
        banReason: 'Banned by admin',
      });
    });

    it('should handle unbanning users', async () => {
      mockAuthClient.admin.unbanUser.mockResolvedValue({});
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        const unbanButton = screen.getByRole('button', { name: 'Unban' });
        fireEvent.click(unbanButton);
      });
      
      expect(mockAuthClient.admin.unbanUser).toHaveBeenCalledWith({
        userId: 'user-3',
      });
    });

    it('should not show ban buttons when user lacks ban permissions', async () => {
      mockPermissions.canBanUsers.mockResolvedValue(false);
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Ban' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Unban' })).not.toBeInTheDocument();
      });
    });
  });

  describe('User Impersonation', () => {
    it('should handle user impersonation', async () => {
      mockAuthClient.admin.impersonateUser.mockResolvedValue({});
      
      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        // Get all Impersonate buttons and click the first one (for user-1)
        const impersonateButtons = screen.getAllByRole('button', { name: 'Impersonate' });
        fireEvent.click(impersonateButtons[0]);
      });
      
      expect(mockAuthClient.admin.impersonateUser).toHaveBeenCalledWith({
        userId: 'user-1',
      });
      
      await waitFor(() => {
        expect(window.location.href).toBe('/dashboard');
      });
    });

    it('should not show impersonate button for banned users', async () => {
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        // Should find impersonate buttons for user-1 and user-2 (user-3 is banned)
        const impersonateButtons = screen.getAllByRole('button', { name: 'Impersonate' });
        expect(impersonateButtons).toHaveLength(2); // For user-1 and user-2
      });
    });

    it('should not show impersonate button when user lacks impersonation permissions', async () => {
      mockPermissions.canImpersonateUsers.mockResolvedValue(false);
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Impersonate' })).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully when loading users', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAuthClient.admin.listUsers.mockRejectedValue(new Error('API Error'));
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to load users:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle role change errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAuthClient.admin.setRole.mockRejectedValue(new Error('Role change failed'));
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        const makeAdminButtons = screen.getAllByRole('button', { name: 'Make Admin' });
        fireEvent.click(makeAdminButtons[0]);
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to set role:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle ban operation errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAuthClient.admin.banUser.mockRejectedValue(new Error('Ban failed'));
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        const banButtons = screen.getAllByRole('button', { name: 'Ban' });
        fireEvent.click(banButtons[0]);
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to ban user:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle impersonation errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAuthClient.admin.impersonateUser.mockRejectedValue(new Error('Impersonation failed'));
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        const impersonateButtons = screen.getAllByRole('button', { name: 'Impersonate' });
        fireEvent.click(impersonateButtons[0]);
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to impersonate user:', expect.any(Error));
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('UI State Updates', () => {
    it('should update UI when role is changed successfully', async () => {
      mockAuthClient.admin.setRole.mockResolvedValue({});
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        const makeAdminButtons = screen.getAllByRole('button', { name: 'Make Admin' });
        fireEvent.click(makeAdminButtons[0]);
      });
      
      // Wait for the UI to update - should now have 2 Remove Admin buttons
      await waitFor(() => {
        const removeAdminButtons = screen.getAllByRole('button', { name: 'Remove Admin' });
        expect(removeAdminButtons).toHaveLength(2); // user-1 and user-2 are now both admins
      });
    });

    it('should update UI when user is banned successfully', async () => {
      mockAuthClient.admin.banUser.mockResolvedValue({});
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        const banButtons = screen.getAllByRole('button', { name: 'Ban' });
        fireEvent.click(banButtons[0]);
      });
      
      // Wait for the UI to update
      await waitFor(() => {
        expect(screen.getAllByText('Banned')).toHaveLength(2); // Original banned user + newly banned user
      });
    });

    it('should update UI when user is unbanned successfully', async () => {
      mockAuthClient.admin.unbanUser.mockResolvedValue({});
      
      render(<AdminDashboard user={mockUser} />);
      
      await waitFor(() => {
        const unbanButton = screen.getByRole('button', { name: 'Unban' });
        fireEvent.click(unbanButton);
      });
      
      // Wait for the UI to update - banned badge should be removed
      await waitFor(() => {
        expect(screen.queryByText('Ban reason: Violation of terms')).not.toBeInTheDocument();
      });
    });
  });
});
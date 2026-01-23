import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the auth modules
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      userHasPermission: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    admin: {
      hasPermission: vi.fn(),
    },
  },
}));

import { 
  requireAdmin, 
  checkUserPermission, 
  checkRolePermission,
  hasPermission,
  canManageUsers,
  canBanUsers,
  canImpersonateUsers,
  canManageSessions
} from '@/lib/permissions';
import { auth } from '@/lib/auth';
import { authClient } from '@/lib/auth-client';

// Get the mocked functions
const mockAuth = auth as any;
const mockAuthClient = authClient as any;

describe('Permissions Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requireAdmin', () => {
    const mockHeaders = new Headers();

    it('should return session when user is admin', async () => {
      const mockSession = {
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await requireAdmin(mockHeaders);

      expect(mockAuth.api.getSession).toHaveBeenCalledWith({ headers: mockHeaders });
      expect(result).toEqual(mockSession);
    });

    it('should throw error when no session exists', async () => {
      mockAuth.api.getSession.mockResolvedValue(null);

      await expect(requireAdmin(mockHeaders)).rejects.toThrow('Authentication required');
    });

    it('should throw error when user is not admin', async () => {
      const mockSession = {
        user: { id: '1', email: 'user@test.com', role: 'user' },
      };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      await expect(requireAdmin(mockHeaders)).rejects.toThrow('Admin access required');
    });

    it('should accept user with admin role', async () => {
      const mockSession = {
        user: { id: '1', email: 'admin@test.com', role: 'admin' },
      };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      const result = await requireAdmin(mockHeaders);
      expect(result.user.role).toBe('admin');
    });
  });

  describe('checkUserPermission', () => {
    it('should check user permissions for specific resource and action', async () => {
      const mockResult = { hasPermission: true };
      mockAuth.api.userHasPermission.mockResolvedValue(mockResult);

      const result = await checkUserPermission('user-1', 'user', 'create');

      expect(mockAuth.api.userHasPermission).toHaveBeenCalledWith({
        body: {
          userId: 'user-1',
          permissions: {
            user: ['create'],
          },
        },
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle session resource permissions', async () => {
      const mockResult = { hasPermission: false };
      mockAuth.api.userHasPermission.mockResolvedValue(mockResult);

      const result = await checkUserPermission('user-1', 'session', 'revoke');

      expect(mockAuth.api.userHasPermission).toHaveBeenCalledWith({
        body: {
          userId: 'user-1',
          permissions: {
            session: ['revoke'],
          },
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('checkRolePermission', () => {
    it('should check role permissions for specific resource and action', async () => {
      const mockResult = { hasPermission: true };
      mockAuth.api.userHasPermission.mockResolvedValue(mockResult);

      const result = await checkRolePermission('admin', 'user', 'delete');

      expect(mockAuth.api.userHasPermission).toHaveBeenCalledWith({
        body: {
          role: 'admin',
          permissions: {
            user: ['delete'],
          },
        },
      });
      expect(result).toEqual(mockResult);
    });

    it('should handle different roles', async () => {
      const mockResult = { hasPermission: false };
      mockAuth.api.userHasPermission.mockResolvedValue(mockResult);

      const result = await checkRolePermission('moderator', 'user', 'ban');

      expect(mockAuth.api.userHasPermission).toHaveBeenCalledWith({
        body: {
          role: 'moderator',
          permissions: {
            user: ['ban'],
          },
        },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('hasPermission (client-side)', () => {
    it('should return true when user has permission', async () => {
      mockAuthClient.admin.hasPermission.mockResolvedValue({
        data: { hasPermission: true },
      });

      const result = await hasPermission('user', ['create', 'read']);

      expect(mockAuthClient.admin.hasPermission).toHaveBeenCalledWith({
        permissions: {
          user: ['create', 'read'],
        },
      });
      expect(result).toBe(true);
    });

    it('should return false when user lacks permission', async () => {
      mockAuthClient.admin.hasPermission.mockResolvedValue({
        data: { hasPermission: false },
      });

      const result = await hasPermission('user', ['delete']);

      expect(result).toBe(false);
    });

    it('should return false when API call fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAuthClient.admin.hasPermission.mockRejectedValue(new Error('API Error'));

      const result = await hasPermission('user', ['create']);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Permission check failed:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should return false when response data is missing', async () => {
      mockAuthClient.admin.hasPermission.mockResolvedValue({
        data: null,
      });

      const result = await hasPermission('user', ['create']);

      expect(result).toBe(false);
    });

    it('should handle session resource permissions', async () => {
      mockAuthClient.admin.hasPermission.mockResolvedValue({
        data: { hasPermission: true },
      });

      const result = await hasPermission('session', ['list', 'revoke']);

      expect(mockAuthClient.admin.hasPermission).toHaveBeenCalledWith({
        permissions: {
          session: ['list', 'revoke'],
        },
      });
      expect(result).toBe(true);
    });
  });

  describe('Specific Permission Helpers', () => {
    beforeEach(() => {
      // Reset the hasPermission mock for each test
      mockAuthClient.admin.hasPermission.mockReset();
    });

    describe('canManageUsers', () => {
      it('should check for user management permissions', async () => {
        mockAuthClient.admin.hasPermission.mockResolvedValue({
          data: { hasPermission: true },
        });

        const result = await canManageUsers();

        expect(mockAuthClient.admin.hasPermission).toHaveBeenCalledWith({
          permissions: {
            user: ['list', 'create', 'set-role'],
          },
        });
        expect(result).toBe(true);
      });

      it('should return false when user lacks management permissions', async () => {
        mockAuthClient.admin.hasPermission.mockResolvedValue({
          data: { hasPermission: false },
        });

        const result = await canManageUsers();
        expect(result).toBe(false);
      });
    });

    describe('canBanUsers', () => {
      it('should check for user banning permissions', async () => {
        mockAuthClient.admin.hasPermission.mockResolvedValue({
          data: { hasPermission: true },
        });

        const result = await canBanUsers();

        expect(mockAuthClient.admin.hasPermission).toHaveBeenCalledWith({
          permissions: {
            user: ['ban'],
          },
        });
        expect(result).toBe(true);
      });

      it('should return false when user lacks banning permissions', async () => {
        mockAuthClient.admin.hasPermission.mockResolvedValue({
          data: { hasPermission: false },
        });

        const result = await canBanUsers();
        expect(result).toBe(false);
      });
    });

    describe('canImpersonateUsers', () => {
      it('should check for user impersonation permissions', async () => {
        mockAuthClient.admin.hasPermission.mockResolvedValue({
          data: { hasPermission: true },
        });

        const result = await canImpersonateUsers();

        expect(mockAuthClient.admin.hasPermission).toHaveBeenCalledWith({
          permissions: {
            user: ['impersonate'],
          },
        });
        expect(result).toBe(true);
      });

      it('should return false when user lacks impersonation permissions', async () => {
        mockAuthClient.admin.hasPermission.mockResolvedValue({
          data: { hasPermission: false },
        });

        const result = await canImpersonateUsers();
        expect(result).toBe(false);
      });
    });

    describe('canManageSessions', () => {
      it('should check for session management permissions', async () => {
        mockAuthClient.admin.hasPermission.mockResolvedValue({
          data: { hasPermission: true },
        });

        const result = await canManageSessions();

        expect(mockAuthClient.admin.hasPermission).toHaveBeenCalledWith({
          permissions: {
            session: ['list', 'revoke'],
          },
        });
        expect(result).toBe(true);
      });

      it('should return false when user lacks session management permissions', async () => {
        mockAuthClient.admin.hasPermission.mockResolvedValue({
          data: { hasPermission: false },
        });

        const result = await canManageSessions();
        expect(result).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle auth API errors in requireAdmin', async () => {
      mockAuth.api.getSession.mockRejectedValue(new Error('Database error'));

      await expect(requireAdmin(new Headers())).rejects.toThrow('Database error');
    });

    it('should handle auth API errors in checkUserPermission', async () => {
      mockAuth.api.userHasPermission.mockRejectedValue(new Error('Permission check failed'));

      await expect(checkUserPermission('user-1', 'user', 'create')).rejects.toThrow('Permission check failed');
    });

    it('should handle auth API errors in checkRolePermission', async () => {
      mockAuth.api.userHasPermission.mockRejectedValue(new Error('Role check failed'));

      await expect(checkRolePermission('admin', 'user', 'delete')).rejects.toThrow('Role check failed');
    });

    it('should gracefully handle client-side permission check errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAuthClient.admin.hasPermission.mockRejectedValue(new Error('Network error'));

      const result = await canManageUsers();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Permission check failed:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined session user', async () => {
      const mockSession = { user: undefined };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      await expect(requireAdmin(new Headers())).rejects.toThrow();
    });

    it('should handle session with missing role', async () => {
      const mockSession = {
        user: { id: '1', email: 'user@test.com' }, // No role property
      };
      mockAuth.api.getSession.mockResolvedValue(mockSession);

      await expect(requireAdmin(new Headers())).rejects.toThrow('Admin access required');
    });

    it('should handle empty permissions array', async () => {
      mockAuthClient.admin.hasPermission.mockResolvedValue({
        data: { hasPermission: false },
      });

      const result = await hasPermission('user', []);

      expect(mockAuthClient.admin.hasPermission).toHaveBeenCalledWith({
        permissions: {
          user: [],
        },
      });
      expect(result).toBe(false);
    });
  });
});
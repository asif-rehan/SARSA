import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/profile/route';
import { auth } from '@/lib/auth';

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

describe('Profile API Integration Tests', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    image: null,
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockSession = {
    user: mockUser,
    session: {
      id: 'session-123',
      userId: 'user-123',
      expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/profile', () => {
    it('should return user profile when authenticated', async () => {
      // Mock authenticated session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        image: mockUser.image,
        emailVerified: mockUser.emailVerified,
        createdAt: mockUser.createdAt.toISOString(),
        updatedAt: mockUser.updatedAt.toISOString(),
      });
    });

    it('should return 401 when not authenticated', async () => {
      // Mock no session
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle auth service errors', async () => {
      // Mock auth service error
      vi.mocked(auth.api.getSession).mockRejectedValue(new Error('Auth service error'));

      const request = new NextRequest('http://localhost:3000/api/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch profile');
    });
  });

  describe('PUT /api/profile', () => {
    it('should update profile with valid data', async () => {
      // Mock authenticated session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const updateData = {
        name: 'Updated Name',
        bio: 'Updated bio',
      };

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Profile updated successfully');
      expect(data.user.name).toBe(updateData.name);
      expect(data.user.bio).toBe(updateData.bio);
    });

    it('should return 401 when not authenticated', async () => {
      // Mock no session
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate input data and return 400 for invalid data', async () => {
      // Mock authenticated session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const invalidData = {
        name: 'A', // Too short
        bio: 'x'.repeat(501), // Too long
      };

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify(invalidData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
      expect(Array.isArray(data.details)).toBe(true);
    });

    it('should handle malformed JSON', async () => {
      // Mock authenticated session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update profile');
    });

    it('should handle preferences update', async () => {
      // Mock authenticated session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const updateData = {
        preferences: {
          theme: 'dark' as const,
          notifications: {
            email: true,
            push: false,
            marketing: true,
          },
          timezone: 'America/New_York',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.preferences).toEqual(updateData.preferences);
    });
  });

  describe('DELETE /api/profile', () => {
    it('should return success message for account deletion request', async () => {
      // Mock authenticated session
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession);

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain('Account deletion requested');
    });

    it('should return 401 when not authenticated', async () => {
      // Mock no session
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle auth service errors', async () => {
      // Mock auth service error
      vi.mocked(auth.api.getSession).mockRejectedValue(new Error('Auth service error'));

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete account');
    });
  });
});
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { POST } from './route';
import { createSession } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';

// Mock next/headers for cookies
const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookies),
}));

const prisma = new PrismaClient();

describe('POST /api/auth/logout - Integration Tests', () => {
  let testUser: any;
  let testSession: any;

  beforeEach(async () => {
    // Clear mocks
    vi.clearAllMocks();

    // Clean up
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    testUser = await prisma.user.create({
      data: {
        id: 'test-logout-user',
        name: 'Test Logout User',
        username: 'testlogout',
        displayUsername: 'TestLogout',
        email: 'testlogout@example.com',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create session
    testSession = await createSession(testUser.id);
  });

  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('Successful Logout', () => {
    it('should logout successfully with valid session', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should delete session from database', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      await POST();

      const session = await prisma.session.findUnique({
        where: { token: testSession.id },
      });

      expect(session).toBeNull();
    });

    it('should delete session cookie', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      await POST();

      expect(mockCookies.delete).toHaveBeenCalled();
    });

    it('should handle logout with no active session', async () => {
      mockCookies.get.mockReturnValue(undefined);

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle logout with invalid session token', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid-token' });

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle logout with expired session', async () => {
      // Create an expired session
      const expiredSession = await prisma.session.create({
        data: {
          id: 'expired-session',
          token: 'expired-token',
          userId: testUser.id,
          expiresAt: new Date(Date.now() - 1000), // 1 second ago
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      mockCookies.get.mockReturnValue({ value: expiredSession.token });

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Multiple Sessions', () => {
    it('should only delete the current session, not other sessions', async () => {
      const session2 = await createSession(testUser.id);

      mockCookies.get.mockReturnValue({ value: testSession.id });

      await POST();

      const deletedSession = await prisma.session.findUnique({
        where: { token: testSession.id },
      });

      const remainingSession = await prisma.session.findUnique({
        where: { token: session2.id },
      });

      expect(deletedSession).toBeNull();
      expect(remainingSession).toBeDefined();
    });

    it('should allow multiple logouts for the same user', async () => {
      const session2 = await createSession(testUser.id);

      // First logout
      mockCookies.get.mockReturnValue({ value: testSession.id });
      const response1 = await POST();
      const data1 = await response1.json();

      expect(data1.success).toBe(true);

      // Second logout
      mockCookies.get.mockReturnValue({ value: session2.id });
      const response2 = await POST();
      const data2 = await response2.json();

      expect(data2.success).toBe(true);

      // Verify both sessions are deleted
      const sessions = await prisma.session.findMany({
        where: { userId: testUser.id },
      });

      expect(sessions.length).toBe(0);
    });
  });

  describe('Cookie Handling', () => {
    it('should always delete cookie even without session token', async () => {
      mockCookies.get.mockReturnValue(undefined);

      await POST();

      expect(mockCookies.delete).toHaveBeenCalled();
    });

    it('should delete cookie even if session deletion fails', async () => {
      mockCookies.get.mockReturnValue({ value: 'non-existent-token' });

      await POST();

      expect(mockCookies.delete).toHaveBeenCalled();
    });
  });

  describe('Different User Roles', () => {
    it('should allow logout for all user roles', async () => {
      const roles = ['STUDENT', 'TEACHER', 'ADMIN', 'SYSTEM'] as const;

      for (const role of roles) {
        const user = await prisma.user.create({
          data: {
            id: `logout-user-${role}`,
            name: `${role} User`,
            username: `logout${role.toLowerCase()}`,
            displayUsername: role,
            email: `logout-${role.toLowerCase()}@example.com`,
            role,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        const session = await createSession(user.id);

        mockCookies.get.mockReturnValue({ value: session.id });

        const response = await POST();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);

        // Verify session deleted
        const deletedSession = await prisma.session.findUnique({
          where: { token: session.id },
        });

        expect(deletedSession).toBeNull();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle logout after session already manually deleted', async () => {
      // Manually delete the session
      await prisma.session.delete({
        where: { id: testSession.id },
      });

      mockCookies.get.mockReturnValue({ value: testSession.id });

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle empty session token', async () => {
      mockCookies.get.mockReturnValue({ value: '' });

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle malformed session token', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid@#$%token' });

      const response = await POST();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Idempotency', () => {
    it('should be idempotent - multiple logout calls should succeed', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      // First logout
      const response1 = await POST();
      const data1 = await response1.json();

      expect(response1.status).toBe(200);
      expect(data1.success).toBe(true);

      // Second logout with same token
      const response2 = await POST();
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.success).toBe(true);
    });
  });

  describe('Response Format', () => {
    it('should return correct response format', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      const response = await POST();
      const data = await response.json();

      expect(data).toEqual({ success: true });
      expect(data.error).toBeUndefined();
    });

    it('should not expose sensitive information in response', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      const response = await POST();
      const data = await response.json();

      expect(data.user).toBeUndefined();
      expect(data.session).toBeUndefined();
      expect(data.token).toBeUndefined();
    });
  });
});

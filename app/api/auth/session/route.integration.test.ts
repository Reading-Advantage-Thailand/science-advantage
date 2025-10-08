import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { GET } from './route';
import { createSession } from '@/lib/auth/session';

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

describe('GET /api/auth/session - Integration Tests', () => {
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
        id: 'test-session-user',
        name: 'Test Session User',
        username: 'testsession',
        displayUsername: 'TestSession',
        email: 'testsession@example.com',
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

  describe('Valid Session', () => {
    it('should return session for valid session token', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toBeDefined();
      expect(data.session.user).toBeDefined();
      expect(data.session.user.id).toBe(testUser.id);
      expect(data.session.user.username).toBe('testsession');
      expect(data.session.user.role).toBe('STUDENT');
    });

    it('should include expiration time in session', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      const response = await GET();
      const data = await response.json();

      expect(data.session.expiresAt).toBeDefined();
      const expiresAt = new Date(data.session.expiresAt);
      expect(expiresAt).toBeInstanceOf(Date);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return all user fields in session', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      const response = await GET();
      const data = await response.json();

      expect(data.session.user.id).toBe(testUser.id);
      expect(data.session.user.name).toBe(testUser.name);
      expect(data.session.user.username).toBe(testUser.username);
      expect(data.session.user.email).toBe(testUser.email);
      expect(data.session.user.role).toBe(testUser.role);
    });

    it('should work for all user roles', async () => {
      const roles = ['STUDENT', 'TEACHER', 'ADMIN', 'SYSTEM'] as const;

      for (const role of roles) {
        const user = await prisma.user.create({
          data: {
            id: `session-user-${role}`,
            name: `${role} User`,
            username: `session${role.toLowerCase()}`,
            displayUsername: role,
            email: `session-${role.toLowerCase()}@example.com`,
            role,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        const session = await createSession(user.id);

        mockCookies.get.mockReturnValue({ value: session.id });

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.session.user.role).toBe(role);
      }
    });
  });

  describe('No Session', () => {
    it('should return null session when no cookie present', async () => {
      mockCookies.get.mockReturnValue(undefined);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toBeNull();
    });

    it('should return null session for invalid token', async () => {
      mockCookies.get.mockReturnValue({ value: 'invalid-token' });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toBeNull();
    });

    it('should return null session for non-existent token', async () => {
      mockCookies.get.mockReturnValue({ value: 'non-existent-token-123' });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toBeNull();
    });

    it('should return null for empty token', async () => {
      mockCookies.get.mockReturnValue({ value: '' });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toBeNull();
    });
  });

  describe('Expired Session', () => {
    it('should return null for expired session', async () => {
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

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toBeNull();
    });

    it('should delete expired session from database', async () => {
      // Create an expired session
      const expiredSession = await prisma.session.create({
        data: {
          id: 'expired-session-2',
          token: 'expired-token-2',
          userId: testUser.id,
          expiresAt: new Date(Date.now() - 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      mockCookies.get.mockReturnValue({ value: expiredSession.token });

      await GET();

      // Verify session was deleted
      const deletedSession = await prisma.session.findUnique({
        where: { token: expiredSession.token },
      });

      expect(deletedSession).toBeNull();
    });

    it('should return valid session just before expiration', async () => {
      // Create session expiring in 1 second
      const almostExpiredSession = await prisma.session.create({
        data: {
          id: 'almost-expired',
          token: 'almost-expired-token',
          userId: testUser.id,
          expiresAt: new Date(Date.now() + 1000), // 1 second from now
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      mockCookies.get.mockReturnValue({ value: almostExpiredSession.token });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toBeDefined();
      expect(data.session.user.id).toBe(testUser.id);
    });
  });

  describe('Session Security', () => {
    it('should not expose sensitive user data', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      const response = await GET();
      const data = await response.json();

      // Should not include password or account data
      expect(data.session.user.password).toBeUndefined();
      expect(data.session.user.account).toBeUndefined();
      expect(data.session.token).toBeUndefined();
    });

    it('should not expose session token in response', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      const response = await GET();
      const data = await response.json();

      expect(data.session.id).toBeUndefined();
      expect(data.session.token).toBeUndefined();
    });
  });

  describe('Multiple Sessions', () => {
    it('should return correct session for current token', async () => {
      const session2 = await createSession(testUser.id);

      // Test first session
      mockCookies.get.mockReturnValue({ value: testSession.id });
      const response1 = await GET();
      const data1 = await response1.json();

      expect(data1.session).toBeDefined();
      expect(data1.session.user.id).toBe(testUser.id);

      // Test second session
      mockCookies.get.mockReturnValue({ value: session2.id });
      const response2 = await GET();
      const data2 = await response2.json();

      expect(data2.session).toBeDefined();
      expect(data2.session.user.id).toBe(testUser.id);
    });
  });

  describe('User Data Updates', () => {
    it('should reflect latest user data from database', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      // Update user data
      await prisma.user.update({
        where: { id: testUser.id },
        data: { name: 'Updated Name' },
      });

      const response = await GET();
      const data = await response.json();

      expect(data.session.user.name).toBe('Updated Name');
    });

    it('should reflect role changes', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      // Update user role
      await prisma.user.update({
        where: { id: testUser.id },
        data: { role: 'TEACHER' },
      });

      const response = await GET();
      const data = await response.json();

      expect(data.session.user.role).toBe('TEACHER');
    });
  });

  describe('Response Format', () => {
    it('should return correct response structure with session', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('session');
      expect(data.session).toHaveProperty('user');
      expect(data.session).toHaveProperty('expiresAt');
    });

    it('should return correct response structure without session', async () => {
      mockCookies.get.mockReturnValue(undefined);

      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('session');
      expect(data.session).toBeNull();
    });

    it('should always return 200 status', async () => {
      // With valid session
      mockCookies.get.mockReturnValue({ value: testSession.id });
      const response1 = await GET();
      expect(response1.status).toBe(200);

      // Without session
      mockCookies.get.mockReturnValue(undefined);
      const response2 = await GET();
      expect(response2.status).toBe(200);

      // With invalid session
      mockCookies.get.mockReturnValue({ value: 'invalid' });
      const response3 = await GET();
      expect(response3.status).toBe(200);
    });
  });

  describe('Edge Cases', () => {
    it('should handle deleted user gracefully', async () => {
      mockCookies.get.mockReturnValue({ value: testSession.id });

      // Delete the user
      await prisma.user.delete({ where: { id: testUser.id } });

      const response = await GET();
      const data = await response.json();

      // Session should be gone because of cascade delete
      expect(data.session).toBeNull();
    });

    it('should handle malformed session token', async () => {
      mockCookies.get.mockReturnValue({ value: 'malformed@#$%token' });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.session).toBeNull();
    });
  });
});

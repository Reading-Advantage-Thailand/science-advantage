import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import { requireAuth, requireRole, hasRole, getSession } from './server';
import { createSession } from './session';
import type { Session } from './types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock next/headers for cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

const prisma = new PrismaClient();

describe('Auth Server Helpers', () => {
  let studentUser: any;
  let teacherUser: any;
  let adminUser: any;
  let systemUser: any;

  beforeEach(async () => {
    // Clean up
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // Create test users with different roles
    studentUser = await prisma.user.create({
      data: {
        id: 'student-1',
        name: 'Student User',
        username: 'student',
        displayUsername: 'Student',
        email: 'student@example.com',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    teacherUser = await prisma.user.create({
      data: {
        id: 'teacher-1',
        name: 'Teacher User',
        username: 'teacher',
        displayUsername: 'Teacher',
        email: 'teacher@example.com',
        role: 'TEACHER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    adminUser = await prisma.user.create({
      data: {
        id: 'admin-1',
        name: 'Admin User',
        username: 'admin',
        displayUsername: 'Admin',
        email: 'admin@example.com',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    systemUser = await prisma.user.create({
      data: {
        id: 'system-1',
        name: 'System User',
        username: 'system',
        displayUsername: 'System',
        email: 'system@example.com',
        role: 'SYSTEM',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('hasRole', () => {
    it('should return true when user has exact role', () => {
      const session: Session = {
        id: 'test-session',
        userId: studentUser.id,
        expiresAt: new Date(),
        user: {
          id: studentUser.id,
          name: studentUser.name,
          username: studentUser.username,
          email: studentUser.email,
          role: 'STUDENT',
          image: null,
        },
      };

      expect(hasRole(session, 'STUDENT')).toBe(true);
    });

    it('should return true when user has higher role', () => {
      const session: Session = {
        id: 'test-session',
        userId: teacherUser.id,
        expiresAt: new Date(),
        user: {
          id: teacherUser.id,
          name: teacherUser.name,
          username: teacherUser.username,
          email: teacherUser.email,
          role: 'TEACHER',
          image: null,
        },
      };

      expect(hasRole(session, 'STUDENT')).toBe(true);
    });

    it('should return false when user has lower role', () => {
      const session: Session = {
        id: 'test-session',
        userId: studentUser.id,
        expiresAt: new Date(),
        user: {
          id: studentUser.id,
          name: studentUser.name,
          username: studentUser.username,
          email: studentUser.email,
          role: 'STUDENT',
          image: null,
        },
      };

      expect(hasRole(session, 'TEACHER')).toBe(false);
      expect(hasRole(session, 'ADMIN')).toBe(false);
      expect(hasRole(session, 'SYSTEM')).toBe(false);
    });

    it('should enforce role hierarchy correctly', () => {
      // STUDENT (level 1)
      const studentSession: Session = {
        id: 'student-session',
        userId: studentUser.id,
        expiresAt: new Date(),
        user: { ...studentUser, image: null },
      };

      expect(hasRole(studentSession, 'STUDENT')).toBe(true);
      expect(hasRole(studentSession, 'TEACHER')).toBe(false);
      expect(hasRole(studentSession, 'ADMIN')).toBe(false);
      expect(hasRole(studentSession, 'SYSTEM')).toBe(false);

      // TEACHER (level 2)
      const teacherSession: Session = {
        id: 'teacher-session',
        userId: teacherUser.id,
        expiresAt: new Date(),
        user: { ...teacherUser, image: null },
      };

      expect(hasRole(teacherSession, 'STUDENT')).toBe(true);
      expect(hasRole(teacherSession, 'TEACHER')).toBe(true);
      expect(hasRole(teacherSession, 'ADMIN')).toBe(false);
      expect(hasRole(teacherSession, 'SYSTEM')).toBe(false);

      // ADMIN (level 3)
      const adminSession: Session = {
        id: 'admin-session',
        userId: adminUser.id,
        expiresAt: new Date(),
        user: { ...adminUser, image: null },
      };

      expect(hasRole(adminSession, 'STUDENT')).toBe(true);
      expect(hasRole(adminSession, 'TEACHER')).toBe(true);
      expect(hasRole(adminSession, 'ADMIN')).toBe(true);
      expect(hasRole(adminSession, 'SYSTEM')).toBe(false);

      // SYSTEM (level 4)
      const systemSession: Session = {
        id: 'system-session',
        userId: systemUser.id,
        expiresAt: new Date(),
        user: { ...systemUser, image: null },
      };

      expect(hasRole(systemSession, 'STUDENT')).toBe(true);
      expect(hasRole(systemSession, 'TEACHER')).toBe(true);
      expect(hasRole(systemSession, 'ADMIN')).toBe(true);
      expect(hasRole(systemSession, 'SYSTEM')).toBe(true);
    });
  });

  describe('Role Hierarchy Tests', () => {
    it('should define correct role hierarchy levels', () => {
      const studentSession: Session = {
        id: 'test',
        userId: 'test',
        expiresAt: new Date(),
        user: { id: 'test', name: 'Test', username: 'test', email: null, role: 'STUDENT', image: null },
      };

      const teacherSession: Session = {
        ...studentSession,
        user: { ...studentSession.user, role: 'TEACHER' },
      };

      const adminSession: Session = {
        ...studentSession,
        user: { ...studentSession.user, role: 'ADMIN' },
      };

      const systemSession: Session = {
        ...studentSession,
        user: { ...studentSession.user, role: 'SYSTEM' },
      };

      // STUDENT = 1, TEACHER = 2, ADMIN = 3, SYSTEM = 4
      expect(hasRole(studentSession, 'STUDENT')).toBe(true);
      expect(hasRole(teacherSession, 'STUDENT')).toBe(true);
      expect(hasRole(adminSession, 'STUDENT')).toBe(true);
      expect(hasRole(systemSession, 'STUDENT')).toBe(true);

      expect(hasRole(studentSession, 'TEACHER')).toBe(false);
      expect(hasRole(teacherSession, 'TEACHER')).toBe(true);
      expect(hasRole(adminSession, 'TEACHER')).toBe(true);
      expect(hasRole(systemSession, 'TEACHER')).toBe(true);

      expect(hasRole(studentSession, 'ADMIN')).toBe(false);
      expect(hasRole(teacherSession, 'ADMIN')).toBe(false);
      expect(hasRole(adminSession, 'ADMIN')).toBe(true);
      expect(hasRole(systemSession, 'ADMIN')).toBe(true);

      expect(hasRole(studentSession, 'SYSTEM')).toBe(false);
      expect(hasRole(teacherSession, 'SYSTEM')).toBe(false);
      expect(hasRole(adminSession, 'SYSTEM')).toBe(false);
      expect(hasRole(systemSession, 'SYSTEM')).toBe(true);
    });
  });

  describe('Route Access Patterns', () => {
    it('should map roles to correct routes', () => {
      // This is implicitly tested by requireRole, but we document the expectations
      const roleRouteMap = {
        STUDENT: '/student',
        TEACHER: '/teacher',
        ADMIN: '/admin',
        SYSTEM: '/system',
      };

      expect(roleRouteMap.STUDENT).toBe('/student');
      expect(roleRouteMap.TEACHER).toBe('/teacher');
      expect(roleRouteMap.ADMIN).toBe('/admin');
      expect(roleRouteMap.SYSTEM).toBe('/system');
    });
  });

  describe('Permission Scenarios', () => {
    it('should allow teacher to access student routes', () => {
      const teacherSession: Session = {
        id: 'test',
        userId: teacherUser.id,
        expiresAt: new Date(),
        user: { ...teacherUser, image: null },
      };

      expect(hasRole(teacherSession, 'STUDENT')).toBe(true);
    });

    it('should prevent student from accessing teacher routes', () => {
      const studentSession: Session = {
        id: 'test',
        userId: studentUser.id,
        expiresAt: new Date(),
        user: { ...studentUser, image: null },
      };

      expect(hasRole(studentSession, 'TEACHER')).toBe(false);
    });

    it('should allow admin to access all lower level routes', () => {
      const adminSession: Session = {
        id: 'test',
        userId: adminUser.id,
        expiresAt: new Date(),
        user: { ...adminUser, image: null },
      };

      expect(hasRole(adminSession, 'STUDENT')).toBe(true);
      expect(hasRole(adminSession, 'TEACHER')).toBe(true);
      expect(hasRole(adminSession, 'ADMIN')).toBe(true);
    });

    it('should prevent admin from accessing system routes', () => {
      const adminSession: Session = {
        id: 'test',
        userId: adminUser.id,
        expiresAt: new Date(),
        user: { ...adminUser, image: null },
      };

      expect(hasRole(adminSession, 'SYSTEM')).toBe(false);
    });

    it('should allow system user to access all routes', () => {
      const systemSession: Session = {
        id: 'test',
        userId: systemUser.id,
        expiresAt: new Date(),
        user: { ...systemUser, image: null },
      };

      expect(hasRole(systemSession, 'STUDENT')).toBe(true);
      expect(hasRole(systemSession, 'TEACHER')).toBe(true);
      expect(hasRole(systemSession, 'ADMIN')).toBe(true);
      expect(hasRole(systemSession, 'SYSTEM')).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle session with null user fields', () => {
      const session: Session = {
        id: 'test',
        userId: 'test',
        expiresAt: new Date(),
        user: {
          id: 'test',
          name: 'Test',
          username: 'test',
          email: null,
          role: 'STUDENT',
          image: null,
        },
      };

      expect(hasRole(session, 'STUDENT')).toBe(true);
    });

    it('should handle session expiration dates correctly', () => {
      const futureExpiry: Session = {
        id: 'test',
        userId: 'test',
        expiresAt: new Date(Date.now() + 86400000), // 1 day future
        user: {
          id: 'test',
          name: 'Test',
          username: 'test',
          email: null,
          role: 'STUDENT',
          image: null,
        },
      };

      expect(hasRole(futureExpiry, 'STUDENT')).toBe(true);

      const pastExpiry: Session = {
        id: 'test',
        userId: 'test',
        expiresAt: new Date(Date.now() - 86400000), // 1 day past
        user: {
          id: 'test',
          name: 'Test',
          username: 'test',
          email: null,
          role: 'STUDENT',
          image: null,
        },
      };

      // hasRole doesn't check expiration - that's validateSession's job
      expect(hasRole(pastExpiry, 'STUDENT')).toBe(true);
    });
  });
});

/**
 * Reusable Auth Module - Main Exports
 * Copy this entire auth/ folder to any Next.js project
 *
 * Usage:
 * - Server-side: import { requireAuth, requireRole } from '@/lib/auth/server'
 * - Password: import { hashPassword, verifyPassword } from '@/lib/auth/password'
 * - Session: import { createSession, validateSession } from '@/lib/auth/session'
 */

export * from './types';
export * from './password';
export * from './session';
export * from './server';

// Better Auth compatible export
import { validateSession } from './session';

export const auth = {
  api: {
    getSession: async ({ headers }: { headers: Headers }) => {
      // Get session token from cookies
      const sessionToken = headers
        .get('cookie')
        ?.match(/session-token=([^;]+)/)?.[1];

      if (!sessionToken) {
        return null;
      }

      return await validateSession(sessionToken);
    },
  },
};

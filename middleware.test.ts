import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from './middleware';

// Mock NextResponse.redirect
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      ...actual.NextResponse,
      redirect: vi.fn((url: URL) => {
        const response = new Response(null, {
          status: 307,
          headers: { Location: url.toString() },
        });
        return response as any;
      }),
      next: vi.fn(() => {
        const response = new Response(null, { status: 200 });
        return response as any;
      }),
    },
  };
});

describe('Middleware - Route Protection and RBAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Protected Routes - Unauthenticated Users', () => {
    it('should redirect to login when accessing /student without session', async () => {
      const request = new NextRequest('http://localhost:3000/student');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/login');
    });

    it('should redirect to login when accessing /teacher without session', async () => {
      const request = new NextRequest('http://localhost:3000/teacher');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/login');
    });

    it('should redirect to login when accessing /admin without session', async () => {
      const request = new NextRequest('http://localhost:3000/admin');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/login');
    });

    it('should redirect to login when accessing /system without session', async () => {
      const request = new NextRequest('http://localhost:3000/system');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/login');
    });

    it('should redirect to login for nested protected routes', async () => {
      const routes = [
        '/student/dashboard',
        '/teacher/classes',
        '/admin/users',
        '/system/settings',
      ];

      for (const route of routes) {
        const request = new NextRequest(`http://localhost:3000${route}`);
        const response = await middleware(request);

        expect(response.status).toBe(307);
        expect(response.headers.get('Location')).toBe('http://localhost:3000/login');
      }
    });
  });

  describe('Protected Routes - Authenticated Users', () => {
    it('should allow access to /student with valid session', async () => {
      const request = new NextRequest('http://localhost:3000/student', {
        headers: {
          Cookie: 'session_token=valid-token',
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow access to /teacher with valid session', async () => {
      const request = new NextRequest('http://localhost:3000/teacher', {
        headers: {
          Cookie: 'session_token=valid-token',
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow access to /admin with valid session', async () => {
      const request = new NextRequest('http://localhost:3000/admin', {
        headers: {
          Cookie: 'session_token=valid-token',
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow access to /system with valid session', async () => {
      const request = new NextRequest('http://localhost:3000/system', {
        headers: {
          Cookie: 'session_token=valid-token',
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Public Routes', () => {
    it('should allow access to / without session', async () => {
      const request = new NextRequest('http://localhost:3000/');

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow access to /login without session', async () => {
      const request = new NextRequest('http://localhost:3000/login');

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow access to /signup without session', async () => {
      const request = new NextRequest('http://localhost:3000/signup');

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Auth Routes with Session', () => {
    it('should redirect to /dashboard when accessing /login with session', async () => {
      const request = new NextRequest('http://localhost:3000/login', {
        headers: {
          Cookie: 'session_token=valid-token',
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/dashboard');
    });

    it('should redirect to /dashboard when accessing /signup with session', async () => {
      const request = new NextRequest('http://localhost:3000/signup', {
        headers: {
          Cookie: 'session_token=valid-token',
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/dashboard');
    });
  });

  describe('Session Token Handling', () => {
    it('should detect session from cookie', async () => {
      const request = new NextRequest('http://localhost:3000/student', {
        headers: {
          Cookie: 'session_token=my-session-token',
        },
      });

      const response = await middleware(request);

      // Should allow access, not redirect
      expect(response.status).toBe(200);
    });

    it('should handle missing session cookie', async () => {
      const request = new NextRequest('http://localhost:3000/student');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/login');
    });

    it('should handle empty session token', async () => {
      const request = new NextRequest('http://localhost:3000/student', {
        headers: {
          Cookie: 'session_token=',
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/login');
    });

    it('should handle multiple cookies', async () => {
      const request = new NextRequest('http://localhost:3000/student', {
        headers: {
          Cookie: 'other_cookie=value; session_token=valid-token; another_cookie=value',
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Route Matching', () => {
    it('should protect routes with query parameters', async () => {
      const request = new NextRequest('http://localhost:3000/student?page=1');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/login');
    });

    it('should protect routes with hash fragments', async () => {
      const request = new NextRequest('http://localhost:3000/student#section');

      const response = await middleware(request);

      expect(response.status).toBe(307);
    });

    it('should protect deeply nested routes', async () => {
      const request = new NextRequest('http://localhost:3000/student/classes/123/lessons/456');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('http://localhost:3000/login');
    });
  });

  describe('Edge Cases', () => {
    it('should handle trailing slashes', async () => {
      const request = new NextRequest('http://localhost:3000/student/', {
        headers: {
          Cookie: 'session_token=valid-token',
        },
      });

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should handle case sensitivity in paths', async () => {
      // Paths should be case-sensitive
      const request = new NextRequest('http://localhost:3000/STUDENT');

      const response = await middleware(request);

      // Since matcher is case-sensitive and matches /student, /STUDENT won't match
      // This would pass through (not caught by middleware)
      expect(response.status).toBe(200);
    });

    it('should not interfere with API routes', async () => {
      const request = new NextRequest('http://localhost:3000/api/some-endpoint');

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should not interfere with static assets', async () => {
      const request = new NextRequest('http://localhost:3000/_next/static/file.js');

      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Redirect URL Construction', () => {
    it('should construct correct redirect URL for different hosts', async () => {
      const request = new NextRequest('https://example.com/student');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('https://example.com/login');
    });

    it('should preserve port in redirect URL', async () => {
      const request = new NextRequest('http://localhost:3001/student');

      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('Location')).toBe('http://localhost:3001/login');
    });
  });

  describe('Middleware Configuration', () => {
    it('should have correct matcher configuration', async () => {
      // This test verifies the exported config
      const { config } = await import('./middleware');

      expect(config.runtime).toBe('nodejs');
      expect(config.matcher).toContain('/student/:path*');
      expect(config.matcher).toContain('/teacher/:path*');
      expect(config.matcher).toContain('/admin/:path*');
      expect(config.matcher).toContain('/system/:path*');
      expect(config.matcher).toContain('/dashboard');
      expect(config.matcher).toContain('/login');
      expect(config.matcher).toContain('/signup');
    });
  });

  describe('Performance and Efficiency', () => {
    it('should execute middleware quickly', async () => {
      const request = new NextRequest('http://localhost:3000/student');

      const start = Date.now();
      await middleware(request);
      const duration = Date.now() - start;

      // Middleware should execute in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        new NextRequest(`http://localhost:3000/student?id=${i}`)
      );

      const responses = await Promise.all(
        requests.map(req => middleware(req))
      );

      responses.forEach(response => {
        expect(response.status).toBe(307);
      });
    });
  });
});

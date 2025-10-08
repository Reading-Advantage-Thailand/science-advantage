/**
 * Auth Client - Client-side authentication utilities
 * Provides a compatibility layer for Better Auth client functionality
 */

interface AuthResponse {
  data?: any;
  error?: { message: string } | null;
}

interface FetchOptions {
  onSuccess?: (ctx?: any) => void;
  onRequest?: (ctx?: any) => void;
  onResponse?: (ctx?: any) => void;
  onError?: (ctx: { error: { message: string } }) => void;
}

interface SignUpEmailOptions {
  email?: string;
  password: string;
  name?: string;
  username?: string;
  displayUsername?: string;
}

class AuthClient {
  signUp = {
    email: async (
      userData: SignUpEmailOptions,
      options: FetchOptions = {}
    ): Promise<AuthResponse> => {
      try {
        options.onRequest?.();

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (response.ok) {
          options.onSuccess?.(data);
          return { data, error: null };
        } else {
          const error = { message: data.error || 'Signup failed' };
          options.onError?.({ error });
          return { data: null, error };
        }
      } catch (err) {
        const error = { message: 'Network error during signup' };
        options.onError?.({ error });
        return { data: null, error };
      } finally {
        options.onResponse?.();
      }
    },
  };

  signIn = {
    email: async (
      credentials: { email: string; password: string },
      options: FetchOptions = {}
    ): Promise<AuthResponse> => {
      try {
        options.onRequest?.();

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (response.ok) {
          options.onSuccess?.(data);
          return { data, error: null };
        } else {
          const error = { message: data.error || 'Login failed' };
          options.onError?.({ error });
          return { data: null, error };
        }
      } catch (err) {
        const error = { message: 'Network error during login' };
        options.onError?.({ error });
        return { data: null, error };
      } finally {
        options.onResponse?.();
      }
    },
  };

  async signOut(options: { fetchOptions?: FetchOptions } = {}) {
    const { fetchOptions = {} } = options;

    try {
      fetchOptions.onRequest?.();

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        fetchOptions.onSuccess?.(data);
        return { data, error: null };
      } else {
        const error = { message: data.error || 'Logout failed' };
        fetchOptions.onError?.({ error });
        return { data: null, error };
      }
    } catch (err) {
      const error = { message: 'Network error during logout' };
      fetchOptions.onError?.({ error });
      return { data: null, error };
    } finally {
      fetchOptions.onResponse?.();
    }
  }

  async getSession(): Promise<{ data: any }> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      return { data: data.session };
    } catch (err) {
      return { data: null };
    }
  }
}

export const authClient = new AuthClient();

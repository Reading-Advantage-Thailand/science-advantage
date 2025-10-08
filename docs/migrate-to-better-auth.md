# Migrating from Auth.js to Better Auth

This guide covers the migration process from Auth.js (NextAuth.js) to Better Auth for the Science Advantage platform.

## Overview

Better Auth is a modern authentication library that provides a more streamlined API and better TypeScript support. This migration involves updating database schemas, route handlers, client-side code, and server-side session handling.

## Migration Steps

### 1. Setup Better Auth

First, follow the Better Auth installation guide:

```bash
npm install better-auth
```

Configure Better Auth in your project with the appropriate providers and database adapter.

### 2. Map Existing Database Columns

Better Auth uses slightly different column names than Auth.js. You'll need to map your existing schema:

#### User Schema

**Change Required:**

- Convert `emailVerified` from datetime to boolean

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified Boolean   @default(false)  // Changed from DateTime?
  name          String?
  image         String?
  // ... other fields
}
```

#### Session Schema

**Field Mappings:**

- `expires` → `expiresAt`
- `sessionToken` → `token`
- Add `createdAt` and `updatedAt` fields

```prisma
model Session {
  id         String   @id @default(cuid())
  token      String   @unique  // Was: sessionToken
  userId     String
  expiresAt  DateTime // Was: expires
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### Account Schema

**Field Mappings:**

- `provider` → `providerId`
- `providerAccountId` → `accountId`
- Update token-related fields
- Remove `session_state` (no longer needed)

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  providerId        String  // Was: provider
  accountId         String  // Was: providerAccountId
  accessToken       String?
  refreshToken      String?
  expiresAt         Int?
  tokenType         String?
  scope             String?
  idToken           String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
}
```

**Migration Note:** Create a database migration to rename/restructure these fields while preserving existing user data.

### 3. Update Route Handler

Replace the Auth.js route handler with Better Auth's Next.js handler.

**Before (Auth.js):**

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '~/server/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**After (Better Auth):**

```typescript
// app/api/auth/[...all]/route.ts
import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '~/server/auth';

export const { POST, GET } = toNextJsHandler(auth);
```

**Important:** The route path changes from `[...nextauth]` to `[...all]`.

### 4. Update Client-Side Authentication

Replace Auth.js client imports with Better Auth's React client.

**Before (Auth.js):**

```typescript
import { signIn, signOut, useSession } from 'next-auth/react';
```

**After (Better Auth):**

```typescript
// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL!,
});

export const { signIn, signOut, useSession } = authClient;
```

#### Social Login Example

**Google OAuth with Better Auth:**

```typescript
export const signInWithGoogle = async () => {
  const data = await signIn.social({
    provider: 'google',
    callbackURL: '/dashboard',
  });
  return data;
};
```

### 5. Adjust Server-Side Session Handling

Update server actions and API routes to use Better Auth's session API.

**Before (Auth.js):**

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '~/server/auth';

export async function protectedAction() {
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized');
  }
  // ... rest of action
}
```

**After (Better Auth):**

```typescript
'use server';

import { auth } from '~/server/auth';
import { headers } from 'next/headers';

export async function protectedAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error('Unauthorized');
  }
  // ... rest of action
}
```

### 6. Configure Middleware

Update middleware to use Better Auth's middleware utilities.

**Example middleware.ts:**

```typescript
import { auth } from '~/server/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## Environment Variables

Update your environment variables:

```env
# Better Auth Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-key

# OAuth Providers (Google)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL=postgresql://...
```

## Testing Checklist

After migration, verify the following:

- [ ] User sign-in with Google OAuth works
- [ ] Session persistence across page reloads
- [ ] Protected routes redirect to sign-in when unauthenticated
- [ ] Server actions can access session data
- [ ] Sign-out clears session properly
- [ ] Existing users can still sign in (data preserved)
- [ ] New user registration works
- [ ] Dev impersonation mode still functions (if applicable)

## Common Issues

### Session Not Persisting

- Verify `NEXT_PUBLIC_BASE_URL` matches your deployment URL
- Check cookie configuration in Better Auth setup

### OAuth Redirect Errors

- Update OAuth provider callback URLs to use the new `/api/auth/[...all]` path
- Ensure `NEXT_PUBLIC_BASE_URL` is set correctly

### TypeScript Errors

- Regenerate Prisma client after schema changes: `npx prisma generate`
- Ensure Better Auth types are properly imported

## Rollback Plan

If issues arise:

1. Revert database migrations
2. Restore Auth.js route handlers
3. Revert client-side auth imports
4. Restore previous middleware configuration

Keep a database backup before running migrations.

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Migration Guide](https://authjs.dev/getting-started/migrate-to-better-auth)

## Next Steps

After successful migration:

1. Remove Auth.js dependencies: `npm uninstall next-auth`
2. Update documentation to reflect new auth patterns
3. Train team on Better Auth API differences
4. Monitor production for any authentication issues

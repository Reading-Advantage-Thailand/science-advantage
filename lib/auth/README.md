# Reusable Authentication Module

A lightweight, secure authentication system for Next.js 15+ with App Router, designed to be copied and used across multiple projects.

## Features

- ✅ **Username/Password Authentication** - Simple, secure login
- ✅ **Server-Side Session Management** - HTTP-only cookies with secure defaults
- ✅ **Role-Based Access Control (RBAC)** - Hierarchical role enforcement
- ✅ **Server Components** - Works with Next.js 15 Server Components
- ✅ **Type-Safe** - Full TypeScript support
- ✅ **Database Agnostic** - Uses Prisma (works with any database)
- ✅ **No External Auth Libraries** - Only bcryptjs for password hashing
- ✅ **Production Ready** - Secure defaults, CSRF protection built-in

## Installation

### 1. Copy the Module

Copy the entire `lib/auth/` folder to your Next.js project:

```
lib/auth/
├── index.ts          # Main exports
├── password.ts       # Password hashing/verification
├── session.ts        # Session creation/validation
├── server.ts         # Server-side helpers
├── types.ts          # TypeScript types
└── README.md         # This file
```

### 2. Install Dependencies

```bash
npm install bcryptjs @prisma/client
npm install -D @types/bcryptjs
```

### 3. Setup Prisma Schema

Add these models to your `prisma/schema.prisma`:

```prisma
model user {
  id            String    @id
  name          String
  username      String    @unique
  email         String?   @unique
  role          UserRole  @default(STUDENT)
  image         String?
  createdAt     DateTime
  updatedAt     DateTime
  account       account[]
  session       session[]
}

model account {
  id            String    @id
  userId        String
  accountId     String
  providerId    String
  password      String?
  createdAt     DateTime
  updatedAt     DateTime
  user          user      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model session {
  id        String   @id
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime
  updatedAt DateTime
  ipAddress String?
  userAgent String?
  user      user     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum UserRole {
  STUDENT
  TEACHER
  ADMIN
  SYSTEM
}
```

Run migration:
```bash
npx prisma migrate dev --name add_auth
npx prisma generate
```

### 4. Create API Routes

Create `app/api/auth/login/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: { account: { where: { providerId: 'credential' } } },
    });

    if (!user || !user.account[0]?.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.account[0].password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const session = await createSession(user.id);
    await setSessionCookie(session.id);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

Create `app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getSessionToken, deleteSession, deleteSessionCookie } from '@/lib/auth/session';

export async function POST() {
  const token = await getSessionToken();
  if (token) await deleteSession(token);
  await deleteSessionCookie();
  return NextResponse.json({ success: true });
}
```

Create `app/api/auth/session/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getCurrentSession();
  return NextResponse.json({ session });
}
```

### 5. Setup Middleware

Create/update `middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session_token')?.value;
  const hasSession = !!sessionToken;

  const protectedRoutes = ['/student', '/teacher', '/admin', '/system'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasSession && ['/login', '/signup'].includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/student/:path*', '/teacher/:path*', '/admin/:path*', '/system/:path*', '/dashboard', '/login'],
};
```

## Usage

### Server-Side (Recommended)

#### Protect a Page (Require Authentication)

```typescript
import { requireAuth } from '@/lib/auth/server';

export default async function DashboardPage() {
  const session = await requireAuth(); // Redirects to /login if not authenticated

  return <div>Welcome {session.user.name}!</div>;
}
```

#### Protect a Page with Role Check

```typescript
import { requireRole } from '@/lib/auth/server';

export default async function AdminPage() {
  const session = await requireRole('ADMIN'); // Redirects if insufficient role

  return <div>Admin Panel</div>;
}
```

#### Get Session (No Redirect)

```typescript
import { getSession } from '@/lib/auth/server';

export default async function Page() {
  const session = await getSession(); // Returns null if not authenticated

  return <div>{session ? `Hello ${session.user.name}` : 'Guest'}</div>;
}
```

#### Check Role Permissions

```typescript
import { requireAuth, hasRole } from '@/lib/auth/server';

export default async function Page() {
  const session = await requireAuth();
  const canEdit = hasRole(session, 'TEACHER');

  return <div>{canEdit && <button>Edit</button>}</div>;
}
```

### Client-Side

#### Login Form

```typescript
'use client';

async function handleLogin(username: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    window.location.href = '/dashboard';
  }
}
```

#### Logout

```typescript
'use client';

async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}
```

## Role Hierarchy

The system implements hierarchical roles where higher roles can access lower-level routes:

- **SYSTEM** (Level 4) - Can access everything
- **ADMIN** (Level 3) - Can access: Admin, Teacher, Student routes
- **TEACHER** (Level 2) - Can access: Teacher, Student routes
- **STUDENT** (Level 1) - Can access: Student routes only

### Example

```typescript
// A TEACHER can access both routes:
await requireRole('STUDENT'); // ✅ Passes (TEACHER >= STUDENT)
await requireRole('TEACHER'); // ✅ Passes (TEACHER == TEACHER)
await requireRole('ADMIN');   // ❌ Redirects (TEACHER < ADMIN)
```

## Creating Users

### Manual User Creation

```typescript
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth/password';

const prisma = new PrismaClient();

async function createUser() {
  const hashedPassword = await hashPassword('SecurePassword123!');

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      role: 'STUDENT',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      userId: user.id,
      accountId: user.username,
      providerId: 'credential',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
}
```

### Seed Script Example

See `prisma/seed-demo-users.ts` in the parent project for a complete example.

## Security Features

### ✅ Secure by Default

- **HTTP-Only Cookies** - Session tokens cannot be accessed by JavaScript
- **Secure Flag** - Cookies only sent over HTTPS in production
- **SameSite=Lax** - CSRF protection built-in
- **Bcrypt Hashing** - Industry-standard password hashing (10 rounds)
- **Session Expiration** - 7-day sessions with automatic cleanup
- **Server-Side Validation** - All auth checks happen server-side

### ✅ What You Get

1. **No JWT vulnerabilities** - Opaque session tokens
2. **No XSS attacks on auth** - HTTP-only cookies
3. **CSRF protection** - SameSite cookies
4. **Timing-safe password comparison** - Via bcrypt
5. **Role enforcement server-side** - Cannot be bypassed

## Customization

### Change Session Duration

Edit `lib/auth/session.ts`:

```typescript
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // Change this
```

### Add Custom Roles

Edit `lib/auth/types.ts`:

```typescript
export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SYSTEM' | 'CUSTOM_ROLE';
```

Update `lib/auth/server.ts`:

```typescript
const ROLE_HIERARCHY: Record<UserRole, number> = {
  STUDENT: 1,
  TEACHER: 2,
  ADMIN: 3,
  SYSTEM: 4,
  CUSTOM_ROLE: 5, // Add here
};
```

### Change Password Requirements

Edit `lib/auth/password.ts`:

```typescript
const SALT_ROUNDS = 12; // Increase for more security (slower)
```

## Migration from Better Auth

If migrating from Better Auth:

1. Keep your existing Prisma schema compatible
2. Update table names if needed
3. Rehash passwords on next login (Better Auth uses different format)
4. Update all `auth.api.getSession()` calls to `getSession()`
5. Update all `requireAuth` / `requireRole` calls

## Testing

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"password123"}'
```

### Test Session

```bash
curl http://localhost:3000/api/auth/session \
  -H "Cookie: session_token=YOUR_TOKEN"
```

## Troubleshooting

### "Session not found" errors

- Check that `DATABASE_URL` is set in `.env`
- Verify Prisma migrations have run
- Check session hasn't expired (7 days default)

### Redirect loops

- Clear cookies
- Check middleware matcher patterns
- Verify session token cookie name matches (`session_token`)

### Type errors

- Run `npx prisma generate`
- Check `UserRole` enum matches Prisma schema

## Environment Variables

Required in `.env`:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

Optional (auto-detected):

```bash
NODE_ENV="production"  # Enables secure cookies
```

## License

This auth module is provided as-is for use in your projects. Modify as needed!

## Support

This is a standalone module with no external dependencies beyond bcryptjs and Prisma. For issues:

1. Check this README
2. Verify Prisma schema matches
3. Check browser console for client errors
4. Check server logs for API errors

---

**Built for Next.js 15+ with App Router** • **TypeScript** • **Prisma** • **Server Components**

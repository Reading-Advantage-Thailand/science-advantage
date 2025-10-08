import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, setSessionCookie } from '@/lib/auth/session';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        account: {
          where: { providerId: 'credential' },
        },
      },
    });

    if (!user || user.account.length === 0) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const account = user.account[0];

    if (!account.password) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, account.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create session
    const session = await createSession(user.id);

    // Set session cookie
    await setSessionCookie(session.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

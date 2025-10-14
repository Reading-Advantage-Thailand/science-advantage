import { NextResponse } from 'next/server';
import * as authSession from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await authSession.getCurrentSession();

    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    return NextResponse.json({
      session: {
        user: session.user,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

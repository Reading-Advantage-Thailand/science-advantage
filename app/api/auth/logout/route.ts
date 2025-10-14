import { NextResponse } from 'next/server';
import * as authSession from '@/lib/auth/session';

export async function POST() {
  const token = await authSession.getSessionToken();

  try {
    if (token) {
      await authSession.deleteSession(token);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await authSession.deleteSessionCookie().catch(() => {});
  }
}

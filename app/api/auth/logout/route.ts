import { NextResponse } from 'next/server';
import {
  getSessionToken,
  deleteSession,
  deleteSessionCookie,
} from '@/lib/auth/session';

export async function POST() {
  try {
    const token = await getSessionToken();

    if (token) {
      await deleteSession(token);
    }

    await deleteSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}

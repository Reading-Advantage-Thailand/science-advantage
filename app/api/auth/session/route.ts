import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ session: null }, { status: 200 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching session' },
      { status: 500 }
    );
  }
}

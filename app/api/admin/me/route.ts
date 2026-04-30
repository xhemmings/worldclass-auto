import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  const username = verifyToken(token || '');
  if (!username) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, username });
}

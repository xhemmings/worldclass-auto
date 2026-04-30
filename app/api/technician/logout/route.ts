import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { TECH_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  cookies().delete(TECH_COOKIE_NAME);
  return NextResponse.json({ ok: true });
}

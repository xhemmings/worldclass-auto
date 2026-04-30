import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { verifyToken, TECH_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const token = cookies().get(TECH_COOKIE_NAME)?.value;
  const username = verifyToken(token || '');
  if (!username) return NextResponse.json({ authenticated: false }, { status: 401 });
  const sql = getDb();
  const rows = await sql`SELECT id, username, name, specialization, max_hours_per_day FROM technicians WHERE username = ${username} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, ...rows[0] });
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { verifyPassword, createToken, TECH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password)
    return NextResponse.json({ error: 'Username and password required.' }, { status: 400 });
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM technicians WHERE username = ${username} AND active = TRUE LIMIT 1`;
    const tech = rows[0];
    if (!tech || !verifyPassword(password, tech.password_hash))
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    const token = createToken(username);
    cookies().set(TECH_COOKIE_NAME, token, {
      httpOnly: true, sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60 * 60, path: '/',
    });
    return NextResponse.json({ ok: true, username, name: tech.name });
  } catch (err) {
    console.error('[tech/login]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

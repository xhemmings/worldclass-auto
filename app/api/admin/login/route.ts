import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { verifyPassword, createToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required.' }, { status: 400 });
  }
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM admin_users WHERE username = ${username} LIMIT 1`;
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }
    const token = createToken(username);
    cookies().set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60,
      path: '/',
    });
    return NextResponse.json({ ok: true, username });
  } catch (err) {
    console.error('[admin/login]', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

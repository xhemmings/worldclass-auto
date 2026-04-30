import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { verifyToken, hashPassword, COOKIE_NAME } from '@/lib/auth';

function authAdmin() {
  return verifyToken(cookies().get(COOKIE_NAME)?.value || '');
}

export async function GET() {
  if (!authAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sql = getDb();
  const techs = await sql`
    SELECT t.*,
      COUNT(wo.id) FILTER (WHERE wo.status IN ('approved','in_progress')) AS active_wo_count,
      COALESCE(SUM(wo.estimated_hours) FILTER (WHERE wo.status IN ('approved','in_progress')), 0) AS assigned_hours
    FROM technicians t
    LEFT JOIN work_orders wo ON wo.assigned_to = t.username
    GROUP BY t.id
    ORDER BY t.name
  `;
  return NextResponse.json(techs);
}

export async function POST(req: Request) {
  if (!authAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { username, password, name, phone, specialization, max_hours_per_day } = await req.json();
  if (!username || !password || !name)
    return NextResponse.json({ error: 'username, password, and name are required.' }, { status: 400 });
  try {
    const sql = getDb();
    const rows = await sql`
      INSERT INTO technicians (username, password_hash, name, phone, specialization, max_hours_per_day)
      VALUES (${username}, ${hashPassword(password)}, ${name}, ${phone || null}, ${specialization || null}, ${max_hours_per_day ?? 6})
      RETURNING id, username, name, phone, specialization, max_hours_per_day, active, created_at
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err: any) {
    if (err.message?.includes('unique')) return NextResponse.json({ error: 'Username already taken.' }, { status: 409 });
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

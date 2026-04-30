import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { verifyToken, TECH_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const token = cookies().get(TECH_COOKIE_NAME)?.value;
  const username = verifyToken(token || '');
  if (!username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sql = getDb();
  const rows = await sql`
    SELECT * FROM work_orders
    WHERE assigned_to = ${username}
    ORDER BY
      CASE status
        WHEN 'in_progress' THEN 1
        WHEN 'approved'    THEN 2
        WHEN 'pending'     THEN 3
        WHEN 'completed'   THEN 4
        ELSE 5
      END,
      COALESCE(due_date, '9999-12-31') ASC,
      created_at ASC
  `;
  return NextResponse.json(rows);
}

export async function PATCH(req: Request) {
  const token = cookies().get(TECH_COOKIE_NAME)?.value;
  const username = verifyToken(token || '');
  if (!username) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, status, actual_hours, notes } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const sql = getDb();
  const extra = status === 'in_progress'
    ? sql`started_at = NOW(),`
    : status === 'completed'
      ? sql`completed_at = NOW(), actual_hours = COALESCE(${actual_hours ?? null}, actual_hours),`
      : sql``;
  const rows = await sql`
    UPDATE work_orders
    SET ${extra}
        status     = ${status},
        notes      = COALESCE(${notes ?? null}, notes),
        updated_at = NOW()
    WHERE id = ${id} AND assigned_to = ${username}
    RETURNING *
  `;
  if (!rows[0]) return NextResponse.json({ error: 'Not found or not yours' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

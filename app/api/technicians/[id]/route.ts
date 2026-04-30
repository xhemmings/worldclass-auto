import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { verifyToken, hashPassword, COOKIE_NAME } from '@/lib/auth';

function authAdmin() {
  return verifyToken(cookies().get(COOKIE_NAME)?.value || '');
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!authAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id);
  const d = await req.json();
  const sql = getDb();
  const rows = await sql`
    UPDATE technicians SET
      name              = COALESCE(${d.name          ?? null}, name),
      phone             = COALESCE(${d.phone         ?? null}, phone),
      specialization    = COALESCE(${d.specialization ?? null}, specialization),
      max_hours_per_day = COALESCE(${d.max_hours_per_day ?? null}, max_hours_per_day),
      active            = COALESCE(${d.active        ?? null}, active),
      password_hash     = CASE WHEN ${d.password ?? null} IS NOT NULL
                           THEN ${d.password ? hashPassword(d.password) : null}
                           ELSE password_hash END
    WHERE id = ${id}
    RETURNING id, username, name, phone, specialization, max_hours_per_day, active
  `;
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!authAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sql = getDb();
  await sql`UPDATE technicians SET active = FALSE WHERE id = ${parseInt(params.id)}`;
  return NextResponse.json({ ok: true });
}

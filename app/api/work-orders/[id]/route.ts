import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

function auth() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifyToken(token || '');
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const d = await req.json();
  try {
    const sql = getDb();
    const rows = await sql`
      UPDATE work_orders
      SET
        status        = COALESCE(${d.status ?? null}, status),
        notes         = COALESCE(${d.notes ?? null}, notes),
        client_name   = COALESCE(${d.client_name ?? null}, client_name),
        phone         = COALESCE(${d.phone ?? null}, phone),
        vehicle_make  = COALESCE(${d.vehicle_make ?? null}, vehicle_make),
        vehicle_model = COALESCE(${d.vehicle_model ?? null}, vehicle_model),
        service_type  = COALESCE(${d.service_type ?? null}, service_type),
        description   = COALESCE(${d.description ?? null}, description),
        updated_at    = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('[work-orders PATCH]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    const sql = getDb();
    await sql`DELETE FROM work_orders WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[work-orders DELETE]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

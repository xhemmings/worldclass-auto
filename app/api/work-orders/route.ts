import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

function auth() {
  const token = cookies().get(COOKIE_NAME)?.value;
  return verifyToken(token || '');
}

export async function GET() {
  if (!auth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM work_orders ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[work-orders GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = auth();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const d = await req.json();
  if (!d.client_name || !d.service_type) {
    return NextResponse.json({ error: 'client_name and service_type are required.' }, { status: 400 });
  }
  try {
    const sql = getDb();
    const rows = await sql`
      INSERT INTO work_orders
        (booking_id, client_name, phone, vehicle_make, vehicle_model, service_type, description, status, created_by)
      VALUES
        (${d.booking_id || null}, ${d.client_name}, ${d.phone || null},
         ${d.vehicle_make || null}, ${d.vehicle_model || null},
         ${d.service_type}, ${d.description || null},
         ${'pending'}, ${user})
      RETURNING *
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error('[work-orders POST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

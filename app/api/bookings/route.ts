import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/db';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!verifyToken(token || '')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[bookings GET]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const data = await req.json();

  const required = [
    'name',
    'phone',
    'email',
    'vehicleMake',
    'vehicleModel',
    'serviceType',
    'preferredDate',
  ];
  for (const field of required) {
    if (!data[field]) {
      return NextResponse.json({ message: `Missing required field ${field}` }, { status: 400 });
    }
  }

  try {
    const sql = getDb();
    await sql`INSERT INTO bookings (name, phone, email, vehicle_make, vehicle_model, service_type, preferred_date, description) VALUES (${data.name}, ${data.phone}, ${data.email}, ${data.vehicleMake}, ${data.vehicleModel}, ${data.serviceType}, ${data.preferredDate}, ${data.description})`;
    return NextResponse.json({ message: 'Booking created' }, { status: 201 });
  } catch (error) {
    console.error('[bookings]', error);
    return NextResponse.json({ message: 'Unable to save booking. Please call us on (876) 462-9709.' }, { status: 500 });
  }
}
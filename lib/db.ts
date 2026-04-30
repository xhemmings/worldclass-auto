import { neon } from '@neondatabase/serverless';

export function getDb() {
  const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
  if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
    throw new Error('Missing Neon database environment variables');
  }
  return neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`);
}
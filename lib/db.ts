import { neon } from '@neondatabase/serverless';

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD) {
  throw new Error('Missing Neon database environment variables');
}

export const sql = neon(
  `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`,
);
import crypto from 'crypto';

const SECRET = process.env.ADMIN_JWT_SECRET || 'wca-admin-secret-2026';

export function hashPassword(pwd: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pwd, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(pwd: string, stored: string): boolean {
  const [salt, hash] = (stored || '').split(':');
  if (!salt || !hash) return false;
  return crypto.pbkdf2Sync(pwd, salt, 10000, 64, 'sha512').toString('hex') === hash;
}

export function createToken(username: string): string {
  const payload = Buffer.from(JSON.stringify({ u: username, t: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token: string): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  if (sig !== expected) return null;
  try {
    const { u, t } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (Date.now() - t > 8 * 60 * 60 * 1000) return null;
    return u as string;
  } catch { return null; }
}

export const COOKIE_NAME      = 'wca_admin_session';
export const TECH_COOKIE_NAME = 'wca_tech_session';

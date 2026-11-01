import { verifyJwt } from './jwt';
import { Env, UserSession } from './types';

export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const [key, ...vals] = part.trim().split('=');
    if (key) {
      cookies[key] = decodeURIComponent(vals.join('='));
    }
  }
  return cookies;
}

export async function getSession(request: Request, env: Env): Promise<UserSession | null> {
  const secret = env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured');
    return null;
  }

  // 1. Authorization: Bearer <token>
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const session = await verifyJwt<UserSession>(token, secret);
    if (session) return session;
  }

  // 2. Cookie: wiki_session=<token>
  const cookies = parseCookies(request.headers.get('Cookie'));
  if (cookies['wiki_session']) {
    const session = await verifyJwt<UserSession>(cookies['wiki_session'], secret);
    if (session) return session;
  }

  return null;
}

export function buildSessionCookie(token: string, domain?: string): string {
  let cookie = `wiki_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`; // 30日
  if (domain) {
    cookie += `; Domain=${domain}`;
  }
  return cookie;
}

export function buildLogoutCookie(domain?: string): string {
  let cookie = 'wiki_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
  if (domain) {
    cookie += `; Domain=${domain}`;
  }
  return cookie;
}

import type { Env } from './types';

/** ログイン・編集の API を呼んでよいサイト。環境変数 ALLOWED_ORIGINS (カンマ区切り) で足せる (開発中の http://localhost:4200 など) */
const DEFAULT_ORIGINS = ['https://wiki.torosaba.net'];

export function allowedOrigins(env: Env, requestUrl: URL): string[] {
  const extra = (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  // この API 自身のサイトは、いつでも許す
  return [...DEFAULT_ORIGINS, ...extra, requestUrl.origin];
}

export function isAllowedOrigin(origin: string | null, env: Env, requestUrl: URL): boolean {
  return !!origin && allowedOrigins(env, requestUrl).includes(origin);
}

/**
 * ログイン・ログアウトのあとに戻る場所。
 * 許したサイトのアドレスだけを通す。「//evil.example」や「/\evil.example」は相対パスに見えて別のサイトを指すので、
 * 「/ で始まるか」だけの確認では、ログイン後に別のサイトへ飛ばされてしまう。
 */
export function resolveReturnTo(raw: string | null | undefined, env: Env, requestUrl: URL, fallback = '/wiki'): string {
  const fallbackUrl = new URL(fallback, requestUrl.origin).toString();
  if (!raw) return fallbackUrl;
  if (raw.startsWith('//') || raw.startsWith('/\\')) return fallbackUrl;
  let url: URL;
  try {
    url = new URL(raw, requestUrl.origin);
  } catch {
    return fallbackUrl;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return fallbackUrl;
  return isAllowedOrigin(url.origin, env, requestUrl) ? url.toString() : fallbackUrl;
}

/**
 * Cookie でログインしている人の「書き込み」の呼び出しは、許したサイトからのものだけにする (CSRF 対策)。
 * Origin ヘッダーが無い呼び出し (curl や AI コネクタなど、Bearer トークンで呼ぶもの) は、ブラウザーを経由していないので通す。
 */
export function checkOrigin(request: Request, env: Env): boolean {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  return isAllowedOrigin(origin, env, new URL(request.url));
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/** CORS のヘッダー。Cookie を付けた呼び出し (credentials: include) では、Origin を * にできず、許したサイトを名指しする必要がある */
export function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (origin && isAllowedOrigin(origin, env, new URL(request.url))) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (!origin) {
    // ブラウザーではない呼び出し (curl など) には、Cookie を使わない前提で * を返す
    headers['Access-Control-Allow-Origin'] = '*';
  }
  return headers;
}

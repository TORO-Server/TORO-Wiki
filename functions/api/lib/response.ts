// CORS のヘッダーは functions/api/_middleware.ts がまとめて付ける (Cookie 付きの呼び出しでは * が使えないため)
export function jsonResponse(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  const mergedHeaders = new Headers(headers);
  if (!mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json; charset=utf-8');
  }
  // トークンや本文を含む応答を、途中で覚えさせない
  if (!mergedHeaders.has('Cache-Control')) {
    mergedHeaders.set('Cache-Control', 'no-store');
  }
  return new Response(JSON.stringify(data), {
    status,
    headers: mergedHeaders,
  });
}

export function errorResponse(message: string, status = 400, details?: unknown): Response {
  return jsonResponse({ error: message, details }, status);
}

/** OPTIONS は _middleware.ts が先に答えるので、ここに来ることはない。単体で動かしたときのための保険 */
export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204 });
  return null;
}

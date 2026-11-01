export function jsonResponse(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  const mergedHeaders = new Headers(headers);
  if (!mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json; charset=utf-8');
  }
  // CORS ヘッダー
  if (!mergedHeaders.has('Access-Control-Allow-Origin')) {
    mergedHeaders.set('Access-Control-Allow-Origin', '*');
  }
  if (!mergedHeaders.has('Access-Control-Allow-Methods')) {
    mergedHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  }
  if (!mergedHeaders.has('Access-Control-Allow-Headers')) {
    mergedHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  return new Response(JSON.stringify(data), {
    status,
    headers: mergedHeaders,
  });
}

export function errorResponse(message: string, status = 400, details?: unknown): Response {
  return jsonResponse({ error: message, details }, status);
}

export function handleCors(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  return null;
}

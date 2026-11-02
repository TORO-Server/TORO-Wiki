import { Env } from './lib/types';
import { corsHeaders } from './lib/security';

/** すべての /api の応答に CORS のヘッダーを付ける。許したサイトだけが、Cookie 付きで読める */
export const onRequest: PagesFunction<Env> = async (context) => {
  const cors = corsHeaders(context.request, context.env);

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(cors)) headers.set(k, v);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
};

import { Env } from '../lib/types';
import { buildLogoutCookie } from '../lib/auth';
import { jsonResponse, handleCors } from '../lib/response';

export const onRequest: PagesFunction<Env> = async (context) => {
  const cors = handleCors(context.request);
  if (cors) return cors;

  const url = new URL(context.request.url);
  const returnTo = url.searchParams.get('returnTo') || '/wiki';
  const cookie = buildLogoutCookie(context.env.COOKIE_DOMAIN);

  // ブラウザからの通常遷移ならリダイレクト、fetch/xhr なら JSON
  const accept = context.request.headers.get('Accept') || '';
  if (accept.includes('application/json')) {
    return jsonResponse(
      { success: true },
      200,
      { 'Set-Cookie': cookie }
    );
  }

  const destination = new URL(returnTo, url.origin).toString();
  return new Response(null, {
    status: 302,
    headers: {
      Location: destination,
      'Set-Cookie': cookie,
    },
  });
};

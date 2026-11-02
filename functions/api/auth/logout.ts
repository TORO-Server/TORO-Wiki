import { Env } from '../lib/types';
import { buildLogoutCookie } from '../lib/auth';
import { jsonResponse, handleCors } from '../lib/response';
import { resolveReturnTo } from '../lib/security';

export const onRequest: PagesFunction<Env> = async (context) => {
  const cors = handleCors(context.request);
  if (cors) return cors;

  const url = new URL(context.request.url);
  const returnTo = resolveReturnTo(url.searchParams.get('redirect') ?? url.searchParams.get('returnTo'), context.env, url);
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

  return new Response(null, {
    status: 302,
    headers: {
      Location: returnTo,
      'Set-Cookie': cookie,
    },
  });
};

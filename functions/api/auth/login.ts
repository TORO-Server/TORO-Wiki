import { Env } from '../lib/types';
import { errorResponse, handleCors } from '../lib/response';
import { resolveReturnTo } from '../lib/security';

export const onRequest: PagesFunction<Env> = async (context) => {
  const cors = handleCors(context.request);
  if (cors) return cors;

  const env = context.env;
  if (!env.DISCORD_CLIENT_ID) {
    return errorResponse('DISCORD_CLIENT_ID is not configured', 500);
  }

  const url = new URL(context.request.url);
  // 画面 (src/app/core/auth.ts) は ?redirect= で、これまでの呼び出しは ?returnTo= で渡す。許したサイトのアドレスだけを通す
  const returnTo = resolveReturnTo(url.searchParams.get('redirect') ?? url.searchParams.get('returnTo'), env, url);

  // コールバック URL の算出
  const redirectUri = env.DISCORD_REDIRECT_URI || `${url.origin}/api/auth/callback`;

  // state に returnTo とランダム文字列を含める。同じ nonce を Cookie にも置き、callback で突き合わせる
  // (突き合わせないと、他人のログインの途中の URL を踏ませて、他人のアカウントでログインさせられてしまう)
  const nonce = crypto.randomUUID();
  const state = btoa(JSON.stringify({ returnTo, nonce }));

  const authUrl = new URL('https://discord.com/api/oauth2/authorize');
  authUrl.searchParams.set('client_id', env.DISCORD_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'identify guilds.members.read');
  authUrl.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      'Set-Cookie': `wiki_oauth_state=${nonce}; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
};

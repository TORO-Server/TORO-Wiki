import { Env } from '../lib/types';
import { errorResponse, handleCors } from '../lib/response';

export const onRequest: PagesFunction<Env> = async (context) => {
  const cors = handleCors(context.request);
  if (cors) return cors;

  const env = context.env;
  if (!env.DISCORD_CLIENT_ID) {
    return errorResponse('DISCORD_CLIENT_ID is not configured', 500);
  }

  const url = new URL(context.request.url);
  const returnTo = url.searchParams.get('returnTo') || '/wiki';

  // コールバック URL の算出
  const redirectUri = env.DISCORD_REDIRECT_URI || `${url.origin}/api/auth/callback`;

  // state に returnTo とランダム文字列を含める
  const stateData = {
    returnTo,
    nonce: crypto.randomUUID(),
  };
  const state = btoa(JSON.stringify(stateData));

  const authUrl = new URL('https://discord.com/api/oauth2/authorize');
  authUrl.searchParams.set('client_id', env.DISCORD_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'identify guilds.members.read');
  authUrl.searchParams.set('state', state);

  return Response.redirect(authUrl.toString(), 302);
};

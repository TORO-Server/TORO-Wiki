import { Env } from '../lib/types';
import { getSession } from '../lib/auth';
import { jsonResponse, handleCors } from '../lib/response';

export const onRequest: PagesFunction<Env> = async (context) => {
  const cors = handleCors(context.request);
  if (cors) return cors;

  const session = await getSession(context.request, context.env);
  if (!session) {
    return jsonResponse({
      authenticated: false,
      user: null,
    });
  }

  return jsonResponse({
    authenticated: true,
    user: {
      id: session.id,
      username: session.username,
      global_name: session.global_name,
      avatar: session.avatar,
      avatar_url: session.avatar_url,
      can_edit: session.can_edit,
      roles: session.roles,
    },
  });
};

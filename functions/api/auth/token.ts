import { Env, UserSession } from '../lib/types';
import { getSession } from '../lib/auth';
import { signJwt } from '../lib/jwt';
import { jsonResponse, errorResponse, handleCors } from '../lib/response';

export const onRequest: PagesFunction<Env> = async (context) => {
  const cors = handleCors(context.request);
  if (cors) return cors;

  const session = await getSession(context.request, context.env);
  if (!session) {
    return errorResponse('Authentication required. Please log in via Discord.', 401);
  }

  // 90 日間有効な AI コネクタ用 Bearer トークンを発行
  const now = Math.floor(Date.now() / 1000);
  const aiTokenPayload: UserSession & { type: string } = {
    ...session,
    type: 'ai_connector',
    iat: now,
    exp: now + 90 * 24 * 60 * 60, // 90日間
  };

  const token = await signJwt(aiTokenPayload as unknown as Record<string, unknown>, context.env.JWT_SECRET);

  const url = new URL(context.request.url);
  const baseUrl = url.origin;

  return jsonResponse({
    token,
    expires_at: new Date(aiTokenPayload.exp * 1000).toISOString(),
    user: {
      id: session.id,
      username: session.username,
      global_name: session.global_name,
      can_edit: session.can_edit,
    },
    connectors: {
      claude_mcp: {
        type: 'mcp_streamable_http',
        url: `${baseUrl}/api/mcp`,
        config_example: {
          mcpServers: {
            'toro-wiki': {
              url: `${baseUrl}/api/mcp`,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          },
        },
      },
      chatgpt: {
        type: 'custom_gpt_action',
        schema_url: `${baseUrl}/api/openapi.json`,
        auth_type: 'bearer',
        token,
      },
      gemini: {
        type: 'function_calling_rest',
        schema_url: `${baseUrl}/api/openapi.json`,
        token,
      },
    },
  });
};

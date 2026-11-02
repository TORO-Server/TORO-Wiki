import { Env } from '../lib/types';
import { getSession } from '../lib/auth';
import { commitGitHubFile } from '../lib/github';
import { jsonResponse, errorResponse, handleCors } from '../lib/response';
import { checkOrigin } from '../lib/security';

/** 1 ページの本文の上限 (バイト)。Wiki のページとして常識外れに大きいものは受け付けない */
const MAX_CONTENT_BYTES = 512 * 1024;

export const onRequest: PagesFunction<Env> = async (context) => {
  const cors = handleCors(context.request);
  if (cors) return cors;

  if (context.request.method !== 'POST' && context.request.method !== 'PUT') {
    return errorResponse('Method Not Allowed', 405);
  }

  // 別のサイトのページから、ログイン中の人の名前で書き込ませない
  if (!checkOrigin(context.request, context.env)) {
    return errorResponse('Origin not allowed', 403);
  }

  // 1. 認可検証
  const session = await getSession(context.request, context.env);
  if (!session) {
    return errorResponse('Authentication required. Please log in via Discord.', 401);
  }

  if (!session.can_edit) {
    return errorResponse('You do not have permission to edit the Wiki.', 403);
  }

  // 2. Body の解析
  let body: { path?: string; content?: string; sha?: string; message?: string };
  try {
    body = await context.request.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const { path, content, sha, message } = body;
  if (!path || typeof content !== 'string') {
    return errorResponse('Missing path or content', 400);
  }

  // パスのバリデーション (ディレクトリトラバーサル防止)
  if (typeof path !== 'string' || path.includes('..') || path.startsWith('/') || path.includes('\\') || path.includes('\0')) {
    return errorResponse('Invalid path format', 400);
  }
  if (new TextEncoder().encode(content).length > MAX_CONTENT_BYTES) {
    return errorResponse('Content is too large', 413);
  }

  try {
    const result = await commitGitHubFile(context.env, {
      path,
      content,
      sha,
      message,
      user: session,
    });

    return jsonResponse({
      success: true,
      path,
      commitSha: result.commitSha,
      contentSha: result.contentSha,
      author: session.global_name || session.username,
      message: 'Successfully committed to repository. Deployment will trigger automatically.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Commit failed:', msg);
    return errorResponse(`Failed to commit changes: ${msg}`, 500);
  }
};

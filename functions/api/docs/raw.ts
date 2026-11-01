import { Env } from '../lib/types';
import { getGitHubFile } from '../lib/github';
import { jsonResponse, errorResponse, handleCors } from '../lib/response';

export const onRequest: PagesFunction<Env> = async (context) => {
  const cors = handleCors(context.request);
  if (cors) return cors;

  const url = new URL(context.request.url);
  const path = url.searchParams.get('path');
  const slug = url.searchParams.get('slug');

  let targetPath = path;

  // slug のみが指定された場合、静的コンテンツの index から探索を試みる
  if (!targetPath && slug) {
    try {
      const indexRes = await fetch(new URL('/content/index.json', url.origin));
      if (indexRes.ok) {
        const indexData = (await indexRes.json()) as { pages: Array<{ slug: string; id: string }> };
        const match = indexData.pages.find((p) => p.slug === slug);
        if (match) {
          const pageRes = await fetch(new URL(`/content/pages/${match.id}.json`, url.origin));
          if (pageRes.ok) {
            const pageData = (await pageRes.json()) as { source?: string };
            if (pageData.source) {
              targetPath = pageData.source;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to resolve slug from index:', e);
    }
  }

  if (!targetPath) {
    return errorResponse('Missing path or slug parameter', 400);
  }

  try {
    const file = await getGitHubFile(context.env, targetPath);
    if (!file) {
      return errorResponse('File not found', 404);
    }
    return jsonResponse(file);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return errorResponse(`Failed to fetch file: ${msg}`, 500);
  }
};

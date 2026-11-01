import { Env, UserSession } from './lib/types';
import { getSession } from './lib/auth';
import { getGitHubFile, commitGitHubFile } from './lib/github';
import { jsonResponse, handleCors } from './lib/response';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id?: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

const SERVER_INFO = {
  name: 'toro-wiki-mcp-server',
  version: '1.0.0',
};

const PROTOCOL_VERSION = '2024-11-05';

const TOOLS = [
  {
    name: 'search_wiki',
    description: 'Search for articles, topics, or keywords in the TORO Server Wiki (wiki.torosaba.net).',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keyword or query string',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'list_pages',
    description: 'List all available Wiki pages, categories, and recent updates.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional category filter (e.g. guide, transport, plugins, world, data, community, system)',
        },
      },
    },
  },
  {
    name: 'get_page',
    description: 'Retrieve the raw Markdown content and git SHA of a Wiki page by its slug or path.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'The page slug (e.g. "ルール" or "ChestShop")',
        },
        path: {
          type: 'string',
          description: 'Optional direct path under docs/ (e.g. "docs/01_Guide/ルール.md")',
        },
      },
    },
  },
  {
    name: 'save_page',
    description: 'Update or create a Wiki page on GitHub. Commits on behalf of the authenticated Discord user.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Relative path under docs/ (e.g. docs/01_Guide/ルール.md)',
        },
        content: {
          type: 'string',
          description: 'Full Markdown content for the page',
        },
        sha: {
          type: 'string',
          description: 'Existing git SHA of the file (required for updating existing pages)',
        },
        message: {
          type: 'string',
          description: 'Commit message explaining the edit',
        },
      },
      required: ['path', 'content'],
    },
  },
];

export const onRequest: PagesFunction<Env> = async (context) => {
  const cors = handleCors(context.request);
  if (cors) return cors;

  const url = new URL(context.request.url);

  // GET リクエストの場合はサーバーメタデータまたは SSE 接続を案内
  if (context.request.method === 'GET') {
    return jsonResponse({
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
      status: 'active',
      transport: 'streamable_http_jsonrpc',
      description: 'Model Context Protocol (MCP) server for TORO Server Wiki with Discord Authentication.',
      tools: TOOLS.map((t) => t.name),
    });
  }

  if (context.request.method !== 'POST') {
    return jsonResponse({ error: 'Method Not Allowed' }, 405);
  }

  // 1. 認証検証
  const session = await getSession(context.request, context.env);
  if (!session) {
    return jsonResponse(
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32000,
          message: 'Authentication required. Pass your Discord token via "Authorization: Bearer <token>" header.',
        },
      },
      401
    );
  }

  // 2. JSON-RPC リクエストの解析
  let rpc: JsonRpcRequest;
  try {
    rpc = (await context.request.json()) as JsonRpcRequest;
  } catch {
    return jsonResponse({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error: Invalid JSON' },
    });
  }

  const id = rpc.id ?? null;

  try {
    switch (rpc.method) {
      case 'initialize': {
        const res: JsonRpcResponse = {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: {
              tools: { listChanged: false },
            },
            serverInfo: SERVER_INFO,
          },
        };
        return jsonResponse(res);
      }

      case 'notifications/initialized': {
        return new Response(null, { status: 204 });
      }

      case 'ping': {
        return jsonResponse({ jsonrpc: '2.0', id, result: {} });
      }

      case 'tools/list': {
        return jsonResponse({
          jsonrpc: '2.0',
          id,
          result: {
            tools: TOOLS,
          },
        });
      }

      case 'tools/call': {
        const params = rpc.params as { name?: string; arguments?: Record<string, unknown> } | undefined;
        const toolName = params?.name;
        const args = params?.arguments || {};

        if (!toolName) {
          return jsonResponse({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Missing tool name' },
          });
        }

        const toolResult = await handleToolCall(context.env, url.origin, session, toolName, args);
        return jsonResponse({
          jsonrpc: '2.0',
          id,
          result: toolResult,
        });
      }

      default: {
        return jsonResponse({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${rpc.method}` },
        });
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return jsonResponse({
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: `Internal server error: ${msg}` },
    });
  }
};

async function handleToolCall(
  env: Env,
  origin: string,
  session: UserSession,
  toolName: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  switch (toolName) {
    case 'search_wiki': {
      const q = String(args.query || '').trim().toLowerCase();
      if (!q) {
        return { isError: true, content: [{ type: 'text', text: 'Search query is required.' }] };
      }

      const res = await fetch(new URL('/content/search.json', origin));
      if (!res.ok) {
        return { isError: true, content: [{ type: 'text', text: 'Failed to load search index.' }] };
      }

      type SearchEntry = { s: string; t: string; c: string; h: string[]; e: string };
      const data = (await res.json()) as SearchEntry[];
      const matches = data
        .filter((item) => {
          return (
            item.t.toLowerCase().includes(q) ||
            item.s.toLowerCase().includes(q) ||
            item.e.toLowerCase().includes(q) ||
            item.h.some((h) => h.toLowerCase().includes(q))
          );
        })
        .slice(0, 8);

      const summary = matches.map((m) => `* **[${m.t}](https://wiki.torosaba.net/wiki/${encodeURIComponent(m.s)})** (${m.c})\n  ${m.e}`).join('\n\n');
      return {
        content: [
          {
            type: 'text',
            text: matches.length > 0
              ? `Found ${matches.length} articles matching "${q}":\n\n${summary}`
              : `No articles found matching "${q}".`,
          },
        ],
      };
    }

    case 'list_pages': {
      const res = await fetch(new URL('/content/index.json', origin));
      if (!res.ok) {
        return { isError: true, content: [{ type: 'text', text: 'Failed to load page index.' }] };
      }
      type IndexEntry = { categories: Array<{ id: string; label: string }>; pages: Array<{ slug: string; title: string; category: string; updated: string }> };
      const data = (await res.json()) as IndexEntry;
      const targetCategory = args.category ? String(args.category).toLowerCase() : null;

      let pages = data.pages;
      if (targetCategory) {
        pages = pages.filter((p) => p.category.toLowerCase() === targetCategory);
      }

      const listText = pages
        .map((p) => `- [${p.title}](/wiki/${encodeURIComponent(p.slug)}) (Category: ${p.category}, Updated: ${p.updated ? p.updated.slice(0, 10) : 'unknown'})`)
        .join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `Wiki Pages (${pages.length} total):\n\n${listText}`,
          },
        ],
      };
    }

    case 'get_page': {
      let targetPath = args.path ? String(args.path) : null;
      const slug = args.slug ? String(args.slug) : null;

      if (!targetPath && slug) {
        // slug からパスを特定
        const idxRes = await fetch(new URL('/content/index.json', origin));
        if (idxRes.ok) {
          const idxData = (await idxRes.json()) as { pages: Array<{ slug: string; id: string }> };
          const p = idxData.pages.find((item) => item.slug === slug);
          if (p) {
            const pageRes = await fetch(new URL(`/content/pages/${p.id}.json`, origin));
            if (pageRes.ok) {
              const pageData = (await pageRes.json()) as { source?: string };
              if (pageData.source) targetPath = pageData.source;
            }
          }
        }
      }

      if (!targetPath) {
        return { isError: true, content: [{ type: 'text', text: 'Could not resolve path or slug for the page.' }] };
      }

      const file = await getGitHubFile(env, targetPath);
      if (!file) {
        return { isError: true, content: [{ type: 'text', text: `Page not found: ${targetPath}` }] };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Path: ${file.path}\nGit SHA: ${file.sha}\nSize: ${file.size} bytes\n\n\`\`\`markdown\n${file.content}\n\`\`\``,
          },
        ],
      };
    }

    case 'save_page': {
      if (!session.can_edit) {
        return {
          isError: true,
          content: [{ type: 'text', text: 'Forbidden: You do not have permission to edit the Wiki.' }],
        };
      }

      const path = String(args.path || '');
      const content = String(args.content || '');
      const sha = args.sha ? String(args.sha) : undefined;
      const message = args.message ? String(args.message) : undefined;

      if (!path || !content) {
        return { isError: true, content: [{ type: 'text', text: 'Both "path" and "content" are required.' }] };
      }

      const result = await commitGitHubFile(env, {
        path,
        content,
        sha,
        message,
        user: session,
      });

      return {
        content: [
          {
            type: 'text',
            text: `Successfully committed ${path} to GitHub.\nCommit SHA: ${result.commitSha}\nAuthor: ${session.global_name || session.username} (Discord)\nDeployment will run automatically.`,
          },
        ],
      };
    }

    default:
      return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${toolName}` }] };
  }
}

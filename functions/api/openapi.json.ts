import { Env } from './lib/types';
import { jsonResponse, handleCors } from './lib/response';

export const onRequest: PagesFunction<Env> = async (context) => {
  const cors = handleCors(context.request);
  if (cors) return cors;

  const url = new URL(context.request.url);
  const baseUrl = url.origin;

  const openapiSpec = {
    openapi: '3.1.0',
    info: {
      title: 'TORO Server Wiki API & Connector',
      description:
        'Official API and AI Connector for TORO Server Wiki (wiki.torosaba.net). Supports search, retrieval, and authorized editing authenticated via Discord.',
      version: '1.0.0',
    },
    servers: [
      {
        url: baseUrl,
        description: 'Current Environment API Server',
      },
    ],
    components: {
      securitySchemes: {
        DiscordBearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Discord-authenticated session or AI Connector token. Obtain this token by logging in with Discord on wiki.torosaba.net.',
        },
      },
      schemas: {
        PageSummary: {
          type: 'object',
          properties: {
            slug: { type: 'string', description: 'Page slug identifier' },
            title: { type: 'string', description: 'Page title' },
            category: { type: 'string', description: 'Category identifier' },
            updated: { type: 'string', description: 'Last updated timestamp (ISO 8601)' },
            author: { type: 'string', description: 'Last editor display name' },
            excerpt: { type: 'string', description: 'Summary excerpt of the page' },
          },
        },
        PageDetail: {
          type: 'object',
          properties: {
            path: { type: 'string', description: 'Repository file path (e.g. docs/01_Guide/ルール.md)' },
            sha: { type: 'string', description: 'Git blob SHA hash required for updates' },
            content: { type: 'string', description: 'Full raw Markdown content' },
            size: { type: 'integer', description: 'File size in bytes' },
          },
        },
        CommitResult: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            path: { type: 'string' },
            commitSha: { type: 'string' },
            contentSha: { type: 'string' },
            author: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/api/docs/raw': {
        get: {
          operationId: 'get_page',
          summary: 'Get raw Markdown content of a Wiki page',
          description: 'Fetch the latest raw Markdown text and git SHA for a page by slug or file path.',
          parameters: [
            {
              name: 'path',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Relative path under docs/ (e.g. docs/01_Guide/ルール.md)',
            },
            {
              name: 'slug',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Wiki page slug (e.g. ルール)',
            },
          ],
          responses: {
            '200': {
              description: 'Page raw content and metadata',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/PageDetail' },
                },
              },
            },
            '404': { description: 'Page not found' },
          },
        },
      },
      '/api/docs/save': {
        post: {
          operationId: 'save_page',
          summary: 'Edit or create a Wiki page',
          description:
            'Commits changes to the Wiki repository on GitHub. Requires Discord authentication with editor privileges.',
          security: [{ DiscordBearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['path', 'content'],
                  properties: {
                    path: {
                      type: 'string',
                      description: 'Relative file path under docs/ (e.g. docs/01_Guide/ルール.md)',
                    },
                    content: {
                      type: 'string',
                      description: 'Updated Markdown content',
                    },
                    sha: {
                      type: 'string',
                      description: 'Existing git blob SHA (recommended to prevent conflict)',
                    },
                    message: {
                      type: 'string',
                      description: 'Commit message explaining the change',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Successfully committed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CommitResult' },
                },
              },
            },
            '401': { description: 'Unauthorized - invalid or missing Discord token' },
            '403': { description: 'Forbidden - user does not have edit permissions' },
          },
        },
      },
      '/content/index.json': {
        get: {
          operationId: 'list_pages',
          summary: 'List all Wiki pages and categories',
          description: 'Get an index of all published Wiki pages with summaries, slugs, and categories.',
          responses: {
            '200': {
              description: 'Index of pages and categories',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      categories: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            label: { type: 'string' },
                            dir: { type: 'string' },
                          },
                        },
                      },
                      pages: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/PageSummary' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/content/search.json': {
        get: {
          operationId: 'search_wiki',
          summary: 'Search Wiki articles',
          description: 'Full search index of pages including title, headings, and keywords.',
          responses: {
            '200': {
              description: 'Search index records',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        s: { type: 'string', description: 'Page slug' },
                        t: { type: 'string', description: 'Page title' },
                        c: { type: 'string', description: 'Category ID' },
                        h: { type: 'array', items: { type: 'string' }, description: 'Headings' },
                        e: { type: 'string', description: 'Excerpt' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/auth/me': {
        get: {
          operationId: 'get_current_user',
          summary: 'Verify current Discord authentication',
          description: 'Returns profile and permission information for the provided Discord token.',
          security: [{ DiscordBearerAuth: [] }],
          responses: {
            '200': {
              description: 'Authentication status and user info',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      authenticated: { type: 'boolean' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          username: { type: 'string' },
                          global_name: { type: 'string', nullable: true },
                          can_edit: { type: 'boolean' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  return jsonResponse(openapiSpec, 200, {
    'Cache-Control': 'public, max-age=3600',
  });
};

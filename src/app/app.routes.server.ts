import { RenderMode, ServerRoute } from '@angular/ssr';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { WikiIndex } from './core/content';

export const serverRoutes: ServerRoute[] = [
  {
    path: ':slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const index: WikiIndex = JSON.parse(
        readFileSync(join(process.cwd(), 'public', 'content', 'index.json'), 'utf8'),
      );
      return index.pages.map((p) => ({ slug: p.slug }));
    },
  },
  { path: 'wiki/:slug', renderMode: RenderMode.Client },
  { path: 'search', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Prerender },
];

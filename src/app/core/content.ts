import { Injectable, InjectionToken, PLATFORM_ID, TransferState, inject, makeStateKey } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Category {
  id: string;
  label: string;
  description: string;
}

export interface PageSummary {
  slug: string;
  id: string;
  title: string;
  category: string;
  updated: string | null;
  author: string | null;
  excerpt: string;
  hidden?: boolean;
}

export interface WikiIndex {
  generatedAt: string;
  repo: string;
  branch: string;
  categories: Category[];
  pages: PageSummary[];
}

export interface TocItem {
  id: string;
  text: string;
  depth: number;
}

export interface WikiPage {
  slug: string;
  title: string;
  category: string;
  updated: string | null;
  author: string | null;
  seesaa: string | null;
  source: string;
  html: string;
  toc: TocItem[];
  backlinks: string[];
}

export interface SearchEntry {
  s: string;
  t: string;
  c: string;
  x: string;
}

/** public/content 以下のファイルを読む。ブラウザーでは fetch、プリレンダー時はディスクから読む */
export type ContentReader = (path: string) => Promise<unknown>;
export const CONTENT_READER = new InjectionToken<ContentReader>('CONTENT_READER', {
  providedIn: 'root',
  factory: () => async (path: string) => {
    const res = await fetch(`/content/${path}`);
    if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
    return res.json();
  },
});

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly read = inject(CONTENT_READER);
  private readonly state = inject(TransferState);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly cache = new Map<string, Promise<unknown>>();

  /** プリレンダーで読んだものは TransferState で HTML に埋め込み、ブラウザーで読み直さない */
  private load<T>(path: string, transfer = true): Promise<T> {
    let p = this.cache.get(path);
    if (!p) {
      const key = makeStateKey<T>(`content:${path}`);
      if (transfer && this.state.hasKey(key)) {
        const v = this.state.get(key, null as T);
        this.state.remove(key);
        p = Promise.resolve(v);
        this.warm(path);
      } else {
        p = this.read(path).then((v) => {
          if (transfer) this.state.set(key, v as T);
          return v;
        });
        p.catch(() => this.cache.delete(path));
      }
      this.cache.set(path, p);
    }
    return p as Promise<T>;
  }

  /**
   * プリレンダーの HTML に埋め込まれていて読まずに済んだデータも、裏で読んで Service Worker のキャッシュに入れる。
   * オフラインでは HTML の代わりにアプリの殻 (index.csr.html) が開くので、そのときにこのデータで描く。
   */
  private warm(path: string) {
    if (!this.browser || !('serviceWorker' in navigator)) return;
    const sw = navigator.serviceWorker;
    const go = () => setTimeout(() => void fetch(`/content/${path}`).catch(() => undefined), 1000);
    if (sw.controller) go();
    else sw.addEventListener('controllerchange', go, { once: true });
  }

  index(): Promise<WikiIndex> {
    return this.load<WikiIndex>('index.json');
  }

  async page(rawSlug: string): Promise<WikiPage | null> {
    const index = await this.index();
    let decoded = rawSlug;
    try {
      decoded = decodeURIComponent(rawSlug);
    } catch {
      // ignore
    }
    const summary = index.pages.find(
      (p) => p.slug === rawSlug || p.slug === decoded || decodeURIComponent(p.slug) === decoded,
    );
    if (!summary) return null;
    return this.load<WikiPage>(`pages/${summary.id}.json`);
  }

  /** 全文検索用のデータ。大きいので TransferState には載せない */
  search(): Promise<SearchEntry[]> {
    return this.load<SearchEntry[]>('search.json', false);
  }
}

export const pageLink = (slug: string) => ['/wiki', slug];

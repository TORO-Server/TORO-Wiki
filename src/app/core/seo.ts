import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE } from './site';

export interface SeoOptions {
  title?: string;
  description?: string;
  path: string;
  type?: 'website' | 'article';
  updated?: string | null;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set(opts: SeoOptions) {
    const full = opts.title ? `${opts.title} | ${SITE.name}` : `${SITE.name} — マインクラフト・クリエイティブサーバーの Wiki`;
    const url = SITE.url + opts.path;
    const imageUrl = `${SITE.url}/og.jpg`;

    this.title.setTitle(full);

    // OGP 基本項目
    this.meta.updateTag({ property: 'og:title', content: full });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:locale', content: 'ja_JP' });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });

    // Twitter Card 項目 (OGP を明示的にミラー)
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: full });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });

    if (opts.description) {
      this.meta.updateTag({ name: 'description', content: opts.description });
      this.meta.updateTag({ property: 'og:description', content: opts.description });
      this.meta.updateTag({ name: 'twitter:description', content: opts.description });
    }

    // og:type と記事の更新日時
    if (opts.type === 'article') {
      this.meta.updateTag({ property: 'og:type', content: 'article' });
      if (opts.updated) {
        this.meta.updateTag({ property: 'article:modified_time', content: opts.updated });
      } else {
        this.meta.removeTag("property='article:modified_time'");
      }
    } else {
      this.meta.updateTag({ property: 'og:type', content: 'website' });
      this.meta.removeTag("property='article:modified_time'");
    }

    // カノニカルリンク
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;

    // 構造化データ (JSON-LD)
    let script = this.doc.head.querySelector<HTMLScriptElement>('script[data-seo-jsonld]');
    if (opts.jsonLd) {
      if (!script) {
        script = this.doc.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', '');
        this.doc.head.appendChild(script);
      }
      script.textContent = JSON.stringify(opts.jsonLd);
    } else if (script) {
      script.remove();
    }
  }
}

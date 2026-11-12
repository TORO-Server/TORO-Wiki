import { Component, ElementRef, PLATFORM_ID, afterRenderEffect, computed, effect, inject, input, resource, signal, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth';
import { ContentService } from '../../core/content';
import { JaDatePipe, safeDecode } from '../../core/format';
import { Icon } from '../../core/icons';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site';
import { UiState } from '../../core/ui';
import { CATEGORY_ICON } from '../../shared/categories';
import { Dialog } from '../../shared/dialog';
import { WikiEditorComponent } from '../../shared/components/wiki-editor/wiki-editor.component';

@Component({
  selector: 'app-wiki-page',
  imports: [RouterLink, Icon, JaDatePipe, WikiEditorComponent, Dialog],
  templateUrl: './wiki-page.html',
  styleUrl: './wiki-page.scss',
})
export class WikiPageView {
  readonly slug = input.required<string>();

  protected readonly auth = inject(AuthService);
  private readonly ui = inject(UiState);
  private readonly content = inject(ContentService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly seo = inject(Seo);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly article = viewChild<ElementRef<HTMLElement>>('article');

  protected readonly site = SITE;
  protected readonly icon = CATEGORY_ICON;
  protected readonly isEditorOpen = signal<boolean>(false);
  protected readonly mobileTocOpen = signal<boolean>(false);
  /** 本文の画像を大きく見ているとき */
  protected readonly lightbox = signal<{ src: string; alt: string } | null>(null);
  /** いま読んでいる見出し (目次で強調する) */
  protected readonly activeHeading = signal<string>('');

  protected readonly decodedSlug = computed(() => safeDecode(this.slug()));

  protected readonly index = resource({ loader: () => this.content.index() });
  protected readonly page = resource({
    params: () => this.slug(),
    loader: ({ params }) => this.content.page(params),
  });

  /** 読めなかったとき (オフラインで、まだ開いたことのないページなど) は null。resource の value() はエラーのとき例外になる */
  protected readonly current = computed(() => (this.page.hasValue() ? this.page.value() : null));
  private readonly idx = computed(() => (this.index.hasValue() ? this.index.value() : undefined));

  /** 本文は scripts/build-content.mjs で sanitize-html を通してある */
  protected readonly html = computed(() => {
    const p = this.current();
    return p ? this.sanitizer.bypassSecurityTrustHtml(p.html) : '';
  });

  /** 本文に文字も画像も無いページ (旧 Wiki から引き継いだときに空だったもの) */
  protected readonly isEmpty = computed(() => {
    const p = this.current();
    return !!p && !/<(img|iframe|video|table)\b/i.test(p.html) && !p.html.replace(/<[^>]*>/g, '').trim();
  });

  protected readonly category = computed(() => {
    const p = this.current();
    return this.idx()?.categories.find((c) => c.id === p?.category) ?? null;
  });

  protected readonly siblings = computed(() => {
    const p = this.current();
    const idx = this.idx();
    if (!p || !idx) return [];
    return idx.pages.filter((x) => x.category === p.category && !x.hidden);
  });

  protected readonly neighbors = computed(() => {
    const list = this.siblings();
    const i = list.findIndex((x) => x.slug === this.current()?.slug);
    return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
  });

  protected readonly backlinks = computed(() => {
    const p = this.current();
    const idx = this.idx();
    if (!p || !idx) return [];
    return p.backlinks.map((s) => idx.pages.find((x) => x.slug === s)).filter((x) => !!x);
  });

  protected readonly toc = computed(() => (this.current()?.toc ?? []).filter((t) => t.depth >= 2 && t.depth <= 3));

  /** 見つからないページの名前に近いページ (「もしかして」) */
  protected readonly similar = computed(() => {
    const idx = this.idx();
    if (!idx || this.current() || this.page.status() !== 'resolved') return [];
    const q = safeDecode(this.slug()).normalize('NFKC').toLowerCase().replace(/[_\s]+/g, '');
    if (!q) return [];
    return idx.pages
      .filter((p) => !p.hidden)
      .map((p) => {
        const t = p.title.normalize('NFKC').toLowerCase().replace(/[_\s]+/g, '');
        const score = t.includes(q) || q.includes(t) ? 2 : [...q].filter((ch) => t.includes(ch)).length / Math.max(q.length, 1);
        return { p, score };
      })
      .filter((x) => x.score >= 0.6)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.p);
  });

  protected readonly editUrl = computed(() => `${SITE.repo}/edit/main/${this.current()?.source}`);
  protected readonly historyUrl = computed(() => `${SITE.repo}/commits/main/${this.current()?.source}`);

  constructor() {
    effect(() => {
      const rawSlug = this.slug();
      const decodedSlug = safeDecode(rawSlug);
      const p = this.current();
      const summary = this.idx()?.pages.find((x) => x.slug === rawSlug || x.slug === decodedSlug);
      if (p) {
        const canonicalPath = `/${encodeURIComponent(p.slug)}`;
        const canonicalUrl = `${SITE.url}${canonicalPath}`;
        const articleJsonLd: Record<string, unknown> = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: p.title,
          url: canonicalUrl,
          ...(summary?.excerpt ? { description: summary.excerpt } : {}),
          ...(p.updated ? { dateModified: p.updated } : {}),
        };
        const breadcrumbJsonLd: Record<string, unknown> = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: `${SITE.url}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Wiki index',
              item: `${SITE.url}/wiki`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: p.title,
              item: canonicalUrl,
            },
          ],
        };
        this.seo.set({
          title: p.title,
          description: summary?.excerpt,
          path: canonicalPath,
          type: 'article',
          updated: p.updated,
          jsonLd: [articleJsonLd, breadcrumbJsonLd],
        });
      } else if (this.page.status() === 'resolved') {
        this.seo.set({
          title: 'ページが見つかりません',
          path: `/${encodeURIComponent(decodedSlug)}`,
        });
      }
    });

    // ページを替えたら、開いていたものを閉じる
    effect(() => {
      this.slug();
      this.lightbox.set(null);
      this.mobileTocOpen.set(false);
      this.activeHeading.set('');
    });

    // 本文を描いたあとに、URL の #見出し まで動かす (本文は非同期に届くため)
    afterRenderEffect(() => {
      const p = this.current();
      if (!p || !this.browser || !location.hash) return;
      document.getElementById(safeDecode(location.hash.slice(1)))?.scrollIntoView();
    });

    // コードブロックに「コピー」ボタンを付ける
    afterRenderEffect(() => {
      this.current();
      const root = this.article()?.nativeElement;
      if (!root || !this.browser) return;
      for (const pre of Array.from(root.querySelectorAll('pre'))) {
        if (pre.parentElement?.classList.contains('code-block')) continue;
        const wrap = document.createElement('div');
        wrap.className = 'code-block';
        pre.replaceWith(wrap);
        wrap.append(pre);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-btn';
        btn.textContent = 'コピー';
        btn.setAttribute('aria-label', 'このコードをコピー');
        wrap.append(btn);
      }
    });

    // いま読んでいる見出し (画面の上の端を通り過ぎた、いちばん最後のもの) を、目次で強調する。
    // IntersectionObserver だと、目次のリンクなどで一気に飛んだとき、途中の見出しの出入りを見逃して、強調がずれるため、スクロールで位置を測る
    afterRenderEffect((onCleanup) => {
      const p = this.current();
      const root = this.article()?.nativeElement;
      if (!p || !root || !this.browser) return;
      const heads = Array.from(root.querySelectorAll<HTMLElement>('h2[id], h3[id]'));
      if (!heads.length) return;
      let frame = 0;
      const update = () => {
        frame = 0;
        // 固定のヘッダーの下に隠れないよう、その分 (と少し) 下を基準にする
        const line = 110;
        let current = '';
        for (const h of heads) {
          if (h.getBoundingClientRect().top <= line) current = h.id;
          else break;
        }
        if (current !== this.activeHeading()) this.activeHeading.set(current);
      };
      const onScroll = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };
      update();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      onCleanup(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
        if (frame) cancelAnimationFrame(frame);
      });
    });
  }

  protected openEditor() {
    this.isEditorOpen.set(true);
  }

  protected closeEditor() {
    this.isEditorOpen.set(false);
  }

  protected openGuide() {
    this.ui.openGuide();
  }

  protected toggleMobileToc() {
    this.mobileTocOpen.set(!this.mobileTocOpen());
  }

  protected scrollToTop() {
    if (!this.browser) return;
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  protected onEditorSaved() {
    this.page.reload();
  }

  /** 本文中のリンクを、ページを読み直さずに開く。画像は大きく見せ、コードはコピーできるようにする */
  protected onArticleClick(e: MouseEvent) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const target = e.target as HTMLElement;

    const copy = target.closest<HTMLButtonElement>('button.copy-btn');
    if (copy) {
      const code = copy.parentElement?.querySelector('pre')?.innerText ?? '';
      void navigator.clipboard
        ?.writeText(code.replace(/\n$/, ''))
        .then(() => {
          copy.textContent = 'コピーしました';
          setTimeout(() => (copy.textContent = 'コピー'), 1500);
        })
        .catch(() => {
          copy.textContent = 'コピーできません';
          setTimeout(() => (copy.textContent = 'コピー'), 1500);
        });
      return;
    }

    const a = target.closest('a');
    if (!a && target instanceof HTMLImageElement && target.src && this.article()?.nativeElement.contains(target)) {
      this.lightbox.set({ src: target.currentSrc || target.src, alt: target.alt });
      return;
    }
    if (!a || a.target || !this.article()?.nativeElement.contains(a)) return;
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#')) {
      e.preventDefault();
      document.getElementById(safeDecode(href.slice(1)))?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      history.replaceState(history.state, '', location.pathname + location.search + href);
      return;
    }
    if (href.startsWith('/') && !href.startsWith('//') && !/\.[a-z0-9]{2,5}$/i.test(href.split('#')[0])) {
      e.preventDefault();
      void this.router.navigateByUrl(href);
    }
  }
}

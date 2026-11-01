import { Component, ElementRef, PLATFORM_ID, afterRenderEffect, computed, effect, inject, input, resource, signal, viewChild } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth';
import { ContentService } from '../../core/content';
import { JaDatePipe } from '../../core/format';
import { Icon } from '../../core/icons';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site';
import { CATEGORY_ICON } from '../../shared/categories';
import { WikiEditorComponent } from '../../shared/components/wiki-editor/wiki-editor.component';

@Component({
  selector: 'app-wiki-page',
  imports: [RouterLink, Icon, JaDatePipe, WikiEditorComponent],
  templateUrl: './wiki-page.html',
  styleUrl: './wiki-page.scss',
})
export class WikiPageView {
  readonly slug = input.required<string>();

  protected readonly auth = inject(AuthService);
  private readonly content = inject(ContentService);
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly seo = inject(Seo);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly article = viewChild<ElementRef<HTMLElement>>('article');

  protected readonly site = SITE;
  protected readonly icon = CATEGORY_ICON;
  protected readonly isEditorOpen = signal<boolean>(false);

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

  protected readonly editUrl = computed(() => `${SITE.repo}/edit/main/${this.current()?.source}`);
  protected readonly historyUrl = computed(() => `${SITE.repo}/commits/main/${this.current()?.source}`);

  constructor() {
    effect(() => {
      const slug = this.slug();
      const p = this.current();
      const summary = this.idx()?.pages.find((x) => x.slug === slug);
      if (p) {
        this.seo.set({ title: p.title, description: summary?.excerpt, path: `/wiki/${encodeURIComponent(slug)}` });
      } else if (this.page.status() === 'resolved') {
        this.seo.set({ title: 'ページが見つかりません', path: `/wiki/${encodeURIComponent(slug)}` });
      }
    });

    // 本文を描いたあとに、URL の #見出し まで動かす (本文は非同期に届くため)
    afterRenderEffect(() => {
      const p = this.current();
      if (!p || !this.browser || !location.hash) return;
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      el?.scrollIntoView();
    });
  }

  protected openEditor() {
    this.isEditorOpen.set(true);
  }

  protected closeEditor() {
    this.isEditorOpen.set(false);
  }

  protected onEditorSaved() {
    this.page.reload();
  }

  /** 本文中のリンクを、ページを読み直さずに開く */
  protected onArticleClick(e: MouseEvent) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest('a');
    if (!a || a.target || !this.article()?.nativeElement.contains(a)) return;
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#')) {
      e.preventDefault();
      const el = document.getElementById(decodeURIComponent(href.slice(1)));
      el?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      // <base href="/"> があるので、"#id" だけだとトップページの URL になってしまう
      history.replaceState(history.state, '', location.pathname + location.search + href);
      return;
    }
    if (href.startsWith('/') && !href.startsWith('//') && !/\.[a-z0-9]{2,5}$/i.test(href.split('#')[0])) {
      e.preventDefault();
      void this.router.navigateByUrl(href);
    }
  }
}

import { Component, DOCUMENT, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { VideoBackground } from './map/video-background';
import { MapStage } from './map/map-stage';
import { MapMode } from './map/map-types';
import { Icon } from './core/icons';
import { SITE } from './core/site';
import { PwaUpdates } from './core/pwa';
import { AuthService } from './core/auth';
import { ContentService, PageSummary } from './core/content';
import { UiState } from './core/ui';
import { EditGuideModalComponent } from './shared/components/edit-guide-modal/edit-guide-modal.component';

const norm = (s: string) => s.normalize('NFKC').toLowerCase();

export type ThemeMode = 'system' | 'light' | 'dark';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    VideoBackground,
    Icon,
    EditGuideModalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[attr.data-map]': 'stage.mode()',
    '(document:keydown)': 'onKey($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class App {
  protected readonly stage = inject(MapStage);
  protected readonly auth = inject(AuthService);
  protected readonly ui = inject(UiState);
  private readonly content = inject(ContentService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly doc = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly site = SITE;
  protected readonly menuOpen = signal(false);
  protected readonly userMenuOpen = signal(false);
  protected readonly query = signal('');
  protected readonly theme = signal<ThemeMode>('system');
  protected readonly themeIcon = computed(() => {
    switch (this.theme()) {
      case 'light':
        return 'sun';
      case 'dark':
        return 'moon';
      case 'system':
        return 'monitor';
    }
  });
  protected readonly themeLabel = computed(() => {
    switch (this.theme()) {
      case 'system':
        return 'テーマ: ブラウザのデフォルト (クリックでライトモードに変更)';
      case 'light':
        return 'テーマ: ライトモード (クリックでダークモードに変更)';
      case 'dark':
        return 'テーマ: ダークモード (クリックでブラウザのデフォルトに変更)';
    }
  });

  // ---- 検索ボックスの候補 (ページ名) ----
  private readonly pages = signal<PageSummary[]>([]);
  protected readonly searchFocused = signal(false);
  protected readonly activeSuggestion = signal(-1);
  protected readonly suggestions = computed(() => {
    const q = norm(this.query().trim());
    if (!q) return [];
    const scored: { page: PageSummary; score: number }[] = [];
    for (const page of this.pages()) {
      const t = norm(page.title);
      const at = t.indexOf(q);
      if (at < 0) continue;
      scored.push({ page, score: (at === 0 ? 0 : 10) + (t === q ? -20 : 0) + t.length / 100 });
    }
    return scored
      .sort((a, b) => a.score - b.score)
      .slice(0, 7)
      .map((s) => s.page);
  });
  protected readonly suggestOpen = computed(() => this.searchFocused() && this.query().trim().length > 0);

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      let r = this.route.snapshot;
      while (r.firstChild) r = r.firstChild;
      this.stage.mode.set((r.data['map'] as MapMode) ?? 'ambient');
      this.menuOpen.set(false);
      this.userMenuOpen.set(false);
      this.searchFocused.set(false);
    });
    if (this.browser) {
      inject(PwaUpdates).start();
      let saved: string | null = null;
      try {
        saved = localStorage.getItem('theme');
      } catch {}
      if (saved === 'light' || saved === 'dark') {
        this.theme.set(saved);
        this.doc.documentElement.dataset['theme'] = saved;
      } else {
        this.theme.set('system');
        delete this.doc.documentElement.dataset['theme'];
      }
    }
  }

  protected onSearchFocus() {
    this.searchFocused.set(true);
    if (this.pages().length) return;
    this.content
      .index()
      .then((idx) => this.pages.set(idx.pages.filter((p) => !p.hidden)))
      .catch(() => undefined);
  }

  protected onSearchInput(value: string) {
    this.query.set(value);
    this.activeSuggestion.set(-1);
  }

  protected onSearchKey(e: KeyboardEvent) {
    const n = this.suggestions().length;
    if (e.key === 'ArrowDown' && n) {
      e.preventDefault();
      this.activeSuggestion.set((this.activeSuggestion() + 1) % n);
    } else if (e.key === 'ArrowUp' && n) {
      e.preventDefault();
      this.activeSuggestion.set((this.activeSuggestion() - 1 + n) % n);
    } else if (e.key === 'Escape') {
      if (this.searchFocused()) {
        e.stopPropagation();
        this.searchFocused.set(false);
        (e.target as HTMLElement).blur();
      }
    }
  }

  protected search(e: Event) {
    e.preventDefault();
    const picked = this.suggestions()[this.activeSuggestion()];
    if (picked) {
      this.openPage(picked);
      return;
    }
    const q = this.query().trim();
    if (q) void this.router.navigate(['/search'], { queryParams: { q } });
    this.searchFocused.set(false);
    (this.doc.activeElement as HTMLElement | null)?.blur();
  }

  protected openPage(page: PageSummary) {
    this.searchFocused.set(false);
    this.query.set('');
    this.activeSuggestion.set(-1);
    (this.doc.activeElement as HTMLElement | null)?.blur();
    void this.router.navigate(['/wiki', page.slug]);
  }

  protected toggleTheme() {
    const current = this.theme();
    const next: ThemeMode =
      current === 'system' ? 'light' :
      current === 'light' ? 'dark' : 'system';
    this.theme.set(next);
    if (next === 'system') {
      delete this.doc.documentElement.dataset['theme'];
      try {
        localStorage.removeItem('theme');
      } catch {
        // 保存できなくても、このページの間は切り替わる
      }
      return;
    }
    this.doc.documentElement.dataset['theme'] = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // 保存できなくても、このページの間は切り替わる
    }
  }

  protected closeMenus() {
    this.menuOpen.set(false);
    this.userMenuOpen.set(false);
  }

  protected openEditGuide() {
    this.menuOpen.set(false);
    this.userMenuOpen.set(false);
    this.ui.openGuide();
  }

  /** ユーザーメニューや検索の候補は、外をクリックしたら閉じる */
  protected onDocumentClick(e: MouseEvent) {
    const target = e.target as Element | null;
    if (this.userMenuOpen() && !target?.closest('.user-menu-wrap')) this.userMenuOpen.set(false);
    if (this.searchFocused() && !target?.closest('.search-wrap')) this.searchFocused.set(false);
  }

  protected onKey(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable;
    if ((e.key === '/' && !typing) || (e.key === 'k' && (e.ctrlKey || e.metaKey))) {
      e.preventDefault();
      this.doc.querySelector<HTMLInputElement>('#site-search')?.focus();
    }
    if (e.key === 'Escape') {
      this.menuOpen.set(false);
      this.userMenuOpen.set(false);
      this.ui.guideOpen.set(false);
    }
  }
}

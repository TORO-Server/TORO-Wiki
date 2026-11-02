import { Component, DOCUMENT, PLATFORM_ID, inject, signal } from '@angular/core';
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
import { AiConnectorModalComponent } from './shared/components/ai-connector-modal/ai-connector-modal.component';
import { EditGuideModalComponent } from './shared/components/edit-guide-modal/edit-guide-modal.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    VideoBackground,
    Icon,
    AiConnectorModalComponent,
    EditGuideModalComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '[attr.data-map]': 'stage.mode()',
    '(document:keydown)': 'onKey($event)',
  },
})
export class App {
  protected readonly stage = inject(MapStage);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly doc = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly site = SITE;
  protected readonly menuOpen = signal(false);
  protected readonly userMenuOpen = signal(false);
  protected readonly aiModalOpen = signal(false);
  protected readonly editGuideOpen = signal(false);
  protected readonly query = signal('');
  protected readonly dark = signal(false);

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      let r = this.route.snapshot;
      while (r.firstChild) r = r.firstChild;
      this.stage.mode.set((r.data['map'] as MapMode) ?? 'ambient');
      this.menuOpen.set(false);
      this.userMenuOpen.set(false);
    });
    if (this.browser) {
      inject(PwaUpdates).start();
      const t = this.doc.documentElement.dataset['theme'];
      this.dark.set(t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }

  protected search(e: Event) {
    e.preventDefault();
    const q = this.query().trim();
    if (q) void this.router.navigate(['/search'], { queryParams: { q } });
    (this.doc.activeElement as HTMLElement | null)?.blur();
  }

  protected toggleTheme() {
    const next = this.dark() ? 'light' : 'dark';
    this.dark.set(next === 'dark');
    this.doc.documentElement.dataset['theme'] = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // 保存できなくても、このページの間は切り替わる
    }
  }

  protected openAiModal() {
    this.userMenuOpen.set(false);
    this.aiModalOpen.set(true);
  }

  protected openEditGuide() {
    this.menuOpen.set(false);
    this.userMenuOpen.set(false);
    this.editGuideOpen.set(true);
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
      this.aiModalOpen.set(false);
      this.editGuideOpen.set(false);
    }
  }
}

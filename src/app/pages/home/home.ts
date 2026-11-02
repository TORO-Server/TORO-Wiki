import { Component, computed, inject, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content';
import { JaDatePipe } from '../../core/format';
import { Icon } from '../../core/icons';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site';
import { CATEGORY_ICON } from '../../shared/categories';
import { MapStage } from '../../map/map-stage';
import { blueMapUrl, poiPageSlug } from '../../map/map-types';
import { EditGuideModalComponent } from '../../shared/components/edit-guide-modal/edit-guide-modal.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Icon, JaDatePipe, EditGuideModalComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly content = inject(ContentService);
  private readonly router = inject(Router);
  protected readonly stage = inject(MapStage);
  protected readonly site = SITE;
  protected readonly icon = CATEGORY_ICON;
  protected readonly query = signal('');
  protected readonly isGuideOpen = signal(false);

  protected readonly index = resource({ loader: () => this.content.index() });

  private readonly visible = computed(() => (this.index.value()?.pages ?? []).filter((p) => !p.hidden));
  protected readonly total = computed(() => this.visible().length);

  protected readonly categories = computed(() => {
    const idx = this.index.value();
    if (!idx) return [];
    return idx.categories.map((c) => ({ ...c, count: this.visible().filter((p) => p.category === c.id).length }));
  });

  protected readonly recent = computed(() =>
    this.visible()
      .filter((p) => p.updated)
      .sort((a, b) => b.updated!.localeCompare(a.updated!))
      .slice(0, 10),
  );

  protected readonly lastUpdated = computed(() => this.recent()[0]?.updated ?? null);

  protected readonly poi = computed(() => {
    const poi = this.stage.current();
    if (!poi) return null;
    const slug = poiPageSlug(poi);
    const hasPage = this.index.value()?.pages.some((p) => p.slug === slug) ?? false;
    return { ...poi, slug: hasPage ? slug : null, bluemap: blueMapUrl(poi), index: this.stage.index() };
  });

  constructor() {
    inject(Seo).set({
      path: '/',
      description:
        'TORO Server の Wiki。マインクラフトのクリエイティブサーバー TORO Server のルール、遊び方、プラグイン、街や鉄道の情報をまとめています。',
    });
  }

  protected search(e: Event) {
    e.preventDefault();
    const q = this.query().trim();
    if (q) void this.router.navigate(['/search'], { queryParams: { q } });
  }

  protected random() {
    const pages = this.visible();
    if (pages.length) void this.router.navigate(['/wiki', pages[Math.floor(Math.random() * pages.length)].slug]);
  }
}

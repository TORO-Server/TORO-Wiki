import { Component, computed, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content';
import { Icon } from '../../core/icons';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site';
import { blueMapUrl } from '../../map/map-types';
import PLACES from '../../map/places.json';

type Place = (typeof PLACES)[number];

/**
 * 3D マップ (BlueMap) への入口。
 * 3d-map.torosaba.net は他のサイトの <iframe> に入れることを禁止している (Content-Security-Policy: frame-ancestors 'self') ので、
 * 埋め込まず、名所ごとの写真から新しいタブで開く。
 */
@Component({
  selector: 'app-map-page',
  imports: [RouterLink, Icon],
  template: `
    <div class="container wrap">
      <header class="sheet head">
        <div>
          <p class="eyebrow">BlueMap</p>
          <h1 class="display">3D マップ</h1>
          <p class="sub">
            TORO Server のワールドを 3D で見られます。名所を選ぶと、その場所から BlueMap が新しいタブで開きます。ドラッグで回転、右ドラッグで移動、ホイールで拡大します。
          </p>
        </div>
        <div class="tools">
          <a class="btn primary" [href]="site.map3d" target="_blank" rel="noopener"><app-icon name="map" /> 3D マップを開く</a>
          <a class="btn" [href]="site.map2d" target="_blank" rel="noopener"><app-icon name="external" /> 2D マップ (Dynmap)</a>
        </div>
      </header>

      <ul class="cards">
        @for (p of places; track p.id) {
          <li class="sheet card">
            <a class="photo" [href]="url(p)" target="_blank" rel="noopener" [attr.aria-label]="p.name + ' を 3D マップで開く'">
              <img [src]="'/background/' + p.id + '.jpg'" alt="" loading="lazy" width="640" height="360" />
            </a>
            <div class="body">
              <h2>{{ p.name }}</h2>
              <p>{{ p.note }}</p>
              <p class="actions">
                <a class="btn" [href]="url(p)" target="_blank" rel="noopener">3D マップで見る <app-icon name="external" /></a>
                @if (wikiSlug(p); as slug) {
                  <a class="btn" [routerLink]="['/wiki', slug]">Wiki で読む</a>
                }
              </p>
            </div>
          </li>
        }
      </ul>
    </div>
  `,
  styles: `
    :host { display: block; }
    .wrap { display: grid; gap: 14px; }
    .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; padding: clamp(18px, 3vw, 32px); }
    .head h1 { margin: 4px 0; font-size: clamp(1.8rem, 4vw, 2.6rem); }
    .sub { max-width: 52em; margin: 0; color: var(--ink-3); font-size: 0.92rem; }
    .tools { display: flex; flex-wrap: wrap; gap: 8px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr)); gap: 12px; margin: 0; padding: 0; list-style: none; }
    .card { display: grid; grid-template-rows: auto 1fr; overflow: hidden; }
    .photo { display: block; aspect-ratio: 16 / 9; overflow: hidden; background: #3b6ea5; }
    .photo img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
    .photo:hover img, .photo:focus-visible img { transform: scale(1.05); }
    .body { display: grid; align-content: start; gap: 4px; padding: 12px 16px 16px; }
    .body h2 { margin: 0; font-size: 1.1rem; color: var(--heading); }
    .body p { margin: 0; color: var(--ink-2); font-size: 0.88rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px !important; }
    @media (prefers-reduced-motion: reduce) { .photo img { transition: none; } }
  `,
})
export class MapPage {
  private readonly content = inject(ContentService);
  protected readonly site = SITE;
  protected readonly places = PLACES;
  private readonly index = resource({ loader: () => this.content.index() });
  private readonly data = computed(() => (this.index.hasValue() ? this.index.value() : undefined));

  constructor() {
    inject(Seo).set({
      title: '3D マップ',
      path: '/map',
      description: 'TORO Server のワールドを BlueMap の 3D マップで見られます。街や空港などの名所へすぐ移動できます。',
    });
  }

  protected url(p: Place) {
    return blueMapUrl(p, 600);
  }

  /** 名所に関する Wiki のページがあれば、そのスラッグ */
  protected wikiSlug(p: Place) {
    if (!p.page) return null;
    const slug = p.page.split('/').pop()!.replace(/\s+/g, '_');
    return this.data()?.pages.some((x) => x.slug === slug) ? slug : null;
  }
}

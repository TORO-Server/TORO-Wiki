import { Component, computed, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content';
import { JaDatePipe, isoDay } from '../../core/format';
import { Icon } from '../../core/icons';
import { Seo } from '../../core/seo';

const PAGE_SIZE = 60;

@Component({
  selector: 'app-updates',
  imports: [RouterLink, Icon, JaDatePipe],
  template: `
    <div class="container narrow">
      <header class="sheet head">
        <div>
          <p class="eyebrow">Recent Changes</p>
          <h1 class="display">更新履歴</h1>
          <p class="sub">Wiki の最近更新されたページです。旧 Wiki (seesaa) での更新日も引き継いでいます。</p>
        </div>
        <a class="btn" href="/feed.xml"><app-icon name="rss" /> RSS</a>
      </header>

      @for (day of days(); track day.date) {
        <section class="sheet day">
          <h2><time [attr.datetime]="day.date">{{ day.iso | jaDate }}</time></h2>
          <ul>
            @for (p of day.pages; track p.slug) {
              <li>
                <a [routerLink]="['/', p.slug]">{{ p.title }}</a>
                <span class="cat chip">{{ label(p.category) }}</span>
                @if (p.author) {
                  <span class="who">{{ p.author }}</span>
                }
              </li>
            }
          </ul>
        </section>
      }

      @if (limit() < total()) {
        <button type="button" class="btn more" (click)="limit.set(limit() + PAGE_SIZE)">もっと見る ({{ total() - limit() }} 件)</button>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .narrow { max-width: 880px; display: grid; gap: 14px; }
    .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; padding: clamp(22px, 4vw, 36px); }
    .head h1 { margin: 4px 0; font-size: clamp(2rem, 4vw, 2.8rem); }
    .sub { margin: 0; color: var(--ink-3); font-size: 0.9rem; }
    .day { padding: 18px 24px; }
    .day h2 { margin: 0 0 6px; font-size: 0.95rem; color: var(--ink-2); }
    ul { margin: 0; padding: 0; list-style: none; }
    li { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 10px; padding: 8px 0; border-top: 1px solid var(--line); }
    li a { font-weight: 700; color: var(--ink); text-decoration: none; }
    li a:hover { color: var(--link); text-decoration: underline; }
    .who { margin-left: auto; color: var(--ink-3); font-size: 0.82rem; }
    .more { justify-self: center; }
    @media (max-width: 996px) {
      .narrow { grid-template-columns: minmax(0, 1fr); }
      /* 行の高さはそのままで、リンクの当たり判定を広げる */
      li { padding: 2px 0; }
      li a { min-width: 40px; padding-block: 6px; }
    }
  `,
})
export class Updates {
  private readonly content = inject(ContentService);
  protected readonly PAGE_SIZE = PAGE_SIZE;
  protected readonly limit = signal(PAGE_SIZE);
  protected readonly index = resource({ loader: () => this.content.index() });

  private readonly sorted = computed(() =>
    ((this.index.hasValue() ? this.index.value() : undefined)?.pages ?? [])
      .filter((p) => p.updated && !p.hidden)
      .sort((a, b) => b.updated!.localeCompare(a.updated!)),
  );
  protected readonly total = computed(() => this.sorted().length);

  protected readonly days = computed(() => {
    const out: { date: string; iso: string; pages: ReturnType<Updates['sorted']> }[] = [];
    for (const p of this.sorted().slice(0, this.limit())) {
      const d = isoDay(p.updated!);
      const last = out.at(-1);
      if (last?.date === d) last.pages.push(p);
      else out.push({ date: d, iso: p.updated!, pages: [p] });
    }
    return out;
  });

  constructor() {
    inject(Seo).set({ title: '更新履歴', path: '/updates', description: 'TORO Server Wiki の最近更新されたページの一覧です。' });
  }

  protected label(id: string) {
    return (this.index.hasValue() ? this.index.value() : undefined)?.categories.find((c) => c.id === id)?.label ?? id;
  }
}

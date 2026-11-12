import { Component, computed, inject, resource, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContentService } from '../../core/content';
import { JaDatePipe } from '../../core/format';
import { Icon } from '../../core/icons';
import { Seo } from '../../core/seo';
import { SITE } from '../../core/site';
import { CATEGORY_ICON } from '../../shared/categories';

const norm = (s: string) => s.normalize('NFKC').toLowerCase();

@Component({
  selector: 'app-wiki-index',
  imports: [RouterLink, Icon, JaDatePipe],
  templateUrl: './wiki-index.html',
  styleUrl: './wiki-index.scss',
})
export class WikiIndexPage {
  private readonly content = inject(ContentService);
  private readonly router = inject(Router);
  protected readonly site = SITE;
  /** "TORO-Server/..." (リンクの文字。リポジトリ名が変わっても、リンク先とずれないよう SITE から作る) */
  protected readonly repoName = SITE.repo.replace(/^https:\/\/github\.com\//, '');
  protected readonly icon = CATEGORY_ICON;
  protected readonly filter = signal('');

  protected readonly index = resource({ loader: () => this.content.index() });

  protected readonly data = computed(() => (this.index.hasValue() ? this.index.value() : undefined));
  protected readonly visible = computed(() => (this.data()?.pages ?? []).filter((p) => !p.hidden));

  protected readonly groups = computed(() => {
    const idx = this.data();
    if (!idx) return [];
    const f = norm(this.filter().trim());
    return idx.categories
      .map((c) => ({
        ...c,
        pages: this.visible().filter((p) => p.category === c.id && (!f || norm(p.title).includes(f))),
      }))
      .filter((g) => g.pages.length);
  });

  protected readonly lastUpdated = computed(() =>
    this.visible().reduce<string | null>((m, p) => (p.updated && (!m || p.updated > m) ? p.updated : m), null),
  );

  constructor() {
    inject(Seo).set({
      title: 'Wiki',
      path: '/wiki',
      description: 'TORO Server Wiki のページ一覧。ルール、プラグイン、交通、自治体、コミュニティの情報をまとめています。',
    });
  }

  protected random() {
    const pages = this.visible();
    if (!pages.length) return;
    const p = pages[Math.floor(Math.random() * pages.length)];
    void this.router.navigate(['/', p.slug]);
  }
}

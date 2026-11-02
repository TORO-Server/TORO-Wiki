import { Component, computed, inject, input, resource, signal, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ContentService, SearchEntry } from '../../core/content';
import { Icon } from '../../core/icons';
import { Seo } from '../../core/seo';

/** 全角・半角、大文字・小文字の違いを無くす */
const norm = (s: string) => s.normalize('NFKC').toLowerCase();
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

interface Hit {
  entry: SearchEntry;
  score: number;
  snippet: string;
}

interface Prepared {
  entry: SearchEntry;
  t: string;
  x: string;
}

/**
 * norm() した文字列と、その 1 文字 1 文字が元の文字列の何文字目にあたるか。
 * NFKC で長さが変わる文字 (「㈱」→「(株)」、「ｱ」→「ア」など) があっても、見つけた場所を元の文字列に戻せる。
 */
function foldWithMap(raw: string) {
  let folded = '';
  const map: number[] = [];
  for (let i = 0; i < raw.length; ) {
    const ch = String.fromCodePoint(raw.codePointAt(i)!);
    const f = norm(ch);
    for (let k = 0; k < f.length; k++) map.push(i);
    folded += f;
    i += ch.length;
  }
  map.push(raw.length);
  return { folded, map };
}

/** 本文全文の検索。データ (search.json) はこのページを開いたときに読む */
@Component({
  selector: 'app-search',
  imports: [RouterLink, Icon],
  template: `
    <div class="container narrow">
      <form class="sheet box" role="search" (submit)="submit($event)">
        <app-icon name="search" />
        <label class="visually-hidden" for="q">検索する言葉</label>
        <input id="q" type="search" name="q" placeholder="ページ名や本文を検索" [value]="text()" (input)="text.set($any($event.target).value)" autofocus />
        <button class="btn primary" type="submit">検索</button>
      </form>

      @if (data.status() === 'error') {
        <p class="sheet note">
          検索のデータを読み込めませんでした。ネットワークにつながっているか確かめて、もう一度お試しください。
          <button type="button" class="btn" (click)="data.reload()">再読み込み</button>
        </p>
      } @else if (!data.hasValue()) {
        <p class="sheet note" aria-live="polite">検索の準備をしています…</p>
      } @else if (terms().length) {
        <p class="count" aria-live="polite">「{{ text().trim() }}」の検索結果: {{ hits().length }}{{ capped() ? ' 件以上 (上位 100 件を表示)' : ' 件' }}</p>
        <ol class="hits">
          @for (h of hits(); track h.entry.s) {
            <li class="sheet">
              <a [routerLink]="['/wiki', h.entry.s]">{{ h.entry.t }}</a>
              <p [innerHTML]="h.snippet"></p>
            </li>
          } @empty {
            <li class="sheet note">見つかりませんでした。言葉を短くするか、<a routerLink="/wiki">ページ一覧</a>から探してみてください。</li>
          }
        </ol>
      } @else {
        <p class="sheet note">探したい言葉を入れてください。空白で区切ると、すべての言葉を含むページを探します。</p>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .narrow { max-width: 860px; display: grid; gap: 14px; }
    .box { display: flex; align-items: center; gap: 10px; padding: 10px 10px 10px 18px; font-size: 1.1rem; color: var(--ink-3); }
    .box input { flex: 1; min-width: 0; border: 0; background: none; color: var(--ink); font: inherit; outline: none; }
    .count { margin: 4px 4px 0; color: var(--ink-2); font-size: 0.9rem; text-shadow: 0 0 10px rgb(var(--veil-rgb)); }
    .hits { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }
    .hits li { padding: 16px 20px; }
    .hits a { font-weight: 700; font-size: 1.05rem; }
    .hits p { margin: 4px 0 0; color: var(--ink-2); font-size: 0.9rem; line-height: 1.7; }
    .note { padding: 16px 20px; color: var(--ink-2); margin: 0; }
    @media (max-width: 996px) {
      /* 1 列の grid の auto だと、折り返せない長い言葉の幅まで広がって画面からはみ出す */
      .narrow { grid-template-columns: minmax(0, 1fr); }
      .hits li { padding: 10px 14px; overflow-wrap: anywhere; }
      .hits a { display: inline-block; min-width: 40px; padding-block: 6px; }
      .box { padding-left: 12px; }
      .box input { min-height: 40px; }
    }
  `,
})
export class Search {
  /** ?q= */
  readonly q = input<string>('');
  private readonly content = inject(ContentService);
  private readonly router = inject(Router);
  protected readonly text = signal('');
  protected readonly data = resource({ loader: () => this.content.search() });

  protected readonly terms = computed(() => norm(this.text()).split(/\s+/).filter(Boolean));

  /** 検索のたびに全ページを norm() し直さないよう、データを読んだときに 1 回だけ作る */
  private readonly prepared = computed<Prepared[]>(() =>
    this.data.hasValue() ? this.data.value().map((entry) => ({ entry, t: norm(entry.t), x: norm(entry.x) })) : [],
  );

  private readonly scored = computed(() => {
    const terms = this.terms();
    if (!terms.length) return [];
    const out: { p: Prepared; score: number }[] = [];
    for (const p of this.prepared()) {
      let score = 0;
      let ok = true;
      for (const term of terms) {
        const inTitle = p.t.includes(term);
        const at = p.x.indexOf(term);
        if (!inTitle && at < 0) {
          ok = false;
          break;
        }
        score += (inTitle ? 20 : 0) + (p.t === term ? 50 : 0) + (at >= 0 ? 1 + Math.min(10, p.x.split(term).length - 1) : 0);
      }
      if (ok) out.push({ p, score });
    }
    return out.sort((a, b) => b.score - a.score);
  });

  protected readonly capped = computed(() => this.scored().length > 100);

  /** 見せる分 (上位 100 件) だけ、抜粋を作る */
  protected readonly hits = computed<Hit[]>(() => {
    const terms = this.terms();
    return this.scored()
      .slice(0, 100)
      .map(({ p, score }) => ({ entry: p.entry, score, snippet: this.snippet(p.entry.x, terms) }));
  });

  constructor() {
    effect(() => this.text.set(this.q() ?? ''));
    inject(Seo).set({ title: '検索', path: '/search' });
  }

  protected submit(e: Event) {
    e.preventDefault();
    void this.router.navigate([], { queryParams: { q: this.text().trim() || null }, replaceUrl: true });
  }

  /** 最初に見つかった所の前後を切り出して、言葉を <mark> で囲む。元の文字を 1 文字ずつ HTML にするので、&lt; などを壊さない */
  private snippet(raw: string, terms: string[]) {
    const { folded, map } = foldWithMap(raw);
    const firstAt = terms.map((t) => folded.indexOf(t)).filter((i) => i >= 0);
    const at = firstAt.length ? Math.min(...firstAt) : 0;
    const from = Math.max(0, at - 50);
    const to = Math.min(folded.length, from + 160);

    // 窓の中で言葉が見つかった範囲 (元の文字列の位置) を集めて、重なるものはまとめる
    const ranges: [number, number][] = [];
    for (const t of terms) {
      for (let i = folded.indexOf(t, from); i >= 0 && i < to; i = folded.indexOf(t, i + t.length)) {
        ranges.push([map[i], map[Math.min(i + t.length, folded.length)]]);
      }
    }
    ranges.sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];
    for (const r of ranges) {
      const last = merged.at(-1);
      if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
      else merged.push([...r]);
    }

    const start = map[from];
    const end = map[to];
    let html = '';
    let pos = start;
    for (const [a, b] of merged) {
      if (b <= start || a >= end) continue;
      const aa = Math.max(a, start);
      const bb = Math.min(b, end);
      html += escapeHtml(raw.slice(pos, aa)) + '<mark>' + escapeHtml(raw.slice(aa, bb)) + '</mark>';
      pos = bb;
    }
    html += escapeHtml(raw.slice(pos, end));
    return (start > 0 ? '…' : '') + html + (end < raw.length ? '…' : '');
  }
}

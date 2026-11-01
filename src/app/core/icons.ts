import { Component, input } from '@angular/core';

// 使うアイコンだけを持つ、小さな SVG アイコン集 (線は currentColor)
const PATHS: Record<string, string> = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.3-4.3',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  sun: 'M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66 1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14-1.41-1.41M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  check: 'M5 12.5 10 17l9-10',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  external: 'M14 4h6v6m0-6-9 9M10 5H5v14h14v-5',
  edit: 'M4 20h4L19 9l-4-4L4 16v4Zm10-14 4 4',
  history: 'M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4m4-1v5l3 2',
  map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14',
  cube: 'M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Zm0 0v0M4 7.5l8 4.5 8-4.5M12 12v9',
  chat: 'M4 5h16v11H9l-5 4V5Zm4 5h.01M12 10h.01M16 10h.01',
  rss: 'M5 5a14 14 0 0 1 14 14M5 11a8 8 0 0 1 8 8M6 18h.01',
  shuffle: 'M4 7h3c4 0 6 10 10 10h3m0 0-3-3m3 3-3 3M4 17h3c1.5 0 2.7-1.4 3.7-3M20 7h-3c-1.5 0-2.7 1.4-3.7 3M20 7l-3-3m3 3-3 3',
  pause: 'M8 5v14M16 5v14',
  play: 'M7 5l12 7-12 7V5Z',
  prev: 'M15 6l-6 6 6 6',
  next: 'M9 6l6 6-6 6',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Zm0 14a2 2 0 0 1 2-2h13',
  users: 'M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1m6.5-9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM21 19v-1a4 4 0 0 0-3-3.9M16 3.1a3.5 3.5 0 0 1 0 6.8',
  train: 'M7 3h10a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2Zm-2 8h14M8 21l2-3m6 3-2-3M9 14.5h.01M15 14.5h.01',
  city: 'M3 21h18M5 21V9l5-3v15m0-11h4v11m0-8 5-2v10',
  plug: 'M9 3v5m6-5v5M6 8h12v3a6 6 0 0 1-12 0V8Zm6 9v4',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  terminal: 'M4 5h16v14H4zM7 9l3 3-3 3m5 0h5',
  data: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  info: 'M12 8h.01M11 12h1v5h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
  network: 'M5 12h14M12 5v14M6.5 6.5l11 11M6.5 17.5l11-11M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  discord: 'M8.5 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2Zm7 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2ZM4 7a14 14 0 0 1 16 0c0 10-4 13-4 13H8S4 17 4 7Z',
};

@Component({
  selector: 'app-icon',
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="d()" /></svg>`,
  styles: `:host { display: inline-flex; width: 1.15em; height: 1.15em; flex: none; } svg { width: 100%; height: 100%; }`,
})
export class Icon {
  readonly name = input.required<string>();
  protected d = () => PATHS[this.name()] ?? '';
}

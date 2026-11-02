import { Component, ElementRef, PLATFORM_ID, afterNextRender, effect, inject, signal, untracked, viewChildren } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MapStage } from './map-stage';
import { BackgroundManifest, Poi } from './map-types';

/** 動画が再生を始めるまで待つ長さ。これを過ぎたら、動画をあきらめて一枚絵にする (遅い回線や壊れたファイルで、画面が暗いままにならないように) */
const PLAY_TIMEOUT = 8000;

/**
 * デスクトップの壁紙およびマップ動画演出。
 * カスケーディング 3D グリッドタイル シャッターによってマップ動画が切り替わる。
 */
@Component({
  selector: 'app-video-background',
  template: `
    @for (slot of slots; track $index) {
      <video
        #video
        muted
        playsinline
        preload="auto"
        disablepictureinpicture
        aria-hidden="true"
        [class.on]="front() === $index && ready()"
        (ended)="onEnded($index)"
        (error)="onError($index)"
      ></video>
    }
    @if (still(); as poster) {
      <img class="still on" [src]="poster" alt="" aria-hidden="true" />
    }
    <div class="veil"></div>

    <!-- グリッドタイル シャッターカバー -->
    <div class="shutter-cover" [class.is-open]="shutterOpen()" [class.is-switching]="switching()" [class.is-done]="done()" aria-hidden="true">
      @for (r of rows(); track r) {
        <ul class="shutter-tile-row" [style.--row-index]="r">
          @for (c of cols; track c) {
            <li class="shutter-tile"></li>
          }
        </ul>
      }
    </div>
  `,
  styleUrl: './video-background.scss',
  host: {
    '[attr.data-mode]': 'stage.mode()',
    '(window:resize)': 'updateGridRows()',
    '(document:visibilitychange)': 'onVisibility()',
  },
})
export class VideoBackground {
  protected readonly stage = inject(MapStage);
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly slots = [0, 1];
  protected readonly cols = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  protected readonly rows = signal<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  private readonly videos = viewChildren<ElementRef<HTMLVideoElement>>('video');

  protected readonly front = signal(0);
  protected readonly ready = signal(false);
  /** 最初は開いた状態 (タイルは見えない)。切り替えの間だけ閉じる。閉じたまま始めると、動画が来るまで画面が真っ暗になる */
  protected readonly shutterOpen = signal(true);
  protected readonly switching = signal(false);
  /** シャッターが開ききったあと。タイルを描かないようにする */
  protected readonly done = signal(true);
  /** 動画を流さないとき (動きを減らす設定・省データ) の一枚絵 */
  protected readonly still = signal<string | null>(null);
  private motion = true;
  private shownIndex = -1;
  /** show() を呼ぶたびに増やす。前の呼び出しの待ち (canplay や timeout) が、あとから効いてしまわないように */
  private seq = 0;
  private doneTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    afterNextRender(() => {
      this.updateGridRows();
      void this.start();
    });

    // UI から名所が変えられたら、その動画へ切り替える
    effect(() => {
      const i = this.stage.index();
      const poi = this.stage.current();
      untracked(() => {
        if (poi && i !== this.shownIndex) this.show(poi, i);
      });
    });
  }

  protected updateGridRows() {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') return;
    const tileH = 46;
    const count = Math.min(28, Math.max(8, Math.ceil(window.innerHeight / tileH)));
    if (count !== this.rows().length) this.rows.set(Array.from({ length: count }, (_, i) => i));
  }

  private async start() {
    const manifest = (await fetch('/background/background.json')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)) as BackgroundManifest | null;
    // 動画の一覧を読めなかったら、青い壁紙のまま
    if (!manifest?.pois.length) return;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    this.motion = !matchMedia('(prefers-reduced-motion: reduce)').matches && !nav.connection?.saveData;
    this.stage.manifest.set(manifest);
    this.show(manifest.pois[0], 0);
  }

  private src(poi: Poi) {
    // AV1 を再生できるなら 1080p の AV1、だめなら 720p の H.264
    const probe = document.createElement('video');
    const av1 = probe.canPlayType('video/mp4; codecs="av01.0.08M.08"') === 'probably';
    return `/background/${av1 ? poi.av1 : poi.h264}`;
  }

  /** 動画をあきらめて、一枚絵を出す。シャッターは開けておく */
  private fallback(poi: Poi) {
    this.motion = false;
    this.still.set(`/background/${poi.poster}`);
    this.openShutter(0);
  }

  private openShutter(delay: number) {
    setTimeout(() => {
      this.switching.set(false);
      this.shutterOpen.set(true);
      // タイルがすべてめくれ終わったら、描くのをやめる
      clearTimeout(this.doneTimer);
      this.doneTimer = setTimeout(() => this.done.set(true), 3600);
    }, delay);
  }

  private show(poi: Poi, i: number) {
    const isFirst = this.shownIndex === -1;
    this.shownIndex = i;
    const seq = ++this.seq;

    if (!this.motion) {
      this.fallback(poi);
      return;
    }

    const videos = this.videos();
    if (videos.length < 2) {
      this.fallback(poi);
      return;
    }

    // 切り替え時は一旦シャッターを閉じる
    if (!isFirst) {
      clearTimeout(this.doneTimer);
      this.done.set(false);
      this.switching.set(true);
      this.shutterOpen.set(false);
    }

    const back = 1 - this.front();
    const v = videos[back].nativeElement;
    v.poster = `/background/${poi.poster}`;
    v.src = this.src(poi);
    v.currentTime = 0;

    let started = false;
    const timeout = setTimeout(() => {
      if (seq === this.seq && !started) this.fallback(poi);
    }, PLAY_TIMEOUT);

    const play = () => {
      if (seq !== this.seq) return;
      v.play()
        .then(() => {
          if (seq !== this.seq) return;
          started = true;
          clearTimeout(timeout);
          this.still.set(null);
          this.front.set(back);
          this.ready.set(true);
          // シャッターをめくり、新しい動画を登場させる
          this.openShutter(isFirst ? 180 : 350);

          // 後ろに回った動画は、フェード・切り替えが終わってから止める
          setTimeout(() => {
            if (seq === this.seq) videos[1 - back].nativeElement.pause();
          }, 1600);
        })
        .catch(() => {
          // 自動再生できない環境では、一枚絵にする
          clearTimeout(timeout);
          if (seq === this.seq) this.fallback(poi);
        });
    };

    if (v.readyState >= 3) {
      play();
    } else {
      v.addEventListener('canplay', play, { once: true });
    }
  }

  protected onEnded(slot: number) {
    if (slot === this.front()) this.stage.next(1);
  }

  /** 読み込めない・壊れた動画のとき。いまの名所は飛ばして、次へ進む (全部だめなら一枚絵) */
  protected onError(slot: number) {
    const v = this.videos()[slot]?.nativeElement;
    if (!v?.getAttribute('src')) return;
    const poi = this.stage.current();
    if (slot !== 1 - this.front() || !poi) return;
    this.fallback(poi);
  }

  /** 見えていないタブでは、動画を止めて電池と通信を節約する */
  protected onVisibility() {
    if (!isPlatformBrowser(this.platformId) || !this.ready()) return;
    const front = this.videos()[this.front()]?.nativeElement;
    if (!front) return;
    if (document.visibilityState === 'hidden') front.pause();
    else void front.play().catch(() => undefined);
  }
}

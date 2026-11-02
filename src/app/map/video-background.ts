import { Component, ElementRef, PLATFORM_ID, afterNextRender, effect, inject, signal, untracked, viewChildren } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MapStage } from './map-stage';
import { BackgroundManifest, Poi } from './map-types';

/**
 * デスクトップの壁紙およびマップ動画演出。
 * カスケーディング 3D グリッドタイル シャッターによってマップ動画が登場・切り替わる。
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
      ></video>
    }
    @if (still(); as poster) {
      <img class="still on" [src]="poster" alt="" aria-hidden="true" />
    }
    <div class="veil"></div>

    <!-- グリッドタイル シャッターカバー -->
    <div class="shutter-cover" [class.is-open]="shutterOpen()" [class.is-switching]="switching()" aria-hidden="true">
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
  host: { '[attr.data-mode]': 'stage.mode()' },
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
  protected readonly shutterOpen = signal(false);
  protected readonly switching = signal(false);
  /** 動画を流さないとき (動きを減らす設定・省データ) の一枚絵 */
  protected readonly still = signal<string | null>(null);
  private motion = true;
  private shownIndex = -1;

  constructor() {
    afterNextRender(() => {
      this.updateGridRows();
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', () => this.updateGridRows());
      }
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

  private updateGridRows() {
    if (!isPlatformBrowser(this.platformId) || typeof window === 'undefined') return;
    const tileH = 46;
    const count = Math.min(28, Math.max(8, Math.ceil(window.innerHeight / tileH)));
    const arr = Array.from({ length: count }, (_, i) => i);
    this.rows.set(arr);
  }

  private async start() {
    const manifest = (await fetch('/background/background.json')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null)) as BackgroundManifest | null;
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

  private show(poi: Poi, i: number) {
    const isFirst = this.shownIndex === -1;
    this.shownIndex = i;

    if (!this.motion) {
      this.still.set(`/background/${poi.poster}`);
      this.shutterOpen.set(true);
      return;
    }

    const videos = this.videos();
    if (videos.length < 2) return;

    // 切り替え時は一旦シャッターを閉じる
    if (!isFirst) {
      this.switching.set(true);
      this.shutterOpen.set(false);
    }

    const back = 1 - this.front();
    const v = videos[back].nativeElement;
    v.poster = `/background/${poi.poster}`;
    v.src = this.src(poi);
    v.currentTime = 0;

    const play = () => {
      v.play()
        .then(() => {
          this.front.set(back);
          this.ready.set(true);
          // シャッターをめくり、新しい動画を劇的に登場させる
          setTimeout(() => {
            this.switching.set(false);
            this.shutterOpen.set(true);
          }, isFirst ? 180 : 350);

          // 後ろに回った動画は、フェード・切り替えが終わってから止める
          setTimeout(() => videos[1 - back].nativeElement.pause(), 1600);
        })
        .catch(() => {
          // 自動再生できない環境では、一枚絵にする
          this.motion = false;
          this.still.set(`/background/${poi.poster}`);
          this.shutterOpen.set(true);
          this.switching.set(false);
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
}

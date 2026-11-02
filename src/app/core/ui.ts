import { Injectable, signal } from '@angular/core';

/** どのページからでも開く、サイト共通のダイアログの開き閉じ */
@Injectable({ providedIn: 'root' })
export class UiState {
  readonly guideOpen = signal(false);
  readonly aiOpen = signal(false);

  openGuide() {
    this.guideOpen.set(true);
  }

  openAi() {
    this.aiOpen.set(true);
  }
}

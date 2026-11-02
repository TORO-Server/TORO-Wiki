import { DOCUMENT, DestroyRef, Directive, ElementRef, afterNextRender, inject, output } from '@angular/core';

/** 開いているダイアログの数。1 つでも開いていれば、後ろのページはスクロールさせない */
let openCount = 0;

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * ダイアログの共通の作法: 開いたら中にフォーカスを移し、Tab が外に出ないようにし、Esc で閉じ、
 * 閉じたら元の場所にフォーカスを戻す。後ろのページのスクロールも止める。
 * `<div role="dialog" appDialog (dialogClose)="close()">` のように付ける (@if で開いている間だけ描くこと)。
 */
@Directive({
  selector: '[appDialog]',
  host: { '(keydown)': 'onKey($event)', tabindex: '-1' },
})
export class Dialog {
  readonly dialogClose = output<void>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly doc = inject(DOCUMENT);
  private previous: HTMLElement | null = null;
  private locked = false;

  constructor() {
    afterNextRender(() => {
      this.previous = this.doc.activeElement instanceof HTMLElement ? this.doc.activeElement : null;
      if (openCount++ === 0) this.doc.documentElement.classList.add('dialog-open');
      this.locked = true;
      const first = this.el.querySelector<HTMLElement>('[autofocus], textarea, input:not([type="hidden"])') ?? this.el.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? this.el).focus({ preventScroll: true });
    });
    inject(DestroyRef).onDestroy(() => {
      if (this.locked && --openCount === 0) this.doc.documentElement.classList.remove('dialog-open');
      const back = this.previous;
      // 押したボタンがもう無いとき (ページが切り替わったなど) は戻さない
      if (back?.isConnected) back.focus({ preventScroll: true });
    });
  }

  protected onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      e.preventDefault();
      this.dialogClose.emit();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = [...this.el.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => x.offsetParent !== null);
    if (!items.length) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = this.doc.activeElement;
    if (e.shiftKey && (active === first || active === this.el)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

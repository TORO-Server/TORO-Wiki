import { Component, DOCUMENT, PLATFORM_ID, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { marked } from 'marked';
import { API_BASE_URL, AuthService } from '../../../core/auth';
import { Icon } from '../../../core/icons';
import { Dialog } from '../../dialog';
import { SITE } from '../../../core/site';

@Component({
  selector: 'app-wiki-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon, Dialog],
  templateUrl: './wiki-editor.component.html',
  styleUrl: './wiki-editor.component.scss',
  host: {
    '(window:beforeunload)': 'onBeforeUnload($event)',
    '(document:keydown)': 'onKey($event)',
  },
})
export class WikiEditorComponent {
  readonly path = input.required<string>();
  readonly title = input<string>('');
  readonly isOpen = input<boolean>(false);

  readonly close = output<void>();
  readonly saved = output<void>();

  protected readonly auth = inject(AuthService);
  protected readonly site = SITE;
  private readonly doc = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly loading = signal<boolean>(false);
  protected readonly saving = signal<boolean>(false);
  protected readonly content = signal<string>('');
  /** 読み込んだときの本文。これと違えば「未保存の変更あり」 */
  private readonly original = signal<string>('');
  protected readonly sha = signal<string>('');
  protected readonly message = signal<string>('');
  protected readonly activeTab = signal<'split' | 'edit' | 'preview'>('split');
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  protected readonly githubEditUrl = computed(() => `${SITE.repo}/edit/main/${this.path()}`);
  protected readonly dirty = computed(() => this.isOpen() && !this.loading() && this.content() !== this.original());
  protected readonly canSave = computed(() => !this.loading() && !this.saving() && !!this.auth.user()?.can_edit && this.dirty());

  /**
   * プレビュー。本文は誰でも提案できるので、書いてある HTML をそのまま描くと、開いた人のログインで悪さができてしまう。
   * そのため Angular の標準のサニタイズ (script や on○○ 属性などを取り除く) に任せ、バイパスはしない。
   */
  protected readonly previewHtml = computed<string>(() => {
    const raw = this.content();
    if (!raw) return '';
    try {
      return marked.parse(raw, { async: false }) as string;
    } catch {
      return '';
    }
  });

  protected readonly charCount = computed(() => this.content().length);

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const p = this.path();
      if (open && p && this.browser) {
        // モバイル幅の場合は初期表示を edit タブにする
        this.activeTab.set(window.innerWidth <= 768 ? 'edit' : 'split');
        void this.loadFile(p);
      }
    });
  }

  async loadFile(filePath: string) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      const res = await fetch(`${API_BASE_URL}/docs/raw?path=${encodeURIComponent(filePath)}`);
      if (!res.ok) {
        throw new Error(`ファイル取得に失敗しました (${res.status})`);
      }
      const data = (await res.json()) as { content: string; sha: string };
      this.content.set(data.content || '');
      this.original.set(data.content || '');
      this.sha.set(data.sha || '');
      this.message.set(`${this.title() || filePath} を編集`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  async save() {
    const user = this.auth.user();
    if (!user || !user.can_edit) {
      this.error.set('編集権限がありません。Discordでログインしているか確認してください。');
      return;
    }
    if (this.saving()) return;

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const token = await this.auth.getApiToken();
      if (!token) {
        throw new Error('ログインの期限が切れました。ログインし直してください。');
      }
      const res = await fetch(`${API_BASE_URL}/docs/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          path: this.path(),
          content: this.content(),
          sha: this.sha() || undefined,
          message: this.message() || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        // 読み込んだあとに、ほかの人が同じページを保存したとき
        if (res.status === 409 || /409|does not match/i.test(data.error ?? '')) {
          throw new Error('このページは、読み込んだあとに別の人が更新しました。書いた内容を手元にコピーしてから、編集画面を開き直してください。');
        }
        throw new Error(data.error || `保存に失敗しました (${res.status})`);
      }

      this.original.set(this.content());
      this.success.set('GitHub へのコミットが完了しました。自動ビルド後に反映されます。');
      this.saved.emit();
      setTimeout(() => {
        this.close.emit();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.error.set(msg);
    } finally {
      this.saving.set(false);
    }
  }

  loginWithDiscord() {
    this.auth.login();
  }

  /** 暗い所をクリックしただけで、書いた内容が消えないようにする (未保存なら確認する) */
  onBackdrop() {
    this.onClose();
  }

  onClose() {
    if (this.saving()) return;
    if (this.dirty() && !this.doc.defaultView?.confirm('保存していない変更があります。破棄して閉じますか？')) return;
    this.close.emit();
  }

  protected onKey(e: KeyboardEvent) {
    if (!this.isOpen()) return;
    // Ctrl / Cmd + S で保存
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (this.canSave()) void this.save();
    }
  }

  protected onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.dirty()) e.preventDefault();
  }
}

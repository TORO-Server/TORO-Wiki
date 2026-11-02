import { Component, PLATFORM_ID, computed, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { AuthService, AUTH_BASE_URL } from '../../../core/auth';
import { Icon } from '../../../core/icons';
import { SITE } from '../../../core/site';

@Component({
  selector: 'app-wiki-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, Icon],
  templateUrl: './wiki-editor.component.html',
  styleUrl: './wiki-editor.component.scss',
})
export class WikiEditorComponent {
  readonly path = input.required<string>();
  readonly title = input<string>('');
  readonly isOpen = input<boolean>(false);

  readonly close = output<void>();
  readonly saved = output<void>();

  protected readonly auth = inject(AuthService);
  protected readonly site = SITE;
  private readonly sanitizer = inject(DomSanitizer);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly loading = signal<boolean>(false);
  protected readonly saving = signal<boolean>(false);
  protected readonly content = signal<string>('');
  protected readonly sha = signal<string>('');
  protected readonly message = signal<string>('');
  protected readonly activeTab = signal<'split' | 'edit' | 'preview'>('split');
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  protected readonly githubEditUrl = computed(() => `${SITE.repo}/edit/main/${this.path()}`);

  protected readonly previewHtml = computed<SafeHtml>(() => {
    const raw = this.content();
    if (!raw) return '';
    try {
      const html = marked.parse(raw, { async: false }) as string;
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch {
      return '';
    }
  });

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const p = this.path();
      if (open && p && this.browser) {
        // モバイル幅の場合は初期表示を edit タブにする
        if (window.innerWidth <= 768) {
          this.activeTab.set('edit');
        } else {
          this.activeTab.set('split');
        }
        void this.loadFile(p);
      }
    });
  }

  async loadFile(filePath: string) {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);
    try {
      const res = await fetch(`${AUTH_BASE_URL}/api/docs/raw?path=${encodeURIComponent(filePath)}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`ファイル取得に失敗しました (${res.status})`);
      }
      const data = (await res.json()) as { content: string; sha: string };
      this.content.set(data.content || '');
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

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      const res = await fetch(`${AUTH_BASE_URL}/api/docs/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          path: this.path(),
          content: this.content(),
          sha: this.sha() || undefined,
          message: this.message() || undefined,
        }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || `保存に失敗しました (${res.status})`);
      }

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

  onClose() {
    if (this.saving()) return;
    this.close.emit();
  }
}

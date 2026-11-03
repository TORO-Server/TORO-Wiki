import { Component, PLATFORM_ID, effect, inject, input, output, signal, untracked } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService, ConnectorInfo } from '../../../core/auth';
import { Icon } from '../../../core/icons';
import { Dialog } from '../../dialog';

@Component({
  selector: 'app-ai-connector-modal',
  standalone: true,
  imports: [CommonModule, Icon, Dialog],
  templateUrl: './ai-connector-modal.component.html',
  styleUrl: './ai-connector-modal.component.scss',
})
export class AiConnectorModalComponent {
  readonly isOpen = input<boolean>(false);
  readonly close = output<void>();

  protected readonly auth = inject(AuthService);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly loading = signal<boolean>(false);
  protected readonly info = signal<ConnectorInfo | null>(null);
  protected readonly copiedField = signal<string | null>(null);
  protected readonly activeTab = signal<'claude' | 'chatgpt' | 'gemini'>('claude');

  constructor() {
    // 開いたとき (ログイン済みなら) トークンを発行する。これまで誰も onOpen() を呼んでおらず、ログインしていても中身が空だった
    effect(() => {
      if (this.isOpen() && this.auth.user()) untracked(() => void this.onOpen());
    });
  }

  async onOpen() {
    if (!this.browser) return;
    this.loading.set(true);
    try {
      const data = await this.auth.getAiConnectors();
      this.info.set(data);
    } finally {
      this.loading.set(false);
    }
  }

  async copyText(text: string, fieldName: string) {
    if (!this.browser) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // クリップボードを使えない環境 (http など) では、文字を選んでコピーしてもらう
      this.copiedField.set(null);
      return;
    }
    this.copiedField.set(fieldName);
    setTimeout(() => {
      if (this.copiedField() === fieldName) {
        this.copiedField.set(null);
      }
    }, 2000);
  }

  get claudeConfigJson(): string {
    const i = this.info();
    if (!i) return '';
    return JSON.stringify(i.connectors.claude_mcp.config_example, null, 2);
  }
}

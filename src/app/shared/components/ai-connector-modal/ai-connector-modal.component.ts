import { Component, PLATFORM_ID, inject, input, output, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService, ConnectorInfo } from '../../../core/auth';
import { Icon } from '../../../core/icons';

@Component({
  selector: 'app-ai-connector-modal',
  standalone: true,
  imports: [CommonModule, Icon],
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

  copyText(text: string, fieldName: string) {
    if (!this.browser) return;
    void navigator.clipboard.writeText(text);
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

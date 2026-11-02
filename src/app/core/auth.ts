import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AuthUser {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  avatar_url: string;
  can_edit: boolean;
  roles: string[];
}

export interface ConnectorInfo {
  token: string;
  expires_at: string;
  connectors: {
    claude_mcp: {
      type: string;
      url: string;
      config_example: Record<string, unknown>;
    };
    chatgpt: {
      type: string;
      schema_url: string;
      auth_type: string;
      token: string;
    };
    gemini: {
      type: string;
      schema_url: string;
      token: string;
    };
  };
}

export const AUTH_BASE_URL = 'https://auth.torosaba.net';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly user = signal<AuthUser | null>(null);
  readonly loading = signal<boolean>(true);
  readonly initialized = signal<boolean>(false);

  constructor() {
    if (this.browser) {
      void this.checkAuth();
    } else {
      this.loading.set(false);
      this.initialized.set(true);
    }
  }

  async checkAuth(): Promise<AuthUser | null> {
    if (!this.browser) return null;
    this.loading.set(true);
    try {
      const res = await fetch(`${AUTH_BASE_URL}/api/auth/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = (await res.json()) as { authenticated: boolean; user: AuthUser | null };
        if (data.authenticated && data.user) {
          this.user.set(data.user);
          return data.user;
        }
      }
      this.user.set(null);
      return null;
    } catch (e) {
      console.warn('Auth check failed:', e);
      this.user.set(null);
      return null;
    } finally {
      this.loading.set(false);
      this.initialized.set(true);
    }
  }

  login(returnTo?: string) {
    if (!this.browser) return;
    const target = returnTo || window.location.href;
    window.location.href = `${AUTH_BASE_URL}/api/auth/login?redirect=${encodeURIComponent(target)}`;
  }

  async logout(): Promise<void> {
    if (!this.browser) return;
    try {
      // Accept を付けると、リダイレクトではなく JSON で答えてくれる
      await fetch(`${AUTH_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    this.user.set(null);
    window.location.reload();
  }

  async getAiConnectors(): Promise<ConnectorInfo | null> {
    if (!this.browser) return null;
    try {
      const res = await fetch(`${AUTH_BASE_URL}/api/auth/token`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        return (await res.json()) as ConnectorInfo;
      }
      return null;
    } catch (e) {
      console.error('Failed to get AI connector info:', e);
      return null;
    }
  }
}

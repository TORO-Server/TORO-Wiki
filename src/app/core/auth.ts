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

export const AUTH_BASE_URL = 'https://auth.torosaba.net';
export const API_BASE_URL = 'https://api.torosaba.net';

/** 期限のこの秒数前には取り直す */
const API_TOKEN_MARGIN_SECONDS = 30;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly user = signal<AuthUser | null>(null);
  readonly loading = signal<boolean>(true);
  readonly initialized = signal<boolean>(false);

  private apiToken: { value: string; expiresAt: number } | null = null;

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
      const res = await fetch(`${AUTH_BASE_URL}/session`, {
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
    window.location.href = `${AUTH_BASE_URL}/login?redirect=${encodeURIComponent(target)}`;
  }

  async logout(): Promise<void> {
    if (!this.browser) return;
    try {
      // Accept を付けると、リダイレクトではなく JSON で答えてくれる
      await fetch(`${AUTH_BASE_URL}/logout`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
    } catch {
      // ignore
    }
    this.apiToken = null;
    this.user.set(null);
    window.location.reload();
  }

  /**
   * API (api.torosaba.net) を呼ぶための短い期限のトークン。
   * ログインの Cookie は auth.torosaba.net にしか届かないので、ここで換えてもらう。メモリにだけ持つ。
   */
  async getApiToken(): Promise<string | null> {
    if (!this.browser) return null;
    const now = Date.now() / 1000;
    if (this.apiToken && this.apiToken.expiresAt - API_TOKEN_MARGIN_SECONDS > now) {
      return this.apiToken.value;
    }
    try {
      const res = await fetch(`${AUTH_BASE_URL}/session-token`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = (await res.json()) as { token: string; expires_in: number };
      this.apiToken = { value: data.token, expiresAt: now + data.expires_in };
      return data.token;
    } catch (e) {
      console.error('Failed to get API token:', e);
      return null;
    }
  }
}

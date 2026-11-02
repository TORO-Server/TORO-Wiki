export interface Env {
  DISCORD_CLIENT_ID: string;
  DISCORD_CLIENT_SECRET: string;
  DISCORD_REDIRECT_URI?: string;
  DISCORD_GUILD_ID?: string;
  DISCORD_REQUIRED_ROLE_ID?: string;
  DISCORD_BOT_TOKEN?: string;
  GITHUB_TOKEN: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  JWT_SECRET: string;
  COOKIE_DOMAIN?: string;
  /** ログイン・編集の API を呼んでよいサイトを足す (カンマ区切り。既定は https://wiki.torosaba.net)。開発中は http://localhost:4200 など */
  ALLOWED_ORIGINS?: string;
}

export interface UserSession {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  avatar_url: string;
  can_edit: boolean;
  roles: string[];
  iat: number;
  exp: number;
  /** AI コネクタ用のトークンには 'ai_connector' が入る (ブラウザーのログインにはない) */
  type?: string;
}

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
}

export interface DiscordGuildMember {
  roles: string[];
  nick: string | null;
  joined_at: string;
}

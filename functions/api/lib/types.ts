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

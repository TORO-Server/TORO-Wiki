import { Env, DiscordUser, DiscordGuildMember, UserSession } from '../lib/types';
import { signJwt } from '../lib/jwt';
import { buildSessionCookie } from '../lib/auth';
import { errorResponse } from '../lib/response';

export const onRequest: PagesFunction<Env> = async (context) => {
  const env = context.env;
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const stateParam = url.searchParams.get('state');

  if (!code) {
    return errorResponse('Missing code parameter', 400);
  }

  let returnTo = '/wiki';
  if (stateParam) {
    try {
      const stateData = JSON.parse(atob(stateParam));
      if (stateData.returnTo && stateData.returnTo.startsWith('/')) {
        returnTo = stateData.returnTo;
      }
    } catch {
      // ignore
    }
  }

  const redirectUri = env.DISCORD_REDIRECT_URI || `${url.origin}/api/auth/callback`;

  // 1. Token 交換
  const tokenParams = new URLSearchParams();
  tokenParams.set('client_id', env.DISCORD_CLIENT_ID);
  tokenParams.set('client_secret', env.DISCORD_CLIENT_SECRET);
  tokenParams.set('grant_type', 'authorization_code');
  tokenParams.set('code', code);
  tokenParams.set('redirect_uri', redirectUri);

  const tokenRes = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenParams.toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error('Discord token exchange failed:', errText);
    return errorResponse('Failed to exchange code with Discord', 400, errText);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string; token_type: string };
  const accessToken = tokenData.access_token;

  // 2. ユーザープロファイル取得
  const userRes = await fetch('https://discord.com/api/v10/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userRes.ok) {
    return errorResponse('Failed to fetch Discord user', 400);
  }

  const user = (await userRes.json()) as DiscordUser;

  // アバター URL の算出
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discriminator || '0', 10) % 5}.png`;

  // 3. ギルド所属およびロールの検証 (設定されている場合)
  let roles: string[] = [];
  let isMember = true;
  let canEdit = true;

  if (env.DISCORD_GUILD_ID) {
    // ユーザーのアクセストークンでギルドメンバー情報を取得
    const memberRes = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${env.DISCORD_GUILD_ID}/member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (memberRes.status === 404) {
      isMember = false;
      canEdit = false;
    } else if (memberRes.ok) {
      const member = (await memberRes.json()) as DiscordGuildMember;
      roles = member.roles || [];

      // 特定のロールが必要な場合
      if (env.DISCORD_REQUIRED_ROLE_ID) {
        canEdit = roles.includes(env.DISCORD_REQUIRED_ROLE_ID);
      }
    } else {
      // ボットトークンがある場合のフォールバック検証
      if (env.DISCORD_BOT_TOKEN) {
        const botMemberRes = await fetch(
          `https://discord.com/api/v10/guilds/${env.DISCORD_GUILD_ID}/members/${user.id}`,
          {
            headers: {
              Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`,
            },
          }
        );
        if (botMemberRes.ok) {
          const member = (await botMemberRes.json()) as DiscordGuildMember;
          roles = member.roles || [];
          if (env.DISCORD_REQUIRED_ROLE_ID) {
            canEdit = roles.includes(env.DISCORD_REQUIRED_ROLE_ID);
          }
        } else {
          isMember = false;
          canEdit = false;
        }
      }
    }
  }

  if (!isMember) {
    // TORO Server Discord に参加していない場合
    const inviteUrl = 'https://discord.gg/j7qKSPgSSt';
    const html = `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="utf-8"><title>認証エラー - TORO Server Wiki</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.6;">
  <h2>TORO Server の Discord への参加が必要です</h2>
  <p>こんにちは、<strong>${user.global_name || user.username}</strong> さん。</p>
  <p>Wiki の編集には TORO Server の公式 Discord サーバーへの参加が必要です。</p>
  <p><a href="${inviteUrl}" target="_blank" style="display: inline-block; padding: 10px 18px; background: #5865F2; color: #fff; text-decoration: none; border-radius: 4px;">TORO Server Discord に参加する</a></p>
  <p><a href="/wiki">Wiki トップへ戻る</a></p>
</body></html>`;
    return new Response(html, {
      status: 403,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // 4. セッショントークン (JWT) の発行
  const now = Math.floor(Date.now() / 1000);
  const session: UserSession = {
    id: user.id,
    username: user.username,
    global_name: user.global_name,
    avatar: user.avatar,
    avatar_url: avatarUrl,
    can_edit: canEdit,
    roles,
    iat: now,
    exp: now + 30 * 24 * 60 * 60, // 30日間有効
  };

  const jwt = await signJwt(session as unknown as Record<string, unknown>, env.JWT_SECRET);
  const cookie = buildSessionCookie(jwt, env.COOKIE_DOMAIN);

  const destination = new URL(returnTo, url.origin).toString();
  return new Response(null, {
    status: 302,
    headers: {
      Location: destination,
      'Set-Cookie': cookie,
    },
  });
};

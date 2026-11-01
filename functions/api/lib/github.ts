import { Env, UserSession } from './types';

// UTF-8 文字列と Base64 の相互変換 (Unicode / 日本語対応)
export function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToUtf8(base64: string): string {
  const cleaned = base64.replace(/\s/g, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export interface GitHubFileResult {
  path: string;
  sha: string;
  content: string;
  size: number;
}

export async function getGitHubFile(env: Env, filePath: string): Promise<GitHubFileResult | null> {
  const owner = env.GITHUB_OWNER || 'TORO-Server';
  const repo = env.GITHUB_REPO || 'TORO-Wiki-Site';
  const branch = env.GITHUB_BRANCH || 'main';

  // パスの正規化 (docs/ から始まるように保証)
  let cleanPath = filePath.replace(/^\/+/, '');
  if (!cleanPath.startsWith('docs/')) {
    cleanPath = `docs/${cleanPath}`;
  }
  if (!cleanPath.endsWith('.md')) {
    cleanPath = `${cleanPath}.md`;
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(cleanPath)}?ref=${encodeURIComponent(branch)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'TORO-Wiki-Editor-Cloudflare',
    },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GitHub API error (${res.status}): ${errorText}`);
  }

  const data = (await res.json()) as { content: string; sha: string; path: string; size: number };
  return {
    path: data.path,
    sha: data.sha,
    content: base64ToUtf8(data.content),
    size: data.size,
  };
}

export interface CommitFileOptions {
  path: string;
  content: string;
  sha?: string;
  message?: string;
  user: UserSession;
}

export async function commitGitHubFile(
  env: Env,
  options: CommitFileOptions
): Promise<{ commitSha: string; contentSha: string }> {
  const owner = env.GITHUB_OWNER || 'TORO-Server';
  const repo = env.GITHUB_REPO || 'TORO-Wiki-Site';
  const branch = env.GITHUB_BRANCH || 'main';

  let cleanPath = options.path.replace(/^\/+/, '');
  if (!cleanPath.startsWith('docs/')) {
    cleanPath = `docs/${cleanPath}`;
  }
  if (!cleanPath.endsWith('.md')) {
    cleanPath = `${cleanPath}.md`;
  }

  // SHA が渡されていない場合、既存ファイルの SHA を取得
  let currentSha = options.sha;
  if (!currentSha) {
    const existing = await getGitHubFile(env, cleanPath);
    if (existing) {
      currentSha = existing.sha;
    }
  }

  const displayName = options.user.global_name || options.user.username;
  const commitMessage = options.message
    ? `${options.message}\n\nCo-authored-by: ${displayName} <${options.user.id}+discord@users.noreply.torosaba.net>`
    : `Wiki update: ${cleanPath}\n\nEdited via Browser/API by Discord user ${displayName} (${options.user.id})`;

  const payload: Record<string, unknown> = {
    message: commitMessage,
    content: utf8ToBase64(options.content),
    branch,
    committer: {
      name: `${displayName} (via Discord)`,
      email: `${options.user.id}+discord@users.noreply.torosaba.net`,
    },
    author: {
      name: `${displayName} (via Discord)`,
      email: `${options.user.id}+discord@users.noreply.torosaba.net`,
    },
  };

  if (currentSha) {
    payload.sha = currentSha;
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(cleanPath)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'TORO-Wiki-Editor-Cloudflare',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GitHub Commit error (${res.status}): ${errorText}`);
  }

  const result = (await res.json()) as { commit: { sha: string }; content: { sha: string } };
  return {
    commitSha: result.commit.sha,
    contentSha: result.content.sha,
  };
}

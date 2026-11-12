// ng build のあと: GitHub Pages 用に 404.html を置く
import { copyFile, access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL } from './content.config.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'dist', 'toro-website', 'browser');

// プリレンダーしていない URL (GitHub Pages では 404) も、アプリが開いて「見つかりません」を出せるようにする
const csr = join(OUT, 'index.csr.html');
const fallback = join(OUT, '404', 'index.html');
try {
  await access(fallback);
  await copyFile(fallback, join(OUT, '404.html'));
} catch {
  await copyFile(csr, join(OUT, '404.html'));
}
console.log('postbuild: 404.html');

// 検索ページは画面側で描く (プリレンダーしない) ので、アプリの殻を /search/ に置く。
// 置かないと、/search?q=... を直接開いたり共有したりしたときに、描画はされても HTTP の状態が 404 になる
try {
  await access(join(OUT, 'search', 'index.html'));
} catch {
  await mkdir(join(OUT, 'search'), { recursive: true });
  await copyFile(csr, join(OUT, 'search', 'index.html'));
}
console.log('postbuild: search/index.html');

// 旧 URL (/wiki/<slug>/) からルート URL (/<slug>/) への静的リダイレクト HTML を生成
function redirectHtml(targetSlug: string): string {
  const encSlug = encodeURIComponent(targetSlug);
  const targetPath = `/${encSlug}/`;
  const canonicalUrl = `${SITE_URL}${targetPath}`;
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <link rel="canonical" href="${canonicalUrl}">
  <meta http-equiv="refresh" content="0; url=${targetPath}">
  <script>location.replace('/' + encodeURIComponent(${JSON.stringify(targetSlug)}) + '/' + location.search + location.hash);</script>
</head>
<body>
  <p>Redirecting to <a href="${targetPath}">${targetPath}</a>...</p>
</body>
</html>
`;
}

const indexRaw = await readFile(join(ROOT, 'public', 'content', 'index.json'), 'utf8');
const index = JSON.parse(indexRaw);
let redirectCount = 0;
for (const page of index.pages) {
  const dir = join(OUT, 'wiki', page.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, 'index.html'), redirectHtml(page.slug));
  redirectCount++;
}
console.log(`postbuild: generated ${redirectCount} article redirects under /wiki/<slug>/`);


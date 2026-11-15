// ng build のあと: GitHub Pages 用に 404.html を置く
import { copyFile, access, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_URL, ALIASES } from './content.config.ts';

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

// ファイルシステムが大文字・小文字を区別するか判定
async function isCaseSensitive(dir: string): Promise<boolean> {
  const testUpper = join(dir, '.case_test_ABC');
  const testLower = join(dir, '.case_test_abc');
  try {
    await writeFile(testUpper, 'A');
    try {
      await access(testLower);
      return false;
    } catch {
      return true;
    }
  } catch {
    return false;
  } finally {
    await rm(testUpper, { force: true });
  }
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

// エイリアスリダイレクト (/Worldguard/ -> /WorldGuard/ など) を生成
const caseSensitive = await isCaseSensitive(OUT);
let aliasCount = 0;
for (const [oldSlug, newSlug] of Object.entries(ALIASES)) {
  // /wiki/<oldSlug>/ -> /<newSlug>/
  const wikiDir = join(OUT, 'wiki', oldSlug);
  await mkdir(wikiDir, { recursive: true });
  await writeFile(join(wikiDir, 'index.html'), redirectHtml(newSlug));
  aliasCount++;

  // /<oldSlug>/ -> /<newSlug>/
  // 大文字・小文字のみの違いの場合、Windows (NTFS) では同一フォルダとみなされて正規記事が上書きされるため
  // 大文字・小文字を区別するファイルシステム (Linux CI / GitHub Pages) または名前が異なる場合のみ生成する
  if (caseSensitive || oldSlug.toLowerCase() !== newSlug.toLowerCase()) {
    const rootDir = join(OUT, oldSlug);
    await mkdir(rootDir, { recursive: true });
    await writeFile(join(rootDir, 'index.html'), redirectHtml(newSlug));
    aliasCount++;
  }
}
console.log(`postbuild: generated ${aliasCount} alias redirects (caseSensitive=${caseSensitive})`);

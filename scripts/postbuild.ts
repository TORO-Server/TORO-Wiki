// ng build のあと: GitHub Pages 用に 404.html を置く
import { copyFile, access, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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

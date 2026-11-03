// TORO-Server/TORO-SVG のロゴから、ファビコン・PWA のアイコン・OGP 画像を作る (手で実行して、結果をコミットする)
//   node scripts/build-icons.mjs
import { mkdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const logo = await readFile(join(PUBLIC, 'logo.svg'));

await sharp(logo, { density: 300 }).resize(180, 180).png().toFile(join(PUBLIC, 'apple-touch-icon.png'));
await sharp(logo, { density: 300 }).resize(32, 32).png().toFile(join(PUBLIC, 'favicon-32.png'));

// PWA (manifest.webmanifest) のアイコン
await mkdir(join(PUBLIC, 'icons'), { recursive: true });
for (const size of [192, 512]) {
  await sharp(logo, { density: 300 }).resize(size, size).png().toFile(join(PUBLIC, 'icons', `icon-${size}.png`));
}
// maskable: 円や角丸に切り抜かれても文字が欠けないよう、ロゴを 64% に縮めて中央 (安全領域 80% の内側) に置く。
// 周りは、ロゴと同じ左黒・右白の背景で埋める
const inner = Math.round(512 * 0.64);
const shrunk = await sharp(logo, { density: 300 }).resize(inner, inner).png().toBuffer();
const split = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="256" height="512" fill="#000"/><rect x="256" width="256" height="512" fill="#fff"/>
</svg>`);
await sharp(split)
  .composite([{ input: shrunk, left: (512 - inner) / 2, top: (512 - inner) / 2 }])
  .png()
  .toFile(join(PUBLIC, 'icons', 'icon-maskable-512.png'));

// OGP: XP のデスクトップに、Wiki のウィンドウを 1 枚置いた絵
const W = 1200;
const H = 630;
const mark = await sharp(logo, { density: 300 }).resize(200, 200).png().toBuffer();
const scene = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="title" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0997ff"/><stop offset="0.08" stop-color="#0053ee"/>
      <stop offset="0.9" stop-color="#0066ff"/><stop offset="1" stop-color="#003dd7"/>
    </linearGradient>
    <linearGradient id="desk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4f86c6"/><stop offset="1" stop-color="#2f5f99"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#desk)"/>
  <rect x="90" y="95" width="1020" height="440" rx="10" fill="#ece9d8" stroke="#0831d9" stroke-width="2"/>
  <path d="M90 105 a10 10 0 0 1 10 -10 h1000 a10 10 0 0 1 10 10 v52 h-1020 z" fill="url(#title)"/>
  <text x="120" y="138" font-family="Trebuchet MS, Tahoma, sans-serif" font-weight="700" font-size="30" fill="#fff">TORO Server Wiki</text>
  <rect x="110" y="170" width="980" height="345" fill="#fff" stroke="#7f9db9"/>
  <text x="380" y="320" font-family="Trebuchet MS, Tahoma, sans-serif" font-weight="700" font-size="76" fill="#003399">TORO Server Wiki</text>
  <text x="384" y="390" font-family="Yu Gothic UI, Meiryo, sans-serif" font-size="32" fill="#333">マインクラフト・クリエイティブサーバーの Wiki</text>
</svg>`);
await sharp(scene)
  .composite([{ input: mark, left: 150, top: 240 }])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(join(PUBLIC, 'og.jpg'));
console.log('icons written');

// BlueMap (3d-map.torosaba.net) を GPU で描画したまま一コマずつ撮影して、背景の動画を作る。
// 細かいブロック (hires タイル) まで読み込み終わってから撮るので、ブラウザーで直接動かすより綺麗になる。
//
//   node scripts/render-background.ts                 すべての名所を撮って public/background に書き出す
//   node scripts/render-background.ts spawn wayama    指定した名所だけ
//   node scripts/render-background.ts --frames 30     試し撮り (先頭の 30 コマだけ)
//   node scripts/render-background.ts --encode-only   撮り直さず、中間ファイルから Web 用の動画だけ作り直す
//
// 必要なもの: Google Chrome, ffmpeg (libx264, libsvtav1。あれば h264_nvenc で中間ファイルを速く作る)
import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer, { type Browser, type Page } from 'puppeteer-core';
import { BLUEMAP_URL, BLUEMAP_MAP, VIDEO, POIS } from './background.config.ts';
import type { Poi } from './background.config.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'background');
const WORK = join(ROOT, '.cache', 'background');
const CHROME =
  process.env['CHROME_PATH'] ??
  ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].find(existsSync);

const args = process.argv.slice(2);
const encodeOnly = args.includes('--encode-only');
const frameLimit = args.includes('--frames') ? Number(args[args.indexOf('--frames') + 1]) : Infinity;
const only = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--frames');
const targets = only.length ? POIS.filter((p) => only.includes(p.id)) : POIS;

function run(cmd: string, argv: string[], opts = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, argv, { stdio: ['ignore', 'inherit', 'inherit'], ...opts });
    p.on('error', reject);
    p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function hasEncoder(name: string): Promise<boolean> {
  return new Promise((resolve) => {
    const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=black:s=256x256:d=0.1', '-c:v', name, '-f', 'null', '-']);
    p.on('exit', (code) => resolve(code === 0));
    p.on('error', () => resolve(false));
  });
}

/** ページの中で動かす: UI を隠し、カメラの操作を自分で持つ */
function setup({ hires, lowres, cameraFar }: { hires: number; lowres: number; cameraFar: number }) {
  const style = document.createElement('style');
  // 地図は body の直下 (BlueMap の webapp) か、#__nuxt の中 (map-web の Nuxt の画面) にある
  style.textContent = `
    body > :not(#map-container):not(:has(#map-container)),
    #map-container ~ * { display: none !important; }
    #map-container > div > div { display: none !important; }
  `;
  document.head.appendChild(style);
  const app = (window as any).bluemap;
  if (!app) return;
  // アプリがカメラの移動に合わせて読み込み範囲を戻さないようにする
  app.cameraMoved = () => {};
  app.updatePageAddress = () => {};
  if (app.mapViewer) {
    app.mapViewer.superSampling = 1;
    if (app.mapViewer.data) {
      app.mapViewer.data.loadedHiresViewDistance = hires;
      app.mapViewer.data.loadedLowresViewDistance = lowres;
    }
    const camera = app.mapViewer.camera;
    if (camera && camera.far < cameraFar) {
      camera.far = cameraFar;
      if (typeof camera.updateProjectionMatrix === 'function') {
        camera.updateProjectionMatrix();
      }
    }
  }
}

function setCamera({
  x,
  y,
  z,
  distance,
  rotation,
  angle,
  hires,
  lowres,
  cameraFar,
}: {
  x: number;
  y: number;
  z: number;
  distance: number;
  rotation: number;
  angle: number;
  hires: number;
  lowres: number;
  cameraFar: number;
}) {
  const mv = (window as any).bluemap?.mapViewer;
  if (!mv) return;
  const cm = mv.controlsManager;
  if (cm) {
    cm.position.set(x, y, z);
    cm.distance = distance;
    cm.rotation = rotation;
    cm.angle = angle;
    cm.tilt = 0;
    cm.ortho = 0;
  }
  mv.loadMapArea(x, z, hires, lowres);
  const camera = mv.camera;
  if (camera && camera.far < cameraFar) {
    camera.far = cameraFar;
    if (typeof camera.updateProjectionMatrix === 'function') {
      camera.updateProjectionMatrix();
    }
  }
}

/** タイルの読み込み状況を取得 */
function getTileLoadingCount(): number {
  const m = (window as any).bluemap?.mapViewer?.map;
  if (!m) return -1;
  const hm = m.hiresTileManager;
  const lm = m.lowresTileManager || [];
  let sum = hm ? hm.currentlyLoading : 0;
  for (const l of lm) {
    if (l && typeof l.currentlyLoading === 'number') {
      sum += l.currentlyLoading;
    }
  }
  return sum;
}

/** MarumaSign の看板画像の読み込みが落ち着いたか (スクリプトがないときは常に true) */
function signsIdle(): boolean {
  const s = (window as any).marumasign3d?.stats?.();
  return !s || (s.loading === 0 && s.queued === 0);
}

/**
 * 3D マップの MarumaSign の看板 (map-web の app/bluemap/marumasign/) のデータを、撮影用に変更して返す。
 */
async function interceptSigns(page: Page, drawDistance: number): Promise<void> {
  const cache = new Map<string, Promise<{ status: number; type: string; body: string }>>();
  const upstream = async (url: string) => {
    if (!cache.has(url)) {
      cache.set(
        url,
        fetch(url).then(async (r) => ({
          status: r.status,
          type: r.headers.get('content-type') ?? '',
          body: await r.text(),
        })),
      );
    }
    return cache.get(url)!;
  };
  await page.setRequestInterception(true);
  page.on('request', async (req) => {
    const url = req.url();
    try {
      if (/\/marumasign\/[^/?]+\.json/.test(url)) {
        const r = await upstream(url);
        if (r.status !== 200) return req.respond({ status: r.status, body: r.body });
        const json = JSON.parse(r.body);
        Object.assign(json, {
          drawDistance,
          fullDrawDistance: true,
          maxActive: 1000,
          textureSize: 256,
          hideBoards: true,
          labels: false,
        });
        return req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
      }
    } catch (e: any) {
      console.warn(`看板のデータを差し替えられませんでした: ${e.message}`);
    }
    return req.continue();
  });
}

/** タイル読み込みの完了または安定化を待機 */
async function waitTilesSettled(page: Page, stableMs: number, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  let lastCount = -1;
  let countSince = 0;
  while (Date.now() - start < timeoutMs) {
    const count = await page.evaluate(getTileLoadingCount);
    if (count === 0) {
      return true;
    }
    if (count !== -1) {
      if (count === lastCount) {
        if (!countSince) countSince = Date.now();
        if (Date.now() - countSince >= stableMs) {
          return true;
        }
      } else {
        lastCount = count;
        countSince = Date.now();
      }
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  return false;
}

async function waitSignsIdle(page: Page, stableMs: number, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  let since = 0;
  while (Date.now() - start < timeoutMs) {
    const idle = await page.evaluate(signsIdle);
    if (idle) {
      since ||= Date.now();
      if (Date.now() - since >= stableMs) return true;
    } else {
      since = 0;
    }
    await new Promise((r) => setTimeout(r, 40));
  }
  return false;
}

async function renderPoi(browser: Browser, poi: Poi, intermediateCodec: string): Promise<string> {
  const page = await browser.newPage();
  try {
    if (VIDEO.marumasign) {
      await interceptSigns(page, VIDEO.signDrawDistance);
    } else {
      await page.setRequestInterception(true);
      page.on('request', (req) => (/marumasign/i.test(req.url()) ? req.abort() : req.continue()));
    }
    await page.setViewport({ width: VIDEO.width, height: VIDEO.height, deviceScaleFactor: 1 });
    const hash = `#${BLUEMAP_MAP}:${poi.x}:${poi.y}:${poi.z}:${VIDEO.distance}:${poi.rotation}:${VIDEO.angle}:0:0:perspective`;
    
    let loaded = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await page.goto(BLUEMAP_URL + '/' + hash, { waitUntil: 'domcontentloaded', timeout: 180_000 });
        await page.waitForFunction(() => (window as any).bluemap?.mapViewer?.map?.hiresTileManager, { timeout: 180_000 });
        loaded = true;
        break;
      } catch (e: any) {
        console.warn(`[${poi.id}] ページ読み込みリトライ (${attempt}/3): ${e.message}`);
        if (attempt === 3) throw e;
        await new Promise((r) => setTimeout(r, 5000));
      }
    }

    const gpu = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null;
      const ext = gl?.getExtension('WEBGL_debug_renderer_info');
      return gl && ext ? (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string) : 'unknown';
    });
    console.log(`[${poi.id}] GPU: ${gpu}`);

    await page.evaluate(setup, {
      hires: VIDEO.hiresViewDistance,
      lowres: VIDEO.lowresViewDistance,
      cameraFar: VIDEO.cameraFar,
    });

    const total = Math.min(frameLimit, VIDEO.fps * VIDEO.seconds);
    const file = join(WORK, `${poi.id}.mp4`);
    const enc = intermediateCodec === 'h264_nvenc'
      ? ['-c:v', 'h264_nvenc', '-preset', 'p7', '-rc', 'vbr', '-cq', '14', '-b:v', '0']
      : ['-c:v', 'libx264', '-preset', 'fast', '-crf', '12'];
    const ff = spawn(
      'ffmpeg',
      ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(VIDEO.fps), '-c:v', 'mjpeg', '-i', '-', ...enc, '-pix_fmt', 'yuv420p', file],
      { stdio: ['pipe', 'inherit', 'inherit'] },
    );
    const done = new Promise<void>((resolve, reject) => {
      ff.on('exit', (c) => (c === 0 ? resolve() : reject(new Error(`ffmpeg exited ${c}`))));
    });

    const cdp = await page.createCDPSession();
    const started = Date.now();
    for (let f = 0; f < total; f++) {
      const t = f / (VIDEO.fps * VIDEO.seconds);
      // ゆっくり回りながら、少しだけ近づく
      await page.evaluate(setCamera, {
        x: poi.x,
        y: poi.y,
        z: poi.z,
        distance: VIDEO.distance * (1.06 - 0.06 * t),
        rotation: poi.rotation + VIDEO.turn * t,
        angle: VIDEO.angle,
        hires: VIDEO.hiresViewDistance,
        lowres: VIDEO.lowresViewDistance,
        cameraFar: VIDEO.cameraFar,
      });
      // 最初のコマは全体が安定するまで長めに待つ
      const ok = await waitTilesSettled(page, f === 0 ? 2500 : 120, f === 0 ? 180_000 : 20_000);
      if (!ok) console.warn(`[${poi.id}] frame ${f}: タイルの読み込みを待ちきれませんでした`);
      // 描画バッファへの反映を待機
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

      if (VIDEO.marumasign) {
        await page.evaluate(() => (window as any).marumasign3d?.update?.());
        const signsOk = await waitSignsIdle(page, f === 0 ? 1500 : 80, f === 0 ? 120_000 : 20_000);
        if (!signsOk) console.warn(`[${poi.id}] frame ${f}: 看板の画像を待ちきれませんでした`);
        if (f === 0) console.log(`[${poi.id}] MarumaSign:`, JSON.stringify(await page.evaluate(() => (window as any).marumasign3d?.stats?.() ?? null)));
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      }

      const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 95, optimizeForSpeed: true });
      if (!ff.stdin.write(Buffer.from(data, 'base64'))) await new Promise((r) => ff.stdin.once('drain', r));
      if (f % 30 === 0) console.log(`[${poi.id}] ${f}/${total} (${((Date.now() - started) / 1000).toFixed(0)}s)`);
    }
    ff.stdin.end();
    await done;
    return file;
  } finally {
    await page.close().catch(() => {});
  }
}

/** 中間ファイルから、Web 用の動画 (AV1 1080p と H.264 720p) とポスター画像を作る */
async function encodeForWeb(id: string, src: string): Promise<void> {
  await mkdir(OUT, { recursive: true });
  // AV1 1080p
  await run('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    src,
    '-an',
    '-c:v',
    'libsvtav1',
    '-preset',
    '5',
    '-b:v',
    '2400k',
    '-svtav1-params',
    'rc=1',
    '-g',
    '120',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    join(OUT, `${id}.av1.mp4`),
  ]);
  // H.264 720p
  await run('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    src,
    '-an',
    '-vf',
    'scale=1280:-2',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-b:v',
    '1800k',
    '-maxrate',
    '2400k',
    '-bufsize',
    '4800k',
    '-profile:v',
    'high',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    join(OUT, `${id}.h264.mp4`),
  ]);
  // JPG poster
  await run('ffmpeg', [
    '-y',
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    src,
    '-frames:v',
    '1',
    '-vf',
    'scale=1280:-2',
    '-q:v',
    '4',
    join(OUT, `${id}.jpg`),
  ]);
}

/** 中間ファイルが既に完全に出力されているか判定 (360フレーム = 20MB以上) */
async function isWorkFileComplete(file: string): Promise<boolean> {
  if (!existsSync(file)) return false;
  try {
    const s = await stat(file);
    return s.size > 20 * 1024 * 1024;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  if (!CHROME) throw new Error('Chrome が見つかりません (CHROME_PATH で指定できます)');
  await mkdir(OUT, { recursive: true });
  await mkdir(WORK, { recursive: true });
  const manifestFile = join(OUT, 'background.json');

  if (encodeOnly) {
    for (const poi of targets) {
      const file = join(WORK, `${poi.id}.mp4`);
      if (!existsSync(file)) {
        console.warn(`[${poi.id}] 中間ファイルがありません: ${file}`);
        continue;
      }
      await encodeForWeb(poi.id, file);
      console.log(`[${poi.id}] encoded`);
    }
    const old = existsSync(manifestFile) ? JSON.parse(await readFile(manifestFile, 'utf8')) : null;
    await writeManifest(manifestFile, old?.generatedAt);
    return;
  }

  const intermediate = (await hasEncoder('h264_nvenc')) ? 'h264_nvenc' : 'libx264';
  console.log('intermediate encoder:', intermediate);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: [
      '--ignore-gpu-blocklist',
      '--enable-gpu-rasterization',
      '--use-angle=d3d11',
      '--enable-unsafe-webgpu',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
    ],
  });

  try {
    for (const poi of targets) {
      const file = join(WORK, `${poi.id}.mp4`);
      if (!Number.isFinite(frameLimit) && (await isWorkFileComplete(file))) {
        console.log(`[${poi.id}] 中間キャッシュが存在するため撮影をスキップします: ${file}`);
      } else {
        await renderPoi(browser, poi, intermediate);
        if (Number.isFinite(frameLimit)) {
          console.log(`[${poi.id}] 試し撮り完了: ${file}`);
          continue;
        }
      }
      await encodeForWeb(poi.id, file);
      console.log(`[${poi.id}] Web用エンコード完了`);
      await writeManifest(manifestFile);
    }
  } finally {
    await browser.close();
  }

  await writeManifest(manifestFile);
}

/** サイトが読む background.json (動画のある名所の一覧) */
async function writeManifest(file: string, generatedAt = new Date().toISOString()): Promise<void> {
  const manifest = {
    generatedAt,
    bluemap: { url: BLUEMAP_URL, map: BLUEMAP_MAP },
    seconds: VIDEO.seconds,
    pois: POIS.filter((p) => existsSync(join(OUT, `${p.id}.av1.mp4`))).map(({ rotation: _rot, ...p }) => ({
      ...p,
      av1: `${p.id}.av1.mp4`,
      h264: `${p.id}.h264.mp4`,
      poster: `${p.id}.jpg`,
    })),
  };
  await writeFile(file, JSON.stringify(manifest, null, 2) + '\n');
  console.log('wrote', file);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

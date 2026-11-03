// 背景動画の設定。名所ごとに 1 本、BlueMap の周りをカメラがゆっくり回る動画を作る。
// 名所の一覧 (座標・名前・回し始める向き) は、サイトの /map と共通の src/app/map/places.json。
import { readFileSync } from 'node:fs';

export const BLUEMAP_URL = 'https://3d-map.torosaba.net';
export const BLUEMAP_MAP = 'overworld';

export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  seconds: 12,
  // BlueMap のカメラ: distance (ブロック), angle (真上 0 〜 水平 π/2), 1 本の間に回る角度 (rad)
  distance: 420,
  angle: 1.02,
  turn: 0.42,
  hiresViewDistance: 450,
  lowresViewDistance: 5000,
  // MarumaSign の看板画像 (3D マップの map-web が描く) も映すか
  marumasign: true,
};

export const POIS = JSON.parse(readFileSync(new URL('../src/app/map/places.json', import.meta.url), 'utf8'));

// 背景動画の設定。名所ごとに 1 本、BlueMap の周りをカメラがゆっくり回る動画を作る。
// 名所の一覧 (座標・名前・回し始める向き) は、サイトの /map と共通の src/app/map/places.json。
import { readFileSync } from 'node:fs';

export interface Poi {
  id: string;
  name: string;
  note: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  page: string;
}

export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  seconds: number;
  distance: number;
  angle: number;
  turn: number;
  hiresViewDistance: number;
  lowresViewDistance: number;
  marumasign: boolean;
  cameraFar: number;
  signDrawDistance: number;
}

export const BLUEMAP_URL = 'https://3d-map.torosaba.net';
export const BLUEMAP_MAP = 'overworld';

export const VIDEO: VideoConfig = {
  width: 1920,
  height: 1080,
  fps: 30,
  seconds: 12,
  // BlueMap のカメラ: distance (ブロック), angle (真上 0 〜 水平 π/2), 1 本の間に回る角度 (rad)
  distance: 420,
  angle: 1.02,
  turn: 0.42,
  // 遠くまで正確に描画するための設定
  // hiresViewDistance: カメラの注視点(420ブロック先)から奥へ広範囲に精密なブロックモデルを描画
  hiresViewDistance: 650,
  // lowresViewDistance: 地平線の果てまで低解像度タイルを描画
  lowresViewDistance: 8000,
  // cameraFar: Three.js の遠景クリッピングプレーン (デフォルト 3000 -> 10000 に拡張して地平線の黒帯を解消)
  cameraFar: 10000,
  // signDrawDistance: 遠くの看板まで描画
  signDrawDistance: 800,
  // MarumaSign の看板画像 (3D マップの map-web が描く) も映すか
  marumasign: true,
};

export const POIS: Poi[] = JSON.parse(
  readFileSync(new URL('../src/app/map/places.json', import.meta.url), 'utf8'),
);

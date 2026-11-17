# 開発

この文書は、サイトを開発する人向けの、ただ 1 つの詳しい文書です。概要とページの編集の仕方は [README.md](README.md) にあります。

## 手順

```bash
npm ci
npm start          # docs/ を変換して、開発サーバーを起動 (http://localhost:4200)
npm run build      # dist/toro-website/browser に静的サイトを書き出す
npm test           # フロントエンドのテスト
```

- `scripts/build-content.ts` — `docs/` の Markdown を HTML にして、`public/content/` (ページの JSON・全文検索の索引)、`feed.xml`、`sitemap.xml` を作ります。`npm start` / `npm run build` の前に自動で動きます。
- ページはすべてプリレンダーするので、JavaScript が動かなくても読めます。
- `main` に push すると GitHub Actions が公開します。

## PWA (ホーム画面に追加・オフライン)

スマホのホーム画面に追加でき、一度開いたページはオフラインでも読めます。Angular の Service Worker (`@angular/service-worker`) を使っています。

- 設定は [`ngsw-config.json`](ngsw-config.json)、マニフェストは [`public/manifest.webmanifest`](public/manifest.webmanifest) です。`npm run build` で `ngsw-worker.js` と `ngsw.json` ができます (開発サーバーでは動きません)。
- アプリの殻 (`index.csr.html`) と、ハッシュ付きの JS・CSS・アイコンは、最初に開いたときにまとめてキャッシュします。
- ページを開くときは、オンラインなら毎回プリレンダーした HTML をネットワークから取ります (更新がすぐ見えます)。オフラインのときだけ、キャッシュした殻を開いて、キャッシュしたデータで描きます。GitHub Pages の `404.html` もそのまま返します。
- ページのデータ (`/content/`) は、ネットワーク優先でキャッシュします (4 秒で返らなければキャッシュ)。画像 (`/attachments/`) はキャッシュ優先です。
- 背景の動画 (`/background/`) は大きいのでキャッシュしません。オフラインでは XP の青い壁紙になります。
- 新しいバージョンを公開すると、開いている人には次にページを移ったときに、ページごと読み直して届けます ([`src/app/core/pwa.ts`](src/app/core/pwa.ts))。キャッシュを消す必要はありません。
- アイコン (`public/icons/`) は `npm run icons` でロゴから作ります。

## 背景の 3D マップの動画

背景は、BlueMap (TORO サーバーの 3D マップ) を GPU で描画して一コマずつ撮影した動画です。
細かいブロック (hires タイル) まで読み込み終わってから撮るので、ブラウザーで直接 3D を描くより綺麗になります。

```bash
npm run background                    # すべての名所を撮って public/background/ に書き出す
npm run background -- spawn wayama    # 指定した名所だけ
npm run background -- spawn --frames 30   # 試し撮り (.cache/background/spawn.mp4)
```

- 必要なもの: Google Chrome、ffmpeg (`libsvtav1`・`libx264`。NVIDIA の GPU があれば `h264_nvenc` も使います)。
- MarumaSign の看板の画像も映します (3D マップの画面が描く。看板のデータは [MarumaSign-Companion](https://github.com/TORO-Server/MarumaSign-Companion) が書く)。
  背景のカメラは名所から離れているので、撮影のときだけ看板のデータに `fullDrawDistance` を足して遠くの看板まで描かせます (本番の地図は変えません)。看板の板と URL のラベルは出しません。
- 名所 (座標・名前・回し始める向き) は [`src/app/map/places.json`](src/app/map/places.json) で、`/map` ページと共通です。
  カメラの距離・角度・長さなどは [`scripts/background.config.ts`](scripts/background.config.ts) で変えられます。
- 1 か所 12 秒、1080p の AV1 と 720p の H.264、ポスター画像を作ります。`public/background/background.json` があると、サイトが自動で動画を流します (ないときは XP の青い壁紙)。
- 動きを減らす設定の人や省データモードの人には、動画の代わりにポスター画像を出します。

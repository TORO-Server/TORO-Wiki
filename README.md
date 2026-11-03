# TORO Server Wiki

https://wiki.torosaba.net/

マインクラフトのクリエイティブサーバー **TORO Server** の Wiki です。
旧 Wiki ([seesaa wiki](https://seesaawiki.jp/toro_server/)) の全ページを引き継ぎ、Angular で一から作りました。
見た目は Docusaurus 版の Windows XP 風デザインを受け継ぎ、デスクトップの壁紙に TORO Server の 3D マップの動画を流しています。

## ページを編集する

ページは [`docs/`](docs/) の Markdown です。カテゴリーはフォルダーで分かれています。

| フォルダー | カテゴリー |
| :--- | :--- |
| `00_Main` | TORO Server (概要・お知らせ) |
| `01_Guide` | ガイド (ルール・利用規約など) |
| `02_Plugins` | プラグイン・Mod |
| `03_Transportation` | 交通 |
| `04_World_and_Cities` | ワールド・都市 |
| `05_Data` | データ |
| `06_Community` | コミュニティ |
| `07_System` | システム |

- ページの URL はファイル名です (`docs/01_Guide/ルール.md` → `/wiki/ルール`。空白は `_` になります)。
- ほかのページへのリンクは相対パスで書きます: `[ルール](../01_Guide/ルール.md)`
- 画像は `docs/attachments/` に置き、`![説明](../attachments/画像.png)` で貼ります。
- 先頭の frontmatter は省略できます。`title` を書くとファイル名の代わりにページ名になります。
  `updated` / `author` / `seesaa` は旧 Wiki から引き継いだ最終更新日・更新者・元のページです。
  このリポジトリで編集すると、最終更新日と更新者は git の履歴から自動で付きます。
- Markdown の中に HTML (`<table>` など) も書けます。`<script>` などはビルド時に取り除かれます。

サイト上の各ページの「このページを編集」から、Discord でログインして直接ブラウザ上で編集するか、GitHub で直接変更を提案できます。

## Discord ログインと AI コネクタ

ログイン、ブラウザからの編集の保存、AI コネクタは、このリポジトリではなく [TORO-Auth](https://github.com/TORO-Server/TORO-Auth) のサーバーが担当します。

- 各サービスの URL と役割は [`docs/07_System/サービスのURLと役割.md`](docs/07_System/サービスのURLと役割.md) が唯一の正本です。URL を書くときは、ここへリンクしてください。
- 使い方は [`docs/07_System/Discord認証編集とAIコネクタ.md`](docs/07_System/Discord認証編集とAIコネクタ.md) を見てください。
## 開発

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
- 新しい版を公開すると、開いている人には次にページを移ったときに、ページごと読み直して届けます ([`src/app/core/pwa.ts`](src/app/core/pwa.ts))。キャッシュを消す必要はありません。
- アイコン (`public/icons/`) は `node scripts/build-icons.ts` でロゴから作ります。

## 背景の 3D マップの動画

背景は、[BlueMap](https://3d-map.torosaba.net/) を GPU で描画して一コマずつ撮影した動画です。
細かいブロック (hires タイル) まで読み込み終わってから撮るので、ブラウザーで直接 3D を描くより綺麗になります。

```bash
npm run background                    # すべての名所を撮って public/background/ に書き出す
npm run background -- spawn wayama    # 指定した名所だけ
npm run background -- spawn --frames 30   # 試し撮り (.cache/background/spawn.mp4)
```

- 必要なもの: Google Chrome、ffmpeg (`libsvtav1`・`libx264`。NVIDIA の GPU があれば `h264_nvenc` も使います)。
- MarumaSign の看板の画像も映します (3D マップの map-web が描く。看板のデータは [MarumaSign-Companion](https://github.com/TORO-Server/MarumaSign-Companion) が書く)。
  背景のカメラは名所から離れているので、撮影のときだけ看板のデータに `fullDrawDistance` を足して遠くの看板まで描かせます (本番の地図は変えません)。看板の板と URL のラベルは出しません。
- 名所 (座標・名前・回し始める向き) は [`src/app/map/places.json`](src/app/map/places.json) で、`/map` ページと共通です。
  カメラの距離・角度・長さなどは [`scripts/background.config.ts`](scripts/background.config.ts) で変えられます。
- 1 か所 12 秒、1080p の AV1 と 720p の H.264、ポスター画像を作ります。`public/background/background.json` があると、サイトが自動で動画を流します (ないときは XP の青い壁紙)。
- 動きを減らす設定の人や省データモードの人には、動画の代わりにポスター画像を出します。

## ライセンス

コード: MIT License。Wiki の文章は、それぞれの執筆者のものです。

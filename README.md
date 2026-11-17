# TORO Server Wiki

マインクラフトのクリエイティブサーバー **TORO Server** の Wiki です。
旧 Wiki ([seesaa wiki](https://seesaawiki.jp/toro_server/)) の全ページを引き継ぎ、Angular で一から作りました。
見た目は Windows XP 風のデザインで、デスクトップの壁紙に TORO Server の 3D マップの動画を流しています。

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

## 開発とそのほかの文書

- 開発の手順、公開の仕組み、PWA (スマホのホーム画面に追加できる仕組み)、背景の動画の作り方: [DEVELOPMENT.md](DEVELOPMENT.md)
- 文章の書き方: [WRITING-STYLE.md](https://github.com/TORO-Server/TORO-Website/blob/main/docs/WRITING-STYLE.md)

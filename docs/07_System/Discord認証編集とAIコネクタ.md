---
title: Discord認証編集とAIコネクタ
category: system
---

# Discord認証編集とAIコネクタ

TORO Server Wiki（wiki.torosaba.net）は、Discord のログインによるブラウザ内編集と、Claude・ChatGPT・Gemini から Wiki を直接操作できる AI コネクタを備えています。

各サービスの URL と役割は [サービスのURLと役割](./サービスのURLと役割.md) にまとめてあります。

---

## 1. ブラウザ上での Wiki 編集

Discord アカウントでログインすることで、GitHub アカウントを所有していないユーザーでもブラウザ上で直接 Wiki 記事を編集・コミットできます。

### 編集の流れ
1. サイト右上の「Discord ログイン」ボタンをクリックし、Discord アカウントで認証します。
2. TORO Server 公式 Discord サーバーに参加していることが確認されると、編集権限が付与されます。
3. 任意の Wiki ページで「このページを編集」をクリックすると、Windows XP スタイルの Markdown エディタが開きます。
4. Markdown を編集し、リアルタイムプレビューで確認後、「保存してコミット」をクリックします。
5. TORO Server の API が GitHub のリポジトリにコミットし、自動ビルド・デプロイが実行されます。
   * コミットログの作者（Author）には、Discord ユーザー名と ID が記録されます。

---

## 2. AI コネクタ (Claude / ChatGPT / Gemini)

AI クライアントから Wiki を検索・参照・編集できます。接続の手順は [AIクライアントの接続方法](./AIクライアントの接続方法.md) を見てください。

### 提供ツール一覧
* `wiki_search(query)`: キーワードによる Wiki 記事検索
* `wiki_get_page(path)`: 指定ページの最新 Markdown 原文と git SHA の取得
* `wiki_list_pages(category)`: 全ページ・カテゴリの一覧取得
* `wiki_save_page(path, content, sha, message)`: ページの編集・コミット（Discord ユーザー名で署名）
* `server_get_status()`: Minecraft サーバーの稼働状態の取得
* `server_get_info()`: TORO Server の各サービスの案内
* `auth_get_identity()`: 呼び出し元の身元と編集権限の確認

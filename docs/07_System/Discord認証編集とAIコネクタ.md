---
title: Discord認証編集とAIコネクタ
category: system
---

# Discord認証編集とAIコネクタ

TORO Server Wiki（wiki.torosaba.net）は、Cloudflare と Discord OAuth2 を連携したブラウザ内編集機能、および Claude・ChatGPT・Gemini から Wiki を直接操作できる AI コネクタ機能を備えています。

---

## 1. ブラウザ上での Wiki 編集

Discord アカウントでログインすることで、GitHub アカウントを所有していないユーザーでもブラウザ上で直接 Wiki 記事を編集・コミットできます。

### 編集の流れ
1. サイト右上の「Discord ログイン」ボタンをクリックし、Discord アカウントで認証します。
2. TORO Server 公式 Discord サーバーに参加していることが確認されると、編集権限が付与されます。
3. 任意の Wiki ページで「このページを編集」をクリックすると、Windows XP スタイルの Markdown エディタが開きます。
4. Markdown を編集し、リアルタイムプレビューで確認後、「保存してコミット」をクリックします。
5. Cloudflare Pages / Workers が GitHub REST API を経由してリポジトリにコミットし、自動ビルド・デプロイが実行されます。
   * コミットログの作者（Author）には、Discord ユーザー名と ID が記録されます。

---

## 2. AI コネクタ (Claude / ChatGPT / Gemini)

Discord 認証によって発行される専用の Bearer トークンを用いて、各種生成 AI アシスタントから Wiki を検索・参照・編集できます。

### 連携方式の対応状況

| AI クライアント | プロトコル / 規格 | エンドポイント | 特徴 |
| :--- | :--- | :--- | :--- |
| **Claude** (Desktop / Code) | Model Context Protocol (MCP) | `/api/mcp` | Streamable HTTP / JSON-RPC 2.0。プロンプトから Wiki 検索・記事編集ツールを自動呼び出し |
| **ChatGPT** (Custom GPTs) | OpenAPI 3.1 Actions | `/api/openapi.json` | Custom GPT の Actions にスキーマを登録し、Bearer 認証で呼び出し |
| **Gemini** (API / Gems) | Function Calling / REST | `/api/openapi.json` または `/api/docs/*` | REST API または OpenAPI スキーマを Tool 定義として渡して利用 |

### 提供ツール一覧
* `search_wiki(query)`: キーワードによる Wiki 記事検索
* `get_page(slug, path)`: 指定ページの Markdown 原文と git SHA の取得
* `list_pages(category)`: 全ページ・カテゴリの一覧取得
* `save_page(path, content, sha, message)`: ページの編集・コミット（Discord ユーザー名で署名）

---

## 3. 設定手順

### Claude Desktop (`claude_desktop_config.json`)
サイト上部の「AI コネクタ設定」ボタンをクリックして Bearer トークンを取得し、設定ファイルに以下を追加します。

```json
{
  "mcpServers": {
    "toro-wiki": {
      "url": "https://wiki.torosaba.net/api/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_DISCORD_TOKEN>"
      }
    }
  }
}
```

### ChatGPT (Custom GPTs)
1. Custom GPT の設定画面で「Actions」を追加します。
2. 「Import from URL」に `https://wiki.torosaba.net/api/openapi.json` を入力します。
3. Authentication を「API Key」->「Bearer」に設定し、Bearer トークンを入力します。

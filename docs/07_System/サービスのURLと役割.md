---
title: サービスのURLと役割
category: system
---

# サービスのURLと役割

TORO Server の認証と API の URL は、**このページが唯一の正本**です。ほかのページには URL を書き写さず、このページへリンクしてください。

## 3 つの窓口

| URL | 役割 | ここにあるもの |
| :--- | :--- | :--- |
| `https://auth.torosaba.net/` | **だれなのかを確かめる** | Discord ログイン、ログアウト、トークンの発行、OAuth 2.0 の認可 |
| `https://api.torosaba.net/` | **データを読み書きする** | Wiki の原稿の取得と保存 (REST API)、OpenAPI の仕様書 |
| `https://mcp.torosaba.net/` | **AI クライアントがつなぐ** | Remote MCP サーバーと、接続の手順の案内 |

## 使い分け

- **AI クライアント (Claude / ChatGPT / Gemini など) をつなぐ**: `https://mcp.torosaba.net/` を登録します。認証は自動で案内されます。手順はそのページにあります。
- **プログラムから Wiki を読み書きする**: `https://api.torosaba.net/` を使います。仕様書は [`/openapi.json`](https://api.torosaba.net/openapi.json) です。
- **ログインの状態を確かめる、トークンを発行する**: `https://auth.torosaba.net/` を開きます。

## API への認証

書き込みには `Authorization: Bearer <トークン>` が必要です。Cookie は使いません。トークンは `https://auth.torosaba.net/` で発行します。

## プログラムから調べるとき

URL の一覧は [`https://api.torosaba.net/`](https://api.torosaba.net/) が JSON で返します。この値はサーバーの設定そのものなので、プログラムからはこれを読んでください。

## 古い URL

次の URL は過去のものです。自動で正しい URL へ転送されますが、新しく書くときには使わないでください。

| 古い URL | 今の URL |
| :--- | :--- |
| `https://auth.torosaba.net/api/mcp` | `https://mcp.torosaba.net/` |
| `https://auth.torosaba.net/api/openapi.json` | `https://api.torosaba.net/openapi.json` |
| `https://auth.torosaba.net/api/docs/raw` | `https://api.torosaba.net/docs/raw` |
| `https://auth.torosaba.net/api/docs/save` | `https://api.torosaba.net/docs/save` |

---
title: サービスのURLと役割
category: system
---

# サービスのURLと役割

TORO Server の認証、API、AI クライアントの接続先の URL と役割です。

## 3 つの窓口

| URL | 役割 | ここにあるもの |
| :--- | :--- | :--- |
| `https://auth.torosaba.net/` | **だれなのかを確かめる** | Discord ログイン、ログアウト、トークンの発行、OAuth 2.0 の認可 |
| `https://api.torosaba.net/` | **データを読み書きする** | Wiki の原稿の取得と保存 (REST API)、OpenAPI の仕様書 |
| `https://mcp.torosaba.net/` | **AI クライアントがつなぐ** | Remote MCP サーバー。ブラウザで開くと [AIクライアントの接続方法](./AIクライアントの接続方法.md) へ移動します |

## 使い分け

- **AI クライアント (Claude / ChatGPT / Gemini など) をつなぐ**: `https://mcp.torosaba.net/` を登録します。手順は [AIクライアントの接続方法](./AIクライアントの接続方法.md) にあります。
- **プログラムから Wiki を読み書きする**: `https://api.torosaba.net/` を使います。仕様書は [`/openapi.json`](https://api.torosaba.net/openapi.json) です。
- **ログインの状態を確かめる、トークンを発行する**: `https://auth.torosaba.net/` を開きます。

## API への認証

書き込みには `Authorization: Bearer <トークン>` が必要です。Cookie は使いません。トークンは `https://auth.torosaba.net/` で発行します。

## プログラムから調べるとき

URL の一覧は [`https://api.torosaba.net/`](https://api.torosaba.net/) が JSON で返します。この値はサーバーの設定そのものなので、プログラムからはこれを読んでください。

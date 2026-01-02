---
title: LunaChat
---

### 概要

このプラグイン LunaChat は、チャンネルチャットシステムと、ローマ字発言の自動日本語化を実現することができます。

### config.yml

### コマンド

#### 一般ユーザー向け

| コマンド | パーミッションノード | 解説 |
| --- | --- | --- |
| /ch create (チャンネル名) | lunachat.create | チャンネルを作成します。 |
| /ch join | lunachat.join | チャンネルに参加します。 |
| /ch join (チャンネル名) | lunachat.join.(チャンネル名) | チャンネルに参加します。 |
| /ch leave | lunachat.leave | 今いるチャンネルから退出します。 |
| /ch leave (チャンネル名) | lunachat.leave.(チャンネル名) | チャンネルから退出します。 |
| /ch list | lunachat.list | チャンネルのリストを表示します。 |
| /ch info (チャンネル名) | lunachat.info | チャンネルの情報を表示します。 |
| /ch log | lunachat.log | チャンネルの発言ログを表示します。 |
| /ch log (チャンネル名) | lunachat.log.(チャンネル名) | チャンネルの発言ログを表示します。 |
| /ch accept | lunachat.accept | 招待を受けてチャンネルチャットに入室します。 |
| /ch deny | lunachat.deny | 招待を拒否します。 |
| /ch hide (チャンネル名) | lunachat.hide.(チャンネル名) | 指定したチャンネルの発言内容を非表示にします。 |
| /ch hide (プレイヤー名) | lunachat.hide.(プレイヤー名) | 指定したプレイヤーの発言内容を非表示にします。 |
| /ch hide list | lunachat.hide.list | 現在非表示にしているチャンネルとプレイヤーのリストを表示します。 |
| /ch unhide (チャンネル名) | lunachat.unhide.(チャンネル名) | 指定したチャンネルの発言内容を表示に戻します。 |
| /ch unhide(プレイヤー名) | lunachat.unhide.(プレイヤー名) | 指定したプレイヤーの発言内容を表示に戻します。 |
| /ch |  | ヘルプを表示します。 |
| /tell | lunachat.message | 指定した人との1:1チャットを開始・送信します。 |
| /r | lunachat.reply | 受信した1:1チャットに返信します。 |
| /jp on | lunachat.japanize | 自分のチャット日本語変換をオンにします。 |
| /jp off | lunachat.japanize | 自分のチャット日本語変換をオフにします。 |

#### チャンネル作成者向け

| コマンド | パーミッションノード | 解説 |
| --- | --- | --- |
| /ch invite (プレイヤー名) | lunachat.invite | 指定した人をチャンネルチャットに招待します。 |
| /ch kick (プレイヤー名) | lunachat.kick | 指定した人をチャンネルチャットからキックします。 |
| /ch ban (プレイヤー名) | lunachat.ban | 指定した人をチャンネルチャットからBANします。 |
| /ch pardon (プレイヤー名) | lunachat.pardon | 指定した人のBANを解除します。 |
| /ch mute (プレイヤー名) | lunachat.mute | 指定した人をチャンネルチャットからMuteします。 |
| /ch unmute (プレイヤー名) | lunachat.unmute | 指定した人のMuteを解除します。 |
| /ch remove | lunachat.remove | チャンネルを削除します。 |
| /ch format | lunachat.format | チャンネルのメッセージフォーマットを設定します。 |
| /ch moderator | lunachat.moderator | チャンネルのモデレーターを設定します。 |
| /ch option | lunachat.option | チャンネルのオプションを設定します。 |

### チャンネル一覧

<チャンネル>で指定するチャンネルの一覧です。  

| 名前 | 説明 |
| --- | --- |
| ! | グローバルちゃんねるです。ディスコードに表示されます。 |
| mili | 軍事に関連する話題向きのチャンネルです。 |
| nsfw | イケない話題向きのチャンネルです。 |
| spam | スパム用のチャンネルです。大規模なピリオドの連投などに向いています。 |
| event | イベント向きのチャンネルです。 |
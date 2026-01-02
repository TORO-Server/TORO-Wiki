---
title: Coreprotect
---

### 概要

当鯖で利用している様々なプレイヤーの行動を取るためのプラグイン。

### config

### パラメーター

各コマンド共通のパラメーターについて説明する。

| 名前 | 何 |
| --- | --- |
| a: | アクション |
| b: | ブロック |
| e: | 除外 |
| t: | 時間 |
| r: | 半径 |
| u: | ユーザー |

#### アクション

| 文字列 | 行為 |
| --- | --- |
| block | ブロックの設置・破壊 |
| +block | ブロックの設置 |
| -block | ブロックの破壊 |
| interact | 右クリック・左クリック |
| container | チェスト・かまどなどからの出し入れ |
| +container | チェスト・かまどへの搬入 |
| -container | チェスト・かまどからの搬出 |
| kill | エンティティの殺害 |
| chat | チャット |
| session | ログイン・ログアウト |
| +session | ログイン |
| -session | ログアウト |
| username | 名前の変更 |

#### ブロック

ブロックIDを記入する。複数の場合はコンマで区切る。

#### 除外

これもブロックID。複数の場合はコンマで区切る。[未検証]

#### 時間

アクションをどのくらい前の時点まで戻すか。  
<数値><単位>[<数値2><単位2>…]

|  |  |
| --- | --- |
| 単位 | 意味 |
| w | 週間 |
| d | 日 |
| h | 時間 |
| m | 分 |
| s | 秒 |

  

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

例

* t:2w,5d,7h,2m,10s
  + 2週間と5日と7時間2分10秒前
* t:5d2h
  + 5日と2時間前
* t:2.5h
  + 2時間半前

#### 場所

数値を指定すると足元から半径以内のブロックだけが選択され、#のあとにワールド名を入れるとそのワールド全体が選択される。  
また、#globalと入れるとすべてのワールドが選択され、#weや#worldeditと入れると[WorldEdit](WorldEdit.md)のセッションが選択される。

#### ユーザー

単にユーザー名を指定する。  

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

水やら溶岩やらの一覧

|  |  |
| --- | --- |
| 物質 | 名前 |
| 水/水流 | #water |
| 溶岩/溶岩流 | #lava |

### 凡例

特定の1ユーザーについて、全ての行動をロールバック  
/co rb u:誰か r:#global t:いつ?

### command

[パーミッションノード](http://minerealm.com/community/viewtopic.php?f=32&t=6782)  
[コマンド](http://www.minerealm.com/community/viewtopic.php?f=32&t=6781)  

| コマンド | パーミッションノード | 解説 | エイリアス |
| --- | --- | --- | --- |
| /co inspect | coreprotect.inspect | クリックしたところのログを見る | /co i |
| /co help | coreprotect.help | ヘルプを見る |  |
| /co rollback <パラメーター> | coreprotect.rollback | ロールバック！ | /co rb |
| /co restore <パラメーター> | coreprotect.restore | ロールバックの取り消し | /co rs |
| /co lookup <パラメーター> | coreprotect.lookup | ログのリストを見る | /co l |
| /co purge <パラメーター> | coreprotect.purge | ログの削除 |  |
| /co reload | coreprotect.reload | コンフィグのリロード |  |
| /co version |  | バージョンを見る |  |
| /co near |  | 5ブロック以内のログを見る |  |
| /co undo |  | オペレーションのアンドゥ |  |
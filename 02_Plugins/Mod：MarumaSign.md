---
title: Mod：MarumaSign
---

### 注意事項

ModはJava版限定要素となっております。  
BEでも見えるように画像を使いたかったら→[ImageOnMap](%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%EF%BC%9AImageOnMap.md)

### 概要

MarumaSignは、画像をマイクラ内で表示するModです。  
AdminのMarumasaUSBさんが作りました。  
![image](../attachments/309119fd6c0def822196cf18eeee29ef.png)

### 目次

* [注意事項](#content_1)
* [概要](#content_2)
* [目次](#content_3)
* [画像を表示してみよう！](#content_4)
  + [1.導入する (2024/12/20時点)](#content_4_1)
  + [2.設置してみる](#content_4_2)
    - [パラメーター一覧](#content_4_2_1)

### 画像を表示してみよう！

#### 1.導入する (2024/12/20時点)

事前に[FabricMC](https://fabricmc.net/use/installer/)、[FabricAPI](https://www.curseforge.com/minecraft/mc-mods/fabric-api/files)をダウンロードしておいてください。  
ついでに、Indiumの導入もお勧めします。  

|  |  |
| --- | --- |
| Minecraft | MarumaSign |
| 1.21.1 | [2.4.1(CurseForge)](https://www.curseforge.com/minecraft/mc-mods/marumasign/files/5702908) |
| 1.21 | [2.3.0(CurseForge)](https://www.curseforge.com/minecraft/mc-mods/marumasign/files/5454021) |
| 1.20.6 | [2.2.0(CurseForge)](https://www.curseforge.com/minecraft/mc-mods/marumasign/files/5454020) |
| 1.20.5 | [2.1.0(Github)](https://github.com/TORO-Server/MarumaSign/releases/tag/v2.1.0) |
| 1.20.4 | [2.0.2(CurseForge)](https://www.curseforge.com/minecraft/mc-mods/marumasign/files/5236126) |
| 1.20.3 | [1.7.0(Github)](https://github.com/TORO-Server/MarumaSign/releases/tag/v1.7.0) |
| 1.20.2 | [1.6.0(Github)](https://github.com/TORO-Server/MarumaSign/releases/tag/v1.6.0) |
| 1.20.1 | [1.5.0(Github)](https://github.com/TORO-Server/MarumaSign/releases/tag/v1.5.0) |

  
まず、FabricMC公式ページの手順に従って、Fabricをインストール。  
FabricAPIとMarumaSignをmodsフォルダに配置して準備完了。

#### 2.設置してみる

WebUIを開きます。(初期キー：B)  
画像をアップロードして、giveコマンド実行を押せば取得できます。  
注意事項：2024/12/20現在、このサーバーのバージョンは1.20.4なのでMarumaSignもそれに合わせてください。

##### パラメーター一覧

|  |  |
| --- | --- |
| 画像アドレス | 画像のURL |
| 横幅 | 看板の横の大きさ |
| 高さ | 看板の縦の大きさ |
| ?軸位置 | 看板の相対的位置 |
| ?軸回転 | 看板の角度等 |
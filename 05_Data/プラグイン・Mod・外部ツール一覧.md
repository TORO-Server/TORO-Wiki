---
title: プラグイン・Mod・外部ツール一覧
---

### 目次

* [目次](#content_1)
* [プラグイン](#content_2)
* [外部ツール](#content_3)
* [Mod](#content_4)
  + [一覧表](#content_4_1)
  + [前提Modの導入](#content_4_2)

### プラグイン

| 解説ページ | 概要 | 必須権限 | 作者 |
| --- | --- | --- | --- |
| [ArmorStandEditor](../02_Plugins/%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%EF%BC%9AArmorStandEditor.md) | 防具立てでより自由度の高い装飾をする |  |  |
| [ClickToMinecart](https://github.com/punipuni-3730/Click-to-Minecart) | レールをクリックするとトロッコが出現する |  | rupirupi\_ |
| [CoreProtect](../02_Plugins/CoreProtect.md) | ブロックのログを確認できる |  |  |
| [CrackShot](../02_Plugins/CrackShot.md) | 重火器を使用できる |  |  |
| [Dynmap](../02_Plugins/Dynmap.md) | ワールドを2D/3Dで俯瞰した地図をウェブで見れる |  |  |
| [ImageOnMap](../02_Plugins/%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%EF%BC%9AImageOnMap.md) | 画像をマイクラ内の地図に変換する |  |  |
| [Lift](../02_Plugins/%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%EF%BC%9ALift.md) | エレベーターを設定できる |  |  |
| [LunaChat](../02_Plugins/LunaChat.md) | チャンネルチャットができる |  |  |
| [MarumasaCar](../02_Plugins/%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%EF%BC%9AMarumasaCar.md) | TOROオリジナルのリアルな車に乗れる |  | MarumasaUSB |
| [MasconCart](https://github.com/TORO-Server/MasconCart) | トロッコをマスコンを使ってるような感覚で操作できる |  | rupirupi\_ |
| [MyPet](../02_Plugins/MyPet.md) | モブをペットとして飼える |  |  |
| [Report](https://github.com/TORO-Server/Report) | 荒らしや操作ミスをマイクラ内から報告できる |  | rupirupi\_ |
| [Skills](../02_Plugins/%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3%EF%BC%9ASkills.md) | 特殊なスキルで遊べる |  | rupirupi\_ |
| [TOROpassシステム](../03_Transportation/TOROpass%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0.md) | ICカードを使える |  | rupirupi\_ |
| [TrainCarts](../02_Plugins/TrainCarts.md) | RSより複雑なダイヤ設定ができる |  |  |
| [Vehicles](../03_Transportation/Vehicles.md) | 乗り物に乗れる | Driver |  |
| [WorldEdit](../02_Plugins/WorldEdit.md) | 大規模な編集をコマンドで行える | Builder(WE権限) |  |
| [WorldGuard](../02_Plugins/Worldguard.md) | 自分の土地を荒らしから守れる | Builder(WE権限) |  |

### 外部ツール

| 解説ページ | 概要 | リンク | 作者 |
| --- | --- | --- | --- |
| [Dynmap](../02_Plugins/Dynmap.md) | ワールドを2D/3Dで俯瞰した地図をウェブで見れる | <https://map.torosaba.net> |  |
| TOROPassWallet | TOROPassの使用履歴を見れます | <https://toro-server.github.io/TOROpass-Wallet/> | rupirupi\_ |
| [カスタムサウンド配布所](https://discord.com/channels/337838758441517057/731793884232941660/1448247549327704217) | サーバー内で使えるカスタムサウンドを手に入れるコマンドを取得できる | <https://sound.torosaba.net/> | rupirupi\_ |
| TORONavi | カーナビ風に地図を表示するアプリ(開発中) | <https://github.com/TORO-Server/toronavi/> | rupirupi\_ |

### Mod

#### 一覧表

| 解説ページ | 概要 | 必須条件 | 作者 | ダウンロード |
| --- | --- | --- | --- | --- |
| [MarumaSign](../02_Plugins/Mod%EF%BC%9AMarumaSign.md) | マイクラ内で高解像度の画像を見れる | Minecraft1.20.1〜1.21.1+FabricMC | MarumasaUSB | [Curseforge](https://www.curseforge.com/minecraft/mc-mods/marumasign/files/all) [Github](https://github.com/TORO-Server/MarumaSign/releases) |
| [MinecartTracking](https://github.com/malken21/MinecartTracking) | トロッコの進行方向を自動で向くMod | Minecraft1.21+FabricMC+FabricKotlin | MarumasaUSB | [Github](https://github.com/malken21/MinecartTracking/releases) |
| [TOROResourceDownloader](https://github.com/TORO-Server/TORO-Resource-Downloader) | サーバーリソースパックを予めダウンロードする | Minecraft1.20.1〜1.21.4+FabricMC | MarumasaUSB | Github([1](https://github.com/TORO-Server/TORO-Resource-Downloader/releases) [2](https://github.com/TORO-Server/TORO-Resource-Downloader/pull/1)) |
| [ForceNoon](https://github.com/malken21/ForceNoon) | 常に昼間に見える | Minecraft1.21+FabricMC+FabricKotlin | MarumasaUSB | [Github](https://github.com/malken21/ForceNoon/releases) |

#### 前提Modの導入

* [Fabric Loader](https://fabricmc.net/use/installer/)
* Fabric API([Modrinth](https://modrinth.com/mod/fabric-api/versions) [Curseforge](https://www.curseforge.com/minecraft/mc-mods/fabric-api/files/all))
* Fabric Language Kotlin([Modrinth](https://modrinth.com/mod/fabric-language-kotlin/versions) [Curseforge](https://www.curseforge.com/minecraft/mc-mods/fabric-language-kotlin/files/all))
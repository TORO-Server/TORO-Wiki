---
title: Dynmap
---

このサーバーでは Dynmap というプラグインが導入されており、  
ブラウザからサーバーのワールドを衛星写真のように見ることができます。  
  
**目次**  
  

* [Dynmapのリンク](#content_1)
* [使い方](#content_2)
* [コマンド一覧](#content_3)
  + [マップ更新系](#content_3_1)
  + [マーカー系](#content_3_2)
    - [マーカー](#content_3_2_1)
    - [角指定](#content_3_2_2)
    - [エリア](#content_3_2_3)
    - [ライン](#content_3_2_4)
    - [オプション](#content_3_2_5)
    - [セット](#content_3_2_6)
* [アイコン一覧](#content_4)
  + [デフォルトアイコン](#content_4_3)
    - [建物系](#content_4_3_7)
    - [サービス系](#content_4_3_8)
    - [道具系](#content_4_3_9)
    - [移動系](#content_4_3_10)
    - [方向系](#content_4_3_11)
    - [旗系](#content_4_3_12)
    - [人系](#content_4_3_13)
    - [メダル・宝石系](#content_4_3_14)
    - [標識系](#content_4_3_15)
    - [自然系](#content_4_3_16)
  + [独自アイコン](#content_4_4)
  + [ラインの色](#content_4_5)
  + [ラインの太さの目安](#content_4_6)

  
  

### Dynmapのリンク

* ~~[旧リンク](http://torosaba.net:60016/)~~ [新リンク](https://map.torosaba.net/)

HTTPSに対応したため、map.torosaba.netからでもアクセスできるようになりました。[(お知らせ)](https://discord.com/channels/337838758441517057/338028109364461569/1325099444894437407)

### 使い方

画面上をドラッグでマップを動かします。  
マウスホイール、または、左上の＋−アイコンをクリックで拡大・縮小します。  
  
右側のタブを開くと、ワールドと接続中プレイヤーの一覧が表示されます。  
タブ内のワールドのアイコンをクリックするとマップが切り替わります。  
タブ内のプレイヤーをクリックするとプレイヤーの現在位置にマップが移動します。また、  
アイコン部分をクリックすると追尾モードになります。もう一度クリックすると解除されます。  
  
左上の層状のアイコンを開くと、マップ上のアイコンなどの表示を切り替えできます。

### コマンド一覧

<https://github.com/webbukkit/dynmap/wiki/Commands>も参照  
コマンドは基本的に運営のみ使用可能です。

#### マップ更新系

| コマンド | 説明 |
| --- | --- |
| /dynmap render | 現在の位置で1タイル更新 |
| /dynmap radiusrender <半径> | 現在の位置を中心に指定した半径で四方を更新 |

#### マーカー系

##### マーカー

| コマンド | 説明 |
| --- | --- |
| /dmarker add <ラベル> icon:<[アイコン](#icon)> | 現在の位置にマーカーを追加 |
| /dmarker movehere <ラベル> | 指定したラベルのマーカーを現在の位置に移動 |
| /dmarker update <ラベル> icon:<[アイコン](#icon)> | 指定したラベルのマーカーのアイコンを変更 |
| /dmarker update <ラベル> newlabel:<ラベル> | 指定したラベルを別のラベルに変更 |
| /dmarker delete <ラベル> | 指定したラベルのマーカーを消去 |
| /dmarker list | マーカーのリストを表示 |
| /dmarker icons | アイコンのリストを表示 |

##### 角指定

| コマンド | 説明 |
| --- | --- |
| /dmarker addcorner | 現在の位置に角を追加 |
| /dmarker clearcorners | addcornerした角を全て取り消し |

##### エリア

| コマンド | 説明 |
| --- | --- |
| /dmarker addarea <ラベル> | 指定した角でエリアを追加 |
| /dmarker updatearea <ラベル> <[オプション](#option)> | 指定したラベルのエリアのオプションを変更 ※位置の変更は不可 |
| /dmarker deletearea <ラベル> | 指定したラベルのエリアを消去 |
| /dmarker listareas | エリアのリストを表示 |

##### ライン

| コマンド | 説明 |
| --- | --- |
| /dmarker addline <ラベル> | 指定した角でラインを追加 |
| /dmarker updateline <ラベル> <[オプション](#option)> | 指定したラベルのラインのオプションを変更 ※位置の変更は不可 |
| /dmarker deleteline <ラベル> | 指定したラベルのラインを消去 |
| /dmarker listlines | ラインのリストを表示 |

##### オプション

| オプション | 説明 | 例 |
| --- | --- | --- |
| newlabel:<ラベル> | ラベル名を変更 | newlabel:トロ |
| color:<色(RRGGBB)> | 枠線の色を設定 | color:0088ff |
| fillcolor:<色(RRGGBB)> | 塗りつぶしの色を設定 | fillcolor:aaa |
| opacity:<不透明度(0.0〜1.0)> | 枠線の不透明度を設定 | opacity:0.8 |
| fillopacity:<不透明度(0.0〜1.0)> | 塗りつぶしの不透明度を設定 | fillopacity:0.2 |
| weight:<太さ(0〜)> | 枠線の太さを設定 | weight:5 |
| set:<ラインやマーカーの属するセット名> | Dynmap上の左上のレイヤーから選択するセット名 | set:Railways |

##### セット

| 名前 | 用途 | デフォルト |
| --- | --- | --- |
| Markers | マーカーや1ケタとA'路線の高速道路のラインが属している。デフォルト。 | ON |
| Railways | 鉄道路線のラインが属している。 | OFF |
| expwy | 1ケタとA'路線以外の高速道路が属している。 | OFF |
| road | 一般鯖道などが属している | OFF |

### アイコン一覧

#### デフォルトアイコン

##### 建物系

| アイコン名 | 説明 | 使用状況 |
| --- | --- | --- |
| default | デフォルト(家) |  |
| house | 家 |  |
| bighouse | 大きい家 |  |
| church | 教会 |  |
| bank | 銀行 |  |
| building | ビル |  |
| factory | 工場 |  |
| lighthouse | 灯台 |  |
| tower | 塔 |  |
| temple | 寺 |  |

##### サービス系

| アイコン名 | 説明 | 使用状況 |
| --- | --- | --- |
| bookshelf | 本棚 |  |
| theater | 劇場 |  |
| beer | ビール |  |
| drink | 飲み物 |  |
| cutlery | フォークとナイフ |  |
| cup | カップ |  |
| camera | カメラ |  |
| basket | かご |  |
| cart | 買い物用カート |  |
| scales | 天秤 |  |
| coins | コイン |  |
| cake | ケーキ |  |
| heart | ハート |  |

##### 道具系

| アイコン名 | 説明 | 使用状況 |
| --- | --- | --- |
| chest | チェスト |  |
| hammer | ハンマー |  |
| bricks | ブロック |  |
| gear | 歯車 |  |
| lock | 南京錠 |  |
| bomb | 爆弾 |  |
| shield | 盾 |  |
| key | 鍵 |  |
| wrench | レンチ |  |
| compass | コンパス |  |
| lightbulb | 電球 |  |

##### 移動系

| アイコン名 | 説明 | 使用状況 |
| --- | --- | --- |
| anchor | 錨 |  |
| minecart | トロッコ |  |
| truck | トラック |  |
| portal | ネザーポータル |  |
| door | ドア |  |

##### 方向系

| アイコン名 | 説明 | 使用状況 |
| --- | --- | --- |
| up | 上矢印 |  |
| down | 下矢印 |  |
| left | 左矢印 |  |
| right | 右矢印 |  |
| pointup | 上指差し |  |
| pointdown | 下指差し |  |
| pointleft | 左指差し |  |
| pointright | 右指差し |  |

##### 旗系

| アイコン名 | 説明 | 使用状況 |
| --- | --- | --- |
| pin | ピン |  |
| redflag | 赤色の旗 |  |
| orangeflag | 橙色の旗 | 都道府県 |
| yellowflag | 黄色の旗 | 島 |
| greenflag | 緑色の旗 |  |
| blueflag | 青色の旗 | 都市 |
| purpleflag | 紫色の旗 |  |
| pinkflag | 桃色の旗 |  |
| pirateflag | 海賊の旗 |  |

##### 人系

| アイコン名 | 説明 | 使用状況 |
| --- | --- | --- |
| skull | 頭蓋骨 |  |
| king | 王 | 世界政府 |
| queen | 女王 |  |
| walk | 歩く人 |  |

##### メダル・宝石系

| アイコン名 | 説明 | 使用状況 |
| --- | --- | --- |
| goldstar | 金星メダル |  |
| silverstar | 銀星メダル |  |
| bronzestar | 銅星メダル |  |
| goldmedal | 金メダル |  |
| silvermedal | 銀メダル |  |
| bronzemedal | 銅メダル |  |
| diamond | ダイアモンド |  |
| ruby | ルビー |  |

##### 標識系

| アイコン名 | 説明 | 使用状況 |
| --- | --- | --- |
| sign | 看板 |  |
| caution | 注意マーク |  |
| construction | 通行止め |  |
| warning | 警告マーク |  |
| exclamation | 赤丸に！マーク |  |
| cross | バツマーク |  |
| comment | フキダシ |  |

##### 自然系

| アイコン名 | 説明 | 使用状況 |
| --- | --- | --- |
| tree | 木 |  |
| flower | 花 |  |
| world | 地球 | スポーン |
| fire | 火 |  |
| tornado | 竜巻 |  |
| sun | 太陽 |  |
| star | 星 |  |
| dog | 犬 |  |

#### 独自アイコン

| アイコン名 | 説明 |
| --- | --- |
| station | 駅 |
| hubstation | 総合駅 |
| ic | インターチェンジ |
| jct | ジャンクション |

#### ラインの色

| 色 | カラーコード | 説明 |
| --- | --- | --- |
|  | #67076B | 高速道路 |
|  | #191970 | 幹線一般/一般鯖道 |
|  | #32CD32 | 都市高速 |
| 1.19以前の色 | | |
|  | #9400d3 | 鯖道路公団所有の自動車専用道路（自動車専用道路の指定に関する公団令の規定による） |
|  | #0000aa | 燕谷都市高速道路 |
|  | #0090A8 | 高麗都市高速道路 幸麓都市高速道路 |
|  | #11ff11 | 二取電鉄 |
|  | #ffdc00 | 毎王トロッコ鉄道 |

#### ラインの太さの目安

| 用途 | 太さ |
| --- | --- |
| 高速道路 1ケタ/A'路線 | 5 |
| 高速道路 その他 | 2 |
| Railwaysセットの路線 | 5 |

---

公式Wikiはこちら → [Dynmap Wiki](https://github.com/webbukkit/dynmap/wiki)
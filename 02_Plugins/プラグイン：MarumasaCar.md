---
title: プラグイン：MarumasaCar
---

MarumasaCarはAdminのまるまさ氏によって開発された自動車プラグイン。事前にTOROServerのサーバーリソースパックを適用している必要がある。  
遊び終えたら必ず片付けてください。  

### 目次

* [目次](#content_1)
* [出し方/消し方](#content_2)
* [使える自動車の種類](#content_3)
  + [AT車について](#content_3_1)
  + [SmoothCarについて](#content_3_2)

### 出し方/消し方

以下のコマンドを実行して手に入れた防具建てを設置するだけです。  

/give @p minecraft:armor\_stand{EntityTag:{id:armor\_stand,ShowArms:1b,Tags:["ここにIDを入力"]}} 1
IDの一覧は次の項で紹介します。  
  
シフトを押しながら右クリックで乗り物を消せます(消せなくなった場合は、必ず運営に自分で報告する事)

### 使える自動車の種類

| ID | 作者 | 定員 | AT車?[(※1)](#annotation1) | 滑らかに動く?[(※2)](#annotation2) |
| --- | --- | --- | --- | --- |
| marumasa.minuma | MarumasaUSB | 2 | ❌ | ❌ |
| marumasa.smooth\_example | MarumasaUSB | 2 | ❌ | ✅ |
| fhrk.simpletruck | fhrk\_ | 4 | ❌ | ❌ |
| fhrk.simplebus | fhrk\_ | 13 | ❌ | ❌ |
| salmon.car | rupirupi\_ | 7 | ❌ | ❌ |
| toilet.sedans13 | \_woodtoilet | 6 | ❌ | ❌ |
| toilet.t34tankq | \_woodtoilet | 1 | ❌ | ❌ |
| salmon.keitruck | rupirupi\_ | 5 | ❌ | ❌ |
| tetsuota.luup | nukonuko\_221 | 1 | ❌ | ❌ |
| 以下 現在使用不可 | | | | |
| marumasa.minumaat | MarumasaUSB | 2 | ✅ | ❌ |
| salmon.carat | rupirupi\_ | 7 | ✅ | ❌ |
| toilet.sedans13at | \_woodtoilet | 6 | ✅ | ❌ |

#### AT車について

致命的なバグが発見されたため現在使用不可です。復活しない可能性もあります。  
  
AT車はホットバーがシフトレバーになる車です。降りればインベントリはもとに戻ります。  
ちなみに、インベントリからクラクションやウィンカーも操作できます。

#### SmoothCarについて

SmoothCarはまるまさ氏が作った滑らかに動く車です。まだ対応車両は少ないです。
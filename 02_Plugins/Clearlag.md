---
title: Clearlag
---

ワールド内のエンティティ（アイテムなど）を自動的に消去する。  

### プラグイン概要

### コマンド・パーミッション一覧

### config.yml

#### 概要・バージョン

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

|#--------------------------------------------------------------------#  
# ClearLag Configuration File #  
#--------------------------------------------------------------------#  
# Configure to your liking, reload the config by tying: /lagg reload #  
# - #  
# Here is a helpful tutorial on this configuration setup! (Updated) #  
# [http://dev.bukkit.org/bukkit-plugins/clearlagg/pag...](http://dev.bukkit.org/bukkit-plugins/clearlagg/pages/config-setup/) #  
#--------------------------------------------------------------------#  
# All possible mob names: <https://goo.gl/cch8YK> #  
#--------------------------------------------------------------------#  
config-version: 20|

##### 和訳

＃------------------------------------------------- -------------------＃  
＃ClearLag構成ファイル＃  
＃------------------------------------------------- -------------------＃  
＃好きに設定することができて、次のコマンドを入力すると即時に反映されます。：/ lagg reload＃  
＃-＃  
＃これは、この構成設定に関する役立つチュートリアルです。 （更新しました） ＃  
＃http：//dev.bukkit.org/bukkit-plugins/clearlagg/pages/config-setup/＃  
＃------------------------------------------------- -------------------＃  
＃エンティティの名前はここから確認できます。：https：//goo.gl/cch8YK＃  
＃------------------------------------------------- -------------------＃  
構成バージョン：20

#### TPS・言語

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

# -- 'use-internal-tps' Should clearlag just use the calculated internal TPS? (Improves accuracy)  
# -- 'language' Clearlag supports multiple languages (<https://github.com/bob7l/Clearlag-Languages)> translated by the community  
# -- 'use-internal-tps' Should Clearlag use Spigot's /tps? (Updated by minutes, much slower, but more accurate!)  
settings:  
language: japanese  
auto-update: true  
enable-api: true  
use-internal-tps: true

##### 和訳

＃-'use-internal-tps' clearlagは、プラグインが計算したTPSを元に処理を実行しますか？ （精度が向上します）  
＃-'language' Clearlagは、コミュニティによって翻訳された複数の言語（<https://github.com/bob7l/Clearlag-Languages>）をサポートしています  
＃-'use-internal-tps'ClearlagはSpigotの/tpsコマンドによって出る値を元に処理を実行しますか？（時間がかかりますが、より正確です）  
設定：  
言語：日本語  
自動更新：true  
enable-api：true  
use-internal-tps：true

#### ラグ・サーバー監視

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Monitors your server's main thread for locking/freezing. Helps figure out what's causing lag-spikes  
# NOTE: This will outprint mostly just stacktraces. It's up to YOU to interpret the stacktrace  
# NOTE: (!Important!) Clearlag will print EVERYTHING to your Spigot/Bukkit server logs!  
# NOTE: A large 'Garbage collection time' generally means the spike was caused by the Garbage collector (Memory issue basically..)  
# -- 'enabled' Should this be enabled (Prints data to your logs, not ingame chat)  
# -- 'min-elapsed-time' How long (IN MILLISECONDS) of a server-tick constitutes a freeze/lock? I don't recommend going under ~80  
# -- 'check-interval' How often (IN MILLISECONDS) should the server be checked? Lower the number, more accurate the timings  
# -- 'follow-stack' Should Clearlag keep printing the stacktrace every time it changes (Can be very spammy)?  
# Help-> [https://dev.bukkit.org/projects/clearlagg/pages/fi...](https://dev.bukkit.org/projects/clearlagg/pages/finding-the-cause-of-lag-spikes)  
lag-spike-helper:  
enabled: false  
min-elapsed-time: 500  
check-interval: 100  
follow-stack: true

##### 和訳

＃サーバーがフリーズしたりするのを監視します。ラグスパイクの原因を特定するのに役立ちます  
＃注：これはエラー直前のログ等を出力します。それらを解釈するのはあなた次第です  
＃注:(！重要！）Clearlagは、すべてをサーバーログに出力します！  
＃注：「ガベージコレクション時間」が大きいということは、通常、スパイクがガベージコレクターによって引き起こされたことを意味します（基本的にメモリの問題です。）  
＃-'enabled'これを有効にする必要があります（ゲーム内チャットではなく、ログにデータを出力します）  
＃-'min-elapsed-time'サーバーティックのどのくらいの時間（ミリ秒単位）がフリーズ/ロックを構成しますか？ 80未満になることはお勧めしません  
＃-'check-interval'サーバーをチェックする頻度（ミリ秒単位）はどれくらいですか？数値を小さくすると、タイミングがより正確になります  
＃-'follow-stack' Clearlagは、変更されるたびにエラー直前のログを出力し続ける必要がありますか（非常にスパムになる可能性があります）？  
＃ヘルプ-> [https://dev.bukkit.org/projects/clearlagg/pages/fi...](https://dev.bukkit.org/projects/clearlagg/pages/finding-the-cause-of-lag-spikes)  
lag-spike-helper:  
enabled: false  
min-elapsed-time: 500  
check-interval: 100  
follow-stack: true

#### ホッパー転送量設定

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Limits the amount of item transfers for all the hoppers in a single chunk  
# -- 'transfer-limit' How many transfers per check interval until the hopper should be disabled  
# -- 'check-interval' In seconds, on what interval should the transfer limit be reset  
hopper-limiter:  
enabled: false  
transfer-limit: 5  
check-interval: 1

##### 和訳

＃1つのチャンク内のすべてのホッパーのアイテム転送の量を制限します  
＃-'transfer-limit'ホッパーを無効にするまでのチェック間隔ごとの転送回数  
＃-'check-interval'秒単位で、転送制限をリセットする間隔  
ホッパーリミッター：  
有効：false  
転送制限：5  
チェック間隔：1

#### RAMが一定以上になるとコマンド実行

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Meters your ram usage. If it goes above 'limit', run 'commands:'  
# NOTE: It's perfectly normal for your server to be using a lot of memory. The JVM's garbage collector will automatically free memory.  
# NOTE: Only use this if you have very little memory that can't support the server  
# -- 'ram-limit' is in MB, do not set it exactly to your max allocated ram amount  
# -- 'interval' is how often clearlag will check your ram usage  
# -- 'commands' lists the commands that will be ran upon hitting your ram-limit  
ram-meter:  
enabled: false  
interval: 20  
ram-limit: 5000  
commands:

* 'lagg killmobs'
* 'lagg clear'

##### 和訳

＃RAMの使用量を測定します。 'limit'を超える場合は、 'コマンドを実行します：'  
＃注：サーバーが大量のメモリを使用しているのは完全に正常です。 JVMのガベージコレクタは自動的にメモリを解放します。  
＃注：サーバーをサポートできないメモリが非常に少ない場合にのみ、これを使用してください  
＃-'ram-limit'はMB単位であり、割り当てられた最大RAM量に正確に設定しないでください  
＃-'interval'は、clearlagがRAMの使用状況をチェックする頻度です  
＃-'commands'は、RAM制限に達したときに実行されるコマンドを一覧表示します  
ラムメーター：  
有効：false  
間隔：20  
ラム制限：5000  
コマンド：  

* 'ラグキルモブ'
* 'ラグクリア'

#### /lagghaltコマンドの設定

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Configure what the '/lagg halt' command does  
# -- 'remove-entities' remove entities such as items, primed-tnt, and mobs  
# -- 'disable-natural-entity-spawning' disables the server's natural world spawning  
# -- 'halted' this section defines which actions should be halted during '/lagg halt'  
halt-command:  
remove-entities: true  
disable-natural-entity-spawning: true  
halted:  
fire: true  
fire-burn: true  
explosion: true  
decay: true  
block-fade: true  
block-form: true  
block-spread: true  
block-natural-change: true

##### 和訳

＃「/ lagghalt」コマンドの機能を構成します  
＃-'remove-entities'は、items、primed-tnt、mobなどのエンティティを削除します  
＃-'disable-natural-entity-spawning'は、サーバーの自然界のスポーンを無効にします  
＃-'halted'このセクションは、 '/ lagghalt'の間にどのアクションを停止する必要があるかを定義します  
停止コマンド：  
エンティティの削除：true  
disable-natural-entity-spawning：true  
停止：  
火：本当  
火傷：本当  
爆発：本当  
崩壊：真  
ブロックフェード：true  
ブロック形式：true  
ブロックスプレッド：true  
block-natural-change：true

#### 移動速度制限

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#This limits how fast a user can move by walking or flying in a single tick (20 ticks a second)  
#I HIGHLY recommend you use this on servers with increased player-speed/fly to prevent chunk overload  
#You may also use Spigot's internal speed limiters to achieve the same goal if present on your version (better performance)  
# -- 'move-max-speed' Max speed on foot  
# -- 'fly-max-speed' Max speed while flying  
player-speed-limiter:  
enabled: false  
move-max-speed: 0.7  
fly-max-speed: 0.8

##### 和訳

＃これにより、ユーザーが1ティック（1秒あたり20ティック）で歩いたり飛んだりして移動できる速度が制限されます。  
#Iチャンクの過負荷を防ぐために、プレーヤー速度/フライが増加したサーバーでこれを使用することを強くお勧めします  
＃バージョンに存在する場合は、Spigotの内部スピードリミッターを使用して同じ目標を達成することもできます（パフォーマンスの向上）  
＃-'move-max-speed'徒歩での最高速度  
＃-'fly-max-speed'飛行中の最大速度  
プレーヤースピードリミッター：  
有効：false  
移動-最大速度：0.7  
フライ-最大速度：0.8

#### アイテムがスポーンするタイミングを設定（？）

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Set the age of specific items when they're first spawned so they naturally despawn faster, or slower then others  
#Recommended for servers with a lot of item-entities consisting mostly of useless items (Such as stone)  
#Material list: [https://hub.spigotmc.org/javadocs/spigot/org/bukki...](https://hub.spigotmc.org/javadocs/spigot/org/bukkit/Material.html)  
# -- 'items' Lists the material names of the entities with their spawn-age (In seconds)  
item-spawn-age-setter:  
enabled: false  
items:  
stone: 240  
grass: 240  
cobblestone: 240  
log: 240  
stone\_axe: 240  
stone\_pickaxe: 240  
stone\_sword: 240  
wooden\_axe: 240  
wooden\_pickaxe: 240  
wooden\_sword: 240  
rotten\_flesh: 240  
gravel: 240  
dirt: 240  
leather: 200  
sand: 240  
bone: 240  
beef: 240  
chicken: 160  
rabbit: 240  
salmon: 240  
cactus: 210  
wool: 180  
arrow: 160  
PORKCHOP: 240  
potato: 240  
RED\_TULIP: 240

##### 和訳

＃特定のアイテムが最初にスポーンされたときの年齢を設定して、他のアイテムよりも自然に速く、または遅くスポーンするようにします  
＃ほとんど役に立たないアイテム（石など）で構成されるアイテムエンティティが多数あるサーバーに推奨  
＃マテリアルリスト：https：//hub.spigotmc.org/javadocs/spigot/org/bukkit/Material.html  
＃-'items'エンティティのマテリアル名とそのスポーン年齢（秒単位）を一覧表示します  
item-spawn-age-setter：  
有効：false  
アイテム：  
石：240  
草：240  
石畳：240  
ログ：240  
stone\_axe：240  
stone\_pickaxe：240  
stone\_sword：240  
wood\_axe：240  
wood\_pickaxe：240  
wood\_sword：240  
rotten\_flesh：240  
砂利：240  
汚れ：240  
革：200  
砂：240  
骨：240  
牛肉：240  
鶏肉：160  
うさぎ：240  
鮭：240  
サボテン：210  
ウール：180  
矢印：160  
ポークチョップ：240  
じゃがいも：240  
RED\_TULIP：240

#### MOB密集抑制

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Should mobs be nerfed to prevent over-breeding to reduce CPU usage (And possibly raise TPS)  
#When mobs are stuck too close, collisions are extremely intensive putting a pretty mean load on the server  
# -- 'max-mobs' means how many bably/adult animals are allowed within the 'check-radius'  
# -- 'check-radius' is the radius of what clearlag will check for 'max-mobs'  
mob-breeding-limiter:  
enabled: false  
max-mobs: 6  
check-radius: 15

##### 和訳

＃CPU使用率を減らすために、過剰繁殖を防ぐためにモブを弱体化する必要があります（そしておそらくTPSを上げる）  
＃Mobが近づきすぎると、衝突が非常に激しくなり、サーバーにかなり平均的な負荷がかかります  
＃-'max-mobs'は、 'check-radius'内で許可されるbably / adult動物の数を意味します  
＃-'check-radius'は、clearlagが 'max-mobs'をチェックする半径です。  
mob-breeding-limiter：  
有効：false  
最大モブ：6  
チェック半径：15

#### サーバーログファイルを自動削除

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Should clearlag purge logs under /logs when the server starts?  
# -- 'days-old' means how many days old can the log be to be deleted  
log-purger:  
enabled: false  
days-old: 3

##### 和訳

＃サーバーの起動時に/ logsの下のログをclearlagでパージする必要がありますか？  
＃-'days-old'は、ログを削除できる日数を意味します  
ログパージャー：  
有効：false  
生後3日

#### /lagg系で削除しないエンティティ

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#What type of entities SHOULD NOT be removed while doing /lagg area?  
area-filter:

* Itemframe
* Minecart
* Wolf
* Villager
* Horse
* ARMOR\_STAND

##### 和訳

＃/ lagg領域を実行している間、どのタイプのエンティティを削除すべきではありませんか？  
エリアフィルター：  

* アイテムフレーム
* トロッコ
* 狼
* 村人
* 馬
* ARMOR\_STAND

#### プラグインのバージョンが上がった時、設定をリセットするか

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Should clearlag reset the config, or attempt to update your config on updates  
# -- 'force-update' is whether or not clearlag will reset your config with a newer version  
# -- settings this to false will make clearlag update your config rather then resetting  
config-updater:  
force-update: false

##### 和訳

＃設定をクリアラグリセットするか、更新時に構成を更新しようとする必要があります  
＃-'force-update'は、clearlagが新しいバージョンで設定をリセットするかどうかです  
＃-これをfalseに設定すると、clearlagは、リセットするのではなく、構成を更新します。  
config-updater：  
強制更新：false

#### MOBegg発生制限

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#This limits the mob egg spawners so players cannot "overload" the server with them  
# -- 'check-radius' is the radius clearlag will check for nearby entities  
# -- 'max-mobs' is how many entities may be in the radius before the spawning is blocked  
mobegg-limiter:  
enabled: false  
check-radius: 8  
max-mobs: 5

##### 和訳

＃これは暴徒の卵のスポナーを制限するので、プレイヤーはサーバーを「オーバーロード」できません  
＃-'check-radius'は、clearlagが近くのエンティティをチェックする半径です。  
＃-'max-mobs'は、スポーンがブロックされる前に半径内に存在する可能性のあるエンティティの数です。  
mobegg-リミッター：  
有効：false  
チェック半径：8  
最大モブ：5

#### チャンク生成制限（非推奨）

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Disable new chunk generation, or just put a cap on how many can load at once.  
#May cause many bugs with Spigot 1.8+, not recommended!  
# -- 'create-new-chunks' disables or enables chunk creation. false would disallow new chunks  
# -- !UNSTABLE ON SPIGOT BUILDS!  
chunk-limiter:  
enabled: false  
limit: 6000  
create-new-chunks: true

##### 和訳

＃新しいチャンクの生成を無効にするか、一度にロードできる数に上限を設定します。  
＃Spigot 1.8以降で多くのバグが発生する可能性がありますが、お勧めしません。  
＃-'create-new-chunks'は、チャンクの作成を無効または有効にします。 falseは、新しいチャンクを許可しません  
＃-！SPIGOTビルドで不安定！  
チャンクリミッター：  
有効：false  
制限：6000  
create-new-chunks：true

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#This modifies the view range of entities  
# -- Lower it is, the better your entity tick will be and the more CPU cycles you'll save  
# -- If it's too high, expect bugs / lots of lag  
mob-range:
> enabled: false
> zombie: 30
> skeleton: 30
> creeper: 20

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#How long should items/Mobs be left on the ground  
# -- live-time's go by ticks (20 ticks a second)  
live-time:
> enabled: false
> interval: 10
> mobtimer: true
> itemtimer: true
> arrowtimer: true
> arrowkilltime: 15
> moblivetime: 600
> itemlivetime: 240

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#This option disallows the placement of too many tnt-minecarts  
# -- 'radius' is the radius clearlag will check for TNT-Minecarts  
tnt-minecart:
> enabled: false
> max: 2
> radius: 6

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#This option reduces global dispenser fire rate  
# -- 'time' is in milliseconds  
dispenser-reducer:
> enabled: false
> time: 100

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#This option reduces the explosions of mass amounts of tnt, and reduces tnt lag  
# -- 'check-radius' is the radius clearlag will check for primed TNT  
# -- 'max-primed' is the max primed TNT within the radius allowed before clearlag begins to remove  
tnt-reducer:
> enabled: false
> check-radius: 5
> max-primed: 3

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#This option reduces fire spread rate  
# -- 'time' is in milliseconds  
firespread-reducer:
> enabled: false
> time: 2000

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#How many entities should one chunk be allowed to hold?  
# -- 'entities' lists all the entities that will be counted  
# and possibly removed.  
chunk-entity-limiter:
> enabled: false
> limit: 10
> entities:
> - Squid
> - Zombie
> - Skeleton
> - Creeper
> - Chicken
> - Pig
> - Sheep
> - Cow
> - Horse
> # - Pig liveTime=100 <- This mob will be REMOVED if it's been alive for 100 ticks (5 seconds)

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#A per-entity chunk limiter. Very useful to limiting useless mobs like squid, but not zombies  
# -- 'entity-limits' lists all the entities, their filters, and 'limit' to specify their limit  
# to be removed/culled  
# -- 'passive-purger' Enables random checking of chunks to see whether they're exceeding limits.  
# -- Useful for when you want to prevent lag exploiting  
# -- 'passive-cleaning-enabled' Enables the passive-purger  
# -- 'check-interval' How often (in ticks, 50MS) should chunks be checked  
# -- 'chunk-batch-size' How many chunks at once should be checked  
per-entity-chunk-entity-limiter:
> enabled: false
> entity-limits:
> - Squid limit:1
> - Zombie limit:2
> - Skeleton limit:2
> - Creeper limit:2
> - Chicken limit:3
> - Pig limit:5
> - Sheep limit:5
> - Cow limit:5
> - Horse limit:3 !hasName
> - Villager limit:4
> - Arrow limit:4 inGround
> - Rabbit limit:2
> - PufferFish limit:2
> - Silverfish limit:2
> - TROPICAL\_FISH limit:2
> - COD limit:2
> - DOLPHIN limit:2
> - Bat limit:1
> - Armorstand limit:10
> passive-cleaner:
> passive-cleaning-enabled: false
> check-interval: 20
> chunk-batch-size: 100

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#How many mobs should be allowed to spawn globally  
# -- 'interval' is the check interval check the current spawn amounts  
spawn-limiter:
> enabled: false
> interval: 15
> mobs: 300
> animals: 300

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Meters your TPS, if it goes to low, run the commands you wrote below!  
# -- 'interval' is how often tps-meter will check the TPS  
# -- 'tps-trigger' is at what TPS the commands will be ran at  
# -- 'tps-recover' is at what TPS should the TPS be considered stable after 'tps-trigger' is executed  
# -- 'commands' lists what commands will be executed when tps-tigger is reached  
# -- 'recover-commands' lists what commands will be executed when tps-recover is reached  
# -- 'trigger-broadcast-message' specifies which message should be broadcasted when tps-trigger runs  
# -- 'recover-broadcast-message' specifies which message should be broadcasted when TPS recovers  
# -- 'broadcast-enabled' defines whether or not tps-meter should broadcast  
tps-meter:
> enabled: false
> trigger-broadcast-message: '&6[ClearLag] &cThe server is overloaded, executing lag-perventing measures'
> recover-broadcast-message: '&6[ClearLag] &aThe server is no longer overloaded!'
> broadcast-enabled: false
> interval: 15
> tps-trigger: 14.0
> tps-recover: 19.0
> commands:
> - 'lagg killmobs'
> - 'lagg clear'
> - 'lagg halt on'
> recover-commands:
> - 'lagg halt off'

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#This is /lagg killmobs, put what you DON'T want removed!  
# -- 'remove-named', when FALSE entities with custom names will NOT be removed  
# -- 'mob-filter' lists which mobs will be IGNORED during /lagg killmobs  
kill-mobs:
> remove-named: false
> mob-filter:
> - Villager
> - Wolf

# - Pig !name="Test" <- This entity will filtered if the name does NOT equal "Test"  
# - Zombie hasName <- This entity will be filtered if it HAS a name
> - ARMOR\_STAND
> - Horse

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#This nerfs mob-spawners (Natural and player-made)  
#-------------------------------------------------  
#This goes by chunks rather then spawners. This is to prevent  
#a large buildup of mob-spawners within a small region to "bypass"  
#your set limit. It also allows for keys to be generated more easily  
#increasing the performance  
# -- 'max-spawn' is the maximum mobs allowed to spawn by a mob-spawner  
# -- 'remove-mobs-on-chunk-unload' is whether or not Clearlag should remove  
# -- the mobs spawned by the mobspawner upon chunk unload (Highly Recommended)  
mobspawner:
> enabled: false
> max-spawn: 4
> remove-mobs-on-chunk-unload: true

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Dont use if you have CB++ or Spigot!  
item-merger:
> enabled: false
> radius: 6

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Auto-removal options  
# -- warnings works like this; time = the time warning should be given, msg = warning message at that time  
# -- NOTE: The below 'remove' section applies to this remover!  
# -- NOTE: Putting the interval to low will cause issues!  
# -- NOTE: To disable "warnings", set it to "warnings: []"  
# -- NOTE: bukkit.broadcast.user permission will allow users to see broadcasts (If not enabled by default)  
#  
# !==[ All string values MUST be inside '']==!  
#  
# -- 'remove-entities' lists what entities should be REMOVED on removal  
# -- 'warnings' list warnings to be given out at specified times  
# -- 'item-filter' What ground-items should NOT be removed during removal  
# -- 'remove-entities' What entities SHOULD be removed during removal  
auto-removal:
> enabled: true
> broadcast-message: '&6[ClearLag] &aRemoved +RemoveAmount Entities!'
> broadcast-removal: true
> autoremoval-interval: 600
> world-filter:
> # - this\_world <-This world will be ignored during removal!
> boat: false
> falling-block: true
> experience-orb: true
> painting: false
> projectile: false
> item: true
> itemframe: false
> minecart: false
> primed-tnt: true
> item-filter:
> # - Stone <-This item-id will be ignored during removal!
> # - Grass
> remove-entities:
> - Arrow onGround
> - Snowball
> - Egg
> - Fireball
> - Boat !isMounted
> - Minecart !isMounted
> - MINECART\_TNT
> # - cow <- This mob-type will be REMOVED during removal!
> # - MINECART\_MOB\_SPAWNER
> # - Pig liveTime=100 <- This mob will be REMOVED if it's been alive for 100 ticks (5 seconds)
> # - Minecart !isMounted <- This entity will be REMOVED if it's NOT mounted
> # - Wolf !hasName <- This entity will be REMOVED if it doesn't have a name
> warnings:
> - 'time:540 msg:&4[ClearLag] &cWarning Ground items will be removed in &7+remaining &cseconds!'

##### 和訳

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#What should be removed during /lagg clear, nearly the same thing as auto-removal  
command-remove:  
world-filter:  
# - this\_world <-This world will be ignored during removal!  
broadcast-removal: false  
boat: true  
falling-block: true  
experience-orb: true  
painting: false  
projectile: true  
item: true  
itemframe: false  
minecart: true  
primed-tnt: true  
item-filter:  
# - Stone <-This item-id will be ignored during removal!  
# - Grass  
remove-entities:  
# - cow <- This mob-type will be REMOVED during removal!  
# - MINECART\_MOB\_SPAWNER  
# - Pig liveTime=100 <- This mob will be REMOVED if it's been alive for 100 ticks (5 seconds)  
# - Minecart !isMounted <- This entity will be REMOVED if it's NOT mounted  
# - Wolf !hasName <- This entity will be REMOVED if it doesn't have a name

##### 和訳

＃/ laggクリア中に削除する必要があるもの、自動削除とほぼ同じこと  
コマンド-削除：  
ワールドフィルター：  
＃-this\_world <-この世界は削除中に無視されます！  
ブロードキャスト-削除：false  
ボート：本当  
フォーリングブロック：true  
経験-オーブ：本当  
絵画：偽  
発射物：true  
アイテム：true  
itemframe：false  
トロッコ：本当  
Primed-tnt：true  
アイテムフィルター：  
＃-石<-このアイテムIDは削除中に無視されます！  
＃ - 草  
エンティティの削除：  
＃-牛<-このmobタイプは、削除中に削除されます！  
＃-MINECART\_MOB\_SPAWNER  
＃-Pig liveTime = 100 <-このmobは、100ティック（5秒）生きていると削除されます  
＃-Minecart！isMounted <-このエンティティは、マウントされていない場合は削除されます  
＃-Wolf！hasName <-このエンティティに名前がない場合、このエンティティは削除されます

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

#Very very old, but still works. Just specifies a global entity limit. I'd recommend 'custom-trigger-removal' instead  
# -- 'max' max entities allowed before the entity removal is activated  
limit:  
enabled: false  
max: 1000  
check-interval: 60  
broadcast-message: '&6[ClearLag] &aLimit reached, removed +RemoveAmount Entities!'  
world-filter:  
# - this\_world <-This world will be ignored during removal!  
broadcast-removal: true  
boat: true  
falling-block: true  
experience-orb: true  
painting: false  
projectile: true  
item: true  
itemframe: false  
minecart: true  
primed-tnt: true  
item-filter:  
# - Stone  
# - Grass <-This item-id will be ignored during removal!

##### 和訳

＃非常に古いですが、それでも機能します。グローバルエンティティ制限を指定するだけです。代わりに「custom-trigger-removal」をお勧めします  
＃-'max'エンティティの削除がアクティブ化される前に許可される最大エンティティ  
制限：  
有効：false  
最大：1000  
チェック間隔：60  
ブロードキャストメッセージ： '＆6 [ClearLag]＆aLimitに到達し、+ RemoveAmountエンティティを削除しました！'  
ワールドフィルター：  
＃-this\_world <-この世界は削除中に無視されます！  
ブロードキャスト-削除：true  
ボート：本当  
フォーリングブロック：true  
経験-オーブ：本当  
絵画：偽  
発射物：true  
アイテム：true  
itemframe：false  
トロッコ：本当  
Primed-tnt：true  
アイテムフィルター：  
＃ - 結石  
＃-草<-このアイテムIDは削除中に無視されます！

#### ？

![](../attachments/386696e9903dfdfe8057eaf0b13380d0.gif)

##### 原文

# Create your own custom removal stuff!  
# -- warnings works like this; time = the time warning should be given, msg = warning message at that time  
# -- NOTE: The below 'remove' section applies to this remover!  
# \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/ \/  
# > READ FOR HELP -> [https://dev.bukkit.org/projects/clearlagg/pages/co...](https://dev.bukkit.org/projects/clearlagg/pages/config-setup) <- READ FOR HELP <  
# /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\ /\  
custom-trigger-removal:
> enabled: false
> triggers:
> trigger1:
> trigger-type: tps-trigger
> run-interval: 5
> tps-trigger: 14.0
> tps-recover: 19.0
> jobs:
> command-executor:
> commands:
> - 'lagg killmobs'
> - 'lagg clear'
> - 'lagg halt'
> recover-commands:
> - 'lagg halt'
> entity-clearer:
> execute-job-time: 120
> warnings:
> - 'time:60 msg:&4[ClearLag] &cEntities/drops will be purged in &7+remaining &cseconds!'
> - 'time:100 msg:&4[ClearLag] &cEntities/drops will be purged in &720 &cseconds!'
> - 'time:110 msg:&4[ClearLag] &cEntities/drops will be purged in &710 &cseconds!'
> world-filter:
> # - world <-This world will be ignored during removal
> removeEntities:
> - item
> - zombie !hasName
> - skeleton !hasName
> - pig !hasName
> - cow !hasName
> trigger2:
> trigger-type: entity-limit-trigger
> run-interval: 25
> limit: 200
> world-filter:
> # - world <-This world will be ignored during checking
> entity-limits:
> - zombie
> - skeleton
> - enderman
> jobs:
> entity-clearer:
> world-filter:
> # - world <-This world will be ignored during removal
> remove-entities:
> - zombie
> - skeleton
> - enderman

##### 和訳

[END]

### 参考
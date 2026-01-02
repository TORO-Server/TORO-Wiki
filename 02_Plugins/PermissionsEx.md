---
title: PermissionsEx
---

### 概要

* プレイヤーごと、またはプレイヤーが属するグループごとに使用可能なコマンドを決められる。

### config

### command

| コマンド | パーミッションノード | 解説 |
| --- | --- | --- |
| pex |  |  |
| pex toggle debug |  |  |
| pex user <user> toggle debug |  |  |
| pex user <user> check <permission> |  |  |
| pex reload |  |  |
| pex config <node> [value] |  |  |
| pex backend |  |  |
| pex backend <backend> |  |  |
| pex hierarchy |  |  |
| pex import <backend> |  |  |
| pex users cleanup <group> [threshold] |  |  |
|  |  |  |
| コマンド | パーミッションノード | 解説 |
| pex worlds |  |  |
| pex world <world> |  |  |
| pex world <world>  inherit <parentWorlds> |  |  |
|  |  |  |
| コマンド | パーミッションノード | 解説 |
| pex users list |  |  |
| pex users |  |  |
| pex user |  |  |
|  |  |  |
| コマンド | パーミッションノード | 解説 |
| pex user |  |  |
| pex user <user> |  |  |
| pex user <user> prefix [newprefix] |  |  |
| pex user <user> delete |  |  |
| pex user <user> list [world] |  |  |
| pex user <user>  add <permission> [world] |  |  |
| pex user <user>  remove <permission> [world] |  |  |
| pex user <user>  timed add <permission>  <lifetime in seconds> [world] |  |  |
| pex user <user>  timed remove <permission>  <lifetime in seconds> [world] |  |  |
| pex user <user>  set <option> <value> [world] |  |  |
|  |  |  |
| コマンド | パーミッションノード | 解説 |
| pex user <user> group list |  |  |
| pex user <user>  group add <group> [world] [lifetime] |  |  |
| pex user <user>  group set <group> [world] |  |  |
| pex user <user>  group remove <group> [world] |  |  |
|  |  |  |
| コマンド | パーミッションノード | 解説 |
| pex default group [world] |  |  |
| pex set default  group <group> <value> [world] |  |  |
|  |  |  |
| コマンド | パーミッションノード | 解説 |
| pex group |  |  |
| pex groups |  |  |
| pex groups list |  |  |
| pex group <group> prefix [newprefix] |  |  |
| pex group <group> suffix [newsuffix] |  |  |
| pex group <group> create [parents] |  |  |
| pex group <group> delete |  |  |
| pex group <group> parents list |  |  |
| pex group <group>  parents set <parents> |  |  |
| pex group <group> |  |  |
| pex group <group> list [world] |  |  |
| pex group <group>  add <permission> [world] |  |  |
| pex group <group>  remove <permission> [world] |  |  |
| pex group <group>  timed add <permission> [lifetime] [world] |  |  |
| pex group <group>  timed remove <permission> [world] |  |  |
| pex group <group>  set <option> <value> [world] |  |  |
| pex group <group> weight [weight] |  |  |
|  |  |  |
| コマンド | パーミッションノード | 解説 |
| pex group <group> users |  |  |
| pex group <group> user add <user> |  |  |
| pex group <group> user remove <user> |  |  |
| pex promote <user> <ladder> |  |  |
| pex demote <user> <ladder> |  |  |
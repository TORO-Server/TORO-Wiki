// Wiki (docs/) の分類と、サイト全体の設定
export const SITE_URL = 'https://wiki.torosaba.net';
export const REPO = 'TORO-Server/TORO-Wiki';
export const BRANCH = 'main';

export const CATEGORIES = [
  { dir: '00_Main', id: 'main', label: 'TORO Server', description: 'サーバーの概要とお知らせ' },
  { dir: '01_Guide', id: 'guide', label: 'ガイド', description: 'ルール・利用規約・はじめての方へ' },
  { dir: '02_Plugins', id: 'plugins', label: 'プラグイン・Mod', description: 'サーバーで使えるプラグインと Mod の使い方' },
  { dir: '03_Transportation', id: 'transport', label: '交通', description: '鉄道・道路・空港・バス' },
  { dir: '04_World_and_Cities', id: 'world', label: 'ワールド・都市', description: '自治体・都市・名所' },
  { dir: '05_Data', id: 'data', label: 'データ', description: '一覧表・素材集' },
  { dir: '06_Community', id: 'community', label: 'コミュニティ', description: 'ブログ・団体・イベント' },
  { dir: '07_System', id: 'system', label: 'システム', description: 'コマンド集など' },
];

// 一覧には出さないページ (URL では開ける)。seesaa のメニュー用ページなど
export const HIDDEN = ['MenuBar1', 'MenuBar2', 'Experimental', 'プラグイン解説（編集用）'];

// seesaa から一括で取り込んだコミットなど、「更新日」に数えないコミットの目印
export const SKIP_UPDATED_MARK = '[skip-updated]';
// これより前のコミット (seesaa からの移行作業) も数えない。それまでの更新日は seesaa の記録 (frontmatter の updated) を使う
export const GIT_SINCE = '2026-10-29T00:00:00+09:00';

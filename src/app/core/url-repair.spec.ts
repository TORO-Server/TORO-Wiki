// node --test src/app/core/url-repair.spec.ts  (npm test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { repairDoubleEncodedPath } from './url-repair.ts';

/** GitHub Pages の Location (UTF-8 の生のバイト) を、サービスワーカーが Latin-1 として読んで、もう一度エンコードしたもの */
const mojibake = (path: string) => '/' + path.split('/').filter(Boolean).map((seg) => encodeURIComponent(Buffer.from(seg, 'utf8').toString('latin1'))).join('/') + '/';

test('文字化けした URL を元に戻す', () => {
  assert.equal(repairDoubleEncodedPath('/wiki/%C3%A3%C2%83%C2%AB%C3%A3%C2%83%C2%BC%C3%A3%C2%83%C2%AB/'), '/wiki/%E3%83%AB%E3%83%BC%E3%83%AB/');
  for (const name of ['ルール', 'Discordについて', 'For_those_outside_Japan_日本国外から参加される方へ', '【空想鉄道】紺ノ葉鐵路', 'アイテムID一覧', '𠮷野家']) {
    assert.equal(repairDoubleEncodedPath(mojibake('wiki/' + name)), '/wiki/' + encodeURIComponent(name) + '/', name);
  }
});

test('文字化けしていない URL には触らない', () => {
  for (const ok of ['/', '/wiki', '/wiki/ルール', '/wiki/%E3%83%AB%E3%83%BC%E3%83%AB', '/wiki/%E3%83%AB%E3%83%BC%E3%83%AB/', '/wiki/Discord', '/wiki/caf%C3%A9', '/wiki/%C3%A9%C3%A9', '/wiki/%E0%A4%A', '/wiki/%C3%28']) {
    assert.equal(repairDoubleEncodedPath(ok), null, ok);
  }
});

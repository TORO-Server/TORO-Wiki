// node --test functions/api/lib/security.test.ts  (npm test)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkOrigin, corsHeaders, escapeHtml, resolveReturnTo } from './security.ts';
import type { Env } from './types.ts';

const env = { ALLOWED_ORIGINS: 'http://localhost:4200' } as Env;
const api = new URL('https://auth.torosaba.net/api/auth/login');

test('resolveReturnTo: 許したサイトと、同じサイトの相対パスだけ通す', () => {
  assert.equal(resolveReturnTo('https://wiki.torosaba.net/wiki/ルール', env, api), 'https://wiki.torosaba.net/wiki/%E3%83%AB%E3%83%BC%E3%83%AB');
  assert.equal(resolveReturnTo('/wiki/foo', env, api), 'https://auth.torosaba.net/wiki/foo');
  assert.equal(resolveReturnTo('http://localhost:4200/x', env, api), 'http://localhost:4200/x');
});

test('resolveReturnTo: 別のサイトへ飛ばされない', () => {
  const fallback = 'https://auth.torosaba.net/wiki';
  for (const bad of [
    'https://evil.example/',
    '//evil.example/',
    '/\\evil.example/',
    'https://wiki.torosaba.net.evil.example/',
    'https://wiki.torosaba.net@evil.example/',
    'javascript:alert(1)',
    'data:text/html,x',
    '',
    null,
    undefined,
  ]) {
    assert.equal(resolveReturnTo(bad as string | null, env, api), fallback, String(bad));
  }
});

test('checkOrigin: Origin が無い呼び出しは通し、許していないサイトは断る', () => {
  const req = (origin?: string) => new Request('https://auth.torosaba.net/api/docs/save', { method: 'POST', headers: origin ? { Origin: origin } : {} });
  assert.equal(checkOrigin(req(), env), true);
  assert.equal(checkOrigin(req('https://wiki.torosaba.net'), env), true);
  assert.equal(checkOrigin(req('https://auth.torosaba.net'), env), true);
  assert.equal(checkOrigin(req('https://evil.example'), env), false);
  assert.equal(checkOrigin(req('null'), env), false);
});

test('corsHeaders: 許したサイトは名指しで Cookie を許し、ほかには出さない', () => {
  const req = (origin?: string) => new Request('https://auth.torosaba.net/api/auth/me', { headers: origin ? { Origin: origin } : {} });
  const ok = corsHeaders(req('https://wiki.torosaba.net'), env);
  assert.equal(ok['Access-Control-Allow-Origin'], 'https://wiki.torosaba.net');
  assert.equal(ok['Access-Control-Allow-Credentials'], 'true');
  const ng = corsHeaders(req('https://evil.example'), env);
  assert.equal(ng['Access-Control-Allow-Origin'], undefined);
  assert.equal(ng['Access-Control-Allow-Credentials'], undefined);
  const none = corsHeaders(req(), env);
  assert.equal(none['Access-Control-Allow-Origin'], '*');
  assert.equal(none['Access-Control-Allow-Credentials'], undefined);
});

test('escapeHtml', () => {
  assert.equal(escapeHtml('<img src=x onerror="a()">&\''), '&lt;img src=x onerror=&quot;a()&quot;&gt;&amp;&#39;');
});

// docs/ の Markdown を、サイトが読む JSON (public/content) と RSS・サイトマップに変換する。
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import { join, dirname, posix, basename, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import { Marked } from 'marked';
import GithubSlugger from 'github-slugger';
import sanitizeHtml from 'sanitize-html';
import { SITE_URL, REPO, BRANCH, CATEGORIES, HIDDEN, SKIP_UPDATED_MARK, GIT_SINCE } from './content.config.ts';
import type { Category } from './content.config.ts';

interface TocItem {
  id: string;
  text: string;
  depth: number;
}

interface PageData {
  slug: string;
  id: string;
  title: string;
  category: string;
  updated: string | null;
  author: string | null;
  seesaa: string | null;
  hidden: boolean;
  source: string;
  dir: string;
  content: string;
  links: Set<string>;
  html?: string;
  toc?: TocItem[];
  text?: string;
  excerpt?: string;
}

interface GitHistoryItem {
  date: string;
  author: string;
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = join(ROOT, 'docs');
const PUBLIC = join(ROOT, 'public');
const OUT = join(PUBLIC, 'content');

const warnings: string[] = [];
const toPosix = (p: string): string => p.split(sep).join('/');

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== 'attachments' && !e.name.startsWith('.')) out.push(...(await walk(full)));
    } else if (e.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

/** git の履歴から、ファイルごとの最後の編集 (一括取り込みのコミットを除く) を集める */
function gitHistory(): Map<string, GitHistoryItem> {
  const map = new Map<string, GitHistoryItem>();
  try {
    const log = execFileSync(
      'git',
      ['-c', 'core.quotepath=false', 'log', `--since=${GIT_SINCE}`, '--format=%x00%cI%x09%an%x09%s', '--name-only', '--', 'docs'],
      { cwd: ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 },
    );
    for (const chunk of log.split('\0').slice(1)) {
      const [head, ...files] = chunk.split('\n');
      const [date, author, subject] = head.split('\t');
      if (subject && subject.includes(SKIP_UPDATED_MARK)) continue;
      for (const f of files) {
        if (f && !map.has(f)) map.set(f, { date, author });
      }
    }
  } catch (e: any) {
    warnings.push(`git log を読めませんでした: ${e.message}`);
  }
  return map;
}

const stripTags = (html: string): string =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const escapeXml = (s: string): string =>
  s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] || c);

const safeDecode = (s: string): string => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

const pageUrl = (slug: string): string => `/${encodeURIComponent(slug)}`;

/** 見出しと、旧 Wiki から引き継いだ手書きの「目次」を除いた、最初の文章 */
function makeExcerpt(html: string): string {
  const body = html
    .replace(/<h\d[\s\S]*?<\/h\d>/g, ' ')
    .replace(/<a class="anchor"[^>]*>#<\/a>/g, '')
    // 「目次」と書いた段落と、そのすぐ後ろの一覧 (リンクだけの入れ子の箇条書き) を除く
    .replace(/<(p|strong|b)>\s*(?:<(?:strong|b)>)?\s*目次\s*(?:<\/(?:strong|b)>)?\s*<\/\1>\s*(<(ul|ol)>[\s\S]*?<\/\3>)?/g, ' ');
  const paragraphs = [...body.matchAll(/<p[\s>][\s\S]*?<\/p>|<p>[\s\S]*?<\/p>/g)].map((m) => stripTags(m[0])).filter((t) => t.length > 1);
  const text = paragraphs.length ? paragraphs.join(' ') : stripTags(body);
  return text.slice(0, 140);
}

const CSS_COLOR = [/^#[0-9a-f]{3,8}$/i, /^[a-z]+$/i, /^(rgb|hsl)a?\([\d\s,.%/]+\)$/i, /^var\(--[a-z0-9-]+\)$/i];

/**
 * ページの頭書きを読む。読むのは YAML と JSON だけ。
 * gray-matter は、頭書きの区切りの行に書かれた言語で読み方を変え、既定では JavaScript も評価する。
 * ページは Wiki の編集者が書くものなので、ビルドの中でプログラムとして動かさない。読めない頭書きは、無いものとして扱う
 */
function frontMatter(raw: string, rel: string): { data: Record<string, unknown>; content: string } {
  const refuse = (): never => {
    throw new Error('front matter は YAML か JSON だけ');
  };
  try {
    const { data, content } = matter(raw, { language: 'yaml', engines: { javascript: refuse, coffee: refuse } });
    return { data, content };
  } catch (err) {
    console.warn(`${rel}: 頭書きを読めません (${String(err)})`);
    return { data: {}, content: raw };
  }
}

async function main(): Promise<void> {
  const files = (await walk(DOCS)).filter((f) => toPosix(relative(DOCS, f)) !== 'README.md');
  const history = gitHistory();

  // 1 周目: ページの一覧を作る (リンクの解決に使う)
  const pages: PageData[] = [];
  const byPath = new Map<string, PageData>();
  const bySlug = new Map<string, PageData>();
  const slugKeys = new Set<string>();
  // 02_Plugins などを先に処理して、短い URL は本来のページに割り当てる
  files.sort((a, b) => toPosix(relative(DOCS, a)).localeCompare(toPosix(relative(DOCS, b))));
  for (const file of files) {
    const rel = toPosix(relative(DOCS, file));
    const raw = await readFile(file, 'utf8');
    const { data: fm, content } = frontMatter(raw, rel);
    const name = basename(file, '.md');
    const dir = rel.split('/')[0];
    const cat = CATEGORIES.find((c: Category) => c.dir === dir);
    let slug = name.replace(/\s+/g, '_');
    // 大文字・小文字だけが違う名前 (CoreProtect / Coreprotect) も、出力のフォルダーがぶつかる環境があるので分ける
    if (slugKeys.has(slug.toLowerCase())) {
      slug = `${cat?.id ?? dir}-${slug}`;
    }
    slugKeys.add(slug.toLowerCase());
    const git = history.get(`docs/${rel}`);
    const fmDate = fm.updated ? new Date(fm.updated).toISOString() : null;
    const gitDate = git ? new Date(git.date).toISOString() : null;
    const useGit = Boolean(gitDate && (!fmDate || gitDate > fmDate));
    const page: PageData = {
      slug,
      id: createHash('sha1').update(slug).digest('hex').slice(0, 12),
      title: String(fm.title ?? name),
      category: cat?.id ?? 'other',
      updated: useGit ? gitDate : fmDate,
      author: useGit ? (git?.author ?? null) : (fm.author ?? null),
      seesaa: fm.seesaa ?? null,
      hidden: HIDDEN.includes(name) || fm.hidden === true,
      source: `docs/${rel}`,
      dir: posix.dirname(rel),
      content,
      links: new Set<string>(),
    };
    pages.push(page);
    byPath.set(rel, page);
    bySlug.set(slug, page);
  }

  /** ページ内のリンク・画像の URL を、サイトの URL に直す */
  const resolveUrl = (page: PageData, href: string | undefined | null, kind: 'link' | 'image'): { href: string | null; external?: boolean } => {
    if (!href) return { href: href ?? null };
    if (/^(https?:|mailto:|tel:|data:)/i.test(href) || href.startsWith('//')) {
      const m = href.match(/^https?:\/\/seesaawiki\.jp\/toro_server\/d\/([^#?]+)/);
      if (m) warnings.push(`${page.source}: seesaa のリンクが残っています ${href}`);
      return { href, external: true };
    }
    if (href.startsWith('#')) return { href };
    if (href.startsWith('/')) return { href };
    const [pathPart, hash] = href.split('#');
    const target = posix.normalize(posix.join(page.dir, safeDecode(pathPart)));
    if (target.startsWith('attachments/')) {
      return { href: '/' + target.split('/').map(encodeURIComponent).join('/') };
    }
    if (kind === 'link') {
      const linked = byPath.get(target) ?? byPath.get(target + '.md');
      if (linked) {
        page.links.add(linked.slug);
        return { href: pageUrl(linked.slug) + (hash ? '#' + hash : '') };
      }
    }
    warnings.push(`${page.source}: リンク先が見つかりません ${href}`);
    return { href: null };
  };

  // 2 周目: HTML にする
  for (const page of pages) {
    const slugger = new GithubSlugger();
    const toc: TocItem[] = [];
    const marked = new Marked({
      gfm: true,
      renderer: {
        heading({ tokens, depth }: { tokens: any; depth: number }) {
          const inner = this.parser.parseInline(tokens);
          const text = stripTags(inner);
          const id = slugger.slug(text) || `h-${toc.length}`;
          if (depth <= 4) toc.push({ id, text, depth });
          return `<h${depth} id="${id}"><a class="anchor" href="#${id}" aria-hidden="true">#</a>${inner}</h${depth}>\n`;
        },
      },
    });
    let html = marked.parse(page.content) as string;

    html = sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'del', 's', 'ins', 'details', 'summary', 'span', 'font', 'u', 'center', 'input']),
      allowedAttributes: {
        '*': ['id', 'style', 'align', 'title', 'class'],
        a: ['href', 'name', 'target', 'rel', 'aria-hidden'],
        img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
        td: ['colspan', 'rowspan', 'bgcolor'],
        th: ['colspan', 'rowspan', 'bgcolor'],
        font: ['color', 'size'],
        ol: ['start'],
        input: ['type', 'checked', 'disabled'],
      },
      allowedSchemes: ['http', 'https', 'mailto'],
      // data: は埋め込みの画像だけ
      allowedSchemesByTag: { img: ['http', 'https', 'data'] },
      // 記事の見た目に使うものだけ。位置や大きさを変えて、サイトの画面を覆い隠せないようにする
      allowedStyles: {
        '*': {
          color: CSS_COLOR,
          'background-color': CSS_COLOR,
          'font-size': [/^\d+(\.\d+)?(px|em|rem|%)$/, /^(x{0,2}-small|small|medium|large|x{1,3}-large)$/],
          'text-align': [/^(left|right|center|justify)$/],
          'text-wrap': [/^(wrap|nowrap|balance|pretty)$/],
        },
      },
      transformTags: {
        // チェックボックスの見た目だけ (フォームの部品としては使わせない)
        input: (_tag: string, attribs: Record<string, string>) => ({
          tagName: 'input',
          attribs: { type: 'checkbox', disabled: 'disabled', ...(attribs.checked != null ? { checked: 'checked' } : {}) },
        }),
        a: (_tag: string, attribs: Record<string, string>) => {
          // href の無い <a id="..."> はリンクではなく、飛び先の目印 (seesaa から引き継いだもの)
          if (attribs.href == null) return { tagName: 'a', attribs: { ...attribs } };
          const r = resolveUrl(page, attribs.href, 'link');
          const a = { ...attribs };
          if (r.href == null) {
            delete a.href;
            a.class = 'missing-link';
          } else {
            a.href = r.href;
          }
          if (r.external) {
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
          }
          return { tagName: 'a', attribs: a };
        },
        img: (_tag: string, attribs: Record<string, string>) => {
          const r = resolveUrl(page, attribs.src, 'image');
          // https のページに http の画像を置くと、ブラウザーによっては読まれないので https にする
          const src = (r.href ?? '').replace(/^http:\/\//i, 'https://');
          return { tagName: 'img', attribs: { ...attribs, src, loading: 'lazy', decoding: 'async', ...(r.external ? { referrerpolicy: 'no-referrer' } : {}) } };
        },
      },
    });
    // 同じページの中の #見出し へのリンクで、飛び先が無いもの (旧 Wiki の「S」の注記など) は、リンクをやめて文字だけにする
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    html = html.replace(/<a ([^>]*?)href="#([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g, (whole, before, hash, after, inner) => {
      // 見出しの横の「#」(自分の見出しへのリンク) はそのまま
      if (/class="anchor"/.test(before + after)) return whole;
      const id = safeDecode(hash);
      return !id || ids.has(id) || ids.has(hash) ? whole : `<span class="missing-link">${inner}</span>`;
    });
    html = html.replace(/<table/g, '<div class="table-wrap"><table').replace(/<\/table>/g, '</table></div>');

    const text = stripTags(html.replace(/<a class="anchor"[^>]*>#<\/a>/g, ''));
    page.html = html;
    page.toc = toc;
    page.text = text;
    page.excerpt = makeExcerpt(html);
  }

  const backlinks = new Map<string, string[]>();
  for (const p of pages) {
    for (const s of p.links) {
      if (s === p.slug) continue;
      if (!backlinks.has(s)) backlinks.set(s, []);
      backlinks.get(s)!.push(p.slug);
    }
  }

  await rm(OUT, { recursive: true, force: true });
  await mkdir(join(OUT, 'pages'), { recursive: true });

  const sorted = [...pages].sort((a, b) => a.title.localeCompare(b.title, 'ja'));
  const index = {
    generatedAt: new Date().toISOString(),
    repo: REPO,
    branch: BRANCH,
    categories: CATEGORIES.map(({ id, label, description }) => ({ id, label, description })),
    pages: sorted.map((p) => ({
      slug: p.slug,
      id: p.id,
      title: p.title,
      category: p.category,
      updated: p.updated,
      author: p.author,
      excerpt: p.excerpt,
      ...(p.hidden ? { hidden: true } : {}),
    })),
  };
  await writeFile(join(OUT, 'index.json'), JSON.stringify(index));

  for (const p of pages) {
    await writeFile(
      join(OUT, 'pages', `${p.id}.json`),
      JSON.stringify({
        slug: p.slug,
        title: p.title,
        category: p.category,
        updated: p.updated,
        author: p.author,
        seesaa: p.seesaa,
        source: p.source,
        html: p.html,
        toc: p.toc,
        backlinks: (backlinks.get(p.slug) ?? []).sort((a, b) => a.localeCompare(b, 'ja')),
      }),
    );
  }

  await writeFile(
    join(OUT, 'search.json'),
    JSON.stringify(pages.filter((p) => !p.hidden).map((p) => ({ s: p.slug, t: p.title, c: p.category, x: p.text }))),
  );

  // RSS (最近更新されたページ)
  const recent = pages.filter((p) => p.updated && !p.hidden).sort((a, b) => (b.updated || '').localeCompare(a.updated || '')).slice(0, 30);
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>TORO Server Wiki 更新情報</title>
<link>${SITE_URL}/updates</link>
<atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
<description>TORO Server 公式サイト・Wiki の最近更新されたページ</description>
<language>ja</language>
${recent
  .map(
    (p) => `<item>
<title>${escapeXml(p.title)}</title>
<link>${SITE_URL}${pageUrl(p.slug)}</link>
<guid isPermaLink="false">${escapeXml(p.slug)}@${p.updated}</guid>
<pubDate>${new Date(p.updated!).toUTCString()}</pubDate>
${p.author ? `<dc:creator>${escapeXml(p.author)}</dc:creator>\n` : ''}<description>${escapeXml(p.excerpt ?? '')}</description>
</item>`,
  )
  .join('\n')}
</channel>
</rss>
`;
  await writeFile(join(PUBLIC, 'feed.xml'), rss);

  const urls: Array<{ loc: string; lastmod?: string | null }> = [
    { loc: '/' },
    { loc: '/wiki' },
    { loc: '/updates' },
    { loc: '/map' },
    ...pages.filter((p) => !p.hidden).map((p) => ({ loc: pageUrl(p.slug), lastmod: p.updated })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${SITE_URL}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod.slice(0, 10)}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
  await writeFile(join(PUBLIC, 'sitemap.xml'), sitemap);

  console.log(`content: ${pages.length} pages, ${warnings.length} warnings`);
  if (process.argv.includes('--verbose')) for (const w of warnings) console.warn('  ' + w);
  else if (warnings.length) console.warn('  (詳しくは --verbose)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

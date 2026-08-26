// scripts/audit.mjs — 살아 있는 사이트를 열어서 재는 검사. 의존성 없음(Node 20 내장 fetch).
//
// 왜 이게 있는가:
// CI 는 유닛테스트와 빌드만 했다. 페이지를 한 번도 열어보지 않았다.
// 그래서 CEO 100장이 만들어질 때부터 404 였고, 두 개의 한글 라우트가 통째로 죽어 있었고,
// 14개 경로에 og:image 가 아예 없어 카카오톡에 빈 카드로 떴다 — 전부 초록불인 채로.
// 손으로 브라우저를 열어 잰 날에만 발견됐다. 그물이 없으면 같은 일이 계속 반복된다.
//
// 쓰는 법:
//   node scripts/audit.mjs --base=http://localhost:3000 --scope=core
//   node scripts/audit.mjs --base=https://nakchalsaju.com --scope=all
// 문제가 하나라도 있으면 종료코드 1.

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.length ? v.join('=') : 'true'];
}));
const BASE = (args.base || 'http://localhost:3000').replace(/\/$/, '');
const SCOPE = args.scope || 'core';
const CHECK_LINKS = args.links !== 'false';

const errors = [];
const notes = [];
const err = (where, msg) => errors.push(`${where} — ${msg}`);

const enc = p => BASE + p.split('/').map(encodeURIComponent).join('/').replace(/%2F/g, '/');

async function get(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'nakchal-audit' } });
      const body = res.headers.get('content-type')?.includes('text/html') ? await res.text() : '';
      return { status: res.status, url: res.url, body };
    } catch (e) {
      if (attempt === 2) return { status: 0, url, body: '', error: String(e) };
      await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
    }
  }
}

// ── 검사할 경로 고르기 ──────────────────────────────
// 사이트맵에서 읽는다. 새 라우트 계열이 생기면 자동으로 감사 대상이 된다 —
// 목록을 손으로 관리하면 언젠가 빠뜨린다. CEO 100장이 그렇게 빠져 있었다.
async function pickPaths() {
  const r = await get(BASE + '/sitemap.xml');
  if (r.status !== 200) { err('/sitemap.xml', `상태 ${r.status}`); return []; }
  const locs = [...r.body.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => decodeURIComponent(m[1].replace(BASE, '').replace(/^https?:\/\/[^/]+/, '')) || '/');
  if (SCOPE === 'all') return [...new Set(locs)];

  // core: 한 계열당 두 장씩만. 대표성은 유지하고 시간은 아낀다.
  const byFamily = new Map();
  for (const p of locs) {
    const fam = p === '/' ? '/' : '/' + p.split('/').filter(Boolean)[0];
    const list = byFamily.get(fam) || [];
    if (list.length < 2) list.push(p);
    byFamily.set(fam, list);
  }
  return [...new Set([].concat(...byFamily.values()))];
}

// ── 페이지 한 장 검사 ──────────────────────────────
const seenTitles = new Map();

function auditPage(path, res) {
  const where = path;
  if (res.status !== 200) { err(where, `상태 ${res.status}${res.error ? ' ' + res.error : ''}`); return null; }

  const landed = decodeURIComponent(new URL(res.url).pathname);
  if (landed !== path) err(where, `${landed} 으로 넘어간다 — 사이트맵에 실린 주소가 자기 자신이 아니다`);

  const h = res.body;
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(where, `h1 이 ${h1}개 (정확히 하나여야 한다)`);

  if (!/<meta property="og:image"/.test(h))
    err(where, 'og:image 없음 — 카카오톡·네이버에 빈 카드로 뜬다');

  if (!/rel="canonical"/.test(h)) err(where, 'canonical 없음');

  if (/<meta name="robots"[^>]*noindex/i.test(h))
    err(where, '사이트맵에 실려 있는데 noindex 다');

  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (!title.trim()) err(where, '<title> 이 비었다');
  else {
    const prev = seenTitles.get(title);
    if (prev) err(where, `제목이 ${prev} 와 똑같다 — 구글이 중복으로 본다`);
    else seenTitles.set(title, where);
  }

  const lang = (h.match(/<html[^>]*lang="([^"]*)"/) || [])[1] || '';
  const want = path.startsWith('/zh') ? 'zh-Hant' : path.startsWith('/en') ? 'en' : 'ko';
  if (lang !== want) err(where, `html lang="${lang}" 인데 ${want} 여야 한다`);

  return h;
}

// ── 내부 링크가 살아 있는지 ────────────────────────
function internalLinks(html) {
  return [...html.matchAll(/href="(\/[^"#?]*)"/g)]
    .map(m => decodeURIComponent(m[1]))
    .filter(p => !p.startsWith('/_next') && !p.startsWith('/api') && !/\.[a-z0-9]{2,5}$/i.test(p))
    .map(p => (p.length > 1 ? p.replace(/\/$/, '') : p));
}

async function main() {
  const paths = await pickPaths();
  if (!paths.length) { console.error('검사할 경로를 못 찾았다.'); process.exit(1); }
  console.log(`${BASE} · scope=${SCOPE} · ${paths.length}개 경로`);

  const linkTargets = new Set();
  let done = 0;
  for (const p of paths) {
    const res = await get(enc(p));
    const html = auditPage(p, res);
    if (html && CHECK_LINKS) for (const l of internalLinks(html)) linkTargets.add(l);
    if (++done % 25 === 0) console.log(`  … ${done}/${paths.length}`);
  }

  if (CHECK_LINKS) {
    const checked = new Set(paths);
    const todo = [...linkTargets].filter(l => !checked.has(l));
    console.log(`내부 링크 ${todo.length}개 확인`);
    for (const l of todo) {
      const r = await get(enc(l));
      // 로그인 게이트로 넘어가는 건 정상이다(보관함·마이페이지). 404·5xx 만 잡는다.
      if (r.status !== 200) err(`link ${l}`, `상태 ${r.status} — 어딘가에서 걸고 있는데 죽은 주소다`);
    }
  }

  console.log('');
  if (errors.length) {
    console.error(`✗ ${errors.length}건\n`);
    for (const e of errors) console.error('  ' + e);
    console.error('');
    process.exit(1);
  }
  for (const n of notes) console.log('  · ' + n);
  console.log(`✓ ${paths.length}개 경로 이상 없음`);
}

main().catch(e => { console.error(e); process.exit(1); });


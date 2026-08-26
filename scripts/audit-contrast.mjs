// scripts/audit-contrast.mjs — WCAG AA 명암비. 진짜 브라우저가 있어야 잴 수 있다.
//
// 하루에 164건이 나온 항목이다. 정적 분석으로는 못 잡는다 —
// 반투명 배경을 조상까지 합성해야 하고, 상속받은 색과 CSS 변수가 실제로 무엇으로
// 계산되는지 알아야 한다. 그래서 크로미움을 띄운다.
//
// playwright 는 package.json 에 넣지 않는다. 워크플로에서 --no-save 로만 깔아
// package-lock.json 을 건드리지 않는다(웹 에디터로는 lock 을 다시 만들 수 없다).
//
//   npm i --no-save playwright && npx playwright install --with-deps chromium
//   node scripts/audit-contrast.mjs --base=http://localhost:3000 --scope=core

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.length ? v.join('=') : 'true'];
}));
const BASE = (args.base || 'http://localhost:3000').replace(/\/$/, '');
const SCOPE = args.scope || 'core';

// 페이지 안에서 도는 검사기. 오탐을 세 번 내고 나서 굳은 규칙이 셋 있다:
//  1. 반투명 배경은 조상까지 아래에서 위로 합성한다. 첫 불투명 배경만 쓰면 홈에서만 15건이 헛나온다.
//  2. 그라디언트(background-image)는 잴 수 없다. 안 건너뛰면 흰 글자가 흰 배경으로 계산된다.
//  3. aria-hidden 은 조상까지 거슬러 본다. 장식 글자를 위반으로 세면 멀쩡한 걸 고치게 된다.
const PROBE = () => {
  const px = v => parseFloat(v) || 0;
  const parse = c => {
    const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null;
    const p = m[1].split(',').map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = c => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1,
  });
  const hex = c => '#' + [c.r, c.g, c.b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('');
  const out = [];
  document.querySelectorAll('*').forEach(el => {
    const t = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim())
      .map(n => n.textContent.trim()).join(' ');
    if (!t) return;
    for (let n = el; n; n = n.parentElement) if (n.getAttribute && n.getAttribute('aria-hidden') === 'true') return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || px(cs.opacity) === 0) return;
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage && s.backgroundImage !== 'none') return;
    }
    const stack = [];
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) stack.push(c);
    }
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (let i = stack.length - 1; i >= 0; i--) bg = over(stack[i], bg);
    const fgc = parse(cs.color); if (!fgc) return;
    const fg = over(fgc, bg);
    const L1 = Math.max(lum(fg), lum(bg)), L2 = Math.min(lum(fg), lum(bg));
    const ratio = (L1 + 0.05) / (L2 + 0.05);
    const size = px(cs.fontSize), w = parseInt(cs.fontWeight) || 400;
    const need = (size >= 24 || (size >= 18.66 && w >= 700)) ? 3 : 4.5;
    if (ratio < need - 0.01) {
      out.push(`"${t.slice(0, 20)}" ${ratio.toFixed(2)}:1 (${need} 필요) ${hex(fg)} on ${hex(bg)}`);
    }
  });
  return out;
};

async function paths() {
  const r = await fetch(BASE + '/sitemap.xml');
  const body = await r.text();
  const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => decodeURIComponent(m[1].replace(/^https?:\/\/[^/]+/, '')) || '/');
  if (SCOPE === 'all') return [...new Set(locs)];
  const fam = new Map();
  for (const p of locs) {
    const k = p === '/' ? '/' : '/' + p.split('/').filter(Boolean)[0];
    const l = fam.get(k) || []; if (l.length < 2) l.push(p); fam.set(k, l);
  }
  return [...new Set([].concat(...fam.values()))];
}

async function main() {
  const { chromium } = await import('playwright');
  const list = await paths();
  console.log(`${BASE} · scope=${SCOPE} · ${list.length}개 경로 · 명암비`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const bad = [];
  let done = 0;
  for (const p of list) {
    const url = BASE + p.split('/').map(encodeURIComponent).join('/').replace(/%2F/g, '/');
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      const hits = await page.evaluate(PROBE);
      for (const h of hits) bad.push(`${p} — ${h}`);
    } catch (e) {
      bad.push(`${p} — 열지 못했다: ${String(e).slice(0, 90)}`);
    }
    if (++done % 25 === 0) console.log(`  … ${done}/${list.length}`);
  }
  await browser.close();

  console.log('');
  if (bad.length) {
    console.error(`✗ ${bad.length}건\n`);
    for (const b of bad) console.error('  ' + b);
    console.error('');
    process.exit(1);
  }
  console.log(`✓ ${list.length}개 경로 명암비 이상 없음`);
}

main().catch(e => { console.error(e); process.exit(1); });


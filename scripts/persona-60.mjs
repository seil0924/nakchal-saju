// 60명이 낙찰사주를 처음부터 끝까지 눌러 본다.
//
// 개발자 10 · 웹기획자 10 · 모바일기획자 10 · 디자이너 10 · 마케터 10 · UX라이터 10.
// 엔진은 창업레이더 scripts/persona-80.mjs 에서 가져왔다. 상권분석가 20명은 뺐다 — 이 사이트엔 상권 숫자가 없다.
//
// 두 번 돈다.
//  1) 화면 순회 — 역할마다 열 명이 전 화면을 나눠 본다. 그래서 역할 하나가 사이트 전체를 덮는다.
//     개발자는 콘솔과 응답 코드를, 모바일기획자는 휴대폰 폭을, UX라이터는 글을 본다.
//  2) 흐름 — 웹기획자 10명과 모바일기획자 5명이 생년월일을 실제로 넣고 결과 → 잠금 → 결제창까지 간다.
//     '결제하기' 는 누르지 않는다. 다만 폼 제출은 라이브 원장에 리포트 한 줄을 남긴다(saveReport) —
//     이름을 '점검용' 으로 넣어 관리자 화면에서 가려낼 수 있게 한다.
//
// 헤드리스 크롬엔 관리자 쿠키가 없다. 그래서 손님이 보는 잠금 화면이 그대로 검사된다.
// 새 의존성 없음 — 크롬은 이 PC 에 있고 WebSocket 은 node 에 들어 있다.
//
// 실행: node scripts/persona-60.mjs [https://nakchalsaju.com]

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const base = (process.argv[2] ?? 'https://nakchalsaju.com').replace(/\/$/, '');
const CHROME = process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), 'persona-60-result.json');

// ── 화면. 상세 주소는 라이브 허브에서 뽑은 실제 주소다. ──
const PAGES = [
  '/', '/reading', '/reading?cat=daepyo', '/reading?cat=sajeong', '/reading?cat=calendar',
  '/reading?cat=daeun', '/reading?cat=gunghap', '/reading?cat=balju',
  '/hoesa', '/hoesa?n=점검건설&d=2016-02-05', '/jari', '/bokchae', '/full', '/taekil', '/taekil/개업일',
  '/balju', '/balju/한국도로공사', '/ceo', '/ceo/스티브잡스', '/column', '/column/ipchun-gijun',
  '/glossary', '/glossary/사정률', '/guide/입찰-사주', '/region/서울', '/industry/전기공사',
  '/saju/갑목-일간', '/why', '/why/haha', '/saeobunse', '/saeobunse/2026',
  '/pricing', '/product/balju', '/samples', '/method', '/faq', '/more', '/review', '/vault', '/ritual',
  '/terms', '/privacy', '/refund', '/login', '/mypage', '/en/bazi', '/zh/bazi',
  '/report/does-not-exist', '/this-page-does-not-exist',
];
const EXPECT_404 = new Set(['/this-page-does-not-exist']);
const url = (p) => base + (p.includes('%') ? p : encodeURI(p));

const VIEW = {
  desktopL: { width: 1440, height: 900, mobile: false, label: '데스크톱 1440' },
  desktop: { width: 1280, height: 800, mobile: false, label: '데스크톱 1280' },
  laptop: { width: 1024, height: 768, mobile: false, label: '노트북 1024' },
  tablet: { width: 768, height: 1024, mobile: true, label: '태블릿 768' },
  phone: { width: 375, height: 812, mobile: true, label: '아이폰 375' },
  phoneL: { width: 412, height: 915, mobile: true, label: '갤럭시 412' },
};

// ── 60명. 기억은 각자 무엇을 먼저 보는지를 정한다. ──
const ROLES = [
  { key: 'dev', label: '개발자', count: 10, views: ['desktopL', 'desktop', 'laptop'],
    memory: ['7년차 프론트엔드, 들어오자마자 콘솔부터 연다', '백엔드 출신, 실패한 요청을 먼저 센다',
      'QA 5년, 404 가 404 로 오는지 본다', '성능 덕후, 느린 응답을 잰다', '접근성 담당, 라벨 없는 입력을 찾는다'] },
  { key: 'planner', label: '웹기획자', count: 10, views: ['desktopL', 'desktop'],
    memory: ['커머스 기획 8년, 막다른 화면을 싫어한다', '서비스 기획, 결제까지 몇 번 누르는지 센다',
      'IA 담당, 길을 잃는 곳을 찾는다', '전환 퍼널을 그리는 사람, 돈 내면 뭐가 열리는지 본다', '정책 기획, 환불·약관 고지를 본다'] },
  { key: 'mobile', label: '모바일기획자', count: 10, views: ['phone', 'phoneL', 'tablet'],
    memory: ['앱 기획 6년, 엄지가 닿는지 본다', '가로 스크롤을 제일 싫어한다',
      '작은 글씨를 못 참는다', '고정된 막대가 내용을 가리는지 본다', '현장에서 한 손으로 쓸 수 있는지 본다'] },
  { key: 'design', label: '디자이너', count: 10, views: ['desktopL', 'desktop', 'phone'],
    memory: ['프로덕트 디자이너, 호버가 살아 있는지 본다', 'UI 일관성 담당, 머리글·바닥글이 같은지 본다',
      '타이포 담당, 12px 아래를 싫어한다', '색 담당, 버튼이 버튼처럼 보이는지 본다', '이미지 담당, 깨진 그림을 찾는다'] },
  { key: 'marketer', label: '마케터', count: 10, views: ['desktopL', 'phone'],
    memory: ['퍼포먼스 마케터, 첫 화면에 행동 버튼이 있는지 본다', 'SEO 담당, 제목·설명·canonical 을 본다',
      '공유 담당, 카톡 미리보기 그림을 본다', '가격을 먼저 찾는 사람', 'GEO 담당, 제목 H1 이 하나인지 본다'] },
  { key: 'writer', label: 'UX라이터', count: 10, views: ['desktop', 'phone'],
    memory: ['UX 라이터 5년, 과장 문구를 찾는다', '영어 찌꺼기를 싫어한다',
      'undefined·NaN 이 화면에 새는 것을 찾는다', '빈 화면에 안내가 있는지 본다', '탭 제목에 브랜드가 두 번 붙는지 본다'] },
];

const FAMILY = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권'];
const GIVEN = ['도현', '서연', '민준', '지우', '하준', '수아', '예준', '지민', '시우', '하은', '주원', '유진', '건우', '채원', '현우'];

const personas = [];
let serial = 0;
for (const role of ROLES) {
  for (let i = 0; i < role.count; i += 1) {
    serial += 1;
    personas.push({
      id: serial, role: role.key, roleLabel: role.label, idx: i,
      name: FAMILY[(serial * 7) % FAMILY.length] + GIVEN[(serial * 11) % GIVEN.length],
      memory: role.memory[i % role.memory.length],
      view: VIEW[role.views[i % role.views.length]],
      // 역할 안에서 화면을 나눠 갖는다 → 역할 하나가 전 화면을 덮는다. 메인은 모두가 본다.
      pages: ['/', ...PAGES.filter((p, k) => p !== '/' && k % role.count === i)],
    });
  }
}

// ── 화면 안에서 도는 검사. 역할마다 보는 눈이 다르다. ──
const AUDIT = (role, mobile) => `(() => {
  const out = [];
  const say = (kind, what, detail, severity) => out.push({ kind, what: String(what).slice(0, 90), detail, severity });
  const name = (el) => {
    const cls = typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(' ')[0] : '';
    const t = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 22);
    return el.tagName.toLowerCase() + cls + (t ? ' "' + t + '"' : '');
  };
  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || el.closest('[hidden]')) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const text = document.body.innerText || '';
  const R = ${JSON.stringify(role)};

  for (const bad of ['undefined', 'NaN', '[object Object]', 'null원', 'Infinity']) {
    if (text.includes(bad)) say('화면에 샌 코드 값', bad, '"' + bad + '" 이(가) 글로 보입니다.', '높음');
  }

  if (R === 'mobile' || ${mobile}) {
    const over = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    if (over > 2) say('가로 스크롤', location.pathname, '화면이 가로로 ' + over + 'px 넘칩니다.', '높음');
  }
  if (R === 'mobile') {
    let small = 0; const eg = [];
    for (const el of document.querySelectorAll('button, a[href], select, input:not([type=hidden])')) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.closest('p, li, dd');
      if (!inline && r.height < 32 && r.width < 200 && ((el.textContent || '').trim() || el.tagName !== 'A')) {
        small += 1; if (eg.length < 3) eg.push(name(el) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
      }
    }
    if (small) say('엄지가 안 닿음', location.pathname, '높이 32px 아래 누를 것 ' + small + '곳 — 예: ' + eg.join(' · '), small > 5 ? '중간' : '낮음');
    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el);
      if (s.position !== 'fixed' && s.position !== 'sticky') continue;
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.height > innerHeight * 0.22 && r.width > innerWidth * 0.8) {
        say('고정 막대가 화면을 가림', name(el), '화면의 ' + Math.round(r.height / innerHeight * 100) + '% 를 덮고 있습니다.', '중간');
      }
    }
  }

  if (R === 'design' || R === 'mobile' || R === 'writer') {
    let tiny = 0; let sample = '';
    for (const el of document.querySelectorAll('p, span, li, td, a, button, small, em, dd, dt, label')) {
      if (!visible(el) || !(el.textContent || '').trim()) continue;
      if (el.children.length > 0 && el.tagName !== 'A' && el.tagName !== 'BUTTON') continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 12) { tiny += 1; if (!sample) sample = name(el) + ' ' + size + 'px'; }
    }
    if (tiny > 0) say('글씨가 너무 작음', location.pathname, '12px 아래 글이 ' + tiny + '곳 — 예: ' + sample, tiny > 10 ? '중간' : '낮음');
  }

  if (R === 'design') {
    for (const img of document.querySelectorAll('img')) {
      if (visible(img) && img.complete && img.naturalWidth === 0) say('깨진 그림', img.src.slice(-50), '그림이 안 불러와졌습니다.', '중간');
    }
  }

  if (R === 'marketer' || R === 'planner') {
    const title = document.title || '';
    if (!title || title.length < 8) say('제목이 없거나 짧음', location.pathname, '탭 제목: "' + title + '"', '중간');
    // 색인 제외(noindex) 페이지 — 404·로그인·리포트 — 는 canonical·공유 그림이 없어야 맞다(첫 재실행 404 페이지 오탐).
    const noindex = /noindex/i.test(document.querySelector('meta[name="robots"]')?.getAttribute('content') || '');
    const priv = noindex || /^\\/(report|admin|mypage|login)/.test(location.pathname);
    const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    if (!desc && !priv) say('검색 설명이 없음', location.pathname, '검색 결과에 한 줄 설명이 안 뜹니다.', '낮음');
    if (R === 'marketer') {
      if (!priv && !document.querySelector('link[rel="canonical"]')) say('canonical 없음', location.pathname, '같은 글이 여러 주소로 잡힐 수 있습니다.', '낮음');
      if (!document.querySelector('meta[property="og:image"]') && !priv) say('공유 미리보기 그림 없음', location.pathname, '카톡에 붙이면 그림이 안 나옵니다.', '낮음');
      // 검색엔진은 보이는 화면이 아니라 문서를 읽는다. 보이는 것만 세면 홈 캐러셀이 넘어간 순간 0 이 나온다(첫 실행 오탐).
      const h1 = document.querySelectorAll('h1').length;
      if (!priv && h1 !== 1) say('H1 이 ' + h1 + '개', location.pathname, '제목 H1 은 하나여야 검색·AI 요약이 주제를 잡습니다.', '낮음');
    }
  }

  if (R === 'planner') {
    // 이 사이트엔 <main> 이 없다. 'main a' 로 세면 모든 화면이 막다른 화면이 된다(첫 실행 49건 전부 오탐).
    // 머리글·바닥글·하단 탭을 빼고 센다.
    const frame = '.topbar, .foot, .dfoot, .nav5, .tab, .dnav, header, footer';
    const actions = [...document.querySelectorAll('a[href], button, select, input')].filter((el) => visible(el) && !el.closest(frame));
    if (actions.length === 0) say('막다른 화면', location.pathname, '머리글을 빼면 다음에 누를 것이 없습니다.', '중간');
  }

  if (R === 'dev') {
    for (const input of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
      if (!visible(input)) continue;
      const labelled = input.labels?.length || input.getAttribute('aria-label') || input.getAttribute('aria-labelledby') || input.closest('label') || input.title;
      if (!labelled) say('라벨 없는 입력칸', name(input) + (input.placeholder ? ' [' + input.placeholder + ']' : ''), '화면 낭독기가 무슨 칸인지 못 읽습니다.', '낮음');
    }
    for (const img of document.querySelectorAll('img')) {
      if (visible(img) && !img.hasAttribute('alt')) say('대체 글 없는 그림', img.src.slice(-40), 'alt 가 없습니다.', '낮음');
    }
  }

  if (R === 'writer') {
    for (const word of ['Lorem', 'TODO', 'FIXME', 'placeholder', 'lorem', 'Loading...', 'Something went wrong']) {
      if (text.includes(word)) say('남은 작업 흔적', word, '"' + word + '" 이(가) 화면에 있습니다.', '높음');
    }
    // 과장 — 사정률은 추첨이라 못 맞힌다. 맞힌다·보장한다는 말이 있으면 안 된다.
    const hype = text.match(/낙찰\\s?보장|당첨\\s?보장|사정률을?\\s?(맞혀|맞춰|예측해)\\s?드립니다|100%\\s?낙찰/);
    if (hype) say('과장 문구', hype[0], '사정률은 복수예비가격 추첨입니다. 맞힌다·보장한다고 쓰면 안 됩니다.', '높음');
    const brand = (document.title.match(/낙찰사주/g) || []).length;
    if (brand > 1) say('탭 제목에 브랜드가 두 번', document.title.slice(0, 60), '"낙찰사주" 가 ' + brand + '번 붙었습니다.', '중간');
    if (text.trim().length < 80 && !location.pathname.startsWith('/admin')) say('거의 빈 화면', location.pathname, '글이 ' + text.trim().length + '자뿐입니다.', '중간');
  }

  return out;
})()`;

const HOVER_PROBE = `(() => {
  const items = [...document.querySelectorAll('main a[href], main button, header a')]
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; })
    .slice(0, 8);
  return items.map((el, i) => {
    el.setAttribute('data-hover-probe', String(i));
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return { i, x: r.left + r.width / 2, y: r.top + r.height / 2,
      before: [s.backgroundColor, s.color, s.textDecorationLine, s.borderColor, s.boxShadow, s.transform, s.opacity].join('|'),
      label: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 20) || el.tagName.toLowerCase() };
  });
})()`;

// ── 흐름: 비어 있는 입력칸을 채운다. React 가 값을 받게 원래 setter 로 넣고 이벤트를 쏜다. ──
const FILL = `(() => {
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  let n = 0;
  for (const sel of document.querySelectorAll('main select, form select, select')) {
    if (!vis(sel) || sel.value) continue;
    const opts = [...sel.options].filter((o) => !o.disabled && o.value);
    if (!opts.length) continue;
    const pick = opts[Math.floor(opts.length / 2)];
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(sel, pick.value);
    sel.dispatchEvent(new Event('change', { bubbles: true })); n += 1;
  }
  const setIn = (el, v) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); n += 1; };
  for (const el of document.querySelectorAll('input')) {
    if (!vis(el) || el.value) continue;
    if (el.type === 'date') setIn(el, '2016-02-05');
    else if (el.type === 'text' || el.type === '') setIn(el, el.maxLength > 0 && el.maxLength < 4 ? '점검' : '점검용');
  }
  return n;
})()`;

// ── CDP ──
const userDataDir = path.join(os.tmpdir(), 'cr-persona60-' + Date.now());
const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${userDataDir}`,
], { stdio: ['ignore', 'ignore', 'pipe'] });

const wsUrl = await new Promise((resolve, reject) => {
  let buffer = '';
  const timer = setTimeout(() => reject(new Error('크롬이 뜨지 않았습니다')), 20000);
  chrome.stderr.on('data', (chunk) => {
    buffer += chunk.toString();
    const found = buffer.match(/ws:\/\/[^\s]+/);
    if (found) { clearTimeout(timer); resolve(found[0]); }
  });
  chrome.on('exit', () => { clearTimeout(timer); reject(new Error('크롬이 바로 종료됐습니다')); });
});

const socket = new WebSocket(wsUrl);
await new Promise((resolve) => { socket.onopen = resolve; });

let messageId = 0;
const waiting = new Map();
const listeners = new Set();
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && waiting.has(message.id)) { waiting.get(message.id)(message); waiting.delete(message.id); return; }
  if (message.method) for (const fn of listeners) fn(message);
};
// 답이 안 오면 '빈 답' 이 아니라 '실패' 로 돌려준다 — 멈춘 화면이 깨끗한 화면으로 보이면 안 된다.
const send = (method, params = {}, sessionId, timeoutMs = 30000) => new Promise((resolve, reject) => {
  const id = ++messageId;
  const timer = setTimeout(() => { waiting.delete(id); reject(new Error(`${method} 이(가) ${timeoutMs / 1000}초 안에 답하지 않았습니다`)); }, timeoutMs);
  waiting.set(id, (message) => { clearTimeout(timer); resolve(message); });
  socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { result: target } = await send('Target.createTarget', { url: 'about:blank' });
const { result: attached } = await send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
const session = attached.sessionId;
for (const domain of ['Page', 'Runtime', 'Network', 'Log']) await send(`${domain}.enable`, {}, session);

let pageEvents = [];
let docStatus = 0;
let docStart = 0; let docMs = 0;
listeners.add((message) => {
  if (message.sessionId !== session) return;
  const p = message.params ?? {};
  if (message.method === 'Runtime.exceptionThrown') {
    pageEvents.push({ kind: '잡히지 않은 오류', detail: (p.exceptionDetails?.exception?.description ?? p.exceptionDetails?.text ?? '').split('\n')[0].slice(0, 160) });
  } else if (message.method === 'Runtime.consoleAPICalled' && p.type === 'error') {
    const line = (p.args ?? []).map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 160);
    if (!/favicon|DevTools/.test(line)) pageEvents.push({ kind: '콘솔 오류', detail: line });
  } else if (message.method === 'Network.responseReceived') {
    const r = p.response ?? {};
    if (p.type === 'Document') { docStatus = r.status; docMs = Date.now() - docStart; }
    else if (r.status >= 400 && !/favicon|\.map$/.test(r.url ?? '')) pageEvents.push({ kind: `요청 실패 ${r.status}`, detail: (r.url ?? '').replace(base, '').slice(0, 120) });
  } else if (message.method === 'Network.loadingFailed' && !p.canceled && p.type !== 'Document') {
    if (!/ERR_ABORTED/.test(p.errorText ?? '')) pageEvents.push({ kind: '요청이 끊김', detail: (p.errorText ?? '') });
  }
});

const evaluate = async (expression) => {
  const response = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, session);
  if (response.result?.exceptionDetails) throw new Error(response.result.exceptionDetails.exception?.description ?? '스크립트 오류');
  return response.result?.result?.value;
};
const go = async (p) => { docStatus = 0; docStart = Date.now(); await send('Page.navigate', { url: url(p) }, session); await sleep(2600); };
const setView = (v) => send('Emulation.setDeviceMetricsOverride', { width: v.width, height: v.height, deviceScaleFactor: 1, mobile: v.mobile }, session);

// ══ 1) 화면 순회 ══
console.log(`${base} — 60명이 저마다 들어와 눌러 봅니다. 화면 ${PAGES.length}개.\n`);
const raw = [];
const pageCache = new Map();
const started = Date.now();

for (const persona of personas) {
  await setView(persona.view);
  for (const page of persona.pages) {
    const cacheKey = `${page}|${persona.view.width}|${persona.role}`;
    let found = pageCache.get(cacheKey);
    if (!found) {
      pageEvents = [];
      found = [];
      let reached = true;
      try { await go(page); } catch (error) {
        reached = false;
        found.push({ kind: '화면이 안 열림', what: page, detail: String(error.message).slice(0, 140), severity: '높음' });
      }
      if (reached) try {
        await evaluate('window.scrollTo(0, document.body.scrollHeight)'); await sleep(600);
        await evaluate('window.scrollTo(0, 0)'); await sleep(250);
        found.push(...(await evaluate(AUDIT(persona.role, persona.view.mobile)) ?? []));

        if ((persona.role === 'design' || persona.role === 'dev') && !persona.view.mobile) {
          const probes = await evaluate(HOVER_PROBE) ?? [];
          let dead = 0; const deadNames = [];
          for (const probe of probes) {
            await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: probe.x, y: probe.y }, session);
            await sleep(160);
            const after = await evaluate(`(() => { const el = document.querySelector('[data-hover-probe="${probe.i}"]'); if (!el) return ''; const s = getComputedStyle(el); return [s.backgroundColor, s.color, s.textDecorationLine, s.borderColor, s.boxShadow, s.transform, s.opacity].join('|'); })()`);
            if (after && after === probe.before) { dead += 1; if (deadNames.length < 3) deadNames.push(probe.label); }
          }
          await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1, y: 1 }, session);
          if (probes.length >= 3 && dead / probes.length >= 0.5) {
            found.push({ kind: '호버에 반응 없음', what: page, detail: `마우스를 올려도 ${dead}/${probes.length}개가 그대로 — 예: ${deadNames.join(' · ')}`, severity: '낮음' });
          }
        }
      } catch (error) {
        found.push({ kind: '검사 실패', what: page, detail: String(error.message).slice(0, 140), severity: '중간' });
      }
      if (persona.role === 'dev' && reached) {
        const want = EXPECT_404.has(page) ? 404 : 200;
        const ok = page.startsWith('/report/does') ? (docStatus === 404 || docStatus === 200) : docStatus === want;
        if (!ok) found.push({ kind: `응답 코드 ${docStatus}`, what: page, detail: `${want} 이어야 합니다.`, severity: docStatus >= 500 ? '높음' : '중간' });
        if (docMs > 4000) found.push({ kind: '느린 첫 응답', what: page, detail: `문서가 ${(docMs / 1000).toFixed(1)}초 만에 왔습니다.`, severity: '낮음' });
        for (const e of pageEvents) {
          // 없는 리포트를 열면 리포트 API 가 404 를 주는 게 정상이다(화면은 안내를 띄운다).
          if (page === '/report/does-not-exist' && e.kind === '요청 실패 404' && e.detail.startsWith('/api/report/get')) continue;
          // Vercel 분석 스크립트(/_vercel/insights)는 배포 환경에만 있다. 로컬 dev 에서 404 는 정상이다.
          if (/localhost|127.0.0.1/.test(base) && e.kind === '요청 실패 404' && e.detail.startsWith('/_vercel/')) continue;
          found.push({ kind: e.kind, what: page, detail: e.detail, severity: e.kind.startsWith('요청 실패 5') || e.kind === '잡히지 않은 오류' ? '높음' : '중간' });
        }
      }
      pageCache.set(cacheKey, found);
    }
    for (const f of found) raw.push({ ...f, page, persona });
  }
  if (persona.id % 10 === 0) process.stdout.write(`  ${persona.id}/60 · ${persona.roleLabel} · ${((Date.now() - started) / 1000).toFixed(0)}초\n`);
}

// ══ 2) 흐름: 입력 → 결과 → 잠금 → 결제창 (결제하기는 안 누름) ══
const FLOW_CATS = ['', 'daepyo', 'sajeong', 'calendar', 'calendar_year', 'daeun', 'gunghap', 'balju', 'ijeon', 'daepyo'];
const flowRows = [];
const flowPeople = [
  ...personas.filter((p) => p.role === 'planner'),
  ...personas.filter((p) => p.role === 'mobile').slice(0, 5),
];
console.log(`\n흐름 ${flowPeople.length}명 — 생년월일 넣고 결제창까지 (결제하기는 누르지 않음)`);

// 상대가 필요한 상품은 손님이 실제로 들어오는 주소로 들어간다 — /balju 에서 발주처를 고르면
// ?ck=client&cn=…&cd=… 로, 궁합은 ?ck=partner 로 상대가 미리 채워진다(ReadingForm 135줄).
// 이전(ijeon)은 /jari 에서 주소를 넣어야 뽑히는 설계라, 그 안내가 뜨면 통과로 본다.
const PREFILL = {
  gunghap: '&ck=partner&cn=' + encodeURIComponent('점검용 상대') + '&cd=1975-05-05',
  balju: '&ck=client&cn=' + encodeURIComponent('한국도로공사') + '&cd=1969-02-15',
};
const EXPECT_GUIDE = { ijeon: /자리 사주는 사무실 주소/ };

for (const [k, persona] of flowPeople.entries()) {
  const cat = FLOW_CATS[k % FLOW_CATS.length];
  const page = '/reading' + (cat ? `?cat=${cat}${PREFILL[cat] ?? ''}` : '');
  const tag = `${page} (흐름)`;
  const row = { who: `${persona.roleLabel} ${persona.name}`, view: persona.view.label, cat: cat || '(없음)', result: false, sec: null, locks: 0, price: null, modal: false, note: '' };
  const fail = (kind, detail, severity = '높음') => raw.push({ kind, what: tag, detail, severity, page: tag, persona });
  pageEvents = [];
  try {
    await setView(persona.view);
    await go(page);
    // 카테고리 없는 /reading 과 사정률은 "어떤 입찰을 앞두고 계세요?" 칩을 먼저 골라야 입력칸이 열린다.
    // 사람은 칩을 누른다. 첫 실행은 칩을 안 눌러서 "뽑기 버튼이 안 나옴" 을 잘못 적었다.
    await evaluate(`(() => { const vis = (el) => el.getBoundingClientRect().height > 0; const any = [...document.querySelectorAll('select, input:not([type=hidden])')].some(vis); if (any) return; const chip = [...document.querySelectorAll('.chip2')].find(vis); chip && chip.click(); })()`);
    await sleep(500);
    await evaluate(FILL); await sleep(500);
    await evaluate(FILL); await sleep(500); // 첫 입력 뒤에 새 칸이 열린다
    await evaluate(FILL); await sleep(300);
    const clicked = await evaluate(`(() => { const b = document.querySelector('button.go'); if (!b || b.disabled) return false; b.click(); return true; })()`);
    if (!clicked) { fail('뽑기 버튼이 안 눌림', '입력칸을 다 채워도 "리포트 뽑기" 버튼이 안 나오거나 비활성입니다.'); row.note = '버튼 없음'; flowRows.push(row); continue; }
    const t0 = Date.now();
    let state = '';
    for (let w = 0; w < 30; w += 1) {
      await sleep(700);
      state = await evaluate(`(() => {
        const ok = [...document.querySelectorAll('button.ok')].find((b) => b.offsetParent);
        if (ok) { ok.click(); return 'confirm'; }
        if (location.pathname.startsWith('/report/')) return 'report';
        if (document.querySelector('button.topshare, .tunlock, .cta')) return 'result';
        const err = document.querySelector('.errbox, .err, [role=alert]');
        if (err && err.textContent.trim()) return 'error:' + err.textContent.trim().slice(0, 60);
        return '';
      })()`);
      if (state === 'report' || state === 'result' || state.startsWith('error:')) break;
    }
    row.sec = +((Date.now() - t0) / 1000).toFixed(1);
    // 필수 입력이 없을 때 폼이 무엇이 필요한지 말해 주면 그게 맞는 동작이다(이전 = /jari 주소).
    if (state.startsWith('error:') && EXPECT_GUIDE[cat] && EXPECT_GUIDE[cat].test(state)) { row.note = '필수 입력 안내가 뜸(정상)'; flowRows.push(row); process.stdout.write('  ' + (k + 1) + '/' + flowPeople.length + ' · ' + row.who + ' · cat=' + row.cat + ' · 안내 정상\n'); continue; }
    if (state.startsWith('error:')) { fail('결과 대신 오류', state.slice(6)); row.note = state; flowRows.push(row); continue; }
    if (state !== 'report' && state !== 'result') { fail('결과가 안 나옴', `21초를 기다려도 결과 화면이 안 떴습니다 (${state || '반응 없음'}).`); flowRows.push(row); continue; }
    row.result = true;
    if (row.sec > 8) fail('결과가 느림', `${row.sec}초 걸렸습니다.`, '낮음');
    await sleep(1200);
    const info = await evaluate(`(() => {
      const text = document.body.innerText;
      const locks = [...document.querySelectorAll('.tunlock, .cta')].filter((e) => e.offsetParent);
      const priced = locks.filter((e) => /[0-9,]+원/.test(e.textContent));
      const leak = ['undefined', 'NaN', '[object Object]'].find((b) => text.includes(b)) || '';
      return { locks: locks.length, priced: priced.length, leak, path: location.pathname };
    })()`);
    row.locks = info.locks;
    if (info.leak) fail('결과에 코드 값이 샘', `"${info.leak}" 이(가) 결과 화면에 보입니다.`);
    if (info.locks === 0) { fail('결제로 가는 문이 없음', '결과 화면에 "열기" 버튼이 하나도 없습니다 — 돈을 낼 수 있는 곳이 안 보입니다.'); flowRows.push(row); continue; }
    if (info.priced === 0) fail('잠금 버튼에 가격이 없음', '"열기" 버튼 어디에도 가격이 적혀 있지 않습니다.', '중간');
    // 결제창을 연다
    await evaluate(`(() => { const b = [...document.querySelectorAll('.cta, .tunlock')].find((e) => e.offsetParent); b && b.click(); })()`);
    // 카테고리 없는 결과는 누르면 그 상품으로 리포트를 다시 뽑은 뒤 결제창을 연다 — 서버를 한 번 다녀온다.
    for (let w = 0; w < 12 && !(await evaluate("!!document.querySelector('.modal.on')")); w += 1) await sleep(700);
    const modal = await evaluate(`(() => {
      const m = document.querySelector('.modal.on');
      if (!m) return { open: false, href: location.pathname };
      const pay = m.querySelector('.paygo');
      const t = pay ? pay.textContent.trim() : '';
      const won = parseInt((t.match(/([0-9,]+)원/) || [,'0'])[1].replace(/,/g, ''), 10);
      return { open: true, pay: t, won, refund: /환불|청약철회|열람/.test(m.innerText) };
    })()`);
    if (!modal.open) {
      // 결과가 폼 안에 있으면 리포트 화면으로 넘어가 거기서 연다
      fail('결제창이 안 열림', `"열기" 를 눌러도 결제창이 안 떴습니다 (지금 ${modal.href}).`);
    } else {
      row.modal = true; row.price = modal.won;
      if (!modal.won) fail('결제 금액이 0', `결제 버튼 문구: "${modal.pay}"`);
      if (!modal.refund) fail('결제창에 환불 고지 없음', '디지털 콘텐츠 청약철회 제한은 결제 전에 알려야 효력이 있습니다.', '중간');
    }
    for (const e of pageEvents) if (e.kind === '잡히지 않은 오류' || e.kind.startsWith('요청 실패 5')) fail(`흐름 중 ${e.kind}`, e.detail);
  } catch (error) {
    fail('흐름 검사 실패', String(error.message).slice(0, 140), '중간');
  }
  flowRows.push(row);
  process.stdout.write(`  ${k + 1}/${flowPeople.length} · ${row.who} · cat=${row.cat} · ${row.result ? '결과 ' + row.sec + '초' : '결과 없음'} · ${row.modal ? '결제창 ' + row.price + '원' : '결제창 없음'}\n`);
}

await send('Target.closeTarget', { targetId: target.targetId });
socket.close();
chrome.kill();
try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch { /* 그만 */ }

// ── 묶는다: 같은 종류·같은 화면·같은 대상은 한 줄로, 몇 명이 봤는지 센다 ──
const groups = new Map();
for (const row of raw) {
  const key = `${row.kind}|${row.page}|${row.what}`;
  if (!groups.has(key)) groups.set(key, { ...row, who: new Map() });
  groups.get(key).who.set(row.persona.id, row.persona);
}
const RANK = { '높음': 0, '중간': 1, '낮음': 2 };
const list = [...groups.values()].sort((a, b) => (RANK[a.severity] - RANK[b.severity]) || (b.who.size - a.who.size));
const bySev = (s) => list.filter((g) => g.severity === s).length;

console.log(`\n${'='.repeat(64)}`);
console.log(`60명 · ${((Date.now() - started) / 60000).toFixed(1)}분 · 발견 ${list.length}건 (높음 ${bySev('높음')} · 중간 ${bySev('중간')} · 낮음 ${bySev('낮음')})\n`);
for (const g of list) {
  const roles = [...new Set([...g.who.values()].map((p) => p.roleLabel))].join('·');
  const first = [...g.who.values()][0];
  console.log(`  [${g.severity}] ${g.kind} — ${g.page}`);
  console.log(`      ${g.what !== g.page ? g.what + ' · ' : ''}${g.detail}`);
  console.log(`      ${g.who.size}명이 봄 (${roles}) · 처음 본 사람: ${first.roleLabel} ${first.name} — "${first.memory}"`);
}
console.log(`\n${'─'.repeat(64)}\n역할별로 잡은 것`);
for (const role of ROLES) {
  const mine = list.filter((g) => [...g.who.values()].some((p) => p.role === role.key));
  console.log(`  ${role.label.padEnd(8)} ${String(role.count).padStart(2)}명 · ${mine.length}건`);
}
console.log(`\n흐름 ${flowRows.length}건 · 결과 ${flowRows.filter((r) => r.result).length} · 결제창 ${flowRows.filter((r) => r.modal).length}`);

fs.writeFileSync(OUT, JSON.stringify({
  base, when: new Date().toISOString(), pages: PAGES.length, personas: personas.length,
  flows: flowRows,
  findings: list.map((g) => ({
    severity: g.severity, kind: g.kind, page: g.page, what: g.what, detail: g.detail,
    seenBy: g.who.size, roles: [...new Set([...g.who.values()].map((p) => p.roleLabel))],
    first: (() => { const f = [...g.who.values()][0]; return `${f.roleLabel} ${f.name} — ${f.memory} (${f.view.label})`; })(),
  })),
}, null, 2));
console.log(`\n자세한 것은 ${OUT}`);
if (bySev('높음') > 0) process.exitCode = 1;

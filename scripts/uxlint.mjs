// scripts/uxlint.mjs — 화면에 나가는 문장을 신한카드 UX Writing 가이드로 잰다.
//
// 왜 스크립트인가: "AI 같은 문체"는 감으로 고치면 고친 만큼 다시 늘어난다.
// 규칙을 적어 두고 숫자로 재야 줄었는지 알 수 있고, 다음 사람이 다시 늘리지 않는다.
//
// 가이드 원문: Desktop\괜찮은\신한카드 ux라이팅.pdf (2025)
//   01 바르게  — 과잉 높임 금지, 맞춤법·띄어쓰기
//   02 친절하게 — 행동을 동사로, 짧고 간결하게, 긍정 표현
//   03 쉽게    — 전문·한자어·일본어 번역 투 금지
//   04 일관되게 — 종결·용어·표기 통일
//
//   node scripts/uxlint.mjs              전체 요약
//   node scripts/uxlint.mjs --rule=높임   한 규칙만 자세히
//   node scripts/uxlint.mjs --file=app/page.tsx
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : 'true']; }));

// 볼 곳: 화면에 나가는 글. 관리자 화면과 테스트는 뺀다(손님이 읽지 않는다).
const DIRS = ['app', 'lib', 'content'];
const SKIP = /node_modules|\.next|__tests__|\/admin\/|scripts\//;
// 약관·환불·개인정보 화면은 법 문구를 그대로 적어야 한다.
// '청약철회가 제한됩니다'를 부드럽게 바꾸면 고지 의무를 흐리게 된다 — 그래서 재지 않는다(2026-09-29).
const LEGAL = /app\/(refund|terms|privacy|en|zh)\//;   // 영어·중국어 화면은 한국어 문장 규칙 대상이 아니다
const EXT = /\.(tsx?|md)$/;

const RULES = [
  { id: '높임', why: '높임말을 겹쳐 쓰면 문장이 늘어진다. 고객이 보는 문구는 하십시오체로 담백하게.',
    re: /(하실 수 (있|없)습니다|보실 수 있습니다|받으실 수 있습니다|이용하실|확인하실|사용하실|열람하실|하시기 바랍니다|주시기 바랍니다|하여 주십시오)/g },
  { id: '군더더기', why: '‘완료·처리·성공적으로’는 뜻을 더하지 않는다. 결과만 말한다.',
    re: /(완료되었습니다|성공적으로|정상적으로|처리되었습니다|적용 완료|진행하실|진행해 주시기)/g },
  { id: '부정형', why: '‘불가·제한’ 같은 부정은 할 수 있는 쪽으로 바꿔 쓴다.',
    re: /(불가합니다|불가능합니다|제한됩니다|틀렸습니다|불가하며|할 수 없으니)/g },
  { id: '클릭', why: '모바일에서는 누르거나 고르는 것이다. ‘클릭·터치’ 대신 ‘누르다·고르다’.',
    re: /(클릭|터치하)/g },
  { id: '번역투', why: '‘~에 있어서·~를 통하여·~로부터의’는 일본어·영어 번역 투다.',
    re: /(에 있어서|를 통하여|을 통하여|로부터의|에 다름 아니|되어지|불리워)/g },
  { id: '적표현', why: '‘~적(的)’은 대개 빼도 뜻이 남는다.',
    re: /(가급적|추가적인|일시적으로|지속적으로|효과적으로|대표적으로|전반적으로|기본적으로|실질적으로|궁극적으로)/g },
  { id: '한자어', why: '어려운 한자어는 쉬운 우리말로. (익일→다음날, 통보→알림, 상이→다름)',
    re: /(익일|익월|당월|사전 공지|통보(?!받)|상이하|구비서류|유선상담|수령하|존재하지 않|제 수수료|소요됩니다)/g },
  { id: 'AI티', why: '“단순히 ~가 아니라”, “~뿐만 아니라”, “무엇보다”는 사람 말투가 아니라 글쓰기 틀이다.',
    re: /(단순히 [^.]{0,30}가 아니라|뿐만 아니라|무엇보다도|바로 그것이|이야말로|라고 할 수 있습니다|에 다름없)/g },
  { id: '줄표', why: '줄표(—)를 한 문장에 여러 번 쓰면 읽는 호흡이 끊긴다. 문장을 나눠 쓴다.',
    re: /—[^—\n]{0,60}—/g },
];

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (SKIP.test(p.split(path.sep).join('/')) || LEGAL.test(p.split(path.sep).join('/'))) continue;
    if (e.isDirectory()) walk(p, out);
    else if (EXT.test(e.name)) out.push(p);
  }
  return out;
}

const files = DIRS.flatMap(d => (fs.existsSync(path.join(ROOT, d)) ? walk(path.join(ROOT, d)) : []))
  .filter(f => !args.file || f.split(path.sep).join('/').includes(args.file));

const hits = new Map(RULES.map(r => [r.id, []]));
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((raw, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(raw)) return;       // 주석은 화면에 안 나간다
    const line = raw.replace(/\s\/\/\s[^'"`]*$/, '');  // 줄 끝에 붙은 주석도 화면에 안 나간다
    for (const r of RULES) {
      r.re.lastIndex = 0;
      const m = line.match(r.re);
      if (m) hits.get(r.id).push({ file: rel, line: i + 1, text: line.trim().slice(0, 110), found: [...new Set(m)].join(', ') });
    }
  });
}

// 습관 두 가지는 '건수'가 아니라 '총량'으로 잰다 — 한 줄에 몇 개든 다 센다.
// 줄표는 2026-09-29 기준 1,956개, '~하십시오'는 359개에서 시작했다(docs/STYLE.md).
const habit = { dash: 0, cmd: 0, files: new Map() };
for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/');
  const src = fs.readFileSync(f, 'utf8')
    .split(/\r?\n/).filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
  const d = (src.match(/—/g) || []).length;
  const c = (src.match(/십시오/g) || []).length;
  habit.dash += d; habit.cmd += c;
  if (d + c) habit.files.set(rel, { d, c });
}

const total = [...hits.values()].reduce((a, b) => a + b.length, 0);
console.log(`${files.length}개 파일 · 규칙 위반 ${total}건 · 줄표 ${habit.dash}개 · '~하십시오' ${habit.cmd}개\n`);
for (const r of RULES) {
  const h = hits.get(r.id);
  if (!h.length) continue;
  console.log(`[${r.id}] ${h.length}건 — ${r.why}`);
  const show = args.rule === r.id ? h : h.slice(0, 3);
  for (const x of show) console.log(`   ${x.file}:${x.line}  (${x.found})  ${x.text}`);
  if (!args.rule && h.length > 3) console.log(`   … ${h.length - 3}건 더 (--rule=${r.id})`);
  console.log('');
}
// 파일별 순위 — 어디부터 손댈지
const byFile = new Map();
for (const h of hits.values()) for (const x of h) byFile.set(x.file, (byFile.get(x.file) || 0) + 1);
const top = [...byFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
if (top.length) {
  console.log('많이 걸린 파일');
  for (const [f, n] of top) console.log(`   ${String(n).padStart(4)}  ${f}`);
}
const habitTop = [...habit.files.entries()].sort((a, b) => (b[1].d + b[1].c) - (a[1].d + a[1].c)).slice(0, 10);
if (habitTop.length) {
  console.log('\n줄표·명령형이 많은 파일');
  for (const [f, v] of habitTop) console.log(`   줄표 ${String(v.d).padStart(3)} · 십시오 ${String(v.c).padStart(3)}  ${f}`);
}
process.exit(total ? 1 : 0);

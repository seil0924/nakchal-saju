// scripts/golden.mjs — 리포트 회귀 골든 테스트
// lib/ 를 임시 복사해 'server-only' 가드만 제거하고 computeReport 출력을
// 경계 케이스(생일 6 × 카테고리 8 × 레벨 3 = 144)로 스냅샷 → baseline과 대조.
//   검증:  npm run golden
//   갱신:  npm run golden -- --update   (의도된 변경 후 baseline 재생성)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const update = process.argv.includes('--update');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nakchal-golden-'));
fs.cpSync(path.join(root, 'lib'), path.join(tmp, 'lib'), { recursive: true });
const strip = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
  const f = path.join(d, e.name);
  if (e.isDirectory()) strip(f);
  else if (f.endsWith('.ts')) { const t = fs.readFileSync(f, 'utf8'); if (t.includes("import 'server-only'")) fs.writeFileSync(f, t.replace(/import 'server-only';?\r?\n?/g, '')); }
} };
strip(path.join(tmp, 'lib'));

const harness = `
import { computeReport } from './lib/report';
const births=[['std','1980-05-15','09:20','solar',false],['notime','1975-11-03',null,'solar',false],['ipchun','1990-02-04','04:10','solar',false],['yaja2330','1985-07-20','23:30','solar',false],['lunarleap','1984-10-15','12:00','lunar',true],['dawnF','1972-12-31','05:45','solar',false]];
const rel={legal:'2010-03-02',legalName:'대한건설',client:'2001-01-05',clientName:'한국도로공사',partner:'1978-06-06',partnerName:'김대영',ally:'1999-09-09',allyName:'대영토건'};
const cats=[undefined,'daepyo','sajeong','balju','gunghap','daeun','calendar','calendar_year'];
const out={};
for(const [lb,birth,time,cal,leap] of births) for(const cat of cats) for(const lv of [0,1,2]){
  const r=computeReport({name:'홍길동',birth,time,cal,leap,...rel,clientCore:true,situation:'관급 공사 · 저가경쟁 심함',worry:'이번 큰 건 넣을지 고민',cat},lv,2026);
  out[lb+'|'+(cat||'ALL')+'|L'+lv]={title:r.title,dayMaster:r.dayMaster,meta:r.meta,selYear:r.selYear,seun:r.seun,gauge:r.gauge,hero:r.hero,wonguk:r.wonguk,sections:r.sections.map(s=>({mk:s.mk,tier:s.tier,free:s.free,t:s.t,html:s.html,teaser:s.teaser,gauge:s.gauge}))};
}
process.stdout.write(JSON.stringify(out));
`;
fs.writeFileSync(path.join(tmp, 'harness.mjs.ts'), harness);
let json;
try { json = execFileSync('npx', ['--yes', 'tsx', path.join(tmp, 'harness.mjs.ts')], { encoding: 'utf8', cwd: tmp, maxBuffer: 64 * 1024 * 1024 }); }
catch (e) { console.error('golden: 하네스 실행 실패\n', e.stderr || e.message); process.exit(2); }
fs.rmSync(tmp, { recursive: true, force: true });

const cur = JSON.parse(json);
const basePath = path.join(root, 'scripts', 'golden.baseline.json');
if (update) { fs.writeFileSync(basePath, JSON.stringify(cur)); console.log('golden: baseline 갱신 (' + Object.keys(cur).length + ' cases)'); process.exit(0); }
const base = JSON.parse(fs.readFileSync(basePath, 'utf8'));
let diffs = 0;
for (const k of Object.keys(base)) if (JSON.stringify(base[k]) !== JSON.stringify(cur[k])) { diffs++; if (diffs <= 5) console.error('  DIFF: ' + k); }
for (const k of Object.keys(cur)) if (!(k in base)) { diffs++; console.error('  NEW: ' + k); }
if (diffs === 0) { console.log('✅ golden: ' + Object.keys(base).length + ' cases 모두 일치'); process.exit(0); }
console.error('❌ golden: ' + diffs + ' cases 불일치 (의도된 변경이면  npm run golden -- --update )'); process.exit(1);

// lib/tycoon.ts — 해외 거장(작고) 사주 매칭 (서버 전용)
// ⚠️ 출생일은 널리 공개된 기록 기준. 생시는 미상 → 삼주(三柱)로 계산.
//    유사도는 명식의 구조적 비교(객관)이며, 해당 인물의 실제 운세 단정이 아님.
//    ⚠️ 배포 전 각 인물 출생일 공개자료 재확인 필요.
import 'server-only';
import { compute, sipsung, sinsal, EL, pil, type Chart } from './engine';

export type Tycoon = { name: string; en: string; co: string; born: string };

export const TYCOONS: Tycoon[] = [
  { name: '스티브 잡스',        en: 'Steve Jobs',          co: 'Apple · 美',     born: '1955-02-24' },
  { name: '헨리 포드',          en: 'Henry Ford',          co: 'Ford · 美',      born: '1863-07-30' },
  { name: '존 록펠러',          en: 'John D. Rockefeller', co: 'Standard Oil · 美', born: '1839-07-08' },
  { name: '앤드루 카네기',      en: 'Andrew Carnegie',     co: 'US Steel · 美',  born: '1835-11-25' },
  { name: '월트 디즈니',        en: 'Walt Disney',         co: 'Disney · 美',    born: '1901-12-05' },
  { name: '레이 크록',          en: 'Ray Kroc',            co: "McDonald's · 美",born: '1902-10-05' },
  { name: '샘 월턴',            en: 'Sam Walton',          co: 'Walmart · 美',   born: '1918-03-29' },
  { name: '토머스 에디슨',      en: 'Thomas Edison',       co: 'GE · 美',        born: '1847-02-11' },
  { name: 'J.P. 모건',          en: 'J.P. Morgan',         co: 'JPMorgan · 美',  born: '1837-04-17' },
  { name: '코닐리어스 밴더빌트',en: 'C. Vanderbilt',       co: 'Railroads · 美', born: '1794-05-27' },
  { name: '데이비드 록펠러',    en: 'David Rockefeller',   co: 'Chase · 美',     born: '1915-06-12' },
  { name: '하워드 휴즈',        en: 'Howard Hughes',       co: 'Hughes · 美',    born: '1905-12-24' },
  { name: '밀턴 허쉬',          en: 'Milton Hershey',      co: 'Hershey · 美',   born: '1857-09-13' },
  { name: '월트 크라이슬러',    en: 'Walter Chrysler',     co: 'Chrysler · 美',  born: '1875-04-02' },
  { name: '모리타 아키오',      en: 'Akio Morita',         co: 'Sony · 日',      born: '1921-01-26' },
  { name: '마쓰시타 고노스케',  en: 'K. Matsushita',       co: 'Panasonic · 日', born: '1894-11-27' },
  { name: '혼다 소이치로',      en: 'Soichiro Honda',      co: 'Honda · 日',     born: '1906-11-17' },
  { name: '도요다 기이치로',    en: 'Kiichiro Toyoda',     co: 'Toyota · 日',    born: '1894-06-11' },
  { name: '잉바르 캄프라드',    en: 'Ingvar Kamprad',      co: 'IKEA · 瑞',      born: '1926-03-30' },
  { name: '엔초 페라리',        en: 'Enzo Ferrari',        co: 'Ferrari · 伊',   born: '1898-02-18' },
  { name: '페르디난트 포르쉐',  en: 'F. Porsche',          co: 'Porsche · 獨',   born: '1875-09-03' },
  { name: '아리스토틀 오나시스',en: 'A. Onassis',          co: 'Shipping · 希',  born: '1906-01-20' },
  { name: '코코 샤넬',          en: 'Coco Chanel',         co: 'Chanel · 佛',    born: '1883-08-19' },
  { name: '에스티 로더',        en: 'Estée Lauder',        co: 'Estée Lauder · 美', born: '1908-07-01' },
];

function argmax(a: number[]) { let x = 0; for (let i = 1; i < a.length; i++) if (a[i] > a[x]) x = i; return x; }
function argmin(a: number[]) { let x = 0; for (let i = 1; i < a.length; i++) if (a[i] < a[x]) x = i; return x; }

type Traits = { el: number; yin: number; strong: number; weak: number; sip: number; sinsal: Set<string> };
function traitsOf(c: Chart): Traits {
  return { el: c.dayMasterEl, yin: c.dGan % 2, strong: argmax(c.dist), weak: argmin(c.dist), sip: argmax(sipsung(c)), sinsal: new Set(sinsal(c).map(s => s.key)) };
}
const SINSAL_KO: Record<string, string> = { 괴강: '괴강살', 백호: '백호살', 양인: '양인살', 천을: '천을귀인', 현침: '현침살', 역마: '역마살', 화개: '화개살' };
const SIP = ['비겁', '식상', '재성', '관성', '인성'];

const TY = TYCOONS.map(t => { const [y, m, d] = t.born.split('-').map(Number); const c = compute(y, m, d, null); return { t, c, tr: traitsOf(c) }; });

export type TyMatch = { tycoon: Tycoon; level: 'twin' | 'near' | 'none'; count: number; matched: string[]; pills: string; el: number };

export function matchTycoon(userChart: Chart): TyMatch {
  const u = traitsOf(userChart);
  let best = TY[0], bestCount = -1, bestMatched: string[] = [];
  for (const e of TY) {
    const T = e.tr; const matched: string[] = [];
    if (u.el === T.el) matched.push(`일간 ${EL[u.el]}`);
    if (u.yin === T.yin) matched.push(u.yin ? '음간' : '양간');
    if (u.strong === T.strong) matched.push(`강한 ${EL[u.strong]}`);
    if (u.weak === T.weak) matched.push(`${EL[u.weak]} 부족`);
    if (u.sip === T.sip) matched.push(`${SIP[u.sip]} 주도`);
    const inter = [...u.sinsal].find(k => T.sinsal.has(k));
    if (inter) matched.push(SINSAL_KO[inter] || '신살');
    if (matched.length > bestCount) { best = e; bestCount = matched.length; bestMatched = matched; }
  }
  const level = bestCount >= 3 ? 'twin' : bestCount === 2 ? 'near' : 'none';
  return { tycoon: best.t, level, count: bestCount, matched: bestMatched, pills: pil(best.c.dGan, best.c.dZhi), el: best.c.dayMasterEl };
}

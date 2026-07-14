// lib/report.ts — 명식 입력 → 섹션 리포트 (서버 전용)
import 'server-only';
import { chartFromBirth, compute, todayPillar, sajeong, wonguk, seunOf, type Chart, type Pillar, type Seun } from './engine';
import { buildTiered, reportHeroFor, type Section, type Hero } from './report-copy';
import { catMks } from './report-categories';

export type ReportInput = {
  name?: string;
  birth: string;                 // YYYY-MM-DD
  time?: string | null;          // HH:MM (모르면 null → 삼주)
  cal?: 'solar' | 'lunar';
  leap?: boolean;
  client?: string | null;        // 발주처 설립일
  clientCore?: boolean;          // 핵심 발주처(큰 판) 여부 — true면 발주처 궁합 유료
  legal?: string | null;         // 법인 설립일
  partner?: string | null;       // 동업 상대 생년월일
  ally?: string | null;          // 협정 상대 회사 설립일
  clientName?: string; legalName?: string; partnerName?: string; allyName?: string; // 대상 이름
  situation?: string;            // 상황 칩 요약 (예: "관급 공사 · 저가경쟁 심함")
  worry?: string;
  cat?: string;                  // 카테고리(daepyo·sajeong·balju·gunghap·daeun) — 섹션 필터
};

function dateChart(v?: string | null): Chart | null {
  if (!v) return null;
  const [y, m, d] = v.split('-').map(Number);
  return compute(y, m, d, null);
}

export type ReportResult = {
  title: string;
  dayMaster: number;
  wonguk: Pillar[];              // 사주팔자 원국 (무료 · 만세력 신뢰)
  gauge: { dir: string; band: [string, string]; pos: number; precise?: string };
  hero: Hero;
  sections: Section[];
  meta: { chapters: number; items: number }; // 분량 앵커 — 전체 리포트 장(章)·항목 수
  selYear: number;              // 이 리포트가 기준으로 삼은 해 (세운)
  seun: { hanja: string; rel: string; tilt: number }; // 대표 본인의 그해 세운
};

// level: 0 무료 · 1 택일팩(정밀값+택일) · 2 전체. (boolean 하위호환: true→2, false→0)
// year: 세운 기준 연도(대표·회사·궁합을 그 해 것으로) — 없으면 올해
export function computeReport(input: ReportInput, unlockedFlag: boolean | number, year?: number): ReportResult {
  const level = typeof unlockedFlag === 'number' ? unlockedFlag : (unlockedFlag ? 2 : 0);
  const c = chartFromBirth(input.birth, input.time ?? null, input.cal ?? 'solar', input.leap ?? false);
  const now = new Date();
  const selYear = (year && year >= 1900 && year <= 2100) ? Math.floor(year) : now.getFullYear();
  const seunSelf: Seun = seunOf(c, selYear);
  const today = todayPillar(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const s = sajeong(c, today);

  const wtxt = (input.worry || '').trim();
  const sit = (input.situation || '').trim();
  const flow = s.tilt > 0
    ? '오늘은 기운이 위로 뻗는 날이라 <b>나설 만한 흐름</b>'
    : '오늘은 기운이 눌리는 날이라 <b>서두르기보다 관망이 유리한 흐름</b>';
  // 상황 칩 + 고민 텍스트를 결과에 반영 (input→output 가시화)
  let worry = '';
  if (sit && wtxt) worry = `「상황 반영」 <b>${sit}</b> 상황에서 「${wtxt.slice(0, 60)}」 — ${flow}입니다.`;
  else if (sit)   worry = `「상황 반영」 이번 건은 <b>${sit}</b> — 그런 판에서 ${flow}입니다.`;
  else if (wtxt)  worry = `「고민 반영」 말씀하신 「${wtxt.slice(0, 60)}」 — ${flow}입니다.`;

  const cli = dateChart(input.client), legal = dateChart(input.legal),
        partner = dateChart(input.partner), ally = dateChart(input.ally);

  const names = { client: input.clientName, legal: input.legalName, partner: input.partnerName, ally: input.allyName };
  const daeunMeta = input.legal ? { foundYear: parseInt(input.legal.slice(0, 4), 10), curYear: selYear } : undefined;
  const nowYMD = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
  // 카테고리 섹션 필터 (해당 카테고리 섹션만 노출)
  const mks = catMks(input.cat);
  const filt = (arr: Section[]) => mks ? arr.filter(x => mks.includes(x.mk)) : arr;
  const cc = !!input.clientCore;
  const sections = filt(buildTiered(c, today, s, worry, cli, legal, partner, ally, names, daeunMeta, nowYMD, level, selYear, seunSelf, cc));

  // 분량 앵커: 전체(레벨 2) 기준 장·항목 수를 산출해 노출 (텍스트는 미전송 — 숫자만)
  const fullSecs = filt(buildTiered(c, today, s, worry, cli, legal, partner, ally, names, daeunMeta, nowYMD, 2, selYear, seunSelf, cc));
  const items = fullSecs.reduce((n, sec) => n + (sec.html.match(/<p|<div class="cbrow|<div class="ssrow/g) || []).length, 0);
  const meta = { chapters: fullSecs.length, items };

  // ★게이팅: 정밀값(precise)은 택일팩(레벨 1)부터 응답에 포함
  const gauge = level >= 1
    ? { dir: s.dir, band: [s.bandLo, s.bandHi] as [string, string], pos: s.pos, precise: s.precise }
    : { dir: s.dir, band: [s.bandLo, s.bandHi] as [string, string], pos: s.pos };

  const hero = reportHeroFor(input.cat, { c, s, nowYMD, cli, legal, partner, ally, seunSelf: seunSelf }); // 카테고리별 히어로
  const title = `士가 읽는 ${input.name ? input.name + ' 대표님' : '대표님'}의 사주 리포트`;
  return { title, dayMaster: c.dayMasterEl, wonguk: wonguk(c), gauge, hero, sections, meta,
    selYear, seun: { hanja: seunSelf.hanja, rel: seunSelf.rel, tilt: seunSelf.tilt } };
}

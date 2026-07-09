// lib/report.ts — 명식 입력 → 섹션 리포트 (서버 전용)
import 'server-only';
import { chartFromBirth, compute, todayPillar, sajeong, type Chart } from './engine';
import { buildFull, buildFreeGated, type Section } from './report-copy';

export type ReportInput = {
  name?: string;
  birth: string;                 // YYYY-MM-DD
  time?: string | null;          // HH:MM (모르면 null → 삼주)
  cal?: 'solar' | 'lunar';
  leap?: boolean;
  client?: string | null;        // 발주처 설립일
  legal?: string | null;         // 법인 설립일
  partner?: string | null;       // 동업 상대 생년월일
  ally?: string | null;          // 협정 상대 회사 설립일
  worry?: string;
};

function dateChart(v?: string | null): Chart | null {
  if (!v) return null;
  const [y, m, d] = v.split('-').map(Number);
  return compute(y, m, d, null);
}

export type ReportResult = {
  title: string;
  dayMaster: number;
  gauge: { dir: string; band: [string, string]; pos: number; precise?: string };
  sections: Section[];
};

export function computeReport(input: ReportInput, unlockedFlag: boolean): ReportResult {
  const c = chartFromBirth(input.birth, input.time ?? null, input.cal ?? 'solar', input.leap ?? false);
  const now = new Date();
  const today = todayPillar(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const s = sajeong(c, today);

  const wtxt = (input.worry || '').trim();
  const worry = wtxt
    ? `「고민 반영」 말씀하신 「${wtxt.slice(0, 60)}」 — ${s.tilt > 0
        ? '오늘은 기운이 위로 뻗는 날이라 <b>나설 만한 흐름</b>'
        : '오늘은 기운이 눌리는 날이라 <b>서두르기보다 관망이 유리한 흐름</b>'}입니다.`
    : '';

  const cli = dateChart(input.client), legal = dateChart(input.legal),
        partner = dateChart(input.partner), ally = dateChart(input.ally);

  const sections = unlockedFlag
    ? buildFull(c, today, s, worry, cli, legal, partner, ally)
    : buildFreeGated(c, today, s, worry, cli, legal, partner, ally);

  // ★게이팅: 정밀값(precise)은 잠금 해제 시에만 응답에 포함
  const gauge = unlockedFlag
    ? { dir: s.dir, band: [s.bandLo, s.bandHi] as [string, string], pos: s.pos, precise: s.precise }
    : { dir: s.dir, band: [s.bandLo, s.bandHi] as [string, string], pos: s.pos };

  const title = `士가 읽는 ${input.name ? input.name + ' 대표님' : '대표님'}의 사주 리포트`;
  return { title, dayMaster: c.dayMasterEl, gauge, sections };
}

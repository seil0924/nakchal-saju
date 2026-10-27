// lib/bigyo.ts — 후보 날짜 비교(較). 대표님이 고른 날 2~3개를 대표님 사주로 순위 매긴다(2026-10-28).
//
// 해외 택일사들이 파는 꼴을 옮겼다: 행사 하나에 후보 날짜 몇 개, 순위와 근거(싱가포르 택일사, 미국 electional 점성가).
// 무료로 보이는 칸은 '모든 업체가 같이 보는 칸'(건제십이신)이고, 대표님 일간·일지로 거르는 칸이 유료다.
// 날짜는 대표님이 친 것만 쓴다. 공고·마감 같은 바깥 데이터는 받지 않는다.
//
// 조건 셋(투찰 택일 길일과 같은 원리, report-copy 의 isGil 과 같은 식):
//   1) 건제십이신이 그 일에 맞는 날인가(lib/taekil 의 good 순서)
//   2) 그날 일진 천간이 대표님 일간을 살리거나(인성) 같은 기운(비겁)인가
//   3) 그날 일진 지지가 대표님 일지와 충하지 않는가
import { relation, todayPillar, GAN, ZHI, type Chart } from './engine';
import { officerOf, AVOID } from './daypicker-en';
import { OFFICER_KO, taekilBySlug } from './taekil';
import { BIGYO_LABEL, isPurpose, parseCands, type BigyoPurpose } from './bigyo-input';
import { holidayOn } from './holidays-kr';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const GAN_EL10 = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const SIJIN: [string, string][] = [['子', '23~01'], ['丑', '01~03'], ['寅', '03~05'], ['卯', '05~07'], ['辰', '07~09'], ['巳', '09~11'], ['午', '11~13'], ['未', '13~15'], ['申', '15~17'], ['酉', '17~19'], ['戌', '19~21'], ['亥', '21~23']];
// 일하는 시간 안의 시진만 권한다(새벽 세 시에 도장을 찍으라고 할 수는 없다).
const WORK_SIJIN = [4, 5, 6, 7, 8];   // 辰 07~09 ~ 申 15~17

export type BigyoRow = {
  ymd: string; label: string;             // '1월 12일(화)'
  ganji: string;
  officer: number; offRank: number;       // 그 일에 맞는 순서(0 이 가장 힘이 실림), 아니면 -1
  offAvoid: boolean;                      // 파·위·폐
  stemRel: string; stemOk: boolean;
  chung: boolean;
  passed: number;                         // 조건 셋 중 통과 수
  goodHours: string[]; badHours: string[];
  holiday: string | null; weekend: boolean;
};

function rowOf(c: Chart, purpose: BigyoPurpose, ymd: string): BigyoRow {
  const [y, m, d] = ymd.split('-').map(Number);
  const good = taekilBySlug(purpose)!.good;
  const officer = officerOf(new Date(y, m - 1, d));
  const tp = todayPillar(y, m, d);
  const rel = relation(c.dayMasterEl, tp.el);
  const stemOk = rel === 'in' || rel === 'bi';
  const chung = (tp.zhi - c.dZhi + 12) % 12 === 6;
  const offRank = good.indexOf(officer);
  const passed = (offRank >= 0 ? 1 : 0) + (stemOk ? 1 : 0) + (chung ? 0 : 1);
  // 시진 천간은 그날 일진 천간에서 나온다(시두법). 판정은 일진과 같은 원리.
  const lv = Array.from({ length: 12 }, (_, z) => { const r = relation(c.dayMasterEl, GAN_EL10[((tp.gan % 5) * 2 + z) % 10]); return r === 'in' || r === 'bi' ? 'g' : r === 'jae' ? 'm' : 'c'; });
  const fmtH = (z: number) => `${SIJIN[z][0]}시 ${SIJIN[z][1]}`;
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return {
    ymd, label: `${m}월 ${d}일(${DOW[dow]})`, ganji: GAN[tp.gan] + ZHI[tp.zhi],
    officer, offRank, offAvoid: AVOID.includes(officer), stemRel: rel, stemOk, chung, passed,
    goodHours: WORK_SIJIN.filter(z => lv[z] === 'g').map(fmtH),
    badHours: WORK_SIJIN.filter(z => lv[z] === 'c').map(fmtH),
    holiday: holidayOn(ymd)?.name ?? null, weekend: dow === 0 || dow === 6,
  };
}

// 순위: 파·위·폐는 맨 뒤 → 통과 수 → 충 없는 쪽 → 건제십이신 순서 → 일하는 시간 안에 맞는 시진이 많은 날 → 이른 날
export function rankCands(c: Chart, purpose: BigyoPurpose, dates: string[]): BigyoRow[] {
  return parseCands(dates).map(d => rowOf(c, purpose, d)).sort((a, b) =>
    (+a.offAvoid - +b.offAvoid) || (b.passed - a.passed) || (+a.chung - +b.chung)
    || ((a.offRank < 0 ? 9 : a.offRank) - (b.offRank < 0 ? 9 : b.offRank))
    || (b.goodHours.length - a.goodHours.length) || a.ymd.localeCompare(b.ymd));
}

const REL_KO: Record<string, string> = {
  in: '대표님 일간을 살리는 기운(인성)', bi: '대표님과 같은 기운(비겁)', jae: '대표님이 다스리는 기운(재성)',
  sik: '대표님 기운을 빼 쓰는 날(식상)', gwan: '대표님을 누르는 기운(관성)',
};

function offLine(purpose: BigyoPurpose, r: BigyoRow) {
  const o = OFFICER_KO[r.officer];
  if (r.offRank >= 0) return `${o.name}(${o.hanja}): ${BIGYO_LABEL[purpose]}에 맞는 날입니다`;
  if (r.offAvoid) return `${o.name}(${o.hanja}): 피하는 날입니다`;
  return `${o.name}(${o.hanja}): 이 일에 특별히 맞지도 어긋나지도 않는 날입니다`;
}

// 무료 칸: 모든 업체가 같이 보는 칸(건제십이신)만. 대표님 사주는 쓰지 않는다.
export function bigyoFreeHtml(purpose: BigyoPurpose, dates: string[]): string {
  const rows = parseCands(dates).map(ymd => {
    const [y, m, d] = ymd.split('-').map(Number);
    const officer = officerOf(new Date(y, m - 1, d));
    const good = taekilBySlug(purpose)!.good;
    const o = OFFICER_KO[officer];
    const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const tag = good.includes(officer) ? '맞는 날' : AVOID.includes(officer) ? '피하는 날' : '보통';
    const hol = holidayOn(ymd)?.name;
    return `<div class="bgrow"><b>${m}월 ${d}일(${DOW[dow]})</b><span>${o.hanja} ${o.name} · ${tag}${hol ? ' · ' + hol : ''}</span></div>`;
  }).join('');
  return `<div class="bglist">${rows}</div>` +
    `<p>위 칸은 그날 자체의 성질(건제십이신)만 본 것이라, 같은 날을 고른 다른 업체 대표님도 똑같이 봅니다.</p>` +
    `<p>대표님 일간을 살리는 날인지, 대표님 일지와 부딪히는 날인지까지 따지면 순서가 바뀔 수 있습니다. 그 순위와 날마다 맞는 시간은 아래에 있습니다.</p>`;
}

export function bigyoPaidHtml(c: Chart, purpose: BigyoPurpose, dates: string[]): string {
  const rows = rankCands(c, purpose, dates);
  const cards = rows.map((r, i) => {
    const checks = [
      `<li class="${r.offRank >= 0 ? 'ok' : 'no'}">${offLine(purpose, r)}</li>`,
      `<li class="${r.stemOk ? 'ok' : 'no'}">일진 ${r.ganji}: ${REL_KO[r.stemRel] || REL_KO.bi}</li>`,
      `<li class="${r.chung ? 'no' : 'ok'}">${r.chung ? `대표님 일지(${ZHI[c.dZhi]})와 충하는 날입니다. 기반이 흔들리는 날이라 큰 건은 무겁습니다` : `대표님 일지(${ZHI[c.dZhi]})와 충하지 않습니다`}</li>`,
    ].join('');
    const hours = r.goodHours.length ? `맞는 시간 ${r.goodHours.join(' · ')}` : '일하는 시간 안에 특별히 맞는 시진은 없습니다';
    const avoid = r.badHours.length ? `<div class="bghr sub">피할 시간 ${r.badHours.join(' · ')}</div>` : '';
    const note = r.holiday ? `<div class="bgnote">${r.holiday}입니다. 관공서·등기소가 쉬는 날이라 접수가 필요한 일이면 날짜를 다시 보셔야 합니다.</div>`
      : r.weekend ? `<div class="bgnote">주말입니다. 관공서 접수가 필요한 일이면 날짜를 다시 보셔야 합니다.</div>` : '';
    return `<div class="bgcard${i === 0 ? ' top' : ''}"><div class="bghd"><span class="bgno">${i + 1}순위</span><b>${r.label}</b><em>조건 3개 중 ${r.passed}개</em></div>` +
      `<ul class="bgchk">${checks}</ul><div class="bghr">${hours}</div>${avoid}${note}</div>`;
  }).join('');
  const best = rows[0];
  const lead = rows.length > 1 && best
    ? `<p>후보 ${rows.length}개 중 대표님께 가장 결이 맞는 날은 <b>${best.label}</b>입니다. 조건 셋은 투찰 택일과 같은 원리이고, 아래에 날마다 무엇을 통과하고 무엇에 걸렸는지 그대로 적었습니다.</p>`
    : '';
  return lead + cards +
    `<p class="bgfoot">셋 다 통과하지 못한 날만 남았다면 파·위·폐가 아니고 충이 없는 날을 고르시면 됩니다. 날짜를 정하는 참고이고, 계약 조건과 일정이 먼저입니다. 투찰금액 산정 근거가 아니며 결과를 보장하지 않습니다.</p>`;
}

// 잠긴 칸 위에 보일 말. 날짜와 순위는 감추고, 충 걸린 날이 몇 개인지만 알려 준다.
export function bigyoTeaser(c: Chart, purpose: BigyoPurpose, dates: string[]): string {
  const rows = rankCands(c, purpose, dates);
  const ch = rows.filter(r => r.chung).length;
  return `후보 <b>${rows.length}개</b>의 순위와 날마다 통과한 조건, 맞는 시간이 여기 있습니다. ` +
    (ch ? `이 가운데 <b>${ch}개</b>는 대표님 일지와 충하는 날입니다.` : `대표님 일지와 충하는 날은 없습니다. 순위는 일간과 건제십이신으로 갈립니다.`);
}

export function bigyoTitle(purpose: string, n: number) {
  return isPurpose(purpose) ? `${BIGYO_LABEL[purpose]} 후보 ${n}개` : `후보 날짜 ${n}개`;
}

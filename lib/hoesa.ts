// lib/hoesa.ts — 회사(법인) 사주. 설립일 하나로 회사의 명식과 지금 구간을 낸다.
//
// **왜 따로 두는가.** 개인 사주 앱은 법인이라는 개념 자체가 없어서 이 계산을 하지 않는다.
// 그래서 여기가 이 서비스의 유일한 무주공산이고, 무료 입구를 여기에 세운다.
//
// **왜 engine 을 안 쓰는가.** engine.ts 는 server-only 이고 유료 해석까지 안고 있다.
// 이 화면에 필요한 건 명식과 관계뿐이라 manse-core(공용) 만으로 충분하다.
// 같은 식을 두 벌 쓰지 않으려고 relation·yearGanji 를 manse-core 로 내렸다.
import {
  GAN, ZHI, EL, EL_HEX, GAN_EL, ZHI_EL, pil,
  corePillars, relation, yearGanji,
} from './manse-core';

export type CompanyChart = {
  yGan: number; yZhi: number; mGan: number; mZhi: number; dGan: number; dZhi: number;
  dayMasterEl: number;
  dist: number[];              // 오행 분포 [목,화,토,금,수]
  pillars: [string, string, string];  // 년주·월주·일주 (설립일이라 시주는 없다 — 삼주)
  foundYear: number;
};

/** 'YYYY-MM-DD' 설립일 → 회사 명식. 형식이 틀리거나 범위를 벗어나면 null. */
export function companyChart(dateISO: string): CompanyChart | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((dateISO || '').trim());
  if (!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (y < 1900 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  // 실제로 존재하는 날짜인지 (2월 30일 같은 입력을 걸러낸다)
  const chk = new Date(Date.UTC(y, mo - 1, d));
  if (chk.getUTCFullYear() !== y || chk.getUTCMonth() !== mo - 1 || chk.getUTCDate() !== d) return null;

  // 설립일에는 시가 없다. 등기 시각을 아는 회사가 없어서 삼주로 본다.
  const p = corePillars(y, mo, d, null);
  const dist = [0, 0, 0, 0, 0];
  dist[GAN_EL[p.yGan]]++; dist[ZHI_EL[p.yZhi]]++;
  dist[GAN_EL[p.mGan]]++; dist[ZHI_EL[p.mZhi]]++;
  dist[GAN_EL[p.dGan]]++; dist[ZHI_EL[p.dZhi]]++;
  return {
    yGan: p.yGan, yZhi: p.yZhi, mGan: p.mGan, mZhi: p.mZhi, dGan: p.dGan, dZhi: p.dZhi,
    dayMasterEl: p.dayMasterEl, dist,
    pillars: [pil(p.yGan, p.yZhi), pil(p.mGan, p.mZhi), pil(p.dGan, p.dZhi)],
    foundYear: y,
  };
}

export type Phase = 'expand' | 'harvest' | 'hold';
export type DaeunBlock = { from: number; to: number; gan: number; zhi: number; el: number; cur: boolean };
export type CompanyDaeun = {
  age: number; curBlock: number; forward: boolean;
  list: DaeunBlock[];
  rel: string;        // 지금 구간과 회사 일간의 관계
  phase: Phase;       // 확장이냐 수성이냐 — 이 화면이 답하는 한 줄
};

// 관계별 구간 성격.
// **둘로 가르면 화면이 자기 말과 싸운다.** 재성 구간의 설명은 "벌이는 것보다 챙기고 굳힐 때"인데
// 이걸 '확장'으로 묶었더니 머리글과 본문이 정반대로 붙었다. 거두는 때는 미는 때와 다르다.
const PHASE_OF: Record<string, Phase> = {
  in: 'expand',      // 밖에서 밀어준다 — 유일하게 벌일 때
  jae: 'harvest',    // 결실 — 벌이는 게 아니라 거두고 굳힌다
  bi: 'hold',        // 경쟁·과열 — 내실
  sik: 'hold',       // 소모 — 관리
  gwan: 'hold',      // 조여진다 — 시스템
};

/** 회사 대운 — 설립 후 10년 단위 구간. curYear 기준으로 지금 어느 칸인지 표시한다. */
export function companyDaeun(ch: CompanyChart, curYear: number): CompanyDaeun {
  let mi = 0;
  for (let i = 0; i < 60; i++) { if (i % 10 === ch.mGan && i % 12 === ch.mZhi) { mi = i; break; } }
  const forward = [0, 2, 4, 6, 8].includes(ch.yGan);   // 년간이 양이면 순행
  const age = Math.max(0, curYear - ch.foundYear);
  const curBlock = Math.min(7, Math.floor(age / 10));
  const list: DaeunBlock[] = [];
  for (let k = 0; k < 8; k++) {
    const idx = ((mi + (forward ? (k + 1) : -(k + 1))) % 60 + 60) % 60;
    const g = idx % 10, z = idx % 12;
    list.push({ from: k * 10, to: k * 10 + 9, gan: g, zhi: z, el: GAN_EL[g], cur: k === curBlock });
  }
  const rel = relation(ch.dayMasterEl, list[curBlock].el);
  return { age, curBlock, forward, list, rel, phase: PHASE_OF[rel] ?? 'hold' };
}

/** 대운 여덟 구간 각각이 확장·수확·수성 중 무엇인지 — 무료 화면의 10년 구간표 */
export function blockPhases(ch: CompanyChart, d: CompanyDaeun): Phase[] {
  return d.list.map(b => PHASE_OF[relation(ch.dayMasterEl, b.el)] ?? 'hold');
}

/** 앞으로 n년 세운 — 밀어주는 해(도움·결실)와 조이는 해(시련) 개수. 해가 언제인지는 유료(회사 대운)에서 연다. */
export function yearsAhead(ch: CompanyChart, fromYear: number, n = 8) {
  const list = Array.from({ length: n }, (_, i) => ({ year: fromYear + i, rel: relation(ch.dayMasterEl, yearGanji(fromYear + i).el) }));
  return { list, up: list.filter(x => x.rel === 'in' || x.rel === 'jae').length, down: list.filter(x => x.rel === 'gwan').length };
}

/** 회사 오행이 두터운 쪽·빈 쪽이 일에서 무엇으로 나타나는가 */
export const CO_STRONG = [
  '새 사업을 벌이고 판을 넓히는 힘이 셉니다 — 대신 벌인 일을 끝맺는 관리가 약해지기 쉽습니다.',
  '영업·대외 관계로 판을 키우는 힘이 셉니다 — 대신 기복이 크고 지출이 빠르게 붙습니다.',
  '버티고 신용을 쌓는 힘이 셉니다 — 대신 변화가 느려 새 시장 진입이 늦어지기 쉽습니다.',
  '원칙·품질·결단이 강한 회사입니다 — 대신 경직돼 사람과 거래처가 등을 돌리기 쉽습니다.',
  '정보를 읽고 흐름을 타는 힘이 셉니다 — 대신 결정이 늦고 실행이 흩어지기 쉽습니다.',
];
export const CO_WEAK = [
  '새 판을 여는 힘이 비어, 기존 발주처에 매이기 쉽습니다. 신사업은 사람을 따로 세워 맡기십시오.',
  '알리고 사람을 끄는 힘이 비어, 실력에 비해 덜 알려집니다. 영업·홍보를 구조로 만드십시오.',
  '버티는 힘이 비어, 자금 흐름이 흔들리면 크게 출렁입니다. 유보금·현금 규칙을 먼저 정하십시오.',
  '끊고 정리하는 힘이 비어, 손해 보는 거래를 오래 끌기 쉽습니다. 손절 기준을 문서로 두십시오.',
  '멀리 보는 힘이 비어, 눈앞 수주에 끌려다니기 쉽습니다. 1년 단위 계획표를 따로 두십시오.',
];

export const PHASE_LABEL: Record<Phase, string> = { expand: '확장 구간', harvest: '수확 구간', hold: '수성 구간' };
export const PHASE_HINT: Record<Phase, string> = {
  expand: '사람과 자금을 태워 벌일 때입니다.',
  harvest: '새로 벌이기보다 벌여 둔 것을 거둘 때입니다.',
  hold: '내실·부채정리·핵심에 집중할 때입니다.',
};

export const DAEUN_LINE: Record<string, string> = {
  in: '회사를 밖에서 밀어주는 기운이 드는 구간입니다 — 자금·수주·인연이 붙습니다.',
  bi: '회사와 같은 기운이 겹치는 구간입니다 — 힘은 세나 경쟁과 확장 과열을 조심할 때입니다.',
  jae: '회사가 결실을 거둬들이는 재물의 구간입니다 — 벌이는 것보다 챙기고 굳힐 때입니다.',
  sik: '회사가 힘을 밖으로 쏟는 구간입니다 — 실적은 나되 소모가 커서 관리가 관건입니다.',
  gwan: '회사가 눌리고 조여지는 구간입니다 — 무리한 확장보다 내실과 시스템을 다질 때입니다.',
};

export const SEUN_LINE: Record<string, [string, string]> = {
  in: ['도움운', '회사를 밖에서 밀어주는 해 — 자금·수주·귀인이 붙어 판을 키우기 좋습니다.'],
  bi: ['경쟁운', '같은 기운이 겹치는 해 — 힘은 세나 경쟁·과속 확장을 조심하고 내실을 지킬 때입니다.'],
  jae: ['결실운', '거둬들이는 재물의 해 — 벌이기보다 챙기고 굳혀 실속을 남길 때입니다.'],
  sik: ['소모운', '힘을 밖으로 쏟는 해 — 실적은 나되 지출·소모가 크니 관리가 관건입니다.'],
  gwan: ['시련운', '조여지는 해 — 규정·계약·사람에서 마찰이 잦으니 무리한 확장을 미룰 때입니다.'],
};

/** 올해가 회사에 어떤 해인가. */
export function companySeun(ch: CompanyChart, year: number) {
  const y = yearGanji(year);
  const rel = relation(ch.dayMasterEl, y.el);
  const [tag, line] = SEUN_LINE[rel] ?? SEUN_LINE.bi;
  return { year, rel, hanja: y.hanja, tag, line };
}

/** 오행이 넘치는 자리와 빈 자리. 무료 화면에서 회사의 결을 한 줄로 말하는 데 쓴다. */
export function elBalance(ch: CompanyChart) {
  let strong = 0, weak = 0;
  ch.dist.forEach((v, i) => { if (v > ch.dist[strong]) strong = i; if (v < ch.dist[weak]) weak = i; });
  // 가장 많은 오행이 둘 이상이면 하나만 집어 "木으로 쏠렸다"고 하면 틀린 말이 된다(木2·金2 인데 木만 말했다)
  const strongs = ch.dist.map((v, i) => (v === ch.dist[strong] ? i : -1)).filter(i => i >= 0);
  const weaks = ch.dist.map((v, i) => (v === ch.dist[weak] ? i : -1)).filter(i => i >= 0);
  return { strong, weak, strongs, weaks, zero: ch.dist[weak] === 0, dist: ch.dist };
}

export const elName = (i: number) => EL[i];
export const elHex = (i: number) => EL_HEX[i];
export const ganjaOf = (g: number, z: number) => GAN[g] + ZHI[z];

/** 은/는 — 회사명이 그대로 문장에 들어가므로 받침을 봐야 한다("대전건설는"이 화면에 찍혔었다). */
export function eunNeun(word: string): string {
  const ch = (word || '').trim().slice(-1);
  const code = ch.charCodeAt(0);
  if (!ch || code < 0xac00 || code > 0xd7a3) return '는';   // 한글이 아니면 기본값
  return (code - 0xac00) % 28 === 0 ? '는' : '은';
}

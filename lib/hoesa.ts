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

  // 설립일에는 시(時)가 없다. 등기 시각을 아는 회사가 없어서 삼주로 본다.
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

export type Phase = 'expand' | 'hold';
export type DaeunBlock = { from: number; to: number; gan: number; zhi: number; el: number; cur: boolean };
export type CompanyDaeun = {
  age: number; curBlock: number; forward: boolean;
  list: DaeunBlock[];
  rel: string;        // 지금 구간과 회사 일간의 관계
  phase: Phase;       // 확장이냐 수성이냐 — 이 화면이 답하는 한 줄
};

// 관계별 구간 성격. 재성·인성·비겁은 밖으로 미는 때, 관성·식상은 안을 다지는 때로 본다.
const PHASE_OF: Record<string, Phase> = { in: 'expand', bi: 'expand', jae: 'expand', gwan: 'hold', sik: 'hold' };

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

export const PHASE_LABEL: Record<Phase, string> = { expand: '확장 구간', hold: '수성 구간' };

export const DAEUN_LINE: Record<string, string> = {
  in: '회사를 밖에서 밀어주는 기운이 드는 구간입니다 — 자금·수주·인연이 붙습니다.',
  bi: '회사와 같은 기운이 겹치는 구간입니다 — 힘은 세나 경쟁과 확장 과열을 조심할 때입니다.',
  jae: '회사가 결실을 거둬들이는 재물의 구간입니다 — 벌이는 것보다 챙기고 굳힐 때입니다.',
  sik: '회사가 힘을 밖으로 쏟는 구간입니다 — 실적은 나되 소모가 커서 관리가 관건입니다.',
  gwan: '회사가 눌리고 조여지는 구간입니다 — 무리한 확장보다 내실과 시스템을 다질 때입니다.',
};

export const SEUN_LINE: Record<string, [string, string]> = {
  in: ['도움運', '회사를 밖에서 밀어주는 해 — 자금·수주·귀인이 붙어 판을 키우기 좋습니다.'],
  bi: ['경쟁運', '같은 기운이 겹치는 해 — 힘은 세나 경쟁·과속 확장을 조심하고 내실을 지킬 때입니다.'],
  jae: ['결실運', '거둬들이는 재물의 해 — 벌이기보다 챙기고 굳혀 실속을 남길 때입니다.'],
  sik: ['소모運', '힘을 밖으로 쏟는 해 — 실적은 나되 지출·소모가 크니 관리가 관건입니다.'],
  gwan: ['시련運', '조여지는 해 — 규정·계약·사람에서 마찰이 잦으니 무리한 확장을 미룰 때입니다.'],
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
  return { strong, weak, zero: ch.dist[weak] === 0, dist: ch.dist };
}

export const elName = (i: number) => EL[i];
export const elHex = (i: number) => EL_HEX[i];
export const ganjaOf = (g: number, z: number) => GAN[g] + ZHI[z];

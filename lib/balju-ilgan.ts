// lib/balju-ilgan.ts — 발주처 상세페이지의 '대표님 일간별로 보면' 표와 이웃 발주처(2026-10-27).
//
// 발주처 상세 64장은 분야 템플릿으로 찍어 낸 글이라, 가장 비슷한 이웃과 문장의 68%가 겹쳤다(발전 5사는 83%).
// 그대로 사이트맵에 올리면 구글이 '자동 생성 얇은 페이지'로 본다. 지어낸 사실을 보태지 않고,
// 우리 궁합 계산(lib/balju-map)이 이미 내는 값으로 페이지마다 다른 내용을 만든다.
//  · 대표 일간 10개 각각에게 이 발주처가 99곳 중 몇 번째로 결이 맞는지(일지 12개를 고르게 평균)
//  · 같은 분야·같은 기운의 이웃 발주처(모든 페이지가 같은 12곳에 링크하던 것을 바꾼다)
import { CLIENTS, clientSlug, josa, type Client } from './clients';
import { fitOf, sipsungOf, SIP_META, OH_NAME, type Sipsung } from './balju-map';

export const ILGAN = ['갑목', '을목', '병화', '정화', '무토', '기토', '경금', '신금', '임수', '계수'] as const;
const GAN_H = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const yearGan = (c: Client) => ((Number(c.date.slice(0, 4)) - 4) % 10 + 10) % 10;

// 일지를 모르는 상태의 기대 점수: 일지 12개에 대해 고르게 평균. 실제 점수는 일지 합충으로 ±10 안팎 달라진다.
function expected(gan: number, c: Client): number {
  let s = 0;
  for (let ji = 0; ji < 12; ji++) s += fitOf({ gan, ji }, c).score;
  return s / 12;
}

// 일간별 99곳 순위표. 페이지마다 다시 세지 않게 한 번만 만든다.
let RANK: Map<string, number>[] | null = null;
function ranks(): Map<string, number>[] {
  if (RANK) return RANK;
  RANK = ILGAN.map((_, gan) => {
    const sorted = CLIENTS.map(c => ({ n: c.name, v: expected(gan, c) }))
      .sort((a, b) => b.v - a.v || a.n.localeCompare(b.n, 'ko'));
    // 같은 점수는 같은 순위(1, 2, 2, 4 …)
    const m = new Map<string, number>(); let prev = NaN, r = 0;
    sorted.forEach((x, i) => { if (x.v !== prev) { r = i + 1; prev = x.v; } m.set(x.n, r); });
    return m;
  });
  return RANK;
}

export type IlganRow = { ilgan: string; hanja: string; sip: Sipsung; label: string; desc: string; score: number; rank: number };

export function ilganTable(c: Client): IlganRow[] {
  const R = ranks(), yg = yearGan(c);
  return ILGAN.map((ilgan, gan) => {
    const sip = sipsungOf(gan, yg), m = SIP_META[sip];
    return { ilgan, hanja: GAN_H[gan], sip, label: m.label, desc: m.desc, score: Math.round(expected(gan, c)), rank: R[gan].get(c.name) ?? CLIENTS.length };
  });
}

// 표를 한 줄로 읽어 주는 문장. 가장 결이 맞는 일간 둘과 시험받는 일간 하나.
export function ilganSummary(c: Client): string {
  const rows = ilganTable(c).slice().sort((a, b) => b.score - a.score || a.rank - b.rank);
  const top = rows.slice(0, 2), low = rows[rows.length - 1];
  const yg = yearGan(c);
  return `${c.name}의 설립 년주는 ${GAN_H[yg]}(${OH_NAME[Math.floor(yg / 2)]}) 기운입니다. ` +
    `${top.map(r => `${r.ilgan} 대표`).join('와 ')}에게는 ${top[0].desc}${josa(top[0].desc, '으로', '로')}, ${CLIENTS.length}곳 중 ${top[0].rank}위 안팎입니다. ` +
    `${low.ilgan} 대표에게는 ${low.desc}${josa(low.desc, '이라', '라')} ${low.rank}위로 내려갑니다.`;
}

// 이웃 발주처: 같은 분야(cat 첫 낱말) 먼저, 그다음 같은 설립 기운. 자기 자신은 뺀다.
export function neighbors(c: Client, n = 10): Client[] {
  const head = c.cat.split('·')[0], yg = yearGan(c), oh = Math.floor(yg / 2);
  const others = CLIENTS.filter(x => x.name !== c.name);
  const sameCat = others.filter(x => x.cat.split('·')[0] === head);
  const sameOh = others.filter(x => !sameCat.includes(x) && Math.floor(yearGan(x) / 2) === oh);
  const rest = others.filter(x => !sameCat.includes(x) && !sameOh.includes(x) && x.core);
  return [...sameCat, ...sameOh, ...rest].slice(0, n);
}

export const slugOf = clientSlug;

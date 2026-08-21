// lib/balju-map.ts — 발주처 관계지도 계산.
// 대표님 일간·일지와 발주처 설립 년주를 견줘 궁합을 매긴다.
// 오행 상생상극만 쓰면 값이 5개뿐이라 지도가 부채꼴로 뭉친다.
// 십성(十星) 10종 + 년지 합충을 더해야 거리가 흩어져 지도가 읽힌다.
import { CLIENTS, clientSlug, type Client } from '@/lib/clients';

const GAN_OH = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];      // 목화토금수
export const OH_NAME = ['목', '화', '토', '금', '수'] as const;
export const OH_HANJA = ['木', '火', '土', '金', '水'] as const;
export const OH_COLOR = ['#2f7d5b', '#c0392b', '#c79a3a', '#8a949e', '#2e5aa8'];
// 위 색은 어두운 지도 위 '점' 전용이다. 흰 배경 글자에 그대로 쓰면
// 金(#8a949e)이 3.08:1까지 떨어져 안 읽힌다. 글자에는 아래 값을 쓴다(전부 흰 배경에서 AA 통과).
export const OH_TEXT = ['#24684a', '#a8321f', '#84621a', '#556069', '#26508f'];

export type Sipsung =
  | '비견' | '겁재' | '식신' | '상관' | '편재'
  | '정재' | '편관' | '정관' | '편인' | '정인';

// 일간(me) 기준 상대 천간(td)의 십성. 오행 관계 × 음양 동일 여부.
export function sipsungOf(me: number, td: number): Sipsung {
  const a = GAN_OH[me], b = GAN_OH[td];
  const same = me % 2 === td % 2;
  if (b === a) return same ? '비견' : '겁재';
  if ((a + 1) % 5 === b) return same ? '식신' : '상관';
  if ((a + 2) % 5 === b) return same ? '편재' : '정재';
  if ((b + 2) % 5 === a) return same ? '편관' : '정관';
  return same ? '편인' : '정인';
}

// 십성을 입찰 언어로. 정인·편관 같은 한자를 그대로 두면 대표님들이 안 읽는다.
// 점수는 절대 평가가 아니라 대표님 기준 '상대 적합도'다.
// 상한 92로 두되 실제 최고치가 80대에 머물게 잡았다 — 상위권이 죄다 99로 뜨면
// 계산이 아니라 광고로 읽혀 오히려 신뢰를 잃는다. 동점이 생기는 편이 자연스럽다.
type Meta = { base: number; label: string; desc: string; color: string };
export const SIP_META: Record<Sipsung, Meta> = {
  정인: { base: 78, label: '물꼬', desc: '나를 살려주는 자리', color: '#2f7d5b' },
  편인: { base: 71, label: '물꼬', desc: '도움이 비스듬히 오는 자리', color: '#2f7d5b' },
  정관: { base: 69, label: '격식', desc: '제도권에서 인정받는 자리', color: '#2f56c4' },
  정재: { base: 64, label: '판돈', desc: '꾸준히 취할 수 있는 자리', color: '#9a7a2e' },
  식신: { base: 60, label: '마당', desc: '내 힘이 편히 뻗는 자리', color: '#2f7d5b' },
  편재: { base: 55, label: '판돈', desc: '크게 벌리는 자리', color: '#9a7a2e' },
  비견: { base: 51, label: '동무', desc: '결이 같아 말이 통하는 곳', color: '#2f56c4' },
  상관: { base: 45, label: '맞불', desc: '실력은 통하나 마찰이 있는 곳', color: '#b3382c' },
  겁재: { base: 40, label: '경합', desc: '경쟁자가 몰리는 자리', color: '#b3382c' },
  편관: { base: 34, label: '고비', desc: '나를 시험하는 큰 판', color: '#b3382c' },
};

// 년지 합충 — 같은 십성이라도 지지가 붙고 부딪히는 정도로 갈린다.
export function jiModifier(a: number, b: number): { delta: number; name: string } {
  const d = ((b - a) % 12 + 12) % 12;
  if (d === 6) return { delta: -10, name: '충(沖)' };
  if (d === 4 || d === 8) return { delta: 7, name: '삼합' };
  if ((a + b) % 12 === 1) return { delta: 6, name: '육합' };
  if (d === 3 || d === 9) return { delta: -5, name: '형(刑)' };
  return { delta: 0, name: '' };
}

export type BaljuFit = {
  name: string; slug: string; cat: string; core: boolean;
  year: number; ganji: string; oh: number;
  sip: Sipsung; label: string; desc: string; color: string;
  jimod: string; score: number;
};

const GAN_H = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const JI_H = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export function fitOf(me: { gan: number; ji: number }, c: Client): BaljuFit {
  const year = Number(c.date.slice(0, 4));
  const gi = ((year - 4) % 10 + 10) % 10;
  const ji = ((year - 4) % 12 + 12) % 12;
  const sip = sipsungOf(me.gan, gi);
  const m = SIP_META[sip];
  const jm = jiModifier(me.ji, ji);
  const score = Math.max(20, Math.min(92, m.base + jm.delta + (c.core ? 2 : 0)));
  return {
    name: c.name, slug: clientSlug(c.name), cat: c.cat, core: !!c.core,
    year, ganji: GAN_H[gi] + JI_H[ji], oh: GAN_OH[gi],
    sip, label: m.label, desc: m.desc, color: m.color,
    jimod: jm.name, score,
  };
}

// 궁합 높은 순. 동점이면 핵심 발주처 우선, 그다음 이름순으로 고정한다
// (정렬이 흔들리면 새로고침마다 순위가 바뀌어 신뢰를 잃는다).
export function rankBalju(me: { gan: number; ji: number }, list: Client[] = CLIENTS): BaljuFit[] {
  return list.map(c => fitOf(me, c)).sort((a, b) =>
    b.score - a.score ||
    Number(b.core) - Number(a.core) ||
    a.name.localeCompare(b.name, 'ko'),
  );
}

// 지도에 올릴 상위 N곳을 잠김/공개로 가른다.
// 가장 가까운 lockCount 곳만 잠근다 — 점수는 공개하고 정체만 가리는 편이
// "몇 점인지는 아는데 어디인지 모르는" 상태를 만들어 가장 강하게 남는다.
export function splitForMap(ranked: BaljuFit[], show = 20, lockCount = 5) {
  const top = ranked.slice(0, show);
  return { locked: top.slice(0, lockCount), free: top.slice(lockCount), top };
}

// 상위권이 한 오행으로 몰리는 건 버그가 아니라 명리 결과다(예: 土 일간에게 火가 인성).
// 그대로 두면 "왜 다 빨갛지"가 되니 한 줄로 설명해준다.
export function dominantOh(top: BaljuFit[]): { oh: number; count: number } | null {
  if (!top.length) return null;
  const n = [0, 0, 0, 0, 0];
  for (const t of top) n[t.oh] += 1;
  let best = 0;
  for (let i = 1; i < 5; i++) if (n[i] > n[best]) best = i;
  return n[best] >= Math.ceil(top.length * 0.5) ? { oh: best, count: n[best] } : null;
}

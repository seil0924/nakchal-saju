// lib/bazi-en.ts — 사주를 영어권이 쓰는 이름으로 옮긴다.
//
// 계산은 손대지 않는다. 만세력·절기·진태양시는 그대로 쓰고 이름표만 바꿔 단다.
// 영어권에서는 'Four Pillars of Destiny' 보다 'BaZi' 로 훨씬 많이 찾는다(구글 트렌드 67 대 2).
// 그래서 간판은 BaZi 로 달고, 한자와 병음을 같이 보여 준다 — 이 쪽 손님은 한자를 반기지 꺼리지 않는다.
import { GAN_EL, ZHI_EL } from '@/lib/manse-core';
import { starOf, type Star } from '@/lib/siksin';

export const STEM_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const STEM_PINYIN = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'] as const;
export const BRANCH_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
export const BRANCH_PINYIN = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'] as const;
export const BRANCH_ANIMAL = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
  'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'] as const;

// 오행 차례는 상생(목→화→토→금→수)이다. 코드 전체가 이 순서를 쓴다.
export const ELEMENT_EN = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'] as const;
// 색이 두 벌 필요하다.
// TILE 은 흰 글씨를 얹는 바탕이라 어두워야 하고(土·金이 밝아서 2.6:1 까지 떨어졌다),
// LIGHT 는 먹빛 배경 위에 얹는 글씨라 밝아야 한다. 한 벌로 돌려쓰면 어느 한쪽이 안 읽힌다.
export const ELEMENT_TILE = ['#2f7d5b', '#b03426', '#8a6a1e', '#5d666e', '#2e5aa8'];
export const ELEMENT_LIGHT = ['#7fd3ab', '#f0938a', '#e8c877', '#c2cad2', '#9dbcf0'];

// 십성. 영어권 자료마다 표기가 갈리는데 가장 널리 쓰이는 쪽으로 골랐다.
export const STAR_EN: Record<Star, string> = {
  비견: 'Friend', 겁재: 'Rob Wealth',
  식신: 'Eating God', 상관: 'Hurting Officer',
  편재: 'Indirect Wealth', 정재: 'Direct Wealth',
  편관: 'Seven Killings', 정관: 'Direct Officer',
  편인: 'Indirect Resource', 정인: 'Direct Resource',
};
export const STAR_HANJA: Record<Star, string> = {
  비견: '比肩', 겁재: '劫財', 식신: '食神', 상관: '傷官', 편재: '偏財',
  정재: '正財', 편관: '七殺', 정관: '正官', 편인: '偏印', 정인: '正印',
};

export type Chart8 = {
  yGan: number; yZhi: number; mGan: number; mZhi: number;
  dGan: number; dZhi: number; hGan: number | null; hZhi: number | null;
};

export type Cell = {
  hanja: string; pinyin: string; element: string;
  hex: string;        // 글자를 얹을 바탕색
  hexText: string;    // 먹빛 위에 쓰는 글씨색
  yang: boolean;
  animal?: string;
  star: string | null;        // 일간 자신은 십성이 없다
  starHanja: string | null;
};
export type Pillar = { label: string; stem: Cell; branch: Cell };

function stemCell(idx: number, me: { el: number; yang: boolean } | null): Cell {
  const el = GAN_EL[idx], yang = idx % 2 === 0;
  const star = me ? starOf(me.el, me.yang, el, yang) : null;
  return {
    hanja: STEM_HANJA[idx], pinyin: STEM_PINYIN[idx],
    element: ELEMENT_EN[el], hex: ELEMENT_TILE[el], hexText: ELEMENT_LIGHT[el], yang,
    star: star ? STAR_EN[star] : null, starHanja: star ? STAR_HANJA[star] : null,
  };
}
function branchCell(idx: number, me: { el: number; yang: boolean }): Cell {
  const el = ZHI_EL[idx], yang = idx % 2 === 0;
  const star = starOf(me.el, me.yang, el, yang);
  return {
    hanja: BRANCH_HANJA[idx], pinyin: BRANCH_PINYIN[idx],
    element: ELEMENT_EN[el], hex: ELEMENT_TILE[el], hexText: ELEMENT_LIGHT[el], yang,
    animal: BRANCH_ANIMAL[idx],
    star: STAR_EN[star], starHanja: STAR_HANJA[star],
  };
}

export type BaziChart = {
  pillars: Pillar[];          // 시주를 모르면 셋만 나온다
  dayMaster: { hanja: string; pinyin: string; element: string; hex: string; yang: boolean };  // hex 는 먹빛 위 글씨색
  counts: { element: string; hex: string; n: number }[];
  strongest: string;
  weakest: string;
};

export function baziOf(c: Chart8): BaziChart {
  const me = { el: GAN_EL[c.dGan], yang: c.dGan % 2 === 0 };
  const pillars: Pillar[] = [
    { label: 'Year', stem: stemCell(c.yGan, me), branch: branchCell(c.yZhi, me) },
    { label: 'Month', stem: stemCell(c.mGan, me), branch: branchCell(c.mZhi, me) },
    { label: 'Day', stem: stemCell(c.dGan, null), branch: branchCell(c.dZhi, me) },
  ];
  if (c.hGan !== null && c.hZhi !== null) {
    pillars.push({ label: 'Hour', stem: stemCell(c.hGan, me), branch: branchCell(c.hZhi, me) });
  }

  const n = [0, 0, 0, 0, 0];
  for (const p of pillars) {
    n[ELEMENT_EN.indexOf(p.stem.element as typeof ELEMENT_EN[number])]++;
    n[ELEMENT_EN.indexOf(p.branch.element as typeof ELEMENT_EN[number])]++;
  }
  const counts = ELEMENT_EN.map((element, i) => ({ element, hex: ELEMENT_LIGHT[i], n: n[i] }));
  // 동수일 때 앞의 오행을 택한다 — 새로고침마다 답이 바뀌면 계산이 아니라 뽑기로 보인다.
  let hi = 0, lo = 0;
  for (let i = 1; i < 5; i++) { if (n[i] > n[hi]) hi = i; if (n[i] < n[lo]) lo = i; }

  return {
    pillars,
    dayMaster: {
      hanja: STEM_HANJA[c.dGan], pinyin: STEM_PINYIN[c.dGan],
      element: ELEMENT_EN[me.el], hex: ELEMENT_LIGHT[me.el], yang: me.yang,
    },
    counts, strongest: ELEMENT_EN[hi], weakest: ELEMENT_EN[lo],
  };
}

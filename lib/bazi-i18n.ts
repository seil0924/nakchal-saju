// lib/bazi-i18n.ts — 영어로 만든 차트에 번체 중국어 이름표를 갈아 끼운다.
//
// 계산은 손대지 않는다. baziOf 가 낸 결과의 '이름'만 바꾼다.
// 언어별로 계산을 따로 짜면 언젠가 반드시 어긋난다 — 같은 생일로 두 언어가 다른 답을 내는 순간 신뢰가 끝난다.
// 십성 한자는 이미 STAR_HANJA 에 있으니 그대로 쓴다.
import { ELEMENT_EN, STAR_EN, STAR_HANJA, BRANCH_ANIMAL, type BaziChart, type Cell } from '@/lib/bazi-en';
import type { Star } from '@/lib/siksin';

export type Lang = 'en' | 'zh';

const EL_ZH = ['木', '火', '土', '金', '水'];
const ANIMAL_ZH = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];
const PILLAR_ZH: Record<string, string> = { Year: '年柱', Month: '月柱', Day: '日柱', Hour: '時柱' };

// 영어 십성 이름 → 한자. STAR_EN 의 값 10개는 서로 겹치지 않아 역인덱스가 안전하다.
const EN_TO_STAR_HANJA: Record<string, string> = Object.fromEntries(
  (Object.keys(STAR_EN) as Star[]).map(k => [STAR_EN[k], STAR_HANJA[k]]),
);

const elZh = (en: string) => EL_ZH[ELEMENT_EN.indexOf(en as typeof ELEMENT_EN[number])] ?? en;
const animalZh = (en?: string) =>
  en === undefined ? undefined : (ANIMAL_ZH[BRANCH_ANIMAL.indexOf(en as typeof BRANCH_ANIMAL[number])] ?? en);

// 중국어 화면에서는 병음이 군더더기다. 빈 문자열로 두고 화면 쪽에서 비면 안 그린다.
const cellZh = (c: Cell): Cell => ({
  ...c,
  pinyin: '',
  element: elZh(c.element),
  animal: animalZh(c.animal),
  star: c.star ? (EN_TO_STAR_HANJA[c.star] ?? c.star) : null,
});

export function toZh(b: BaziChart): BaziChart {
  return {
    pillars: b.pillars.map(p => ({
      label: PILLAR_ZH[p.label] ?? p.label,
      stem: cellZh(p.stem),
      branch: cellZh(p.branch),
    })),
    dayMaster: { ...b.dayMaster, pinyin: '', element: elZh(b.dayMaster.element) },
    counts: b.counts.map(c => ({ ...c, element: elZh(c.element) })),
    strongest: elZh(b.strongest),
    weakest: elZh(b.weakest),
  };
}

// 계산기 화면 문구. 한 곳에 모아 두어야 한쪽만 고쳐지는 사고가 안 난다.
export const BZ_UI = {
  en: {
    htmlLang: 'en',
    dateLabel: 'Date of birth', timeLabel: 'Time of birth', placeLabel: 'Place of birth',
    unknown: 'Unknown', known: 'Known', searchCity: 'Search a city',
    yang: 'Yang', yin: 'Yin', dayMasterSub: 'Day Master', dayMaster: 'Day Master',
    why: (
      'Why we ask for the place: the hour pillar is set by true solar time, not by the clock on the wall. ' +
      'Two people born at the same clock time in Madrid and Beijing are more than an hour apart in solar time. ' +
      'If a calculator never asks where you were born, its hour pillar is a guess.'
    ),
    strongest: 'Strongest', thinnest: 'thinnest',
    correctionFor: (city: string) => `Solar correction applied for ${city}`,
    yajaNote: ' Late-night hour (23:00–01:00) handled as the following day pillar.',
    noTimeHint: 'Without a birth time we read three pillars. The hour pillar changes the reading, so add the time if you know it.',
    disc: (
      'Solar terms are computed astronomically from the sun\u2019s apparent longitude, not from a fixed calendar date, ' +
      'so births near a term boundary land in the right month. For reflection, not prediction.'
    ),
    none: 'none', min: 'min',
  },
  zh: {
    htmlLang: 'zh-Hant',
    dateLabel: '出生日期', timeLabel: '出生時間', placeLabel: '出生地',
    unknown: '不詳', known: '已知', searchCity: '搜尋城市',
    yang: '陽', yin: '陰', dayMasterSub: '日主', dayMaster: '日主',
    why: (
      '為何要問出生地：時柱依真太陽時而定，不是牆上的時鐘。' +
      '同一時鐘時刻出生的兩個人，在馬德里與北京的真太陽時相差一個多小時。' +
      '若排盤工具從不問你在哪裡出生，它的時柱只是猜的。'
    ),
    strongest: '最旺', thinnest: '最弱',
    correctionFor: (city: string) => `${city} 的真太陽時校正`,
    yajaNote: ' 夜子時（23:00–01:00）按翌日日柱處理。',
    noTimeHint: '不知出生時辰則只排三柱。時柱會改變整盤的讀法，知道時間請補上。',
    disc: (
      '節氣由太陽視黃經天文推算，並非查固定日曆，因此節氣交界前後出生也能落在正確的月份。' +
      '僅供參考省思，非預言。'
    ),
    none: '無', min: '分',
  },
} as const;


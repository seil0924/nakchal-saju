// lib/daypicker-en.ts — 건제십이신(建除十二神) 택일을 영어권 이름으로.
//
// '언제 시작할까'는 문화를 거의 안 탄다. 인도는 무후르타(muhurta)로 디왈리에 증권거래소가
// 한 시간짜리 특별장을 열고, 일본은 육요(六曜)로 계약 날인일을 잡고, 중화권은 택일(擇日)을 한다.
// 우리 엔진이 그대로 상품이 되는 자리라 영어판을 여기서 먼저 낸다.
import { sunLong, jdn } from '@/lib/manse-core';

// 열두 신을 차례대로. index = (일지 − 월지 + 12) % 12 로 나온다.
export const OFFICERS = [
  { hanja: '建', pinyin: 'Jian', en: 'Establish', gist: 'Beginnings and declarations. Strong to start, weak to finish.' },
  { hanja: '除', pinyin: 'Chu', en: 'Remove', gist: 'Clearing out. Good for ending things and cleaning up.' },
  { hanja: '滿', pinyin: 'Man', en: 'Full', gist: 'Filling up. Good for stocking, storing and moving in.' },
  { hanja: '平', pinyin: 'Ping', en: 'Balance', gist: 'Level ground. Quiet, unremarkable, safe for routine work.' },
  { hanja: '定', pinyin: 'Ding', en: 'Stable', gist: 'Settling. The day things are fixed in place — contracts sit well here.' },
  { hanja: '執', pinyin: 'Zhi', en: 'Initiate', gist: 'Taking hold. Good for hiring and taking charge.' },
  { hanja: '破', pinyin: 'Po', en: 'Destruction', gist: 'Breaking. Avoid for anything you want to last.' },
  { hanja: '危', pinyin: 'Wei', en: 'Danger', gist: 'Precarious. Avoid for travel and risk.' },
  { hanja: '成', pinyin: 'Cheng', en: 'Success', gist: 'Completion. The strongest day for opening and finishing.' },
  { hanja: '收', pinyin: 'Shou', en: 'Collect', gist: 'Gathering in. Good for receiving payment and closing deals.' },
  { hanja: '開', pinyin: 'Kai', en: 'Open', gist: 'Opening. Good for launches and first days.' },
  { hanja: '閉', pinyin: 'Bi', en: 'Close', gist: 'Shutting. Avoid for anything you want to open.' },
] as const;

export const AVOID = [6, 7, 11];   // 破 · 危 · 閉

export type Purpose = 'opening' | 'contract' | 'moving' | 'travel' | 'wedding';

// 좋은 순서대로 적는다 — 앞에 있을수록 그 일에 힘이 실린다.
export const PURPOSES: Record<Purpose, { label: string; blurb: string; good: number[] }> = {
  opening: {
    label: 'Opening a business',
    blurb: 'First day of trading, a launch, a grand opening.',
    good: [8, 10, 2, 4],
  },
  contract: {
    label: 'Signing a contract',
    blurb: 'Putting your name to something you want to hold.',
    good: [4, 8, 9],
  },
  moving: {
    label: 'Moving home or office',
    blurb: 'Carrying your things into a new place.',
    good: [2, 4, 8, 10],
  },
  travel: {
    label: 'Setting out on a journey',
    blurb: 'Long trips and departures.',
    good: [1, 10, 8],
  },
  wedding: {
    label: 'A wedding',
    blurb: 'Joining two households.',
    good: [4, 8, 2],
  },
};

const STEM = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
const BRANCH = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
const STEM_H = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const BRANCH_H = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const p2 = (n: number) => String(n).padStart(2, '0');

// 월지는 절기로 가른다. 하루가 끝나는 시점(23:59 KST)으로 재야 오후에 드는 절기를
// 하루 늦게 잡지 않는다 — 정오로 재다가 입추·백로에서 실제로 어긋난 적이 있다.
function monthBranch(d: Date): number {
  const jd = jdn(d.getFullYear(), d.getMonth() + 1, d.getDate()) + (23.9833 - 9 - 12) / 24;
  return (2 + Math.floor(((sunLong(jd) - 315 + 360) % 360) / 30)) % 12;
}

export type DayPick = {
  ymd: string; month: number; day: number; dow: string;
  ganji: string; ganjiPinyin: string;
  officer: number; hanja: string; pinyin: string; en: string; gist: string;
  rank: number;              // 0 이 가장 좋다
};

function dayOf(d: Date): Omit<DayPick, 'rank'> {
  const mZhi = monthBranch(d);
  const idx = ((jdn(d.getFullYear(), d.getMonth() + 1, d.getDate()) + 49) % 60 + 60) % 60;
  const gan = idx % 10, zhi = idx % 12;
  const officer = ((zhi - mZhi) % 12 + 12) % 12;
  const o = OFFICERS[officer];
  return {
    ymd: `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`,
    month: d.getMonth() + 1, day: d.getDate(), dow: DOW[d.getDay()],
    ganji: STEM_H[gan] + BRANCH_H[zhi],
    ganjiPinyin: STEM[gan] + ' ' + BRANCH[zhi],
    officer, hanja: o.hanja, pinyin: o.pinyin, en: o.en, gist: o.gist,
  };
}

export function officerOf(d: Date): number { return dayOf(d).officer; }

// 그 일에 맞는 날만 골라 앞에서부터 돌려준다.
export function pickDays(purpose: Purpose, from: Date = new Date(), span = 90): DayPick[] {
  const good = PURPOSES[purpose].good;
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const out: DayPick[] = [];
  for (let k = 1; k <= span; k++) {
    const d = new Date(base.getTime() + k * 86400000);
    const info = dayOf(d);
    const rank = good.indexOf(info.officer);
    if (rank >= 0) out.push({ ...info, rank });
  }
  return out;
}

// 피하는 날. 겁주려는 게 아니라 '왜 그날은 빼는지'를 같이 보여주려는 것이다.
export function avoidDays(from: Date = new Date(), span = 90): DayPick[] {
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const out: DayPick[] = [];
  for (let k = 1; k <= span; k++) {
    const d = new Date(base.getTime() + k * 86400000);
    const info = dayOf(d);
    if (AVOID.includes(info.officer)) out.push({ ...info, rank: AVOID.indexOf(info.officer) });
  }
  return out;
}

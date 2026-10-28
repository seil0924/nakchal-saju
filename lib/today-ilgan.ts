// lib/today-ilgan.ts — 일간별 오늘의 투찰 운세(/today/[일간], 2026-10-28).
// 대표님이 투찰 전날 밤이나 당일 아침에 "오늘 넣어도 되나"를 검색하는 자리.
// 하루의 판정은 둘을 겹친다.
//   1) 그날 일진 천간이 대표님 일간에게 무슨 별인가(lib/ilgan DAY_STAR). 인성·비겁이면 살리는 날.
//   2) 그날 건제십이신이 파·위·폐면 미루는 편(입찰일 택일과 같은 기준).
// 일지 충은 생년월일이 있어야 본다. 그래서 이 화면은 '일간만 본 신호'라고 적고, 정밀 판정은 /reading 으로 보낸다.
import { GAN, ZHI, todayPillar } from './engine';
import { officerOf, AVOID } from './daypicker-en';
import { OFFICER_KO, taekilBySlug } from './taekil';
import { holidayOn } from './holidays-kr';
import { DAY_STAR, stemStar, type Tone } from './ilgan';
import type { Star } from './siksin';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const SIJIN: [string, string][] = [['子', '23~01'], ['丑', '01~03'], ['寅', '03~05'], ['卯', '05~07'], ['辰', '07~09'], ['巳', '09~11'], ['午', '11~13'], ['未', '13~15'], ['申', '15~17'], ['酉', '17~19'], ['戌', '19~21'], ['亥', '21~23']];
const WORK = [4, 5, 6, 7, 8];
const UP: Star[] = ['비견', '겁재', '정인', '편인'];

export type DaySignal = {
  ymd: string; label: string; short: string; ganji: string;
  star: Star; tone: Tone; line: string;
  officer: string; officerAvoid: boolean; officerGood: boolean;
  goodHours: string[]; holiday: string | null; weekend: boolean;
};

export function daySignal(me: number, ymd: string): DaySignal {
  const [y, m, d] = ymd.split('-').map(Number);
  const tp = todayPillar(y, m, d);
  const star = stemStar(me, tp.gan);
  const ds = DAY_STAR[star];
  const off = officerOf(new Date(y, m - 1, d));
  const o = OFFICER_KO[off];
  const officerAvoid = AVOID.includes(off);
  const officerGood = taekilBySlug('입찰일')!.good.includes(off);
  const tone: Tone = officerAvoid ? 'hold' : ds.tone;
  const goodHours = WORK.filter(z => UP.includes(stemStar(me, ((tp.gan % 5) * 2 + z) % 10)))
    .map(z => `${SIJIN[z][0]}시 ${SIJIN[z][1]}`);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return {
    ymd, label: `${m}월 ${d}일(${DOW[dow]})`, short: `${m}.${d}`, ganji: GAN[tp.gan] + ZHI[tp.zhi],
    star, tone, line: officerAvoid ? `${o.name}(${o.hanja})이 든 날이라 택일에서 피하는 날입니다. ${ds.line}` : ds.line,
    officer: `${o.name}(${o.hanja})`, officerAvoid, officerGood,
    goodHours, holiday: holidayOn(ymd)?.name ?? null, weekend: dow === 0 || dow === 6,
  };
}

const addDays = (ymd: string, k: number) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + k)).toISOString().slice(0, 10);
};

// 오늘부터 7일. 주말·공휴일은 투찰을 안 하는 날이 많아도 그대로 보여 주고 표시만 단다.
export function weekSignals(me: number, fromYmd: string): DaySignal[] {
  return Array.from({ length: 7 }, (_, k) => daySignal(me, addDays(fromYmd, k)));
}

// 이번 주에서 가장 나은 평일(넣기 편한 날 → 맞는 시진 많은 날 → 이른 날).
export function bestWeekday(list: DaySignal[]): DaySignal | null {
  const rank: Record<Tone, number> = { go: 0, mid: 1, hold: 2 };
  const ws = list.filter(x => !x.weekend && !x.holiday);
  return [...ws].sort((a, b) => (rank[a.tone] - rank[b.tone]) || (b.goodHours.length - a.goodHours.length) || a.ymd.localeCompare(b.ymd))[0] ?? null;
}

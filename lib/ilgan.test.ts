import { describe, it, expect } from 'vitest';
import { ILGAN, ilganBySlug, stemStar } from './ilgan';
import { yearReading, monthsOf } from './saeun-ilgan';
import { daySignal, weekSignals, bestWeekday } from './today-ilgan';

describe('일간 열 개', () => {
  it('주소 이름은 /saju 개념 페이지와 같다', () => {
    expect(ILGAN.map(x => x.slug)).toEqual(['갑목', '을목', '병화', '정화', '무토', '기토', '경금', '신금', '임수', '계수']);
    expect(ilganBySlug('임수')!.idx).toBe(8);
  });
  it('십성: 甲에게 丁은 상관, 壬에게 丁은 정재, 丁에게 丁은 비견', () => {
    expect(stemStar(0, 3)).toBe('상관');
    expect(stemStar(8, 3)).toBe('정재');
    expect(stemStar(3, 3)).toBe('비견');
  });
});

describe('2027 정미년 사업운', () => {
  it('열두 달은 입춘 무렵 壬寅에서 시작해 癸丑으로 끝난다', () => {
    const ms = monthsOf(2027);
    expect(ms.length).toBe(12);
    expect(ms[0].g * 100 + ms[0].z).toBe(8 * 100 + 2);   // 壬寅
    expect(ms[11].g * 100 + ms[11].z).toBe(9 * 100 + 1); // 癸丑
    expect(new Date(ms[0].start).getUTCMonth()).toBe(1);  // 2월
    expect([3, 4, 5]).toContain(new Date(ms[0].start).getUTCDate());
  });
  it('열 장의 판정이 서로 다르다(이름만 바꾼 페이지가 아니다)', () => {
    const keys = ILGAN.map(x => { const r = yearReading(x.idx, 2027); return r.stemStar + r.months.map(m => m.star).join(''); });
    expect(new Set(keys).size).toBe(10);
    expect(yearReading(0, 2027).stemStar).toBe('상관');
    expect(yearReading(0, 2027).ganji).toBe('丁未');
  });
});

describe('오늘의 투찰 운세', () => {
  it('파·위·폐 날은 별과 상관없이 미루는 편', () => {
    for (const me of [0, 4, 8]) for (const s of weekSignals(me, '2026-11-02')) if (s.officerAvoid) expect(s.tone).toBe('hold');
  });
  it('2026-10-28 일진은 甲寅이 아니라 실제 간지를 낸다', () => {
    const s = daySignal(8, '2026-10-28');
    expect(s.ganji.length).toBe(2);
    expect(s.label).toBe('10월 28일(수)');
  });
  it('이번 주 가장 나은 날은 평일에서 고른다', () => {
    const b = bestWeekday(weekSignals(2, '2026-10-31'));
    expect(b && !b.weekend).toBe(true);
  });
});

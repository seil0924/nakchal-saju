import { describe, it, expect } from 'vitest';
import { yearData, yearName, isTaekilYear } from '../taekil-year';
import { goodDays } from '../taekil';

describe('택일 연도판', () => {
  it('2027년은 정미년', () => {
    expect(yearName(2027)).toEqual({ hanja: '丁未', ko: '정미' });
  });
  it('열두 달 모두 있고 연도 밖 날짜가 없다', () => {
    const ms = yearData('계약일', 2027)!;
    expect(ms.map(m => m.m)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(ms.flatMap(m => m.good).every(d => d.ymd.startsWith('2027-'))).toBe(true);
    expect(ms.flatMap(m => m.good)[0].ymd).toBe('2027-01-01');
    expect(ms.flatMap(m => m.good).at(-1)!.ymd <= '2027-12-31').toBe(true);
  });
  it('90일 화면과 같은 계산이다', () => {
    const year = yearData('계약일', 2027)!.flatMap(m => m.good).map(d => d.ymd);
    const ninety = goodDays('계약일', new Date(2026, 11, 31), 90).map(d => d.ymd);
    expect(year.slice(0, ninety.length)).toEqual(ninety);
  });
  it('으뜸날에는 주말·공휴일이 없다', () => {
    for (const m of yearData('법인설립일', 2027)!) expect(m.best.every(d => !d.off)).toBe(true);
  });
  it('없는 해·없는 일은 null', () => {
    expect(isTaekilYear(2031)).toBe(false);
    expect(yearData('없는날', 2027)).toBeNull();
  });
});

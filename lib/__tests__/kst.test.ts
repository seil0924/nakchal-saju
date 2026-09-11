import { describe, it, expect } from 'vitest';
import { kstYmd, dateFromYmd, localYmd } from '../kst';

// /taekil 의 React 오류 #425 는 서버(UTC)와 브라우저(한국)가 "오늘" 을 다르게 읽어서 났다.
describe('kstYmd — 한국 날짜', () => {
  it('한국 새벽(서버는 아직 어제)에도 한국 날짜를 낸다', () => {
    // 2026-09-10 20:00 UTC = 2026-09-11 05:00 KST
    expect(kstYmd(new Date('2026-09-10T20:00:00Z'))).toBe('2026-09-11');
  });
  it('한국 자정 직전은 그날', () => {
    // 2026-09-11 14:59 UTC = 2026-09-11 23:59 KST
    expect(kstYmd(new Date('2026-09-11T14:59:00Z'))).toBe('2026-09-11');
  });
});

describe('dateFromYmd — 어느 시간대에서 읽어도 같은 날', () => {
  it('UTC 로 읽어도, 이 기계의 지역 시간으로 읽어도 그 날짜다', () => {
    const d = dateFromYmd('2026-09-11');
    expect([d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()]).toEqual([2026, 9, 11]);
    expect(localYmd(d)).toBe('2026-09-11');
    expect(kstYmd(d)).toBe('2026-09-11');
  });
  it('연말·윤년 경계', () => {
    expect(kstYmd(dateFromYmd('2026-12-31'))).toBe('2026-12-31');
    expect(kstYmd(dateFromYmd('2028-02-29'))).toBe('2028-02-29');
  });
});

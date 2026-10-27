import { describe, it, expect } from 'vitest';
import { solarToLunar, lunarToSolar } from '../manse-core';

describe('양력 → 음력', () => {
  it('2026 추석(음력 8월 15일)은 양력 2026-09-25', () => {
    expect(solarToLunar(2026, 9, 25)).toEqual({ y: 2026, m: 8, d: 15, leap: false });
  });
  it('1950~2060 매일 왕복이 맞다(윤달 포함)', () => {
    let leaps = 0;
    for (let t = Date.UTC(1950, 0, 1); t <= Date.UTC(2060, 11, 31); t += 86400000) {
      const s = new Date(t); const y = s.getUTCFullYear(), m = s.getUTCMonth() + 1, d = s.getUTCDate();
      const l = solarToLunar(y, m, d); if (l.leap) leaps++;
      expect(lunarToSolar(l.y, l.m, l.d, l.leap)).toEqual({ y, m, d });
    }
    expect(leaps).toBeGreaterThan(1000);
  });
});

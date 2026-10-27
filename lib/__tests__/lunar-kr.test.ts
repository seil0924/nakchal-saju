import { describe, it, expect } from 'vitest';
import { krShift, lunarToSolarKR, solarToLunarKR } from '../lunar-kr';
import { lunarToSolar } from '../manse-core';

describe('한국 음력(KST 합삭)', () => {
  it('2027년 설: 중국 2/6, 한국 2/7', () => {
    expect(lunarToSolar(2027, 1, 1)).toEqual({ y: 2027, m: 2, d: 6 });
    expect(lunarToSolarKR(2027, 1, 1)).toEqual({ y: 2027, m: 2, d: 7 });
    expect(solarToLunarKR(2027, 2, 7)).toEqual({ y: 2027, m: 1, d: 1, leap: false });
    // 2/6 은 한국에서 아직 지난해 섣달 그믐
    const eve = solarToLunarKR(2027, 2, 6);
    expect([eve.y, eve.m]).toEqual([2026, 12]);
    expect(eve.d).toBeGreaterThanOrEqual(29);
  });
  it('2026년 설·추석은 두 나라가 같다', () => {
    expect(lunarToSolarKR(2026, 1, 1)).toEqual({ y: 2026, m: 2, d: 17 });
    expect(lunarToSolarKR(2026, 8, 15)).toEqual({ y: 2026, m: 9, d: 25 });
  });
  it('1950~2100 모든 달: 밀림은 0 아니면 1, 그리고 드물다', () => {
    let months = 0, shifted = 0;
    for (let y = 1950; y <= 2100; y++) for (let m = 1; m <= 12; m++) {
      const s = lunarToSolar(y, m, 1); months++; shifted += krShift(s.y, s.m, s.d);
    }
    expect(shifted).toBeGreaterThan(0);
    expect(shifted / months).toBeLessThan(0.05);
  });
  it('양력→음력→양력 되돌리기가 맞다(2020~2035 매일)', () => {
    for (let t = Date.UTC(2020, 0, 1); t <= Date.UTC(2035, 11, 31); t += 86400000) {
      const dt = new Date(t), y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1, d = dt.getUTCDate();
      const l = solarToLunarKR(y, m, d);
      expect(l.d).toBeGreaterThanOrEqual(1); expect(l.d).toBeLessThanOrEqual(30);
      expect(lunarToSolarKR(l.y, l.m, l.d, l.leap)).toEqual({ y, m, d });
    }
  });
});

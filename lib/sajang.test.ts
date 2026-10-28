import { describe, it, expect } from 'vitest';
import { judgeSajang, TYPES } from './sajang';
import { chartFromInput } from './preview';

describe('대표가 될 사주(sajang)', () => {
  it('1971-07-16 壬水 일간: 식상이 가장 많아 만들어 파는 대표, 재성 신호는 서지 않는다', () => {
    const c = chartFromInput('1971-07-16', null)!;
    const r = judgeSajang(c);
    expect(r.dayKo).toBe('임');
    expect(r.counts).toEqual({ bi: 1, sik: 2, jae: 0, gwan: 1, in: 1 });
    expect(r.type.name).toBe(TYPES.sik.name);
    expect(r.signals.find(s => s.key === 'jae')!.ok).toBe(false);
    expect(r.signals.find(s => s.key === 'sik')!.ok).toBe(true);
  });

  it('1950~2010년 매일: 신호는 0~5개, 판정 문장과 갈래가 늘 나온다', () => {
    const seen = new Set<string>();
    const types = new Set<string>();
    for (let t = Date.UTC(1950, 0, 1); t < Date.UTC(2011, 0, 1); t += 86400000 * 7) {
      const d = new Date(t).toISOString().slice(0, 10);
      const r = judgeSajang(chartFromInput(d, null)!);
      expect(r.passed).toBeGreaterThanOrEqual(0);
      expect(r.passed).toBeLessThanOrEqual(5);
      expect(r.verdict.length).toBeGreaterThan(0);
      seen.add(r.verdict); types.add(r.type.group);
    }
    // 네 단계 판정과 다섯 갈래가 모두 실제로 나온다(한쪽으로 쏠린 판정기가 아니다)
    expect(seen.size).toBe(4);
    expect(types.size).toBe(5);
  });

  it('문구에 줄표·결과 단정이 없다', () => {
    const all = JSON.stringify(TYPES);
    expect(all).not.toMatch(/—|반드시|성공합니다|망합니다/);
  });
});

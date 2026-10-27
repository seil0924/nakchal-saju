import { describe, it, expect } from 'vitest';
import { indexableBalju, baljuMaxSim, BALJU_SIM_MAX } from '../balju-index';
import { hasFullFacts } from '../balju-facts';

// 사이트맵에 올리는 발주처 상세는 사실이 다 차 있고 이웃과 덜 겹치는 곳뿐(2026-10-27)
describe('사이트맵에 올릴 발주처', () => {
  const list = indexableBalju();
  it('기준을 넘는 곳은 없다', () => {
    const sim = baljuMaxSim();
    for (const c of list) { expect(hasFullFacts(c.name)).toBe(true); expect(sim.get(c.name)!).toBeLessThan(BALJU_SIM_MAX); }
  });
  it('같은 설립일·같은 분야인 발전 5사는 아직 빠진다', () => {
    expect(list.map(c => c.name)).not.toContain('한국중부발전');
  });
  it('한 곳도 안 올라가는 일은 없다(데이터가 빠지면 깨진다)', () => {
    expect(list.length).toBeGreaterThanOrEqual(30);
  });
});

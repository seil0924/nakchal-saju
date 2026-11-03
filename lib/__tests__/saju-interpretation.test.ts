import { describe, expect, it } from 'vitest';
import { compute, sajeong, seunOf, todayPillar, type Chart } from '../engine';
import { GAN_EL, ZHI_EL } from '../manse-core';
import { HIDDEN_STEMS, interpretChart, periodReading } from '../saju-interpretation';
import { representativeSections } from '../interpretation-copy';
import { computeReport } from '../report';

// 규칙별 경계 검증용 명식. 실존 인물의 생년월일이 아니다.
function chart(patch: Partial<Chart> = {}): Chart {
  const c: Chart = { yGan: 2, yZhi: 0, mGan: 4, mZhi: 2, dGan: 0, dZhi: 4, hGan: null, hZhi: null, dayMasterEl: 0, dist: [], ...patch };
  c.dayMasterEl = GAN_EL[c.dGan]; c.dist = [0, 0, 0, 0, 0];
  [c.yGan, c.mGan, c.dGan, ...(c.hGan === null ? [] : [c.hGan])].forEach(g => c.dist[GAN_EL[g]]++);
  [c.yZhi, c.mZhi, c.dZhi, ...(c.hZhi === null ? [] : [c.hZhi])].forEach(z => c.dist[ZHI_EL[z]]++);
  return c;
}
describe('조건을 함께 읽는 사주 해석', () => {
  it('동일 일간과 동일 오행 개수도 월지 위치에 따라 달리 해석한다', () => {
    const spring = chart({ mZhi: 2, yZhi: 8 });
    const autumn = chart({ mZhi: 8, yZhi: 2 });
    expect(spring.dist).toEqual(autumn.dist);
    const a = interpretChart(spring), b = interpretChart(autumn);
    expect(a.season).toBe('봄 초입'); expect(b.season).toBe('가을 초입');
    expect(a.summary).not.toBe(b.summary);
    expect(a.support).toBe(b.support + 1);
  });
  it('표면에 없는 금이 축의 지장간에 있으면 완전 부재로 처리하지 않는다', () => {
    const c = chart({ yZhi: 1 });
    expect(c.dist[3]).toBe(0);
    const a = interpretChart(c);
    expect(a.hiddenOnly).toContain(3); expect(a.unobserved).not.toContain(3);
    expect(a.counts.reduce((x, y) => x + y, 0)).toBe(5);
  });
  it('자·오·사·해의 십성은 지장간 천간의 음양으로 계산한다', () => {
    const a = interpretChart(chart({ yZhi: 0, mZhi: 6, dZhi: 5, hGan: 0, hZhi: 11 }));
    expect(a.hidden.map(b => b.stems.at(-1)?.star)).toEqual(['정인', '상관', '식신', '편인']);
  });
  it('12개 지장간 표의 본기 오행이 지지의 대표 오행과 일치한다', () => {
    expect(HIDDEN_STEMS).toHaveLength(12);
    HIDDEN_STEMS.forEach((stems, z) => {
      expect(GAN_EL[stems.at(-1)!]).toBe(ZHI_EL[z]);
      expect(new Set(stems).size).toBe(stems.length);
    });
  });
  it('동률은 모두 유지하고 한 유형을 임의로 선택하지 않는다', () => {
    const a = interpretChart(chart());
    expect(a.counts).toEqual([1, 1, 2, 0, 1]);
    const b = interpretChart(chart({ dZhi: 0 }));
    expect(b.leaders).toEqual([4]);
    const tied = interpretChart(chart({ yGan: 0, mZhi: 8, dZhi: 8 }));
    expect(tied.leaders).toEqual([3]);
    const all = interpretChart(chart({ yGan: 2, mGan: 4, yZhi: 0, mZhi: 2, dZhi: 8 }));
    expect(all.counts).toEqual([1, 1, 1, 1, 1]);
    expect(all.leaders).toHaveLength(5); expect(all.label).toBe('복합 성향');
  });
  it('생시 미상은 시주나 시지의 뿌리를 만들어 넣지 않는다', () => {
    const a = interpretChart(chart({ yZhi: 9, mZhi: 9, dZhi: 9 }));
    const b = interpretChart(chart({ yZhi: 9, mZhi: 9, dZhi: 9, hGan: 0, hZhi: 2 }));
    expect(a.hourKnown).toBe(false); expect(a.hidden).toHaveLength(3); expect(a.roots).toHaveLength(0);
    expect(b.hourKnown).toBe(true); expect(b.roots.map(r => r.position)).toEqual(['시지']);
    expect(b.counts.reduce((x, y) => x + y, 0)).toBe(7);
  });
  it('실행과 검토가 함께 있을 때만 조건별 풀이를 만든다', () => {
    const a = interpretChart(chart());
    expect(a.tensions.find(t => t.title === '빠른 실행과 신중한 검토')?.body).toContain('익숙한 일');
    const b = interpretChart(chart({ yGan: 0, yZhi: 2, mGan: 0, mZhi: 2, dZhi: 2 }));
    expect(b.tensions.some(t => t.title === '빠른 실행과 신중한 검토')).toBe(false);
  });
  it('기간이 달라도 원국 해석은 고정, 연간·일간 주제는 각각 표시한다', () => {
    const c = chart(), day = sajeong(c, todayPillar(2026, 11, 3));
    const a = representativeSections(c, day, seunOf(c, 2026), 2026);
    const b = representativeSections(c, { ...day, rel: 'in' }, seunOf(c, 2028), 2028);
    expect(a.find(s => s.mk === '器')).toEqual(b.find(s => s.mk === '器'));
    expect(b.find(s => s.mk === '核')?.html).toContain('2028년');
    expect(b.find(s => s.mk === '核')?.html).toContain('오늘 · 학습·준비');
    expect(b.find(s => s.mk === '核')?.html).toContain('서로 다른 주제');
    expect(periodReading('unknown').label).toBe('해석 보류');
  });
  it('여러 날짜에 대해 입력을 변경하지 않고 동일한 결과를 반환한다', () => {
    for (let m = 1; m <= 12; m++) {
      const c = compute(1980, m, 15, m % 2 ? null : 9);
      const before = structuredClone(c), a = interpretChart(c);
      expect(c).toEqual(before); expect(interpretChart(c)).toEqual(a);
      expect(a.summary).not.toMatch(/undefined|NaN/);
      expect(a.counts.reduce((x, y) => x + y, 0)).toBe(a.hourKnown ? 7 : 5);
    }
  });
});

describe('리포트 연결과 유료 보호', () => {
  const input = { birth: '1980-05-15', time: null, cal: 'solar' as const, leap: false, cat: 'daepyo' as const };
  it('새 상세 내용은 구매 전 서버 응답에 포함하지 않는다', () => {
    for (const level of [0, 1]) {
      const r = computeReport(input, level, 2026);
      for (const mk of ['五', '決', '人', '財', '方', '士']) expect(r.sections.find(s => s.mk === mk)?.html).toBe('');
      expect(r.sections.find(s => s.mk === '器')?.html).toContain('시주를 제외');
      expect(r.hero.big).toBe(interpretChart(compute(1980, 5, 15, null)).label);
    }
    const paid = computeReport(input, 2, 2026);
    expect(paid.sections.find(s => s.mk === '五')?.html).toContain('표면 6글자');
    expect(paid.sections.find(s => s.mk === '決')?.html).toContain('적용 방법');
    expect(paid.sections.map(s => s.html).join('')).not.toMatch(/평생의 숙제|통째로 비어|큰 건일수록 남에게 미루지/);
  });
  it('다른 상품의 섹션과 권한에 새 대표 사주 상세를 섞지 않는다', () => {
    const r = computeReport({ ...input, cat: 'sajeong' }, 0, 2026);
    expect(r.sections.map(s => s.mk)).toEqual(['率', '擇']);
    expect(r.sections.find(s => s.mk === '擇')?.html).toBe('');
  });
});

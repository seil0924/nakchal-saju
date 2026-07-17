import { describe, it, expect } from 'vitest';
import { computePreview, chartFromInput, sipsungPreview, SIJIN, SIJIN_MID } from '../preview';
import { compute, chartFromBirth, sipsung } from '../engine';

const PILLAR_KEYS = ['yGan', 'yZhi', 'mGan', 'mZhi', 'dGan', 'dZhi', 'hGan', 'hZhi', 'dayMasterEl'] as const;

describe('preview — 클라 명식이 서버 engine 과 일치 (교차검증)', () => {
  it('computePreview 명식 == compute 명식 (dist 제외 전 필드)', () => {
    const p = computePreview(2000, 6, 15, 14) as any;
    const e = compute(2000, 6, 15, 14) as any;
    for (const k of PILLAR_KEYS) expect(p[k]).toBe(e[k]);
  });
  it('시 없는 경우도 일치', () => {
    const p = computePreview(1993, 9, 24, null) as any;
    const e = compute(1993, 9, 24, null) as any;
    for (const k of PILLAR_KEYS) expect(p[k]).toBe(e[k]);
  });
  it('chartFromInput 명식 == chartFromBirth 명식', () => {
    const p = chartFromInput('1980-05-15', '09:20') as any;
    const e = chartFromBirth('1980-05-15', '09:20') as any;
    expect(p).not.toBeNull();
    for (const k of PILLAR_KEYS) expect(p[k]).toBe(e[k]);
  });
  it('sipsungPreview == sipsung', () => {
    expect(sipsungPreview(computePreview(2000, 6, 15, 14))).toEqual(sipsung(compute(2000, 6, 15, 14)));
    expect(sipsungPreview(computePreview(1975, 11, 3, null))).toEqual(sipsung(compute(1975, 11, 3, null)));
  });
});

describe('chartFromInput — 입력 가드', () => {
  it('빈 문자열/형식 오류는 null', () => {
    expect(chartFromInput('')).toBeNull();
    expect(chartFromInput('not-a-date')).toBeNull();
    expect(chartFromInput('2000-13')).toBeNull(); // dd 없음 → NaN
  });
  it('정상 입력은 명식 반환', () => {
    expect(chartFromInput('2000-06-15')).not.toBeNull();
  });
});

describe('SIJIN 시진 테이블', () => {
  it('12지시 + 대표시각 각 12개', () => {
    expect(SIJIN).toHaveLength(12);
    expect(SIJIN_MID).toHaveLength(12);
  });
  it('각 시진은 [이름, 시간범위] 쌍', () => {
    for (const [name, range] of SIJIN) {
      expect(typeof name).toBe('string');
      expect(range).toMatch(/^\d{2}:\d{2}~\d{2}:\d{2}$/);
    }
  });
  it('대표시각은 HH:MM 형식', () => {
    for (const t of SIJIN_MID) expect(t).toMatch(/^\d{2}:\d{2}$/);
  });
});

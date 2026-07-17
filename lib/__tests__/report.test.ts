import { describe, it, expect } from 'vitest';
import { computeReport, type ReportInput } from '../report';
import { chartFromBirth, yearGanji } from '../engine';
import { catMks } from '../report-categories';

const base: ReportInput = { name: '홍길동', birth: '1980-05-15', time: '09:20', cal: 'solar', leap: false };

describe('computeReport — 리포트 조립 (날짜 무관 부분)', () => {
  it('제목은 이름 반영', () => {
    expect(computeReport(base, 0, 2026).title).toContain('홍길동 대표님');
    expect(computeReport({ ...base, name: undefined }, 0, 2026).title).toContain('대표님');
  });

  it('dayMaster 는 명식 일간오행과 일치', () => {
    const r = computeReport(base, 2, 2026);
    expect(r.dayMaster).toBe(chartFromBirth('1980-05-15', '09:20').dayMasterEl);
    expect(r.dayMaster).toBeGreaterThanOrEqual(0);
    expect(r.dayMaster).toBeLessThan(5);
  });

  it('wonguk: 시 있으면 4주, 없으면 3주', () => {
    expect(computeReport(base, 2, 2026).wonguk).toHaveLength(4);
    expect(computeReport({ ...base, time: null }, 2, 2026).wonguk).toHaveLength(3);
  });

  it('selYear/seun 은 지정 연도의 간지', () => {
    const r = computeReport(base, 2, 2026);
    expect(r.selYear).toBe(2026);
    expect(r.seun.hanja).toBe(yearGanji(2026).hanja);
  });

  it('범위 밖 연도는 올해로 폴백', () => {
    const r = computeReport(base, 2, 1800);
    expect(r.selYear).toBeGreaterThanOrEqual(2020);
  });

  it('★게이팅: 레벨0 은 precise 없음, 레벨1+ 는 있음', () => {
    expect(computeReport(base, 0, 2026).gauge.precise).toBeUndefined();
    expect(computeReport(base, 1, 2026).gauge.precise).toBeDefined();
    expect(computeReport(base, 2, 2026).gauge.precise).toBeDefined();
  });

  it('boolean 하위호환: true→레벨2(precise 있음), false→레벨0(없음)', () => {
    expect(computeReport(base, true, 2026).gauge.precise).toBeDefined();
    expect(computeReport(base, false, 2026).gauge.precise).toBeUndefined();
  });

  it('카테고리 필터: cat 지정 시 해당 카테고리 섹션(mk)만 노출', () => {
    const r = computeReport({ ...base, cat: 'sajeong' }, 2, 2026);
    const allowed = catMks('sajeong')!;
    expect(r.sections.length).toBeGreaterThan(0);
    for (const sec of r.sections) expect(allowed).toContain(sec.mk);
  });

  it('meta.chapters 는 양수', () => {
    expect(computeReport(base, 2, 2026).meta.chapters).toBeGreaterThan(0);
  });

  it('관계 입력(발주처·법인·동업·협정) 전체여도 예외 없이 조립', () => {
    const full: ReportInput = {
      ...base, client: '2001-01-05', clientName: '한국도로공사', clientCore: true,
      legal: '2010-03-02', legalName: '대한건설', partner: '1978-06-06', partnerName: '김대영',
      ally: '1999-09-09', allyName: '대영토건', cat: 'gunghap', situation: '관급 공사', worry: '이번 큰 건',
    };
    expect(() => computeReport(full, 2, 2026)).not.toThrow();
  });

  it('음력·시 미상 입력도 예외 없이 조립', () => {
    expect(() => computeReport({ ...base, birth: '1984-10-15', cal: 'lunar', leap: true, time: null }, 2, 2026)).not.toThrow();
  });
});

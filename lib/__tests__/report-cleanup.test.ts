import { describe, it, expect } from 'vitest';
import { splitDeletable, cleanName, isReportId } from '../report-cleanup';

// 리포트를 지우면 결제 기록이 cascade 로 같이 지워진다. 이 규칙이 매출 기록을 지키는 마지막 줄이다.
describe('splitDeletable — 결제·유료 리포트는 남긴다', () => {
  it('결제가 붙은 리포트는 남긴다', () => {
    const r = splitDeletable([{ id: 'a' }, { id: 'b' }, { id: 'c' }], ['b']);
    expect(r.deletable).toEqual(['a', 'c']);
    expect(r.kept).toEqual(['b']);
  });
  it('결제 기록이 없어도 유료로 열린 리포트(unlock_level ≥ 1)는 남긴다', () => {
    const r = splitDeletable([{ id: 'a', unlockLevel: 0 }, { id: 'b', unlockLevel: 1 }, { id: 'c', unlockLevel: 2 }, { id: 'd', unlockLevel: null }], []);
    expect(r.deletable).toEqual(['a', 'd']);
    expect(r.kept).toEqual(['b', 'c']);
  });
  it('비어 있으면 아무것도 지우지 않는다', () => {
    expect(splitDeletable([], ['x'])).toEqual({ deletable: [], kept: [] });
  });
});

describe('cleanName', () => {
  it('앞뒤 공백을 떼고 1~12자만 받는다', () => {
    expect(cleanName('  점검용 ')).toBe('점검용');
    expect(cleanName('')).toBe('');
    expect(cleanName('   ')).toBe('');
    expect(cleanName(null)).toBe('');
    expect(cleanName('가'.repeat(13))).toBe('');
  });
});

describe('isReportId', () => {
  it('uuid 만 받는다', () => {
    expect(isReportId('3f2b8c1e-9a4d-4e21-8b7a-1c2d3e4f5a6b')).toBe(true);
    expect(isReportId('does-not-exist')).toBe(false);
    expect(isReportId("1' or '1'='1")).toBe(false);
    expect(isReportId(undefined)).toBe(false);
  });
});

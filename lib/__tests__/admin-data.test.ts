import { describe, it, expect } from 'vitest';
import { getStats, listMembers, listPayments, listReports, won } from '../admin-data';

// 백엔드(Supabase Service Role) 미설정 → 데모모드: 빈 값 반환 경로 검증
describe('admin-data — 데모모드(백엔드 미설정)', () => {
  it('getStats 는 EMPTY_STATS(0/0.0)', async () => {
    const s = await getStats();
    expect(s.members).toBe(0);
    expect(s.paid).toBe(0);
    expect(s.convRate).toBe('0.0');
    expect(s.mrr).toBe(0);
  });
  it('목록 함수는 빈 배열', async () => {
    expect(await listMembers()).toEqual([]);
    expect(await listPayments()).toEqual([]);
    expect(await listReports()).toEqual([]);
  });
  it('won 은 천단위 콤마(원 접미사 없음)', () => {
    expect(won(59000)).toBe('59,000');
    expect(won(0)).toBe('0');
  });
});

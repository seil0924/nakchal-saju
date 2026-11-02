import { beforeEach, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/reports/mine/route';
import { listReports } from '../store';
import { requireUser } from '../supabase/server';
vi.mock('../store', () => ({ listReports: vi.fn() }));
vi.mock('../supabase/server', () => ({ requireUser: vi.fn() }));
beforeEach(() => vi.clearAllMocks());
it('비회원 보관함은 계정의 서버 목록을 조회하지 않는다', async () => {
  vi.mocked(requireUser).mockResolvedValue(null);
  expect(await (await GET()).json()).toEqual({ reports: [] });
  expect(listReports).not.toHaveBeenCalled();
});
it('로그인한 본인의 목록만 조회한다', async () => {
  vi.mocked(requireUser).mockResolvedValue({ id: 'signed-in-user' } as any);
  vi.mocked(listReports).mockResolvedValue([{ id: 'owned-report', unlocked: true }]);
  expect(await (await GET()).json()).toEqual({ reports: [{ id: 'owned-report', unlocked: true }] });
  expect(listReports).toHaveBeenCalledWith('signed-in-user');
});

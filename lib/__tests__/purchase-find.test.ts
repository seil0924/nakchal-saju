import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/report/find/route';
import { purchasesOf, findTooMany, getReportAccess } from '../store';
import { buyerKey } from '../buyer';
import { canViewPaid } from '../report-access';
vi.mock('../store', () => ({ purchasesOf: vi.fn(), findTooMany: vi.fn(), getReportAccess: vi.fn() }));
beforeEach(() => { vi.clearAllMocks(); vi.mocked(findTooMany).mockResolvedValue(false); vi.mocked(purchasesOf).mockResolvedValue([]); });
const post = (name = '테스트구매자', phone = '010-0000-0000') => POST(new Request('http://localhost/api/report/find', { method: 'POST', body: JSON.stringify({ name, phone }) }));
describe('다른 기기에서 구매 리포트 복구', () => {
  it('구매자 정보가 일치하는 완료 기록만 열람 토큰과 함께 돌려준다', async () => {
    vi.mocked(purchasesOf).mockResolvedValue([{ reportId: 'paid-report', passKey: null, item: '투찰 택일', amount: 990, paidAt: null }]);
    vi.mocked(getReportAccess).mockResolvedValue({ owner: null, token: 'private-report-token' });
    const response = await post(); const data = await response.json();
    expect(purchasesOf).toHaveBeenCalledWith(buyerKey('테스트구매자', '01000000000'));
    expect(getReportAccess).toHaveBeenCalledOnce(); expect(getReportAccess).toHaveBeenCalledWith('paid-report');
    expect(canViewPaid({ auth: true, userId: null, owner: null, token: 'private-report-token', reportId: 'paid-report', t: data.reports[0].token })).toBe(true);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(response.cookies.get('nk_buyer')).toBeDefined();
  });
  it('일치하는 구매가 없으면 어떤 리포트의 토큰도 조회하지 않는다', async () => {
    const response = await post('다른구매자'); expect((await response.json()).reports).toEqual([]);
    expect(getReportAccess).not.toHaveBeenCalled(); expect(response.cookies.get('nk_buyer')).toBeUndefined();
  });
  it('조회 횟수를 초과하면 구매 목록과 토큰을 반환하지 않는다', async () => {
    vi.mocked(findTooMany).mockResolvedValue(true); expect((await post()).status).toBe(429);
    expect(purchasesOf).not.toHaveBeenCalled(); expect(getReportAccess).not.toHaveBeenCalled();
  });
  it('불완전한 연락처는 기록 조회 전에 거절한다', async () => {
    expect((await post('테스트', '010123')).status).toBe(400); expect(purchasesOf).not.toHaveBeenCalled();
  });
});

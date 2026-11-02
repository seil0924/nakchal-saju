import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buyerCanViewReport } from '../buyer-report-access';
import { buyerKeyFromCookie } from '../buyer';
import { purchasesOf } from '../store';
vi.mock('../buyer', () => ({ buyerKeyFromCookie: vi.fn() }));
vi.mock('../store', () => ({ purchasesOf: vi.fn() }));
beforeEach(() => { vi.clearAllMocks(); vi.mocked(buyerKeyFromCookie).mockReturnValue('verified-buyer'); vi.mocked(purchasesOf).mockResolvedValue([]); });
describe('복구한 구매자의 리포트 접근', () => {
  it('구매자 쿠키가 없으면 구매 기록도 조회하지 않는다', async () => {
    vi.mocked(buyerKeyFromCookie).mockReturnValue(null);
    expect(await buyerCanViewReport('report')).toBe(false); expect(purchasesOf).not.toHaveBeenCalled();
  });
  it('해당 구매자의 완료 기록에 있는 리포트만 연다', async () => {
    vi.mocked(purchasesOf).mockResolvedValue([{ reportId: 'bought', passKey: null, item: 'report', amount: 990, paidAt: null }]);
    expect(await buyerCanViewReport('bought')).toBe(true);
    expect(await buyerCanViewReport('someone-elses-report')).toBe(false);
    expect(purchasesOf).toHaveBeenCalledWith('verified-buyer');
  });
  it('발주처 패스만으로 다른 사람의 리포트를 열 수 없다', async () => {
    vi.mocked(purchasesOf).mockResolvedValue([{ reportId: null, passKey: 'pass:balju:test', item: 'pass', amount: 9900, paidAt: null }]);
    expect(await buyerCanViewReport('report')).toBe(false);
  });
  it('기록을 확인할 수 없으면 권한을 부여하지 않는다', async () => {
    vi.mocked(purchasesOf).mockRejectedValue(new Error('unavailable'));
    await expect(buyerCanViewReport('report')).rejects.toThrow('unavailable');
  });
});

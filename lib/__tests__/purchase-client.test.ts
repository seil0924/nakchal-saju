import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startPurchase, requestJSON, PURCHASE_PENDING } from '../purchase-client';
import { openKcpPay } from '@/app/_components/kcpPay';

const flags = vi.hoisted(() => ({ enabled: true }));
vi.mock('@/app/_components/kcpPay', () => ({ get KCP_CLIENT_ENABLED() { return flags.enabled; }, openKcpPay: vi.fn() }));
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
const prep = () => json({ paymentId: 'test', amount: 990, orderName: 'test report' });
beforeEach(() => { vi.clearAllMocks(); flags.enabled = true; vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('결제 취소·확인 지연·재결제 방지 안내', () => {
  it('이미 구매했으면 결제창을 열지 않고 복구 안내를 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValue(json({ error: 'already_paid' }, 409));
    await expect(startPurchase({})).rejects.toMatchObject({ recover: true });
    expect(openKcpPay).not.toHaveBeenCalled();
  });
  it('결제창 취소 시 승인 요청을 보내지 않는다', async () => {
    vi.mocked(fetch).mockResolvedValue(prep()); vi.mocked(openKcpPay).mockResolvedValue(null);
    expect(await startPurchase({})).toBe('cancelled'); expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('모바일 이동 시 승인을 중복 요청하지 않는다', async () => {
    vi.mocked(fetch).mockResolvedValue(prep()); vi.mocked(openKcpPay).mockResolvedValue('redirect');
    expect(await startPurchase({})).toBe('redirect'); expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('승인 응답을 잃으면 재결제 대신 상태 확인을 요구한다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(prep()).mockRejectedValueOnce(new Error('offline'));
    vi.mocked(openKcpPay).mockResolvedValue({ enc_data: 'test', enc_info: 'test', tran_cd: 'test' });
    await expect(startPurchase({})).rejects.toMatchObject({ recover: true, message: PURCHASE_PENDING });
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('복채도 승인 응답이 불확실하면 자동 재결제하지 않는다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(prep()).mockResolvedValueOnce(json({ ok: false, error: 'approve_unknown' }, 502));
    vi.mocked(openKcpPay).mockResolvedValue({ enc_data: 'test', enc_info: 'test', tran_cd: 'test' });
    await expect(startPurchase({ bokchae: true, amount: 50000 })).rejects.toMatchObject({ recover: true, message: PURCHASE_PENDING });
    expect(openKcpPay).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('결제 준비 실패는 승인 불명 상태와 구분한다', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    await expect(startPurchase({})).rejects.toMatchObject({ recover: false }); expect(openKcpPay).not.toHaveBeenCalled();
  });
  it('운영 환경에서 모의 결제가 거절되면 성공으로 표시하지 않는다', async () => {
    flags.enabled = false; vi.mocked(fetch).mockResolvedValueOnce(prep()).mockResolvedValueOnce(json({ error: 'not_available' }, 403));
    await expect(startPurchase({})).rejects.toMatchObject({ recover: false });
  });
  it('서버 승인 성공을 확인해야 confirmed를 반환한다', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(prep()).mockResolvedValueOnce(json({ ok: true }));
    vi.mocked(openKcpPay).mockResolvedValue({ enc_data: 'test', enc_info: 'test', tran_cd: 'test' });
    expect(await startPurchase({})).toBe('confirmed');
  });
  it('응답 없는 조회를 끝내고 재시도할 수 있게 한다', async () => {
    vi.useFakeTimers(); vi.mocked(fetch).mockImplementation((_url, init) => new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('timeout')))));
    const response = expect(requestJSON('/test')).rejects.toThrow('timeout');
    await vi.advanceTimersByTimeAsync(20000); await response;
  });
});

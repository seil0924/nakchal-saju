import { describe, it, expect, vi, afterEach } from 'vitest';
import { KCP_ENABLED, KCP_TEST, KCP_SITE_CD, kcpRegister, kcpApprove } from '../kcp';

afterEach(() => { vi.unstubAllGlobals(); });

describe('kcp — 결제 게이트웨이 설정', () => {
  it('env 미설정 시 비활성, 테스트모드 기본 on', () => {
    expect(KCP_ENABLED).toBe(false);
    expect(KCP_TEST).toBe(true);
    expect(KCP_SITE_CD).toBe('');
  });
});

describe('kcpRegister — 모바일 거래등록', () => {
  it('성공 응답(Code 0000)이면 ok + approvalKey, 금액은 문자열로 전송', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ Code: '0000', approvalKey: 'AK1', PayUrl: 'https://pay' }) });
    vi.stubGlobal('fetch', fetchMock);
    const r = await kcpRegister({ ordr_idxx: 'o1', good_mny: 59000, good_name: '리포트', ret_url: 'https://ret' });
    expect(r.ok).toBe(true);
    expect(r.approvalKey).toBe('AK1');
    expect(r.PayUrl).toBe('https://pay');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.good_mny).toBe('59000'); // 문자열
    expect(body.ordr_idxx).toBe('o1');
    expect(body.currency).toBe('410'); // KRW
  });
});

describe('kcpApprove — 결제 승인 + 금액 검증', () => {
  it('res_cd 0000 이면 ok + 금액 파싱, ordr_mony 문자열 전송(위변조 검증용)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ res_cd: '0000', amount: '59000', tno: 'T1', res_msg: 'OK' }) });
    vi.stubGlobal('fetch', fetchMock);
    const r = await kcpApprove({ enc_data: 'e', enc_info: 'i', tran_cd: 'tc', ordr_mony: 59000, ordr_no: 'o1' });
    expect(r.ok).toBe(true);
    expect(r.amount).toBe(59000);
    expect(r.tno).toBe('T1');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.ordr_mony).toBe('59000'); // 가맹점 저장 금액 검증 필드
  });

  it('res_cd 실패면 ok=false, amount 0', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ json: async () => ({ res_cd: '9999', res_msg: '거절' }) });
    vi.stubGlobal('fetch', fetchMock);
    const r = await kcpApprove({ enc_data: 'e', enc_info: 'i', tran_cd: 'tc', ordr_mony: 59000, ordr_no: 'o1' });
    expect(r.ok).toBe(false);
    expect(r.amount).toBe(0);
    expect(r.res_cd).toBe('9999');
  });
});

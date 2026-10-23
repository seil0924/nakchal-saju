import { describe, it, expect } from 'vitest';
import { kcpReturnUrl, kcpReturn } from '../kcp-return';
import { createOrder, confirmOrder, saveReport } from '../store';

const O = 'https://nakchalsaju.com';
const F = { enc_data: '', enc_info: '', tran_cd: '', res_cd: '' };

describe('KCP 인증결과 처리 (PC·모바일 공용)', () => {
  it('결제창을 닫으면(인증 실패) 그 리포트로, 사유를 달아 돌려보낸다', async () => {
    const { id } = await saveReport({ birth: '1971-07-16', name: '점검' } as any);
    const o = await createOrder(id, 990, 2);
    const url = await kcpReturnUrl(O, { ...F, paymentId: o.paymentId, res_cd: '3001' });
    expect(url).toBe(`${O}/report/${id}?paid=0&why=auth%3A3001`);
  });
  it('이미 paid 인 주문이 다시 들어오면 승인을 다시 부르지 않고 성공으로 돌려보낸다', async () => {
    const { id } = await saveReport({ birth: '1971-07-16', name: '점검' } as any);
    const o = await createOrder(id, 990, 2);
    await confirmOrder(o.paymentId, 990);
    const url = await kcpReturnUrl(O, { ...F, paymentId: o.paymentId, enc_data: 'x', enc_info: 'y', tran_cd: 'z' });
    expect(url.startsWith(`${O}/report/${id}?paid=1`)).toBe(true);
  });
  it('주문을 못 찾으면 홈으로, 사유를 남긴다', async () => {
    const url = await kcpReturnUrl(O, { ...F, paymentId: 'pay_none', enc_data: 'x', enc_info: 'y', tran_cd: 'z' });
    expect(url).toBe(`${O}/?paid=0&why=order_not_found`);
  });
  it('구매자 칸이 없는 DB 에서도 비회원 패스는 결제 뒤 이 기기에서 열린다', async () => {
    const key = 'a'.repeat(64);
    const o = await createOrder('pass:balju:b:' + key, 9900, 1);   // 구매자 정보 없이 저장된 주문
    await confirmOrder(o.paymentId, 9900);
    const r = await kcpReturn(O, { ...F, paymentId: o.paymentId, enc_data: 'x', enc_info: 'y', tran_cd: 'z' });
    expect(r.buyerKey).toBe(key);
  });
});

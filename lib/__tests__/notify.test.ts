import { describe, it, expect, vi, afterEach } from 'vitest';
import { notifyPayment } from '../notify';
import { createOrder, saveReport } from '../store';

afterEach(() => { vi.unstubAllGlobals(); delete process.env.DISCORD_PAY_WEBHOOK; });

describe('결제 디스코드 알림', () => {
  it('웹후크 주소가 없으면 보내지 않는다', async () => {
    const f = vi.fn(); vi.stubGlobal('fetch', f);
    await notifyPayment({ kind: 'paid', paymentId: 'pay_x' });
    expect(f).not.toHaveBeenCalled();
  });
  it('결제 완료: 금액·주문번호 끝자리만, 손님 성함은 보내지 않는다', async () => {
    process.env.DISCORD_PAY_WEBHOOK = 'https://discord.test/hook';
    const f = vi.fn(async () => new Response('')); vi.stubGlobal('fetch', f);
    const { id } = await saveReport({ birth: '1971-07-16', name: '홍길동' } as any);
    const o = await createOrder(id, 990, 2);
    await notifyPayment({ kind: 'paid', paymentId: o.paymentId });
    const body = JSON.parse((f.mock.calls[0] as any)[1].body);
    expect(body.content).toContain('990원');
    expect(body.content).toContain('#' + o.paymentId.slice(-6));
    expect(body.content).not.toContain('홍길동');
    expect(body.allowed_mentions).toEqual({ parse: [] });
  });
  it('확인 필요: 사유를 우리말로', async () => {
    process.env.DISCORD_PAY_WEBHOOK = 'https://discord.test/hook';
    const f = vi.fn(async () => new Response('')); vi.stubGlobal('fetch', f);
    await notifyPayment({ kind: 'check', paymentId: 'pay_y', why: 'confirm:timeout' });
    expect(JSON.parse((f.mock.calls[0] as any)[1].body).content).toContain('열람 저장 실패');
  });
  it('알림이 실패해도 예외를 던지지 않는다(결제 흐름을 막지 않는다)', async () => {
    process.env.DISCORD_PAY_WEBHOOK = 'https://discord.test/hook';
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('down'); }));
    await expect(notifyPayment({ kind: 'paid', paymentId: 'pay_z' })).resolves.toBeUndefined();
  });
});

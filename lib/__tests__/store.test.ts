import { describe, it, expect, beforeAll } from 'vitest';
import {
  backend, createOrder, confirmOrder, getOrder,
  unlockLevel, isUnlocked, BALJU_PASS_KEY, hasEntitlement, hasBaljuPass,
} from '../store';

// Supabase 환경변수 없음 → 인메모리 백엔드로 결제 로직을 자격증명 없이 검증한다.
describe('store — 결제/주문 로직 (인메모리 백엔드)', () => {
  beforeAll(() => {
    expect(backend()).toBe('memory');
  });

  it('createOrder 는 서버 확정 금액으로 pending 주문 생성', async () => {
    const o = await createOrder('rpt-A', 59000, 2);
    expect(o.status).toBe('pending');
    expect(o.amount).toBe(59000);
    expect(o.level).toBe(2);
    expect(o.paymentId).toMatch(/^pay_/);
  });

  it('★보안: 금액 위변조(불일치) 시 승인 거부 → null, 언락 안 됨', async () => {
    const o = await createOrder('rpt-tamper', 59000, 2);
    const bad = await confirmOrder(o.paymentId, 100); // 100원만 냈다고 위조
    expect(bad).toBeNull();
    expect(await unlockLevel('rpt-tamper')).toBe(0);
    expect(await isUnlocked('rpt-tamper')).toBe(false);
  });

  it('정확한 금액이면 승인 + 해당 레벨로 언락', async () => {
    const o = await createOrder('rpt-ok', 39000, 2);
    const done = await confirmOrder(o.paymentId, 39000);
    expect(done?.status).toBe('paid');
    expect(await unlockLevel('rpt-ok')).toBe(2);
    expect(await isUnlocked('rpt-ok')).toBe(true);
  });

  it('★다운그레이드 방지: 레벨2 리포트에 레벨1 결제해도 레벨 유지', async () => {
    const hi = await createOrder('rpt-dg', 59000, 2);
    await confirmOrder(hi.paymentId, 59000);
    expect(await unlockLevel('rpt-dg')).toBe(2);
    const lo = await createOrder('rpt-dg', 20000, 1);
    await confirmOrder(lo.paymentId, 20000);
    expect(await unlockLevel('rpt-dg')).toBe(2);
  });

  it('존재하지 않는 주문 승인은 null', async () => {
    expect(await confirmOrder('pay_nonexistent', 1000)).toBeNull();
  });

  it('getOrder 로 생성 주문 조회', async () => {
    const o = await createOrder('rpt-get', 29000, 2);
    const got = await getOrder(o.paymentId);
    expect(got?.paymentId).toBe(o.paymentId);
    expect(got?.amount).toBe(29000);
    expect(got?.status).toBe('pending');
  });

  it('패스(entitlement): pass: 키 주문 승인 시 권한 부여', async () => {
    const key = BALJU_PASS_KEY('user-xyz');
    expect(key).toBe('pass:balju:user-xyz');
    expect(await hasBaljuPass('user-xyz')).toBe(false);
    const o = await createOrder(key, 99000, 1);
    await confirmOrder(o.paymentId, 99000);
    expect(await hasEntitlement(key)).toBe(true);
    expect(await hasBaljuPass('user-xyz')).toBe(true);
  });

  it('BALJU_PASS_KEY: userId 없으면 demo 스코프', () => {
    expect(BALJU_PASS_KEY()).toBe('pass:balju:demo');
    expect(BALJU_PASS_KEY(null)).toBe('pass:balju:demo');
  });
});

import { describe, it, expect } from 'vitest';
import { kstDayStartIso, kstMonthStartIso, kstStamp, payerOf, payItemName, payStatusLabel } from '../admin-format';

const U = '11111111-2222-3333-4444-555555555555';

describe('admin-format — 한국시간', () => {
  it('오늘 시작은 한국 자정(UTC 전날 15시)', () => {
    // 한국 9/17 08:30 = UTC 9/16 23:30 — 서버(UTC)로 재면 아직 16일이지만 한국은 17일이다
    const now = new Date('2026-09-16T23:30:00Z');
    expect(kstDayStartIso(now)).toBe('2026-09-16T15:00:00.000Z');
    expect(kstMonthStartIso(now)).toBe('2026-08-31T15:00:00.000Z');
  });
  it('시각은 한국 시각으로 찍는다', () => {
    expect(kstStamp('2026-09-16T23:30:00Z')).toBe('09.17 08:30');
    expect(kstStamp('2026-09-16T23:30:00Z', true)).toBe('26.09.17 08:30');
    expect(kstStamp(null)).toBe('');
    expect(kstStamp('nope')).toBe('');
  });
});

describe('admin-format — 결제', () => {
  it('회원은 결제 → 패스 키 → 리포트 주인 순으로 찾는다', () => {
    expect(payerOf({ user_id: 'a' }, {})).toBe('a');
    expect(payerOf({ pass_key: 'pass:balju:' + U }, {})).toBe(U);
    expect(payerOf({ pass_key: 'pass:balju:anon' }, {})).toBeNull();
    expect(payerOf({ report_id: 'r1' }, { r1: 'b' })).toBe('b');
    expect(payerOf({ report_id: 'r2' }, { r2: null })).toBeNull();
  });
  it('상품명', () => {
    expect(payItemName({ pass_key: 'pass:balju:x', amount: 39000 })).toBe('발주처 프리미엄 패스');
    expect(payItemName({ report_id: null, level: 0, amount: 5000 })).toBe('복채');
    expect(payItemName({ report_id: 'r', amount: 19900 }, 'daepyo')).toBe('대표 사주');
    expect(payItemName({ report_id: 'r', amount: 39000 })).not.toMatch(/원 상품/);
    expect(payItemName({ report_id: 'r', amount: 9900 })).toMatch(/ \/ .* 중$/);
    expect(payItemName({ report_id: 'r', amount: 12345 })).toBe('12,345원 상품');
  });
  it('상태', () => {
    expect(payStatusLabel('paid')).toBe('완료');
    expect(payStatusLabel('pending')).toBe('대기');
    expect(payStatusLabel('cancelled')).toBe('환불');
    expect(payStatusLabel('failed')).toBe('실패');
  });
});

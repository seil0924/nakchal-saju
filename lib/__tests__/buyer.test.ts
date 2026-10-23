import { describe, it, expect } from 'vitest';
import { normName, normPhone, validPhone, checkBuyer, buyerKey, maskPhone, dashPhone } from '../buyer';
import { createOrder, confirmOrder, saveReport, purchasesOf, buyerKeyOfPayment, hasBaljuPass, BALJU_PASS_BUYER_KEY } from '../store';

describe('구매자 열쇠(로그인 대신 성함·휴대폰)', () => {
  it('번호는 적는 모양이 달라도 같은 번호로 본다', () => {
    expect(normPhone('010-1234-5678')).toBe('01012345678');
    expect(normPhone('010 1234 5678')).toBe('01012345678');
    expect(normPhone('+82 10-1234-5678')).toBe('01012345678');
    expect(normPhone('821012345678')).toBe('01012345678');
  });
  it('휴대폰 번호만 받는다', () => {
    expect(validPhone('01012345678')).toBe(true);
    expect(validPhone('0111234567')).toBe(true);
    expect(validPhone('0212345678')).toBe(false);
    expect(validPhone('0101234')).toBe(false);
  });
  it('이름 빈칸과 자모 풀림을 맞춘다', () => {
    expect(normName(' 홍 길동 ')).toBe('홍길동');
    expect(normName('홍길동'.normalize('NFD'))).toBe('홍길동');
  });
  it('같은 사람은 같은 열쇠, 다른 이름은 다른 열쇠', () => {
    expect(buyerKey('홍길동', '010-1234-5678')).toBe(buyerKey('홍 길동', '01012345678'));
    expect(buyerKey('홍길동', '01012345678')).not.toBe(buyerKey('홍길순', '01012345678'));
    expect(buyerKey('홍길동', '01012345678')).toMatch(/^[0-9a-f]{64}$/);
  });
  it('틀린 곳을 짚어 준다', () => {
    expect(checkBuyer('', '01012345678', true)).toMatchObject({ ok: false, error: 'buyer_name' });
    const short = checkBuyer('홍길동', '0101234', true);
    expect(short).toMatchObject({ ok: false, error: 'buyer_phone' });
    expect((short as any).message).toContain('7자리');
    expect(checkBuyer('홍길동', '01012345678', false)).toMatchObject({ ok: false, error: 'buyer_agree' });
    expect(checkBuyer('홍길동', '010-1234-5678', true)).toMatchObject({ ok: true, name: '홍길동', phone: '01012345678' });
  });
  it('화면 표시용 번호 모양', () => {
    expect(maskPhone('01012345678')).toBe('010-****-5678');
    expect(dashPhone('01012345678')).toBe('010-1234-5678');
    expect(dashPhone('0111234567')).toBe('011-123-4567');
  });
});

describe('산 것 다시 찾기', () => {
  it('결제를 마친 리포트만 그 열쇠로 찾힌다', async () => {
    const b = checkBuyer('찾기점검', '01099990001', true) as any;
    const { id: r1 } = await saveReport({ birth: '1971-07-16', name: '점검' } as any);
    const { id: r2 } = await saveReport({ birth: '1971-07-16', name: '점검' } as any);
    const o1 = await createOrder(r1, 990, 2, null, '대표 사주', b);
    await createOrder(r2, 990, 2, null, '대표 사주', b);   // 결제창만 열고 닫음
    await confirmOrder(o1.paymentId, 990);
    expect(await buyerKeyOfPayment(o1.paymentId)).toBe(b.key);
    const list = await purchasesOf(b.key);
    expect(list.map(x => x.reportId)).toEqual([r1]);
    expect(await purchasesOf(buyerKey('남의이름', '01099990001'))).toEqual([]);
  });
  it('비회원이 산 발주처 패스는 구매자 열쇠로 열린다', async () => {
    const b = checkBuyer('패스점검', '01099990002', true) as any;
    expect(await hasBaljuPass(null, b.key)).toBe(false);
    const o = await createOrder(BALJU_PASS_BUYER_KEY(b.key), 9900, 1, null, '발주처 패스', b);
    await confirmOrder(o.paymentId, 9900);
    expect(await hasBaljuPass(null, b.key)).toBe(true);
    expect((await purchasesOf(b.key)).some(x => x.passKey)).toBe(true);
  });
});

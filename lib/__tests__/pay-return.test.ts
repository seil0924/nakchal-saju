import { describe, it, expect } from 'vitest';
import { payReturnDest, payReturnQuery } from '../pay-return';

const O = 'https://nakchalsaju.com';
describe('KCP 결제 뒤 도착지 (PC·모바일 공용)', () => {
  it('리포트 결제는 성공·실패 모두 그 리포트로 (모바일 취소가 홈으로 튕기던 문제)', () => {
    expect(payReturnDest(O, true, 'r1')).toBe(`${O}/report/r1`);
    expect(payReturnDest(O, false, 'r1')).toBe(`${O}/report/r1`);
  });
  it('발주처 패스는 /report/pass:… 로 가지 않는다', () => {
    expect(payReturnDest(O, true, 'pass:balju:u1')).toBe(`${O}/thanks`);
    expect(payReturnDest(O, false, 'pass:balju:u1')).toBe(`${O}/balju`);
  });
  it('복채는 감사 화면으로', () => {
    expect(payReturnDest(O, true, null)).toBe(`${O}/thanks?kind=bokchae`);
    expect(payReturnDest(O, false, null)).toBe(`${O}/bokchae`);
  });
  it('쿼리: 토큰은 성공일 때 붙인 것만, 사유는 인코딩', () => {
    expect(payReturnQuery(`${O}/report/r1`, true, undefined, '&t=k')).toBe(`${O}/report/r1?paid=1&t=k`);
    expect(payReturnQuery(`${O}/thanks?kind=bokchae`, true)).toBe(`${O}/thanks?kind=bokchae&paid=1`);
    expect(payReturnQuery(`${O}/report/r1`, false, 'auth:3001')).toBe(`${O}/report/r1?paid=0&why=auth%3A3001`);
  });
});

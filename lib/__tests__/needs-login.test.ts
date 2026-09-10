import { describe, it, expect } from 'vitest';
import { needsLogin } from '../../middleware';

// 예전 게이트는 '공개 목록에 없으면 로그인' 이었다. 그래서 없는 주소(오타·지운 글)까지
// /login 으로 튕겨 404 가 한 번도 안 났다(2026-09-10 60명 점검에서 발견). 이제 막는 곳은 셋뿐이다.
describe('needsLogin — 로그인이 필요한 곳만 막는다', () => {
  it('보관함·마이페이지·관리자는 로그인 필요', () => {
    for (const p of ['/vault', '/mypage', '/admin', '/admin/reports', '/admin/reviews'])
      expect(needsLogin(p)).toBe(true);
  });
  it('없는 주소는 막지 않는다 — 404 를 받아야 한다', () => {
    for (const p of ['/this-page-does-not-exist', '/colum', '/readng', '/사주풀이', '/vaultx', '/administrator'])
      expect(needsLogin(p)).toBe(false);
  });
  it('공개 페이지는 막지 않는다', () => {
    for (const p of ['/', '/reading', '/hoesa', '/report/abc', '/balju/한국도로공사', '/en/bazi'])
      expect(needsLogin(p)).toBe(false);
  });
  it('인코딩된 주소도 같은 판정', () => {
    expect(needsLogin(encodeURI('/admin/리포트'))).toBe(true);
    expect(needsLogin(encodeURI('/없는-주소'))).toBe(false);
  });
});

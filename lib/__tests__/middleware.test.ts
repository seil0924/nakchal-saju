import { describe, it, expect } from 'vitest';
import { isPublicPath } from '../../middleware';

describe('isPublicPath — 로그인 게이트 판정', () => {
  it('공개 경로는 true (랜딩·로그인·무료 리딩·세일즈 입구)', () => {
    for (const p of ['/', '/login', '/reading', '/pricing', '/terms', '/privacy', '/ceo', '/balju'])
      expect(isPublicPath(p)).toBe(true);
  });
  it('보호 경로는 false (보관함·마이페이지·리포트 열람)', () => {
    for (const p of ['/vault', '/mypage', '/full'])
      expect(isPublicPath(p)).toBe(false);
  });
  it('정적 파일(확장자 포함)은 게이트 제외', () => {
    for (const p of ['/hero.mp4', '/img/a.jpg', '/icon.svg', '/llms.txt'])
      expect(isPublicPath(p)).toBe(true);
  });
  it('공개 프리픽스(/api /auth /product/ /why/ /balju/ /report/)', () => {
    expect(isPublicPath('/api/report')).toBe(true);
    expect(isPublicPath('/auth/callback')).toBe(true);
    expect(isPublicPath('/product/balju')).toBe(true);
    expect(isPublicPath('/why/haha')).toBe(true);
    expect(isPublicPath('/balju/한국도로공사')).toBe(true);
    expect(isPublicPath('/report/abc123')).toBe(true); // 결과 공유 링크 — 비소유자는 무료 티저만(API 게이팅)
  });
});

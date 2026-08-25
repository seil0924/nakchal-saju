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

// 사이트맵에 넣어 놓고 로그인으로 튕기는 페이지가 있으면 구글은 색인을 못 한다.
// /login 이 robots.txt 로 막혀 있어 리다이렉트 끝이 막다른 길이 되고,
// 검색 콘솔은 그걸 "robots.txt 에 의해 차단됨" 이라고 보고한다 — /jari 와 /en/bazi 가 실제로 그랬다.
// 사이트맵과 게이트가 어긋나는 순간 여기서 깨지게 해 둔다.
describe('사이트맵에 올린 곳은 모두 열려 있어야 한다', () => {
  it('제출한 URL 중 로그인으로 튕기는 것이 없다', async () => {
    const { default: sitemap } = await import('../../app/sitemap');
    const blocked = sitemap()
      .map(e => new URL(e.url).pathname)
      .filter(p => !isPublicPath(p));
    expect(blocked).toEqual([]);
  });
});

describe('나중에 붙일 자리', () => {
  it('영어 페이지는 통째로 공개다', () => {
    for (const p of ['/en/bazi', '/en/date-picker', '/en/anything'])
      expect(isPublicPath(p)).toBe(true);
  });

  it('자리 사주도 열려 있다', () => {
    expect(isPublicPath('/jari')).toBe(true);
  });

  it('보호해야 할 곳은 그대로 막혀 있다', () => {
    for (const p of ['/vault', '/mypage', '/admin', '/admin/views'])
      expect(isPublicPath(p)).toBe(false);
  });
});

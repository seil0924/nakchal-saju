import { describe, it, expect } from 'vitest';
import { srcOf, isSrc, SRC, SRC_LABEL } from '../track-src';

describe('track-src: srcOf', () => {
  it('네이버는 통합검색·블로그·모바일이 모두 한 낱말로 접힌다', () => {
    expect(srcOf('https://search.naver.com/search.naver?query=식신생재', '')).toBe('naver');
    expect(srcOf('https://m.blog.naver.com/nakchalsaju/223', '')).toBe('naver');
    expect(srcOf('https://blog.naver.com/nakchalsaju', '')).toBe('naver');
  });

  it('검색엔진·SNS 를 구분한다', () => {
    expect(srcOf('https://www.google.com/', '')).toBe('google');
    expect(srcOf('https://www.google.co.kr/', '')).toBe('google');
    expect(srcOf('https://search.daum.net/search', '')).toBe('daum');
    expect(srcOf('https://www.instagram.com/p/x', '')).toBe('instagram');
    expect(srcOf('https://youtu.be/abc', '')).toBe('youtube');
  });

  it('referrer 가 없거나 우리 도메인이면 직접 방문이다', () => {
    expect(srcOf('', '')).toBe('direct');
    expect(srcOf('https://nakchalsaju.com/column/x', '')).toBe('direct');
    expect(srcOf('https://www.nakchalsaju.com/reading', '')).toBe('direct');
  });

  it('utm_source 가 referrer 를 이긴다 — 우리가 직접 붙인 표시라 더 정확하다', () => {
    expect(srcOf('https://nakchalsaju.com/', '?utm_source=naver')).toBe('naver');
    expect(srcOf('', '?utm_source=pwa')).toBe('pwa');
    expect(srcOf('', '?utm_source=naverblog')).toBe('naver');
    expect(srcOf('', '?utm_source=엉뚱한값')).toBe('other');
  });

  it('모르는 출처는 other 로 모은다', () => {
    expect(srcOf('https://example.com/a', '')).toBe('other');
  });

  it('망가진 입력에도 던지지 않는다', () => {
    expect(srcOf('not a url', '')).toBe('direct');
    expect(srcOf('', '???')).toBe('direct');
  });

  it('naver.com 을 흉내 낸 도메인은 네이버로 세지 않는다', () => {
    expect(srcOf('https://fakenaver.com/', '')).toBe('other');
    expect(srcOf('https://naver.com.evil.io/', '')).toBe('other');
  });
});

describe('track-src: isSrc', () => {
  it('목록에 있는 값만 통과시킨다 — 남이 보내는 값이라 그대로 저장하면 표가 오염된다', () => {
    expect(isSrc('naver')).toBe(true);
    expect(isSrc('drop table')).toBe(false);
    expect(isSrc(null)).toBe(false);
    expect(isSrc(7)).toBe(false);
  });

  it('모든 낱말에 한국어 이름표가 있다', () => {
    for (const s of SRC) expect(SRC_LABEL[s]).toBeTruthy();
  });
});

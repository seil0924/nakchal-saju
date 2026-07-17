import { describe, it, expect } from 'vitest';
import { painBySlug, PAINS, PAIN_CAT } from '../pains';
import { isCatKey } from '../report-categories';

describe('pains — 통점 랜딩 데이터', () => {
  it('painBySlug: 등록 슬러그는 데이터, 미등록은 null', () => {
    expect(painBySlug('haha')?.slug).toBe('haha');
    expect(painBySlug('big-miss')?.slug).toBe('big-miss');
    expect(painBySlug('없음')).toBeNull();
  });
  it('슬러그 중복 없음, 필수 배열 필드 보유', () => {
    const slugs = new Set<string>();
    for (const p of PAINS) {
      expect(slugs.has(p.slug)).toBe(false);
      slugs.add(p.slug);
      expect(Array.isArray(p.dig)).toBe(true);
      expect(p.dig.length).toBeGreaterThan(0);
      expect(Array.isArray(p.reframe)).toBe(true);
      expect(Array.isArray(p.gives)).toBe(true);
      for (const g of p.gives) expect(g).toHaveLength(2); // [제목, 설명]
    }
  });
  it('PAIN_CAT 값은 모두 유효 카테고리 키', () => {
    for (const cat of Object.values(PAIN_CAT)) expect(isCatKey(cat)).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { PRODUCT_PAGES, productPageBySlug, productPageByKey } from '../product-pages';
import { CAT_INFO, isCatKey } from '../report-categories';

describe('상품 상세페이지 정의', () => {
  it('상품 8종, 키는 모두 실제 카테고리', () => {
    expect(PRODUCT_PAGES.length).toBe(8);
    for (const p of PRODUCT_PAGES) {
      expect(isCatKey(p.key)).toBe(true);
      expect(CAT_INFO[p.key]).toBeTruthy();
    }
  });
  it('슬러그와 옛 슬러그가 서로 겹치지 않는다 — 겹치면 무한 넘김이 된다', () => {
    const all = PRODUCT_PAGES.flatMap(p => [p.slug, ...(p.old || [])]);
    expect(new Set(all).size).toBe(all.length);
    for (const p of PRODUCT_PAGES) expect(p.old || []).not.toContain(p.slug);
  });
  it('슬러그로 찾기 — 옛 주소도 같은 상품을 준다', () => {
    expect(productPageBySlug('daepyo')?.key).toBe('daepyo');
    expect(productPageBySlug('dongup')?.slug).toBe('gunghap');
    expect(productPageBySlug('beopin')?.slug).toBe('daeun');
    expect(productPageBySlug('없는주소')).toBeNull();
  });
  it('카테고리 키로 찾기', () => {
    expect(productPageByKey('sajeong')?.slug).toBe('taekil');
    expect(productPageByKey('ijeon')?.slug).toBe('jari');
  });
  it('빈 칸이 없다 — 상세페이지에 그대로 나가는 글이다', () => {
    for (const p of PRODUCT_PAGES) {
      expect(p.hook.length).toBeGreaterThan(5);
      expect(p.sub.length).toBeGreaterThan(10);
      expect(p.pains.length).toBeGreaterThanOrEqual(3);
      expect(p.free.length).toBeGreaterThanOrEqual(2);   // 연간 캘린더·사무실 자리는 무료 구간이 둘뿐이다(실제 그렇다)
      expect(p.paid.length).toBeGreaterThanOrEqual(3);
      expect(p.toc.length).toBeGreaterThanOrEqual(4);
      expect(p.faq.length).toBeGreaterThanOrEqual(2);
      expect(p.href.startsWith('/')).toBe(true);
    }
  });
});

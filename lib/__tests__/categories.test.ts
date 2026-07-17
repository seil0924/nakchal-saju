import { describe, it, expect } from 'vitest';
import { productBySlug, PRODUCTS, OHAENG, PAIN_OH } from '../categories';

describe('categories — 상품/오행색', () => {
  it('productBySlug: 등록 슬러그는 상품, 미등록은 null', () => {
    expect(productBySlug('balju')?.slug).toBe('balju');
    expect(productBySlug('beopin')?.slug).toBe('beopin');
    expect(productBySlug('없음')).toBeNull();
  });
  it('OHAENG 5행 모두 el·acc 보유', () => {
    for (const k of ['mok', 'hwa', 'to', 'geum', 'su']) {
      expect(OHAENG[k]).toBeDefined();
      expect(OHAENG[k].el).toBeTruthy();
      expect(OHAENG[k].acc).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
  it('모든 상품의 oh 는 OHAENG 키를 참조', () => {
    for (const p of PRODUCTS) expect(OHAENG[p.oh]).toBeDefined();
  });
  it('PAIN_OH 값은 모두 OHAENG 키', () => {
    for (const v of Object.values(PAIN_OH)) expect(OHAENG[v]).toBeDefined();
  });
});

import { describe, it, expect } from 'vitest';
import { won, SKU, LEVEL, PRICE_TAEKIL, PRICE_FULL, PRICE_BALJU_PASS } from '../constants';

describe('won — 원화 표기', () => {
  it('천단위 콤마 + 원', () => {
    expect(won(12900)).toBe('12,900원');
    expect(won(990)).toBe('990원');
    expect(won(1000000)).toBe('1,000,000원');
    expect(won(0)).toBe('0원');
  });
});

describe('LEVEL / SKU — 언락 레벨·상품', () => {
  it('레벨 상수', () => {
    expect(LEVEL.FREE).toBe(0);
    expect(LEVEL.TAEKIL).toBe(1);
    expect(LEVEL.FULL).toBe(2);
  });
  it('SKU 레벨·가격 매핑', () => {
    expect(SKU.taekil.level).toBe(1);
    expect(SKU.taekil.price).toBe(PRICE_TAEKIL);
    expect(SKU.full.level).toBe(2);
    expect(SKU.full.price).toBe(PRICE_FULL);
  });
  it('가격은 모두 양수', () => {
    for (const p of [PRICE_TAEKIL, PRICE_FULL, PRICE_BALJU_PASS]) expect(p).toBeGreaterThan(0);
  });
});

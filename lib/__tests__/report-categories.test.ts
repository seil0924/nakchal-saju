import { describe, it, expect } from 'vitest';
import {
  isCatKey, catPrice, catMks, catOfMk, productOfMk, catUI, CAT_INFO,
} from '../report-categories';

describe('report-categories — 카테고리 상품 로직', () => {
  it('isCatKey: 유효 카테고리만 true', () => {
    expect(isCatKey('daepyo')).toBe(true);
    expect(isCatKey('sajeong')).toBe(true);
    expect(isCatKey('nope')).toBe(false);
    expect(isCatKey(undefined)).toBe(false);
    expect(isCatKey(123)).toBe(false);
  });
  it('catPrice: 카테고리 개별가, 무효면 0', () => {
    expect(catPrice('daepyo')).toBe(59000);
    expect(catPrice('calendar')).toBe(20000);
    expect(catPrice('xxx')).toBe(0);
    expect(catPrice(undefined)).toBe(0);
  });
  it('모든 카테고리 가격은 양수', () => {
    for (const k of Object.keys(CAT_INFO)) expect(catPrice(k)).toBeGreaterThan(0);
  });
  it('catMks: 카테고리 섹션 부호 목록', () => {
    expect(catMks('sajeong')).toEqual(['率', '擇']);
    expect(catMks('xxx')).toBeNull();
  });
  it('catOfMk: 섹션부호→카테고리 역매핑', () => {
    expect(catOfMk('率')).toBe('sajeong');
    expect(catOfMk('處')).toBe('balju');
    expect(catOfMk('없는부호')).toBeNull();
  });
  it('productOfMk: 부호로 상품정보(+key) 조회', () => {
    const p = productOfMk('率');
    expect(p?.key).toBe('sajeong');
    expect(p?.price).toBe(39000);
    expect(productOfMk('X')).toBeNull();
  });
  it('catUI: 카테고리별 UI 스키마, 미지정은 기본값', () => {
    expect(catUI('daepyo').selfImmediate).toBe(true);
    expect(catUI('balju').requires).toBe('client');
    expect(catUI('daeun').legal).toBe('required');
    expect(catUI(undefined)).toBeDefined();
    expect(catUI('존재안함').requires).toBeNull();
  });
});

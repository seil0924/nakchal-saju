import { describe, it, expect } from 'vitest';
import { GUIDES, REGIONS, INDUSTRIES } from '../seo-landings';
import { CONCEPTS } from '../seo-concepts';
import { FAQ_MAIN, GUIDE_FAQS } from '../faq';

const uniq = <T,>(a: T[]) => new Set(a).size === a.length;

describe('seo-landings: GUIDES', () => {
  it('비어있지 않고 슬러그가 고유하다', () => {
    expect(GUIDES.length).toBeGreaterThan(0);
    expect(uniq(GUIDES.map(g => g.slug))).toBe(true);
  });
  it('각 가이드에 필수 필드·섹션이 있다', () => {
    for (const g of GUIDES) {
      expect(g.slug && g.title && g.h1 && g.lead).toBeTruthy();
      expect(g.keywords.length).toBeGreaterThan(0);
      expect(g.sections.length).toBeGreaterThan(0);
      for (const s of g.sections) expect(s.h && s.p).toBeTruthy();
      expect(g.ctaHref.startsWith('/')).toBe(true);
    }
  });
});

describe('seo-landings: REGIONS', () => {
  it('슬러그 고유 + 필수 필드', () => {
    expect(REGIONS.length).toBeGreaterThan(0);
    expect(uniq(REGIONS.map(r => r.slug))).toBe(true);
    for (const r of REGIONS) {
      expect(r.name && r.intro && r.industry).toBeTruthy();
      expect(Array.isArray(r.clients)).toBe(true);
    }
  });
});

describe('seo-landings: INDUSTRIES', () => {
  it('슬러그 고유 + 필수 필드', () => {
    expect(INDUSTRIES.length).toBeGreaterThan(0);
    expect(uniq(INDUSTRIES.map(x => x.slug))).toBe(true);
    for (const x of INDUSTRIES) { expect(x.name && x.intro && x.trait && x.myeong).toBeTruthy(); expect(x.keywords.length).toBeGreaterThan(0); }
  });
});

describe('seo-concepts: CONCEPTS', () => {
  it('일간10 + 오행5 = 15+ , 슬러그 고유, group 유효', () => {
    expect(CONCEPTS.length).toBeGreaterThanOrEqual(15);
    expect(uniq(CONCEPTS.map(c => c.slug))).toBe(true);
    for (const c of CONCEPTS) {
      expect(['일간', '오행']).toContain(c.group);
      expect(c.h1 && c.lead && c.title).toBeTruthy();
      expect(c.sections.length).toBeGreaterThan(0);
    }
  });
});

describe('faq', () => {
  it('FAQ_MAIN 문답이 비어있지 않다', () => {
    expect(FAQ_MAIN.length).toBeGreaterThan(0);
    for (const x of FAQ_MAIN) {
      expect(x.q.trim().length).toBeGreaterThan(0);
      expect(x.a.trim().length).toBeGreaterThan(0);
    }
  });
  it('GUIDE_FAQS 키는 실제 가이드 슬러그이고 각 항목이 유효하다', () => {
    const slugs = new Set(GUIDES.map(g => g.slug));
    for (const [key, qas] of Object.entries(GUIDE_FAQS)) {
      expect(slugs.has(key)).toBe(true);
      expect(qas.length).toBeGreaterThan(0);
      for (const x of qas) expect(x.q && x.a).toBeTruthy();
    }
  });
});

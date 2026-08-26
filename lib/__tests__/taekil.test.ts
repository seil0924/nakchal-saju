import { describe, it, expect } from 'vitest';
import { TAEKIL, OFFICER_KO, taekilBySlug, goodDays, badDays } from '@/lib/taekil';
import { OFFICERS, AVOID, pickDays, avoidDays } from '@/lib/daypicker-en';
import { moveDays } from '@/lib/taek-map';

const FROM = new Date(2026, 7, 24);   // 2026-08-24

describe('한국어 이름표', () => {
  it('열두 신이 영어판과 같은 순서로 붙어 있다', () => {
    expect(OFFICER_KO).toHaveLength(12);
    for (let i = 0; i < 12; i++) expect(OFFICER_KO[i].hanja).toBe(OFFICERS[i].hanja);
  });

  it('이름과 설명이 빠짐없이 있다', () => {
    for (const o of OFFICER_KO) {
      expect(o.name).toHaveLength(1);
      expect(o.gist.length).toBeGreaterThan(10);
    }
  });
});

describe('택일 랜딩', () => {
  it('다섯 장이고 슬러그가 겹치지 않는다', () => {
    expect(TAEKIL).toHaveLength(5);
    expect(new Set(TAEKIL.map(t => t.slug)).size).toBe(5);
  });

  it('본문·FAQ·CTA 가 비어 있는 장이 없다', () => {
    for (const t of TAEKIL) {
      expect(t.h1.length).toBeGreaterThan(5);
      expect(t.lead.length).toBeGreaterThan(20);
      expect(t.body.length).toBeGreaterThanOrEqual(3);
      for (const b of t.body) expect(b.p.length).toBeGreaterThan(60);
      expect(t.faq.length).toBeGreaterThanOrEqual(3);
      for (const f of t.faq) expect(f.a.length).toBeGreaterThan(30);
      expect(t.cta.href.startsWith('/')).toBe(true);
    }
  });

  it('피하는 신을 좋은 날로 고르는 장은 없다', () => {
    for (const t of TAEKIL) for (const g of t.good) expect(AVOID).not.toContain(g);
  });

  it('슬러그로 찾고, 없는 슬러그는 null 이다', () => {
    expect(taekilBySlug('개업일')?.kw).toBe('개업일 택일');
    expect(taekilBySlug('없는것')).toBeNull();
  });
});

describe('날 고르기', () => {
  it('장마다 석 달 안에 쓸 날이 여럿 나온다', () => {
    for (const t of TAEKIL) {
      const days = goodDays(t.slug, FROM, 90);
      expect(days.length).toBeGreaterThan(10);
      for (const d of days) expect(t.good).toContain(d.officer);
    }
  });

  it('없는 슬러그면 빈 목록이다', () => {
    expect(goodDays('없는것', FROM, 90)).toEqual([]);
  });

  it('피하는 날은 좋은 날과 겹치지 않는다', () => {
    const avoid = new Set(badDays(FROM, 90).map(d => d.ymd));
    for (const t of TAEKIL) for (const d of goodDays(t.slug, FROM, 90)) expect(avoid.has(d.ymd)).toBe(false);
  });

  it('피하는 날은 영어판과 같은 목록이다', () => {
    expect(badDays(FROM, 90).map(d => d.ymd)).toEqual(avoidDays(FROM, 90).map(d => d.ymd));
  });
});

describe('언어가 갈려도 날은 하나여야 한다', () => {
  it('사무실이전은 자리 사주(이사 택일)와 같은 날을 낸다', () => {
    expect(goodDays('사무실이전', FROM, 90).map(d => d.ymd)).toEqual(moveDays(FROM, 90).map(d => d.ymd));
  });

  it('사무실이전은 영어판 moving 과도 같은 날을 낸다', () => {
    expect(goodDays('사무실이전', FROM, 90).map(d => d.ymd)).toEqual(pickDays('moving', FROM, 90).map(d => d.ymd));
  });

  it('개업일은 영어판 opening 과 같은 날을 낸다', () => {
    expect(goodDays('개업일', FROM, 90).map(d => d.ymd)).toEqual(pickDays('opening', FROM, 90).map(d => d.ymd));
  });

  it('계약일은 영어판 contract 와 같은 날을 낸다', () => {
    expect(goodDays('계약일', FROM, 90).map(d => d.ymd)).toEqual(pickDays('contract', FROM, 90).map(d => d.ymd));
  });
});


import { describe, it, expect } from 'vitest';
import { baljuContent, yearGanji, type BaljuClient } from './balju-content';

describe('yearGanji', () => {
  it('computes 60갑자 세차 for known years', () => {
    const g = yearGanji(1984); // 갑자
    expect(g.ganji).toBe('갑자');
    expect(g.oh).toBe('목');
    expect(g.hanja.length).toBe(2);
    expect(g.trait.length).toBeGreaterThan(0);
  });
  it('handles all five 오행 traits', () => {
    const ohs = new Set<string>();
    for (let y = 1980; y < 1990; y++) ohs.add(yearGanji(y).oh);
    expect(ohs.size).toBe(5); // 목화토금수 모두 등장
  });
});

// 각 분야 버킷 + 기본값 + core/non-core 분기를 모두 실행
const samples: BaljuClient[] = [
  { name: '한국도로공사', date: '1969-02-15', cat: '도로·건설', core: true, tip: 'x' },
  { name: '한국토지주택공사', date: '2009-10-01', cat: '주택·토지', core: true },
  { name: '한국전력공사', date: '1982-01-01', cat: '전력·설비', core: true },
  { name: '한국가스공사', date: '1983-08-18', cat: '가스·플랜트', core: true },
  { name: '한국철도공사', date: '2005-01-01', cat: '철도·시설', core: true },
  { name: '부산항만공사', date: '2004-01-16', cat: '항만·건설', core: true },
  { name: '한국수자원공사', date: '1967-11-16', cat: '수자원·토목', core: true },
  { name: '서울대학교병원', date: '1978-07-15', cat: '의료·병원', core: true },
  { name: '조달청', date: '1961-10-02', cat: '조달·구매', core: true },
  { name: '방위사업청', date: '2006-01-02', cat: '국방·조달', core: true },
  { name: '국가유산청', date: '2024-05-17', cat: '문화·유산' },
  { name: '산림청', date: '1967-01-01', cat: '산림·임업' },
  { name: '경기도', date: '1896-08-04', cat: '지자체·관급' },
  { name: '어떤기관', date: '2001-04-02', cat: '기타분류' }, // DEFAULT_BUCKET
];

describe('baljuContent', () => {
  it('produces rich, unique content for every bucket', () => {
    for (const c of samples) {
      const ct = baljuContent(c);
      expect(ct.sector.length).toBeGreaterThan(0);
      expect(ct.intro).toContain(c.name);
      expect(ct.intro).toContain('설립');
      expect(ct.bid.length).toBeGreaterThan(10);
      expect(ct.prep.length).toBe(3);
      expect(ct.founding).toContain('세차');
      expect(ct.faqs.length).toBe(4);
      for (const [q, a] of ct.faqs) {
        expect(q.length).toBeGreaterThan(0);
        expect(a.length).toBeGreaterThan(0);
      }
    }
  });
  it('differentiates core vs non-core CTA/FAQ copy', () => {
    const core = baljuContent({ name: 'A', date: '2000-01-01', cat: '조달·구매', core: true });
    const free = baljuContent({ name: 'B', date: '2000-01-01', cat: '지자체·관급' });
    expect(core.intro).toContain('큰 판');
    expect(free.intro).toContain('첫 낙찰');
    expect(core.faqs[3][1]).toContain('유료');
    expect(free.faqs[3][1]).toContain('무료');
  });
  it('falls back to default tip when tip missing', () => {
    const ct = baljuContent({ name: '무팁기관', date: '1990-01-01', cat: '기타' });
    expect(ct.intro).toContain('무팁기관');
  });
});

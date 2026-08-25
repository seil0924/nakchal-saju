import { describe, it, expect } from 'vitest';
import { baziOf, STEM_HANJA, BRANCH_HANJA, STAR_EN, ELEMENT_EN, type Chart8 } from '@/lib/bazi-en';
import { CITIES, searchCities, findCity, cityKey } from '@/lib/cities';
import { corePillars, resolveBirth } from '@/lib/manse-core';

const ch = (o: Partial<Chart8> = {}): Chart8 => ({
  yGan: 0, yZhi: 0, mGan: 0, mZhi: 0, dGan: 0, dZhi: 0, hGan: null, hZhi: null, ...o,
});

describe('영어 이름표', () => {
  it('천간 열, 지지 열둘이 빠짐없이 있다', () => {
    expect(STEM_HANJA).toHaveLength(10);
    expect(BRANCH_HANJA).toHaveLength(12);
    expect(ELEMENT_EN).toEqual(['Wood', 'Fire', 'Earth', 'Metal', 'Water']);
  });

  it('십성 열 가지 모두 영어 이름이 붙는다', () => {
    const names = Object.values(STAR_EN);
    expect(names).toHaveLength(10);
    expect(new Set(names).size).toBe(10);   // 겹치는 이름이 없다
    expect(STAR_EN['식신']).toBe('Eating God');
    expect(STAR_EN['편관']).toBe('Seven Killings');
  });
});

describe('명식 옮기기', () => {
  it('시주를 모르면 세 기둥, 알면 네 기둥이다', () => {
    expect(baziOf(ch()).pillars).toHaveLength(3);
    expect(baziOf(ch({ hGan: 2, hZhi: 6 })).pillars).toHaveLength(4);
  });

  it('일간에는 십성이 붙지 않는다', () => {
    const b = baziOf(ch());
    const day = b.pillars.find(p => p.label === 'Day')!;
    expect(day.stem.star).toBeNull();
    expect(day.branch.star).not.toBeNull();
  });

  it('갑목 일간은 Yang Wood 로 나온다', () => {
    const b = baziOf(ch({ dGan: 0 }));
    expect(b.dayMaster.pinyin).toBe('Jia');
    expect(b.dayMaster.element).toBe('Wood');
    expect(b.dayMaster.yang).toBe(true);
  });

  it('을목 일간은 Yin Wood 다', () => {
    expect(baziOf(ch({ dGan: 1 })).dayMaster.yang).toBe(false);
  });

  it('지지에는 띠 이름이 붙는다', () => {
    const b = baziOf(ch({ yZhi: 8 }));
    expect(b.pillars[0].branch.animal).toBe('Monkey');
  });

  it('오행 개수는 글자 수와 맞는다', () => {
    const three = baziOf(ch());
    expect(three.counts.reduce((a, c) => a + c.n, 0)).toBe(6);
    const four = baziOf(ch({ hGan: 2, hZhi: 6 }));
    expect(four.counts.reduce((a, c) => a + c.n, 0)).toBe(8);
  });

  it('가장 두꺼운 오행과 가장 얇은 오행을 짚는다', () => {
    // 갑(木) 자(水)만 여섯 자 — 木 셋 水 셋, 나머지 0
    const b = baziOf(ch());
    expect(['Wood', 'Water']).toContain(b.strongest);
    expect(b.counts.find(c => c.element === 'Fire')!.n).toBe(0);
  });

  it('어떤 명식이든 빈칸 없이 나온다', () => {
    for (let g = 0; g < 10; g++) for (let z = 0; z < 12; z++) {
      const b = baziOf(ch({ yGan: g, yZhi: z, mGan: (g + 3) % 10, mZhi: (z + 5) % 12, dGan: g, dZhi: (z + 7) % 12 }));
      for (const p of b.pillars) for (const c of [p.stem, p.branch]) {
        expect(c.hanja).toHaveLength(1);
        expect(c.pinyin.length).toBeGreaterThan(1);
        expect(ELEMENT_EN).toContain(c.element as typeof ELEMENT_EN[number]);
        expect(c.hex).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });
});

describe('출생지 목록', () => {
  it('대륙마다 도시가 담겨 있다', () => {
    expect(CITIES.length).toBeGreaterThan(60);
    for (const region of ['Asia/', 'Europe/', 'America/', 'Africa/', 'Australia/', 'Pacific/']) {
      expect(CITIES.some(c => c.tz.startsWith(region))).toBe(true);
    }
  });

  it('경도와 시간대가 모두 쓸 만한 값이다', () => {
    for (const c of CITIES) {
      expect(c.lng).toBeGreaterThanOrEqual(-180);
      expect(c.lng).toBeLessThanOrEqual(180);
      expect(c.tz).toContain('/');
      // 시간대 이름이 진짜인지 — 가짜면 여기서 던진다
      expect(() => new Intl.DateTimeFormat('en-US', { timeZone: c.tz }).format(new Date())).not.toThrow();
    }
  });

  it('같은 이름이 두 번 들어가 있지 않다', () => {
    const keys = CITIES.map(cityKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('도시 이름으로도 나라 이름으로도 찾힌다', () => {
    expect(searchCities('seoul')[0].city).toBe('Seoul');
    expect(searchCities('SEOUL')[0].city).toBe('Seoul');
    expect(searchCities('japan').length).toBeGreaterThan(1);
  });

  it('앞글자가 맞는 도시를 먼저 내놓는다', () => {
    expect(searchCities('san')[0].city.toLowerCase().startsWith('san')).toBe(true);
  });

  it('빈 검색은 아무것도 내놓지 않는다', () => {
    expect(searchCities('   ')).toEqual([]);
  });

  it('키로 다시 찾을 수 있다', () => {
    const c = CITIES[0];
    expect(findCity(cityKey(c))).toEqual(c);
    expect(findCity('Nowhere, Nowhere')).toBeNull();
  });
});

describe('출생지가 명식을 바꾼다', () => {
  it('같은 시각이라도 마드리드와 서울은 시주가 갈릴 때가 있다', () => {
    // 서울 −30분, 마드리드 −75분. 45분 차이라 두 시간짜리 시지 경계를 넘는 시각에서만 갈린다.
    // 하루를 훑어 갈리는 시각이 실제로 있는지 본다 — 한 시각만 찍으면 우연히 같은 칸에 들어간다.
    const seoul = findCity('Seoul, South Korea')!;
    const madrid = findCity('Madrid, Spain')!;
    const hourBranch = (p: typeof seoul, hhmm: string) => {
      const r = resolveBirth('1990-01-15', hhmm, 'solar', false, p);
      return corePillars(r.y, r.m, r.d, r.hf, r.yaja).hZhi;
    };
    let differs = 0;
    for (let hh = 0; hh < 24; hh++) for (const mm of ['00', '20', '40']) {
      const t = `${String(hh).padStart(2, '0')}:${mm}`;
      if (hourBranch(seoul, t) !== hourBranch(madrid, t)) differs++;
    }
    expect(differs).toBeGreaterThan(0);
  });

  it('목록의 어느 도시로 넣어도 명식이 나온다', () => {
    for (const c of CITIES) {
      const r = resolveBirth('1985-06-15', '13:40', 'solar', false, c);
      const b = baziOf(corePillars(r.y, r.m, r.d, r.hf, r.yaja));
      expect(b.pillars).toHaveLength(4);
      expect(b.dayMaster.element.length).toBeGreaterThan(3);
    }
  });
});

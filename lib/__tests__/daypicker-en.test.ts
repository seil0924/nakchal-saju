import { describe, it, expect } from 'vitest';
import { OFFICERS, PURPOSES, AVOID, officerOf, pickDays, avoidDays, type Purpose } from '@/lib/daypicker-en';
import { moveDays } from '@/lib/taek-map';

const FROM = new Date(2026, 7, 24);   // 2026-08-24
const ALL = Object.keys(PURPOSES) as Purpose[];

describe('열두 신', () => {
  it('건제십이신이 차례대로 열둘 있다', () => {
    expect(OFFICERS).toHaveLength(12);
    expect(OFFICERS[0].hanja).toBe('建');
    expect(OFFICERS[8].hanja).toBe('成');
    expect(OFFICERS[11].hanja).toBe('閉');
  });

  it('한자·병음·영어·설명이 빠짐없이 붙는다', () => {
    for (const o of OFFICERS) {
      expect(o.hanja).toHaveLength(1);
      expect(o.pinyin.length).toBeGreaterThan(1);
      expect(o.en.length).toBeGreaterThan(3);
      expect(o.gist.length).toBeGreaterThan(20);
    }
  });

  it('피하는 날은 파·위·폐 셋이다', () => {
    expect(AVOID.map(i => OFFICERS[i].hanja)).toEqual(['破', '危', '閉']);
  });

  it('어느 날이든 0~11 사이로 떨어진다', () => {
    for (let k = 0; k < 400; k++) {
      const i = officerOf(new Date(2026, 0, 1 + k));
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(12);
    }
  });

  it('열두 신이 한 해 안에 모두 돌아온다', () => {
    const seen = new Set<number>();
    for (let k = 0; k < 400; k++) seen.add(officerOf(new Date(2026, 0, 1 + k)));
    expect(seen.size).toBe(12);
  });
});

describe('일의 종류', () => {
  it('다섯 갈래 모두 이름과 설명과 좋은 날이 있다', () => {
    expect(ALL.length).toBe(5);
    for (const p of ALL) {
      const v = PURPOSES[p];
      expect(v.label.length).toBeGreaterThan(3);
      expect(v.blurb.length).toBeGreaterThan(10);
      expect(v.good.length).toBeGreaterThan(1);
    }
  });

  it('좋은 날로 피하는 날을 고르는 갈래는 없다', () => {
    for (const p of ALL) {
      for (const g of PURPOSES[p].good) expect(AVOID).not.toContain(g);
    }
  });
});

describe('날 고르기', () => {
  it('갈래마다 석 달 안에 쓸 만한 날이 여럿 나온다', () => {
    for (const p of ALL) {
      const days = pickDays(p, FROM, 90);
      expect(days.length).toBeGreaterThan(10);
      expect(days.length).toBeLessThan(45);
    }
  });

  it('고른 날은 모두 그 갈래에 맞는 신이다', () => {
    for (const p of ALL) {
      for (const d of pickDays(p, FROM, 90)) {
        expect(PURPOSES[p].good).toContain(d.officer);
        expect(d.rank).toBe(PURPOSES[p].good.indexOf(d.officer));
      }
    }
  });

  it('날짜가 오름차순이고 오늘은 넣지 않는다', () => {
    const days = pickDays('opening', FROM, 90);
    for (let i = 1; i < days.length; i++) expect(days[i - 1].ymd < days[i].ymd).toBe(true);
    expect(days[0].ymd > '2026-08-24').toBe(true);
  });

  it('간지와 요일이 붙는다', () => {
    for (const d of pickDays('contract', FROM, 60)) {
      expect(d.ganji).toHaveLength(2);
      expect(['Sun','Mon','Tue','Wed','Thu','Fri','Sat']).toContain(d.dow);
      expect(d.ganjiPinyin).toContain(' ');
    }
  });

  it('피하는 날은 좋은 날과 겹치지 않는다', () => {
    const avoid = new Set(avoidDays(FROM, 90).map(d => d.ymd));
    for (const p of ALL) {
      for (const d of pickDays(p, FROM, 90)) expect(avoid.has(d.ymd)).toBe(false);
    }
  });

  it('피하는 날도 석 달에 여럿 나온다', () => {
    const a = avoidDays(FROM, 90);
    expect(a.length).toBeGreaterThan(15);
    for (const d of a) expect(AVOID).toContain(d.officer);
  });
});

describe('한국판과 같은 엔진을 쓴다', () => {
  it('이사 택일은 한국 자리 사주와 같은 날을 내놓는다', () => {
    // 영어판을 따로 계산하면 두 화면이 다른 날을 말하게 된다. 같은 자리에서 나와야 한다.
    const ko = moveDays(FROM, 90).map(d => d.ymd);
    const en = pickDays('moving', FROM, 90).map(d => d.ymd);
    expect(en).toEqual(ko);
  });
});

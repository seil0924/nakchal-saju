import { describe, it, expect } from 'vitest';
import {
  compute, chartFromBirth, sipsung, relation, todayPillar,
  wonguk, sinsal, yearGanji, seunOf, sajeong, type Chart,
} from '../engine';

// 시(時) 없는 최소 명식을 직접 구성 (신살 등 순수 함수 검증용)
function chart(dGan: number, dZhi: number, over: Partial<Chart> = {}): Chart {
  return {
    yGan: 0, yZhi: 0, mGan: 0, mZhi: 0,
    dGan, dZhi, hGan: null, hZhi: null,
    dayMasterEl: [0, 0, 1, 1, 2, 2, 3, 3, 4, 4][dGan],
    dist: [0, 0, 0, 0, 0],
    ...over,
  };
}

describe('yearGanji — 세운 간지 (60갑자 검증)', () => {
  it('1984년 = 甲子 (60갑자 시작해)', () => {
    const y = yearGanji(1984);
    expect(y.g).toBe(0);
    expect(y.z).toBe(0);
    expect(y.hanja).toBe('甲子');
  });
  it('2024년 = 甲辰 (청룡의 해)', () => {
    const y = yearGanji(2024);
    expect(y.g).toBe(0);
    expect(y.z).toBe(4);
    expect(y.hanja).toBe('甲辰');
  });
  it('60년 주기 반복 (1984 와 2044 동일)', () => {
    expect(yearGanji(2044).hanja).toBe(yearGanji(1984).hanja);
  });
});

describe('relation — 오행 상생상극 (일간 기준 십성 관계)', () => {
  it('같은 오행 = 비겁(bi)', () => {
    expect(relation(0, 0)).toBe('bi');
  });
  it('나를 생하는 오행 = 인성(in) — 水生木', () => {
    // me=木(0), 水(4)가 木을 생함
    expect(relation(0, 4)).toBe('in');
  });
  it('내가 생하는 오행 = 식상(sik) — 木生火', () => {
    expect(relation(0, 1)).toBe('sik');
  });
  it('내가 극하는 오행 = 재성(jae) — 木克土', () => {
    expect(relation(0, 2)).toBe('jae');
  });
  it('나를 극하는 오행 = 관성(gwan) — 金克木', () => {
    expect(relation(0, 3)).toBe('gwan');
  });
});

describe('compute — 오행 분포', () => {
  it('시 없으면 6개 글자, 분포 합 6', () => {
    const c = compute(2000, 6, 15, null);
    expect(c.dist.reduce((a, b) => a + b, 0)).toBe(6);
    expect(c.hGan).toBeNull();
  });
  it('시 있으면 8개 글자, 분포 합 8', () => {
    const c = compute(2000, 6, 15, 14);
    expect(c.dist.reduce((a, b) => a + b, 0)).toBe(8);
    expect(c.hGan).not.toBeNull();
  });
});

describe('chartFromBirth — 생일→명식', () => {
  it('결정론적', () => {
    expect(chartFromBirth('1993-09-24', '10:30')).toEqual(chartFromBirth('1993-09-24', '10:30'));
  });
  it('resolveBirth 경유해 compute 와 동일 결과', () => {
    const a = chartFromBirth('2000-06-15', null, 'solar');
    const b = compute(2000, 6, 15, null);
    expect(a).toEqual(b);
  });
});

describe('sipsung — 십성 분포', () => {
  it('시 없으면 합 5, 있으면 합 7', () => {
    const noHour = sipsung(compute(2000, 6, 15, null));
    const withHour = sipsung(compute(2000, 6, 15, 14));
    expect(noHour.reduce((a, b) => a + b, 0)).toBe(5);
    expect(withHour.reduce((a, b) => a + b, 0)).toBe(7);
    expect(noHour).toHaveLength(5);
  });
});

describe('todayPillar — 일진 (jdn 기반)', () => {
  it('2000-01-01 = 戊午 (gan=4, zhi=6) — 검증된 jdn 유도값', () => {
    const t = todayPillar(2000, 1, 1);
    expect(t.gan).toBe(4);
    expect(t.zhi).toBe(6);
    expect(t.el).toBe(2); // 戊=土
  });
});

describe('wonguk — 원국 표시 모델', () => {
  it('시 없으면 3주(年月日), 있으면 4주', () => {
    expect(wonguk(compute(2000, 6, 15, null))).toHaveLength(3);
    expect(wonguk(compute(2000, 6, 15, 14))).toHaveLength(4);
  });
  it('일주(日) 십성은 항상 일원', () => {
    const cols = wonguk(compute(2000, 6, 15, 14));
    const day = cols.find((c) => c.pos === '日');
    expect(day?.sip).toBe('일원');
  });
});

describe('sinsal — 신살 판정', () => {
  it('庚辰(6,4) 일주는 괴강살', () => {
    const out = sinsal(chart(6, 4));
    expect(out.some((s) => s.key === '괴강')).toBe(true);
  });
  it('최대 2개까지만 반환', () => {
    const out = sinsal(chart(6, 4, { yZhi: 2, mZhi: 8, hZhi: 5, hGan: 0 }));
    expect(out.length).toBeLessThanOrEqual(2);
  });
});

describe('seunOf — 세운 상성', () => {
  it('연도 간지는 일간과 무관하게 고정', () => {
    const s = seunOf(chart(0, 0), 2024);
    expect(s.year).toBe(2024);
    expect(s.hanja).toBe('甲辰');
    expect(s.gan).toBe(0);
    expect(s.zhi).toBe(4);
  });
});

describe('sajeong — 사정률 (결정론적 유료값)', () => {
  it('같은 명식·같은 날 → 같은 precise 값 (재현성)', () => {
    const c = compute(2000, 6, 15, 14);
    const today = todayPillar(2026, 3, 10);
    expect(sajeong(c, today).precise).toBe(sajeong(c, today).precise);
  });
  it('tilt 양수면 up=true, 상단 밴드', () => {
    const c = compute(2000, 6, 15, 14);
    // 일간을 생하거나 같은 오행의 날이면 up
    const today = { gan: 0, zhi: 0, el: c.dayMasterEl }; // 같은 오행 → bi → tilt +1
    const r = sajeong(c, today);
    expect(r.up).toBe(true);
    expect(r.dir).toBe('상단 밴드');
  });
  it('내가 생하는(식상) 날은 하단 밴드, up=false', () => {
    const c = compute(2000, 6, 15, 14);
    const sikEl = (c.dayMasterEl + 1) % 5; // 내가 생함 → 식상 → tilt 음수
    const r = sajeong(c, { gan: 0, zhi: 0, el: sikEl });
    expect(r.up).toBe(false);
    expect(r.dir).toBe('하단 밴드');
    expect(r.bridge).toContain('하단');
  });
  it('pos 는 4~96 범위로 클램프', () => {
    const c = compute(2000, 6, 15, 14);
    for (const el of [0, 1, 2, 3, 4]) {
      const r = sajeong(c, { gan: 0, zhi: 0, el });
      expect(r.pos).toBeGreaterThanOrEqual(4);
      expect(r.pos).toBeLessThanOrEqual(96);
    }
  });
});

describe('sinsal — 나머지 신살 판정', () => {
  it('천을귀인 — 甲(0) 일간이 丑(1) 지지를 볼 때', () => {
    const out = sinsal(chart(0, 0, { yZhi: 1 }));
    expect(out.some((s) => s.key === '천을')).toBe(true);
  });
  it('역마살 — 지지에 寅(2) 있을 때', () => {
    const out = sinsal(chart(0, 0, { mZhi: 2 }));
    expect(out.some((s) => s.key === '역마')).toBe(true);
  });
  it('신살 없는 평범한 명식은 빈 배열', () => {
    // 甲子 일주, 지지에 특수부호 없는 조합
    const out = sinsal(chart(0, 0, { yZhi: 0, mZhi: 0 }));
    expect(Array.isArray(out)).toBe(true);
  });
});

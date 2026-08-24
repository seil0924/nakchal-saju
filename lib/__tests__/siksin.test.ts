import { describe, it, expect } from 'vitest';
import { starOf, starsOf, strengthOf, judgeSiksin, GAN_KO, ZHI_KO, type Chart8, type Star, type Level } from '@/lib/siksin';

// 천간 0~9 = 갑을병정무기경신임계 · 지지 0~11 = 자축인묘진사오미신유술해
const ch = (o: Partial<Chart8> = {}): Chart8 => ({
  yGan: 0, yZhi: 0, mGan: 0, mZhi: 0, dGan: 0, dZhi: 0, hGan: null, hZhi: null, ...o,
});

describe('십성 매기기', () => {
  it('갑목 일간에게 병은 식신, 정은 상관이다', () => {
    expect(starOf(0, true, 1, true)).toBe('식신');
    expect(starOf(0, true, 1, false)).toBe('상관');
  });

  it('갑목 일간에게 무는 편재, 기는 정재다', () => {
    expect(starOf(0, true, 2, true)).toBe('편재');
    expect(starOf(0, true, 2, false)).toBe('정재');
  });

  it('나를 이기는 것이 관, 나를 낳는 것이 인이다', () => {
    expect(starOf(0, true, 3, true)).toBe('편관');
    expect(starOf(0, true, 3, false)).toBe('정관');
    expect(starOf(0, true, 4, true)).toBe('편인');
    expect(starOf(0, true, 4, false)).toBe('정인');
  });

  it('같은 오행은 음양으로 비견과 겁재를 가른다', () => {
    expect(starOf(2, false, 2, false)).toBe('비견');
    expect(starOf(2, false, 2, true)).toBe('겁재');
  });

  it('어떤 일간으로 봐도 열 십성이 빠짐없이 한 번씩 나온다', () => {
    for (let me = 0; me < 5; me++) for (const yang of [true, false]) {
      const got = new Set<Star>();
      for (let el = 0; el < 5; el++) for (const y of [true, false]) got.add(starOf(me, yang, el, y));
      expect(got.size).toBe(10);
    }
  });
});

describe('여덟 글자 읽기', () => {
  it('시주를 모르면 다섯 자리, 알면 일곱 자리를 본다', () => {
    expect(starsOf(ch())).toHaveLength(5);
    expect(starsOf(ch({ hGan: 2, hZhi: 6 }))).toHaveLength(7);
  });

  it('일간은 나 자신이라 십성을 매기지 않는다', () => {
    expect(starsOf(ch({ hGan: 2, hZhi: 6 })).some(s => s.pillar === 2 && s.stem)).toBe(false);
  });

  it('자리 이름과 한글 글자를 함께 준다', () => {
    const s = starsOf(ch({ yGan: 2 }))[0];
    expect(s.where).toBe('년간');
    expect(s.ch).toBe('병');
    expect(GAN_KO).toHaveLength(10);
    expect(ZHI_KO).toHaveLength(12);
  });

  it('갑목 일간의 월간 병은 식신으로 잡힌다', () => {
    const s = starsOf(ch({ mGan: 2 })).find(x => x.where === '월간');
    expect(s?.star).toBe('식신');
  });
});

describe('일간 버티는 힘 — 득령·득지·득세', () => {
  it('월지가 내 편이면 득령이다', () => {
    expect(strengthOf(starsOf(ch({ mZhi: 2 }))).ryeong).toBe(true);    // 인 = 비견
    expect(strengthOf(starsOf(ch({ mZhi: 4 }))).ryeong).toBe(false);   // 진 = 편재
  });

  it('일지가 내 편이면 득지다', () => {
    expect(strengthOf(starsOf(ch({ dZhi: 2 }))).ji).toBe(true);
    expect(strengthOf(starsOf(ch({ dZhi: 4 }))).ji).toBe(false);
  });

  it('나머지 글자에서 내 편이 절반을 넘으면 득세다', () => {
    expect(strengthOf(starsOf(ch())).se).toBe(true);
    expect(strengthOf(starsOf(ch({ yGan: 4, yZhi: 4, mGan: 4 }))).se).toBe(false);
  });

  it('셋 중 둘을 얻으면 버틴다고 본다', () => {
    expect(strengthOf(starsOf(ch())).count).toBe(3);
    expect(strengthOf(starsOf(ch())).strong).toBe(true);
    const w = strengthOf(starsOf(ch({ yGan: 2, yZhi: 6, mGan: 4, mZhi: 4, dZhi: 4 })));
    expect(w.count).toBe(0);
    expect(w.strong).toBe(false);
  });

  it('글자가 없으면 아무것도 얻지 못한다', () => {
    const s = strengthOf([]);
    expect(s.count).toBe(0);
    expect(s.strong).toBe(false);
  });
});

describe('식신생재 판정', () => {
  // 계진 / 병인 / 갑묘 / 무해 — 득령·득지로 일간이 버티고, 식신과 재성이 붙어 천간에 드러난 형태
  const CLEAR = ch({ yGan: 9, yZhi: 4, mGan: 2, mZhi: 2, dGan: 0, dZhi: 3, hGan: 4, hZhi: 11 });

  it('식신과 재성이 붙고 드러나고 일간이 버티면 뚜렷하다', () => {
    const r = judgeSiksin(CLEAR);
    expect(r.kind).toBe('식신생재');
    expect(r.adjacent).toBe(true);
    expect(r.bothStem).toBe(true);
    expect(r.doosik).toBe(false);
    expect(r.strength.strong).toBe(true);
    expect(r.level).toBe('clear');
    expect(r.headline).toContain('식신생재');
  });

  it('재성이 없으면 서지 않는다', () => {
    const r = judgeSiksin(ch({ yGan: 0, yZhi: 2, mGan: 2, mZhi: 6, dGan: 0, dZhi: 3 }));
    expect(r.level).toBe('none');
    expect(r.jae).toHaveLength(0);
    expect(r.notes.join(' ')).toContain('재성이 없습니다');
  });

  it('식신도 상관도 없으면 서지 않는다', () => {
    const r = judgeSiksin(ch({ yGan: 8, yZhi: 0, mGan: 4, mZhi: 4, dGan: 0, dZhi: 4 }));
    expect(r.level).toBe('none');
    expect(r.kind).toBeNull();
    expect(r.notes.join(' ')).toContain('식신도 상관도 없습니다');
  });

  it('없다고 할 때도 본문과 근거가 겹치지 않는다', () => {
    const r = judgeSiksin(ch({ yGan: 8, yZhi: 0, mGan: 4, mZhi: 4, dGan: 0, dZhi: 4 }));
    for (const n of r.notes) expect(r.body).not.toContain(n);
  });

  it('천간의 편인이 식신을 치면 등급이 내려간다', () => {
    const r = judgeSiksin(ch({ yGan: 8, yZhi: 0, mGan: 2, mZhi: 2, dGan: 0, dZhi: 4 }));
    expect(r.doosik).toBe(true);
    expect(r.level).toBe('weak');
    expect(r.notes.join(' ')).toContain('도식');
  });

  it('상관만 있으면 상관생재로 이름을 바꿔 부른다', () => {
    const r = judgeSiksin(ch({ yGan: 3, yZhi: 5, mGan: 5, mZhi: 1, dGan: 0, dZhi: 2 }));
    expect(r.kind).toBe('상관생재');
    expect(r.sik).toHaveLength(0);
    expect(r.sang.length).toBeGreaterThan(0);
    expect(r.headline).toContain('상관생재');
  });

  it('식신과 상관이 섞이면 식상생재로 부른다', () => {
    const r = judgeSiksin(ch({ yGan: 2, yZhi: 5, mGan: 5, mZhi: 1, dGan: 0, dZhi: 2 }));
    expect(r.kind).toBe('식상생재');
  });

  it('일간이 얇으면 그 사실을 짚어 준다', () => {
    const r = judgeSiksin(ch({ yGan: 2, yZhi: 6, mGan: 4, mZhi: 4, dGan: 0, dZhi: 4, hGan: 4, hZhi: 4 }));
    expect(r.strength.strong).toBe(false);
    expect(r.notes.join(' ')).toContain('일간이 얇은');
  });

  it('버티면 무엇으로 버티는지 밝힌다', () => {
    const r = judgeSiksin(CLEAR);
    expect(r.notes.join(' ')).toContain('득령');
  });

  it('멀리 떨어져 있으면 이어지기까지 시간이 걸린다고 말한다', () => {
    const r = judgeSiksin(ch({ yGan: 2, yZhi: 2, mGan: 0, mZhi: 2, dGan: 0, dZhi: 3, hGan: 4, hZhi: 4 }));
    expect(r.adjacent).toBe(false);
    expect(r.notes.join(' ')).toContain('떨어져');
  });

  it('어떤 명식을 넣어도 등급과 문장이 나온다', () => {
    for (let g = 0; g < 10; g++) for (let z = 0; z < 12; z++) {
      const r = judgeSiksin(ch({ yGan: g, yZhi: z, mGan: (g + 3) % 10, mZhi: (z + 5) % 12, dGan: g, dZhi: (z + 2) % 12 }));
      expect(['clear', 'yes', 'weak', 'none']).toContain(r.level);
      expect(r.headline.length).toBeGreaterThan(5);
      expect(r.body.length).toBeGreaterThan(10);
      expect(r.notes.length).toBeGreaterThan(0);
    }
  });

  // 한번 계산이 한쪽으로 쏠려 어떤 명식을 넣어도 '약함'만 나온 적이 있다.
  // 판정이 늘 같은 답을 내면 그건 판정이 아니라 장식이다. 그래서 분포를 지킨다.
  it('판정이 한쪽으로 쏠리지 않는다', () => {
    const seen = new Map<Level, number>();
    let total = 0;
    for (let dg = 0; dg < 10; dg++) for (let mg = 0; mg < 10; mg++) for (let mz = 0; mz < 12; mz++) {
      const withHour = (dg + mz) % 2 === 0;
      const r = judgeSiksin(ch({
        yGan: (dg + 2) % 10, yZhi: (mz + 3) % 12,
        mGan: mg, mZhi: mz, dGan: dg, dZhi: (mz + 6) % 12,
        hGan: withHour ? (mg + 4) % 10 : null,
        hZhi: withHour ? (mz + 9) % 12 : null,
      }));
      seen.set(r.level, (seen.get(r.level) ?? 0) + 1);
      total++;
    }
    expect(seen.size).toBeGreaterThanOrEqual(3);
    const positive = (seen.get('clear') ?? 0) + (seen.get('yes') ?? 0);
    expect(positive / total).toBeGreaterThan(0.05);
    expect(positive / total).toBeLessThan(0.7);
  });

  it('같은 명식은 언제나 같은 답을 낸다', () => {
    expect(judgeSiksin(CLEAR)).toEqual(judgeSiksin(CLEAR));
  });
});

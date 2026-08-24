import { describe, it, expect } from 'vitest';
import { starOf, starsOf, strengthOf, judgeSiksin, GAN_KO, ZHI_KO, type Chart8, type Star } from '@/lib/siksin';

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

describe('일간 버티는 힘', () => {
  it('월지에는 두 몫을 준다', () => {
    const a = strengthOf(starsOf(ch({ mZhi: 2 })));   // 월지 인 = 비견 → 돕는 쪽
    const b = strengthOf(starsOf(ch({ mZhi: 4 })));   // 월지 진 = 편재 → 빼는 쪽
    expect(a.help - b.help).toBe(2);
    expect(b.drain - a.drain).toBe(2);
  });

  it('일간 자신을 한 몫으로 센다', () => {
    expect(strengthOf([]).help).toBe(1);
    expect(strengthOf([]).strong).toBe(true);
  });
});

describe('식신생재 판정', () => {
  // 계자 / 병인 / 갑진 / 무진 — 인성·비겁이 받치고 식신과 재성이 붙어 천간에 드러난 형태
  const CLEAR = ch({ yGan: 9, yZhi: 0, mGan: 2, mZhi: 2, dGan: 0, dZhi: 4, hGan: 4, hZhi: 4 });

  it('식신과 재성이 붙고 드러나고 일간이 버티면 뚜렷하다', () => {
    const r = judgeSiksin(CLEAR);
    expect(r.kind).toBe('식신생재');
    expect(r.level).toBe('clear');
    expect(r.adjacent).toBe(true);
    expect(r.bothStem).toBe(true);
    expect(r.doosik).toBe(false);
    expect(r.strength.strong).toBe(true);
    expect(r.headline).toContain('식신생재');
  });

  it('재성이 없으면 서지 않는다', () => {
    const r = judgeSiksin(ch({ yGan: 0, yZhi: 2, mGan: 2, mZhi: 6, dGan: 0, dZhi: 3 }));
    expect(r.level).toBe('none');
    expect(r.jae).toHaveLength(0);
    expect(r.body).toContain('재성이 없습니다');
  });

  it('식신도 상관도 없으면 서지 않는다', () => {
    const r = judgeSiksin(ch({ yGan: 8, yZhi: 0, mGan: 4, mZhi: 4, dGan: 0, dZhi: 4 }));
    expect(r.level).toBe('none');
    expect(r.kind).toBeNull();
    expect(r.body).toContain('식신도 상관도 없습니다');
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
      expect(r.strength.help).toBeGreaterThan(0);
    }
  });

  it('같은 명식은 언제나 같은 답을 낸다', () => {
    expect(judgeSiksin(CLEAR)).toEqual(judgeSiksin(CLEAR));
  });
});

import { describe, it, expect } from 'vitest';
import {
  matchTycoon, tyProfile, TYCOONS, PROFILE,
  TYPE_NAME, TYPE_DESC, TYPE_GOOD, TYPE_RISK, TYPE_MYEONG, TYPE_USER, TYPE_BIZ, TYPE_HOPE, TYPE_WAY,
} from '../tycoon';
import { compute } from '../engine';

describe('matchTycoon — 거장 매칭 로직', () => {
  it('결정론적', () => {
    const c = compute(1980, 5, 15, 14);
    expect(matchTycoon(c)).toEqual(matchTycoon(c));
  });
  it('matched 배열 길이 == count', () => {
    const r = matchTycoon(compute(1975, 11, 3, null));
    expect(r.matched).toHaveLength(r.count);
  });
  it('level 은 count 임계값과 일치 (>=3 twin, ==2 near, else none)', () => {
    const r = matchTycoon(compute(1990, 2, 4, 10));
    const expected = r.count >= 3 ? 'twin' : r.count === 2 ? 'near' : 'none';
    expect(r.level).toBe(expected);
  });
  it('거장 본인 명식으로 매칭하면 twin (자기 특질 전부 일치)', () => {
    const t0 = TYCOONS[0];
    const [y, m, d] = t0.born.split('-').map(Number);
    const r = matchTycoon(compute(y, m, d, null));
    expect(r.count).toBeGreaterThanOrEqual(3);
    expect(r.level).toBe('twin');
  });
  it('반환 구조: pills 문자열, el 0~4, tyDist 5칸', () => {
    const r = matchTycoon(compute(1980, 5, 15, null));
    expect(typeof r.pills).toBe('string');
    expect(r.el).toBeGreaterThanOrEqual(0);
    expect(r.el).toBeLessThan(5);
    expect(r.tyDist).toHaveLength(5);
  });
});

describe('tyProfile — 거장 프로필 조회', () => {
  it('존재하는 키는 프로필, 없는 키는 null', () => {
    const key = Object.keys(PROFILE)[0];
    expect(tyProfile(key)).toBe(PROFILE[key]);
    expect(tyProfile('__없는거장__')).toBeNull();
  });
});

describe('TYPE_* 유형 카피 배열', () => {
  it('모든 유형 배열은 5개(오행 대응)', () => {
    for (const arr of [TYPE_NAME, TYPE_DESC, TYPE_GOOD, TYPE_RISK, TYPE_MYEONG, TYPE_USER, TYPE_BIZ, TYPE_HOPE, TYPE_WAY])
      expect(arr).toHaveLength(5);
  });
});

describe('TYCOONS 데이터 무결성', () => {
  it('모든 거장은 필수 필드 + 유효 생일(YYYY-MM-DD)', () => {
    expect(TYCOONS.length).toBeGreaterThan(0);
    for (const t of TYCOONS) {
      expect(t.name).toBeTruthy();
      expect(t.en).toBeTruthy();
      expect(t.born).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

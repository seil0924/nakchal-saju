import { describe, it, expect } from 'vitest';
import {
  jdn, pil, lunarToSolar, corePillars, resolveBirth,
  GAN, ZHI, EL, GAN_EL, ZHI_EL,
} from '../manse-core';

describe('상수 테이블 무결성', () => {
  it('GAN 10개, ZHI 12개, EL 5개', () => {
    expect(GAN).toHaveLength(10);
    expect(ZHI).toHaveLength(12);
    expect(EL).toHaveLength(5);
  });
  it('오행 인덱스 테이블 길이/범위', () => {
    expect(GAN_EL).toHaveLength(10);
    expect(ZHI_EL).toHaveLength(12);
    for (const e of [...GAN_EL, ...ZHI_EL]) expect(e).toBeGreaterThanOrEqual(0), expect(e).toBeLessThan(5);
  });
});

describe('jdn — 율리우스 적일 (천문학적 검증)', () => {
  it('2000-01-01 = JDN 2451545 (표준값)', () => {
    expect(jdn(2000, 1, 1)).toBe(2451545);
  });
  it('연속된 날짜는 정확히 1 차이', () => {
    expect(jdn(2000, 6, 16) - jdn(2000, 6, 15)).toBe(1);
    expect(jdn(2024, 1, 1) - jdn(2023, 12, 31)).toBe(1);
  });
  it('2000년은 윤년 (2/28 → 3/1 이 2일)', () => {
    expect(jdn(2000, 3, 1) - jdn(2000, 2, 28)).toBe(2);
  });
  it('1900년은 평년 (100 배수·400 비배수 → 2/28 → 3/1 이 1일)', () => {
    expect(jdn(1900, 3, 1) - jdn(1900, 2, 28)).toBe(1);
  });
});

describe('pil — 간지 문자열 조합', () => {
  it('첫 간지 甲子, 마지막 간지 癸亥', () => {
    expect(pil(0, 0)).toBe('甲子');
    expect(pil(9, 11)).toBe('癸亥');
  });
});

describe('lunarToSolar — 음력→양력', () => {
  it('지원 범위(1900~2100) 밖은 그대로 반환', () => {
    expect(lunarToSolar(1899, 1, 1)).toEqual({ y: 1899, m: 1, d: 1 });
    expect(lunarToSolar(2101, 5, 5)).toEqual({ y: 2101, m: 5, d: 5 });
  });
  it('유효 범위 입력은 정상 양력 날짜 객체 반환', () => {
    const r = lunarToSolar(2000, 5, 5);
    expect(r.y).toBeGreaterThanOrEqual(1900);
    expect(r.m).toBeGreaterThanOrEqual(1);
    expect(r.m).toBeLessThanOrEqual(12);
    expect(r.d).toBeGreaterThanOrEqual(1);
    expect(r.d).toBeLessThanOrEqual(31);
  });
});

describe('corePillars — 명식 코어', () => {
  it('결정론적 (같은 입력 → 같은 출력)', () => {
    expect(corePillars(2000, 6, 15, 14)).toEqual(corePillars(2000, 6, 15, 14));
  });
  it('간(0~9)·지(0~11) 범위 준수, 오행 인덱스 일치', () => {
    const p = corePillars(1993, 9, 24, 10);
    for (const g of [p.yGan, p.mGan, p.dGan]) expect(g).toBeGreaterThanOrEqual(0), expect(g).toBeLessThan(10);
    for (const z of [p.yZhi, p.mZhi, p.dZhi]) expect(z).toBeGreaterThanOrEqual(0), expect(z).toBeLessThan(12);
    expect(p.dayMasterEl).toBe(GAN_EL[p.dGan]);
  });
  it('시(時) 없으면 hGan/hZhi 는 null', () => {
    const p = corePillars(2000, 6, 15, null);
    expect(p.hGan).toBeNull();
    expect(p.hZhi).toBeNull();
  });
  it('입춘 이전(1월) 출생은 사주상 전년도로 계산', () => {
    // 2000-01-15 는 입춘(2/4) 전 → 1999(己卯)년: yGan=5, yZhi=3
    const before = corePillars(2000, 1, 15, 12);
    expect(before.yGan).toBe(5);
    expect(before.yZhi).toBe(3);
    // 2000-06-15 는 입춘 후 → 2000(庚辰)년: yGan=6, yZhi=4
    const after = corePillars(2000, 6, 15, 12);
    expect(after.yGan).toBe(6);
    expect(after.yZhi).toBe(4);
  });
});

describe('resolveBirth — 생일 문자열 파싱/보정', () => {
  it('시각 없으면 hf=null, yaja=false', () => {
    const r = resolveBirth('2000-06-15', null);
    expect(r.hf).toBeNull();
    expect(r.yaja).toBe(false);
  });
  it('23시대 출생은 야자시(yaja=true)', () => {
    const r = resolveBirth('2000-06-15', '23:30');
    expect(r.yaja).toBe(true);
  });
  it('정오 출생은 야자시 아님', () => {
    expect(resolveBirth('2000-06-15', '12:00').yaja).toBe(false);
  });
  it('음력 입력은 양력으로 변환되어 날짜가 바뀜', () => {
    const lunar = resolveBirth('2000-05-05', null, 'lunar');
    const solar = resolveBirth('2000-05-05', null, 'solar');
    expect(lunar.d !== solar.d || lunar.m !== solar.m).toBe(true);
  });
});

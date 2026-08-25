import { describe, it, expect } from 'vitest';
import { solarShiftMin, dstShiftMin, resolveBirth, KOREA, type Birthplace } from '@/lib/manse-core';

// 경도를 인자로 뺀 뒤에도 한국 결과가 한 자도 달라지면 안 된다.
// 이미 나간 리포트가 있어서, 여기가 흔들리면 손님이 먼저 안다.
describe('한국은 예전 그대로', () => {
  it('평시 진태양시 보정은 −30분이다', () => {
    expect(solarShiftMin(KOREA, 1993, 1, 1, 9, 20)).toBe(-30);
    expect(solarShiftMin(KOREA, 2026, 8, 24, 14, 0)).toBe(-30);
  });

  it('서머타임이 걸린 해에는 −90분이 된다', () => {
    // 1988년 5월 8일 ~ 10월 9일. 표준자오선이 15° 동쪽으로 밀린 셈이라 한 시간이 더 빠진다.
    expect(solarShiftMin(KOREA, 1988, 7, 15, 12, 0)).toBe(-90);
    expect(dstShiftMin(KOREA, 1988, 7, 15, 12, 0)).toBe(60);
  });

  it('서머타임 밖의 같은 해 날짜는 −30분이다', () => {
    expect(solarShiftMin(KOREA, 1988, 12, 1, 12, 0)).toBe(-30);
    expect(dstShiftMin(KOREA, 1988, 12, 1, 12, 0)).toBe(0);
  });

  it('1950년대 서머타임도 tz 자료가 알고 있다', () => {
    expect(dstShiftMin(KOREA, 1957, 7, 1, 12, 0)).toBe(60);
    expect(dstShiftMin(KOREA, 1953, 7, 1, 12, 0)).toBe(0);
  });

  it('낮에 태어나면 시각만 30분 당겨지고 날짜는 그대로다', () => {
    const r = resolveBirth('1993-01-01', '09:20');
    expect(r.y).toBe(1993); expect(r.m).toBe(1); expect(r.d).toBe(1);
    expect(r.hf).toBeCloseTo(9 + 20 / 60 - 0.5, 6);
    expect(r.yaja).toBe(false);
  });

  it('밤 11시대는 예전과 같이 야자시로 잡는다', () => {
    const r = resolveBirth('1993-01-01', '23:10');
    expect(r.yaja).toBe(true);
    expect(r.d).toBe(1);
  });

  it('시각을 모르면 아무것도 건드리지 않는다', () => {
    const r = resolveBirth('1993-01-01', null);
    expect(r.hf).toBeNull();
    expect(r.yaja).toBe(false);
    expect(r.d).toBe(1);
  });
});

describe('자정을 넘나드는 자리', () => {
  it('0시 20분생은 전날 밤으로 넘어간다', () => {
    // 예전에는 진태양시가 음수(−0.17)로 새어 시주가 어긋났다. 이제 전날 23:50 으로 잡힌다.
    const r = resolveBirth('1993-01-02', '00:20');
    expect(r.d).toBe(1);
    expect(r.hf).toBeCloseTo(23 + 50 / 60, 6);
    expect(r.yaja).toBe(true);   // 전날의 야자시 — 일주는 예전과 같은 자리에 남는다
  });

  it('0시 40분생은 넘어가지 않는다', () => {
    const r = resolveBirth('1993-01-02', '00:40');
    expect(r.d).toBe(2);
    expect(r.hf).toBeCloseTo(10 / 60, 6);
  });

  it('진태양시는 언제나 0시와 24시 사이에 있다', () => {
    for (let hh = 0; hh < 24; hh++) for (const mm of [0, 29, 30, 59]) {
      const r = resolveBirth('1993-06-15', `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
      expect(r.hf).not.toBeNull();
      expect(r.hf as number).toBeGreaterThanOrEqual(0);
      expect(r.hf as number).toBeLessThan(24);
    }
  });
});

describe('한국 밖에서 태어난 경우', () => {
  const NY: Birthplace = { lng: -73.94, tz: 'America/New_York' };
  const LON: Birthplace = { lng: -0.13, tz: 'Europe/London' };
  const MADRID: Birthplace = { lng: -3.7, tz: 'Europe/Madrid' };
  const URUMQI: Birthplace = { lng: 87.6, tz: 'Asia/Shanghai' };
  const TOKYO: Birthplace = { lng: 139.7, tz: 'Asia/Tokyo' };

  it('뉴욕은 75°W 자오선보다 동쪽이라 겨울 보정이 양수다', () => {
    expect(solarShiftMin(NY, 1990, 1, 15, 12, 0)).toBe(4);
    // 여름에는 자오선이 60°W 로 밀려 한 시간 가까이 뒤로 간다.
    expect(solarShiftMin(NY, 1990, 7, 15, 12, 0)).toBe(-56);
    expect(dstShiftMin(NY, 1990, 7, 15, 12, 0)).toBe(60);
  });

  it('런던은 본초자오선 위라 겨울에 보정이 거의 없다', () => {
    expect(Math.abs(solarShiftMin(LON, 1990, 1, 15, 12, 0))).toBeLessThanOrEqual(1);
  });

  it('마드리드는 서쪽에 있으면서 중부유럽시를 써서 크게 밀린다', () => {
    expect(solarShiftMin(MADRID, 1990, 1, 15, 12, 0)).toBe(-75);
  });

  it('우루무치는 베이징시를 써서 두 시간 넘게 어긋난다', () => {
    expect(solarShiftMin(URUMQI, 1990, 1, 15, 12, 0)).toBe(-130);
  });

  it('도쿄는 표준자오선 동쪽이라 보정이 양수다', () => {
    expect(solarShiftMin(TOKYO, 1990, 1, 15, 12, 0)).toBe(19);
  });

  it('같은 시각이라도 태어난 곳이 다르면 시주 재료가 달라진다', () => {
    const seoul = resolveBirth('1990-01-15', '12:00', 'solar', false, KOREA);
    const ny = resolveBirth('1990-01-15', '12:00', 'solar', false, NY);
    expect(seoul.hf).not.toBe(ny.hf);
  });

  it('출생지를 안 주면 예전처럼 한국으로 본다', () => {
    expect(resolveBirth('1990-01-15', '12:00')).toEqual(
      resolveBirth('1990-01-15', '12:00', 'solar', false, KOREA));
  });

  it('어느 곳이든 보정은 하루의 절반을 넘지 않는다', () => {
    for (const p of [NY, LON, MADRID, URUMQI, TOKYO, KOREA]) {
      const s = solarShiftMin(p, 1990, 3, 21, 12, 0);
      expect(Math.abs(s)).toBeLessThan(720);
    }
  });
});

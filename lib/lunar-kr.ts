// lib/lunar-kr.ts — 한국 음력(KST 합삭 기준)으로 고친 양력↔음력.
//
// manse-core 의 음력 표는 중국 표(UTC+8)다. 합삭이 한국 자정과 중국 자정 사이(KST 00~01시)에 들면
// 중국은 그날이 초하루, 한국은 다음 날이 초하루가 된다. 2027년 설이 그렇다: 합삭 2027-02-07 00:56 KST,
// 중국 설은 2/6, 한국 설은 2/7(2026-10-28, 공휴일 계산이 하루 어긋나서 알았다).
// 그래서 표가 준 초하루마다 실제 합삭 시각을 Meeus 식으로 다시 재서 한국 날짜로 옮긴다.
// 윤달을 어느 달에 두는지가 두 나라에서 갈리는 드문 해는 고치지 않는다(표를 그대로 따른다).
import { jdn, lunarToSolar, solarToLunar } from './manse-core';

const R = Math.PI / 180;

// k 번째 합삭의 역학시(JDE). Meeus, Astronomical Algorithms 2판 49장. 오차는 수십 초 안쪽이다.
function newMoonJDE(k: number): number {
  const T = k / 1236.85, T2 = T * T, T3 = T2 * T, T4 = T3 * T;
  let jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T2 - 0.00000015 * T3 + 0.00000000073 * T4;
  const E = 1 - 0.002516 * T - 0.0000074 * T2;
  const M = (2.5534 + 29.1053567 * k - 0.0000014 * T2 - 0.00000011 * T3) * R;
  const Mp = (201.5643 + 385.81693528 * k + 0.0107582 * T2 + 0.00001238 * T3 - 0.000000058 * T4) * R;
  const F = (160.7108 + 390.67050284 * k - 0.0016118 * T2 - 0.00000227 * T3 + 0.000000011 * T4) * R;
  const Om = (124.7746 - 1.56375588 * k + 0.0020672 * T2 + 0.00000215 * T3) * R;
  const s = Math.sin;
  jde += -0.4072 * s(Mp) + 0.17241 * E * s(M) + 0.01608 * s(2 * Mp) + 0.01039 * s(2 * F)
    + 0.00739 * E * s(Mp - M) - 0.00514 * E * s(Mp + M) + 0.00208 * E * E * s(2 * M)
    - 0.00111 * s(Mp - 2 * F) - 0.00057 * s(Mp + 2 * F) + 0.00056 * E * s(2 * Mp + M)
    - 0.00042 * s(3 * Mp) + 0.00042 * E * s(M + 2 * F) + 0.00038 * E * s(M - 2 * F)
    - 0.00024 * E * s(2 * Mp - M) - 0.00017 * s(Om) - 0.00007 * s(Mp + 2 * M)
    + 0.00004 * s(2 * Mp - 2 * F) + 0.00004 * s(3 * M) + 0.00003 * s(Mp + M - 2 * F)
    + 0.00003 * s(2 * Mp + 2 * F) - 0.00003 * s(Mp + M + 2 * F) + 0.00003 * s(Mp - M + 2 * F)
    - 0.00002 * s(Mp - M - 2 * F) - 0.00002 * s(3 * Mp + M) + 0.00002 * s(4 * Mp);
  // 행성 섭동(합쳐서 2분 안쪽)
  const A = [
    [299.77, 0.107408, 0.000325], [251.88, 0.016321, 0.000165], [251.83, 26.651886, 0.000164],
    [349.42, 36.412478, 0.000126], [84.66, 18.206239, 0.00011], [141.74, 53.303771, 0.000062],
    [207.14, 2.453732, 0.00006], [154.84, 7.30686, 0.000056], [34.52, 27.261239, 0.000047],
    [207.19, 0.121824, 0.000042], [291.34, 1.844379, 0.00004], [161.72, 24.198154, 0.000037],
    [239.56, 25.513099, 0.000035], [331.55, 3.592518, 0.000023],
  ];
  A.forEach(([a, b, c], i) => { jde += c * s((a + b * k - (i === 0 ? 0.009173 * T2 : 0)) * R); });
  return jde;
}

// 역학시와 세계시의 차(초). 1950~2100 에서 1분 안쪽이면 충분하다(경계는 한 시간 폭이다).
function deltaT(year: number): number {
  const t = year - 2000;
  if (year < 1986) { const u = year - 1975; return 45.45 + 1.067 * u - u * u / 260 - u * u * u / 718; }
  if (year < 2005) return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5;
  if (year < 2050) return 62.92 + 0.32217 * t + 0.005589 * t * t;
  return -20 + 32 * ((year - 1820) / 100) ** 2 - 0.5628 * (2150 - year);
}

// 그 날짜 가까이 드는 합삭이 한국 날짜로 며칠인지(JDN).
function newMoonKstJdn(nearJdn: number): number {
  const k = Math.round((nearJdn - 2451550.09766) / 29.530588861);
  const jde = newMoonJDE(k);
  const yr = 2000 + (jde - 2451545) / 365.25;
  const jdUT = jde - deltaT(yr) / 86400;
  return Math.floor(jdUT + 0.5 + 9 / 24);
}

const p2 = (n: number) => String(n).padStart(2, '0');
function ymdFromJdn(j: number) {
  const dt = new Date(Date.UTC(2000, 0, 1) + (j - jdn(2000, 1, 1)) * 86400000);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

// 중국 표의 초하루(양력) → 한국 초하루까지 며칠 밀리는가(0 또는 1).
export function krShift(y: number, m: number, d: number): number {
  const cn = jdn(y, m, d);
  const kr = newMoonKstJdn(cn);
  const sh = kr - cn;
  return sh === 1 ? 1 : 0;   // 표와 천문 계산이 크게 어긋나면(1950 이전 등) 표를 믿는다
}

export function lunarToSolarKR(y: number, m: number, d: number, isLeap = false) {
  if (y < 1900 || y > 2100) return lunarToSolar(y, m, d, isLeap);
  const s = lunarToSolar(y, m, 1, isLeap);
  return ymdFromJdn(jdn(s.y, s.m, s.d) + krShift(s.y, s.m, s.d) + d - 1);
}

export function solarToLunarKR(y: number, m: number, d: number): { y: number; m: number; d: number; leap: boolean } {
  const today = jdn(y, m, d);
  const l = solarToLunar(y, m, d);
  const s = lunarToSolar(l.y, l.m, 1, l.leap);
  const start = jdn(s.y, s.m, s.d) + krShift(s.y, s.m, s.d);
  if (today >= start) return { ...l, d: today - start + 1 };
  // 중국은 초하루, 한국은 아직 지난달 그믐
  const p = ymdFromJdn(jdn(s.y, s.m, s.d) - 1);
  const pl = solarToLunar(p.y, p.m, p.d);
  const ps = lunarToSolar(pl.y, pl.m, 1, pl.leap);
  const pstart = jdn(ps.y, ps.m, ps.d) + krShift(ps.y, ps.m, ps.d);
  return { ...pl, d: today - pstart + 1 };
}

export const ymdKR = (o: { y: number; m: number; d: number }) => `${o.y}-${p2(o.m)}-${p2(o.d)}`;

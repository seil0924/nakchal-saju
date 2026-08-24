// lib/taek-map.ts — 자리 사주(宅). 지금 자리 진단과 이전 방위·택일.
// 좌표만 있으면 되는 순수 계산이다. 지오코딩(주소→좌표)은 바깥에서 넣어준다.
//
// 표현 원칙: 대장군방·삼살방을 "그쪽으로 가면 재앙"이라고 쓰지 않는다.
// 고전에 그런 단정의 근거가 약하고, 판단은 대표님께 남긴다.
// "전통적으로 이 해에는 이 방면을 조심하라고 보았다"까지가 우리가 할 말이다.
import { sunLong, jdn } from '@/lib/manse-core';

// ── 8방위 ────────────────────────────────────────────
export const DIR8 = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'] as const;
export const DIR8_HANJA = ['北', '北東', '東', '南東', '南', '南西', '西', '北西'] as const;
export type Dir8 = typeof DIR8[number];

// 두 좌표의 방위각(도). 북 0°, 시계 방향.
// 이사 방위론은 '지금 있는 자리'를 기준으로 본다 — 출발점이 기준이라는 뜻이다.
export function bearing(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const R = Math.PI / 180;
  const f1 = from.lat * R, f2 = to.lat * R;
  const dl = (to.lng - from.lng) * R;
  const y = Math.sin(dl) * Math.cos(f2);
  const x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
  return (Math.atan2(y, x) / R + 360) % 360;
}

// 방위각 → 8방위. 한 방위가 45°를 차지한다.
export function dirOf(deg: number): { idx: number; name: Dir8; hanja: string } {
  const idx = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
  return { idx, name: DIR8[idx], hanja: DIR8_HANJA[idx] };
}

// 두 좌표 사이 거리(km) — 얼마나 멀리 옮기는지도 판단에 쓰인다.
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// ── 그해 조심하는 방면 ────────────────────────────────
// 년지 12개가 4개 조로 묶여 3년씩 같은 방면을 가리킨다.
const DAEJANGGUN: Record<string, number> = {
  '해자축': 6,   // 亥子丑年 → 서
  '인묘진': 0,   // 寅卯辰年 → 북
  '사오미': 2,   // 巳午未年 → 동
  '신유술': 4,   // 申酉戌年 → 남
};
// 삼살은 삼합(三合) 기준. 삼합 국(局)의 반대편을 가리킨다.
const SAMSAL: Record<string, number> = {
  '신자진': 4,   // 申子辰(水局) → 남
  '해묘미': 6,   // 亥卯未(木局) → 서
  '인오술': 0,   // 寅午戌(火局) → 북
  '사유축': 2,   // 巳酉丑(金局) → 동
};
const ZHI_KO = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

function lookup(zhiIdx: number, table: Record<string, number>): number {
  const z = ZHI_KO[((zhiIdx % 12) + 12) % 12];
  for (const key of Object.keys(table)) if (key.includes(z)) return table[key];
  return -1;
}

export type YearCaution = {
  year: number; yearZhi: number;
  daejanggun: number; samsal: number; same: boolean;
};

export function yearCaution(year: number): YearCaution {
  const yearZhi = ((year - 4) % 12 + 12) % 12;
  const d = lookup(yearZhi, DAEJANGGUN);
  const s = lookup(yearZhi, SAMSAL);
  return { year, yearZhi, daejanggun: d, samsal: s, same: d === s };
}

// 그 방면이 언제 풀리는지 — "그럼 언제 가면 되냐"에 답이 있어야 상품이 된다.
export function nextClearYear(dirIdx: number, from: number, limit = 12): number | null {
  for (let y = from; y < from + limit; y++) {
    const c = yearCaution(y);
    if (c.daejanggun !== dirIdx && c.samsal !== dirIdx) return y;
  }
  return null;
}

// ── 체질에 맞는 방면 ─────────────────────────────────
// 부족한 오행을 채우는 방면. 목=동 화=남 토=남서 금=서 수=북.
const EL_DIR = [2, 4, 5, 6, 0];
const EL_DIR_ALT = [3, 3, 1, 7, 7];
export function favorDir(weakEl: number): { main: number; alt: number } {
  return { main: EL_DIR[weakEl] ?? 2, alt: EL_DIR_ALT[weakEl] ?? 3 };
}

// ── 이사 택일 ───────────────────────────────────────
// 건제십이신 중 이사·입주에 쓰는 넷만 고른다.
const MOVE_GOOD: Record<number, { key: string; name: string; why: string }> = {
  2:  { key: '滿', name: '만', why: '채워지는 날 — 짐 들이기 좋습니다' },
  4:  { key: '定', name: '정', why: '자리가 굳는 날 — 계약·입주에 맞습니다' },
  8:  { key: '成', name: '성', why: '이루어지는 날 — 이사에 가장 힘이 실립니다' },
  10: { key: '開', name: '개', why: '열리는 날 — 새 자리를 여는 데 좋습니다' },
};

const GAN_H = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ZHI_H = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const p2 = (n: number) => String(n).padStart(2, '0');

export type MoveDay = {
  ymd: string; month: number; day: number; dow: string;
  ganji: string; key: string; name: string; why: string; rank: number;
};

// 하루가 끝나는 시점(23:59 KST)의 절기 구간으로 월지를 잡는다.
// 정오로 재면 오후에 드는 절기를 하루 늦게 잡아 월지가 통째로 밀린다.
function monthZhiOf(d: Date): number {
  const jd = jdn(d.getFullYear(), d.getMonth() + 1, d.getDate()) + (23.9833 - 9 - 12) / 24;
  return (2 + Math.floor(((sunLong(jd) - 315 + 360) % 360) / 30)) % 12;
}

export function moveDays(from: Date = new Date(), span = 60): MoveDay[] {
  const out: MoveDay[] = [];
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let k = 1; k <= span; k++) {
    const d = new Date(base.getTime() + k * 86400000);
    const mZhi = monthZhiOf(d);
    const idx = ((jdn(d.getFullYear(), d.getMonth() + 1, d.getDate()) + 49) % 60 + 60) % 60;
    const dGan = idx % 10, dZhi = idx % 12;
    const sinIdx = ((dZhi - mZhi) % 12 + 12) % 12;
    const hit = MOVE_GOOD[sinIdx];
    if (!hit) continue;
    out.push({
      ymd: `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`,
      month: d.getMonth() + 1, day: d.getDate(), dow: DOW[d.getDay()],
      ganji: GAN_H[dGan] + ZHI_H[dZhi],
      key: hit.key, name: hit.name, why: hit.why,
      rank: sinIdx === 8 ? 0 : sinIdx === 10 ? 1 : sinIdx === 4 ? 2 : 3,
    });
  }
  return out;
}

// ── 종합 판정 ───────────────────────────────────────
export type MoveVerdict = {
  deg: number; dir: number; dirName: string; km: number;
  isDaejanggun: boolean; isSamsal: boolean; isFavor: boolean;
  clearYear: number | null;
  level: 'good' | 'ok' | 'caution';
};

export function judgeMove(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  weakEl: number,
  year: number,
): MoveVerdict {
  const deg = bearing(from, to);
  const { idx, name } = dirOf(deg);
  const c = yearCaution(year);
  const fav = favorDir(weakEl);
  const isDae = idx === c.daejanggun;
  const isSam = idx === c.samsal;
  const isFav = idx === fav.main || idx === fav.alt;
  return {
    deg: Math.round(deg * 10) / 10, dir: idx, dirName: name,
    km: Math.round(distanceKm(from, to) * 10) / 10,
    isDaejanggun: isDae, isSamsal: isSam, isFavor: isFav,
    clearYear: (isDae || isSam) ? nextClearYear(idx, year + 1) : null,
    level: (isDae || isSam) ? 'caution' : (isFav ? 'good' : 'ok'),
  };
}

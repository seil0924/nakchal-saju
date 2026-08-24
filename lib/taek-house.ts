// lib/taek-house.ts — 자리 사주(宅) 중 '지금 앉아 있는 자리'를 본다.
// 옮길 자리(방위·택일)는 taek-map.ts 가 맡고, 여기는 사무실 안쪽을 본다.
//
// 근거는 양택 팔택론(八宅論)이다. 여덟 방위를 동사택 넷과 서사택 넷으로 가르고,
// 출입문이 속한 사택과 대표 자리가 속한 사택이 같은가를 본다.
// 고전이 실제로 말한 범위가 여기까지다. 그 너머는 지어내지 않는다.
import { GAN_EL, ZHI_EL } from '@/lib/manse-core';
import { DIR8, DIR8_HANJA, favorDir } from '@/lib/taek-map';

// 팔택 — DIR8 순서(북·북동·동·남동·남·남서·서·북서)에 그대로 맞췄다.
export const GUA = ['坎', '艮', '震', '巽', '離', '坤', '兌', '乾'] as const;
export const GUA_KO = ['감', '간', '진', '손', '리', '곤', '태', '건'] as const;
export const DONG_SATAEK = [0, 2, 3, 4];   // 감·진·손·리 — 북·동·남동·남
export const SEO_SATAEK = [1, 5, 6, 7];    // 간·곤·태·건 — 북동·남서·서·북서
export type Sataek = '동사택' | '서사택';

const norm8 = (d: number) => ((Math.round(d) % 8) + 8) % 8;

export function sataekOf(dir: number): Sataek {
  return DONG_SATAEK.includes(norm8(dir)) ? '동사택' : '서사택';
}

export type Gua = {
  idx: number; gua: string; ko: string;
  dir: string; hanja: string; sataek: Sataek;
};

export function guaOf(dir: number): Gua {
  const i = norm8(dir);
  return { idx: i, gua: GUA[i], ko: GUA_KO[i], dir: DIR8[i], hanja: DIR8_HANJA[i], sataek: sataekOf(i) };
}

// ── 문과 자리 ────────────────────────────────────────
export type Harmony = {
  door: Gua; desk: Gua;
  same: boolean;
  line: boolean;                       // 문과 자리가 정면으로 마주 보는가(門沖)
  level: 'good' | 'ok' | 'caution';
  title: string; body: string;
};

export function houseHarmony(door: number, desk: number): Harmony {
  const d = guaOf(door), k = guaOf(desk);
  const same = d.sataek === k.sataek;
  const line = (norm8(desk) - norm8(door) + 8) % 8 === 4;
  const level: Harmony['level'] = same ? (line ? 'ok' : 'good') : 'caution';
  const title = same
    ? (line ? '사택은 맞으나, 문과 정면입니다' : '문과 자리가 한 사택입니다')
    : '문과 자리가 다른 사택입니다';
  const body = same
    ? (line
      ? `출입문 ${d.dir}(${d.gua})과 대표 자리 ${k.dir}(${k.gua})은 같은 ${d.sataek}입니다. 다만 둘이 정면으로 마주 보아, 드나드는 기운이 자리로 곧장 들이칩니다.`
      : `출입문 ${d.dir}(${d.gua})과 대표 자리 ${k.dir}(${k.gua})이 같은 ${d.sataek}입니다. 팔택에서 가장 무난하게 보는 배치입니다.`)
    : `출입문은 ${d.sataek}(${d.dir}·${d.gua}), 대표 자리는 ${k.sataek}(${k.dir}·${k.gua})입니다. 문을 옮기기 어렵다면 자리를 같은 사택 쪽으로 돌리는 편이 빠릅니다.`;
  return { door: d, desk: k, same, line, level, title, body };
}

// ── 비보(裨補) 물건 ──────────────────────────────────
// 값이 비싼 물건이 아니라 놓는 자리가 값을 한다. 그래서 where 를 반드시 같이 준다.
export type Bibo = { item: string; where: string; why: string };

const BIBO_EL: Bibo[][] = [
  [ // 木 — 자라는 것
    { item: '키 큰 관엽 화분', where: '동쪽 또는 남동쪽 벽', why: '살아 자라는 것이 木을 채웁니다' },
    { item: '결이 보이는 원목 수납장', where: '대표 자리 뒤', why: '가공을 덜 한 나무일수록 결이 삽니다' },
  ],
  [ // 火 — 빛과 열
    { item: '따뜻한 색 스탠드 조명', where: '남쪽 창가나 응접 자리', why: '빛과 열이 火의 몫입니다' },
    { item: '붉은 계열 액자 한 점', where: '대표 자리 정면 벽', why: '눈이 가장 오래 머무는 곳에 둡니다' },
  ],
  [ // 土 — 흙에서 온 것
    { item: '도자기 화병이나 돌 문진', where: '책상 위 왼쪽', why: '흙에서 온 것이 土를 세웁니다' },
    { item: '황토·베이지 계열 러그', where: '응접 테이블 아래', why: '바닥을 눌러 자리를 안정시킵니다' },
  ],
  [ // 金 — 단단한 쇠붙이
    { item: '금속 명패나 놋 소품', where: '서쪽 또는 북서쪽 선반', why: '단단한 쇠붙이가 결단을 돕습니다' },
    { item: '흰 바탕 시계', where: '출입문 맞은편 벽', why: '金은 때를 가르는 기운입니다' },
  ],
  [ // 水 — 도는 물
    { item: '작은 어항이나 유리 수반', where: '북쪽 벽 가까이', why: '고이지 않고 도는 물이 水입니다' },
    { item: '검정·짙은 남색 소품', where: '책상 오른쪽', why: '짙은 색이 물의 자리를 대신합니다' },
  ],
];

export function biboFor(weakEl: number, h?: Harmony): Bibo[] {
  const out = BIBO_EL[((weakEl % 5) + 5) % 5].slice();
  if (!h) return out;
  if (!h.same) out.push({ item: '파티션이나 낮은 책장', where: '대표 자리와 출입문 사이', why: '사택이 갈릴 때는 사이를 한 겹 나누는 것이 먼저입니다' });
  if (h.line) out.push({ item: '가림 화분이나 스크린', where: '문과 자리를 잇는 직선 위', why: '정면으로 들이치는 흐름을 한 번 꺾어 줍니다' });
  return out;
}

// ── 부족한 오행 ─────────────────────────────────────
export type ElChart = {
  yGan: number; yZhi: number; mGan: number; mZhi: number;
  dGan: number; dZhi: number; hGan: number | null; hZhi: number | null;
};

export function elCounts(c: ElChart): number[] {
  const n = [0, 0, 0, 0, 0];
  n[GAN_EL[c.yGan]]++; n[ZHI_EL[c.yZhi]]++;
  n[GAN_EL[c.mGan]]++; n[ZHI_EL[c.mZhi]]++;
  n[GAN_EL[c.dGan]]++; n[ZHI_EL[c.dZhi]]++;
  if (c.hGan !== null && c.hZhi !== null) { n[GAN_EL[c.hGan]]++; n[ZHI_EL[c.hZhi]]++; }
  return n;
}

// 가장 적은 오행. 동수면 낮은 번호(목→화→토→금→수)를 택한다 —
// 새로고침마다 답이 바뀌면 계산이 아니라 뽑기로 보인다.
export function weakElOf(c: ElChart): number {
  const n = elCounts(c);
  let w = 0;
  for (let i = 1; i < 5; i++) if (n[i] < n[w]) w = i;
  return w;
}

// 대표 자리를 어느 쪽에 두면 좋은지 — 부족한 오행의 방위를 그대로 쓴다.
export function deskAdvice(weakEl: number): { main: Gua; alt: Gua } {
  const f = favorDir(weakEl);
  return { main: guaOf(f.main), alt: guaOf(f.alt) };
}

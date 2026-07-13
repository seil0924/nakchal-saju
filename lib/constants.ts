// lib/constants.ts — 가격/문구 단일 소스 (서버·클라이언트 공용)
// 단건(구독 없음). 무료 훅 → 택일팩(완결형 미끼) → 전체 리포트(심층) 사다리.
export const PRICE_TAEKIL = 990;     // 택일팩: 정밀 사정률 + 이번 달 투찰 길일 캘린더
export const PRICE_FULL = 12900;     // 전체 리포트: 모든 심층 섹션 + 궁합 + 택일 + 정밀값

// 언락 레벨: 0 무료 · 1 택일팩 · 2 전체
export type UnlockLevel = 0 | 1 | 2;
export const LEVEL = { FREE: 0, TAEKIL: 1, FULL: 2 } as const;
export const SKU = {
  taekil: { level: 1 as UnlockLevel, price: PRICE_TAEKIL, orderName: '낙찰사주 사정률 사주' },
  full:   { level: 2 as UnlockLevel, price: PRICE_FULL,   orderName: '낙찰사주 리포트' },
} as const;
export type Sku = keyof typeof SKU;

// 하위호환(기존 참조): 첫 열람가 = 택일팩, 정가 = 전체
export const PRICE_FIRST = PRICE_TAEKIL;
export const PRICE_REGULAR = PRICE_FULL;

export const won = (n: number) => n.toLocaleString('ko-KR') + '원';

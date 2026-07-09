// lib/constants.ts — 가격/문구 단일 소스 (서버·클라이언트 공용)
export const PRICE_FIRST = 990;      // 첫 열람 특가
export const PRICE_REGULAR = 1900;   // 이후 단건
export const PRICE_SUB = 9900;       // 월 구독
export const won = (n: number) => n.toLocaleString('ko-KR') + '원';

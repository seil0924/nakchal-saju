import { lunarToSolar, solarToLunar } from './manse-core';

export type BirthParts = { y: number; m: number; d: number };
export type Calendar = 'solar' | 'lunar';

// 기관 설립일은 생년월일 범위(1900년 이후)와 다르다.
export function solarMonthDays(y: number, m: number): number {
  if (!y || !m) return 31;
  if (y < 1000 || y > 2100 || m < 1 || m > 12) return 0;
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function relatedDateError(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return true;
  const [y, m, d] = value.split('-').map(Number);
  return y < 1000 || y > 2100 || m < 1 || m > 12 || d < 1 || d > solarMonthDays(y, m);
}

// 관계·법인 계산 입력은 양력으로 통일하되, 저장된 원본 달력은 바꾸지 않는다.
export function relatedSolarDate(date: string, cal: Calendar = 'solar', leap = false): string {
  if (cal === 'solar') return relatedDateError(date) ? '' : date;
  if (birthDateError(date, cal, leap)) return '';
  const [y, m, d] = date.split('-').map(Number);
  const solar = lunarToSolar(y, m, d, leap);
  return `${solar.y}-${String(solar.m).padStart(2, '0')}-${String(solar.d).padStart(2, '0')}`;
}

// 기존 명식 엔진과 같은 음력표로 검사한다. 없는 날짜를 다음 달로 넘기지 않는다.
export function birthMonthDays(y: number, m: number, cal: Calendar, leap = false): number {
  if (!y || !m) return cal === 'lunar' ? 30 : 31;
  if (y < 1900 || y > 2100 || m < 1 || m > 12) return 0;
  if (cal === 'solar') return new Date(Date.UTC(y, m, 0)).getUTCDate();
  const first = lunarToSolar(y, m, 1, leap);
  const back = solarToLunar(first.y, first.m, first.d);
  if (back.y !== y || back.m !== m || back.leap !== leap) return 0;
  const last = lunarToSolar(y, m, 30, leap);
  const end = solarToLunar(last.y, last.m, last.d);
  return end.y === y && end.m === m && end.d === 30 && end.leap === leap ? 30 : 29;
}

export function birthDateError(birth: unknown, cal: Calendar = 'solar', leap = false): string {
  if (typeof birth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birth)) return '태어난 해·월·일을 모두 골라주세요.';
  const [y, m, d] = birth.split('-').map(Number);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1) return '생년월일을 다시 확인해주세요.';
  const days = birthMonthDays(y, m, cal, leap);
  if (!days && cal === 'lunar' && leap) return '선택한 해의 해당 월은 윤달이 아닙니다. 평달·윤달과 월을 확인해주세요.';
  return d > days ? '선택한 달에 없는 날짜입니다. 태어난 날을 다시 골라주세요.' : '';
}

export function updateBirthParts(parts: BirthParts, change: Partial<BirthParts>, cal: Calendar, leap = false) {
  const next = { ...parts, ...change };
  const cleared = !!next.d && next.d > birthMonthDays(next.y, next.m, cal, leap);
  if (cleared) next.d = 0;
  const birth = next.y && next.m && next.d ? `${next.y}-${String(next.m).padStart(2, '0')}-${String(next.d).padStart(2, '0')}` : '';
  return { parts: next, birth, cleared };
}

export const validBirthTime = (time: unknown) => typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

export function displayBirth(birth: string, cal: Calendar, leap = false) {
  const [y, m, d] = birth.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일 · ${cal === 'solar' ? '양력' : leap ? '음력 윤달' : '음력 평달'}`;
}

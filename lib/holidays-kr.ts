// lib/holidays-kr.ts — 관공서 공휴일과 대체공휴일(택일 연도 페이지·후보 날짜 비교에서 '그날 등기소가 여나'를 짚으려고).
//
// 규칙(관공서의 공휴일에 관한 규정, 2023 개정 기준):
//   대체공휴일 없음: 신정, 현충일
//   설·추석 연휴: 사흘 중 하루라도 일요일이거나 다른 공휴일과 겹치면, 연휴 뒤 첫 평일
//   그 밖(삼일절·어린이날·부처님오신날·광복절·개천절·한글날·성탄절, 2027년부터 노동절·제헌절):
//     토·일요일이거나 다른 공휴일과 겹치면 그 뒤 첫 평일
// 노동절(5/1)·제헌절(7/17)은 2027년부터 넣는다. 2027년 월력요항 정리본과 대조했다(lib/__tests__/holidays-kr.test.ts).
// 선거일·임시공휴일은 미리 알 수 없어 넣지 않는다.
import { lunarToSolarKR as lunarToSolar } from './lunar-kr';

export type Holiday = { ymd: string; name: string; sub?: boolean };

const p2 = (n: number) => String(n).padStart(2, '0');
const ymdOf = (d: Date) => `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

export function holidaysOf(year: number): Holiday[] {
  const map = new Map<string, Holiday>();
  type Item = { d: Date; name: string; rule: 'none' | 'sunday' | 'weekend' };
  const items: Item[] = [];
  const fixed = (m: number, d: number, name: string, rule: Item['rule']) => items.push({ d: utc(year, m, d), name, rule });
  const lunar = (m: number, d: number) => { const s = lunarToSolar(year, m, d, false); return utc(s.y, s.m, s.d); };

  fixed(1, 1, '신정', 'none');
  fixed(3, 1, '삼일절', 'weekend');
  if (year >= 2027) fixed(5, 1, '노동절', 'weekend');
  fixed(5, 5, '어린이날', 'weekend');
  fixed(6, 6, '현충일', 'none');
  if (year >= 2027) fixed(7, 17, '제헌절', 'weekend');
  fixed(8, 15, '광복절', 'weekend');
  fixed(10, 3, '개천절', 'weekend');
  fixed(10, 9, '한글날', 'weekend');
  fixed(12, 25, '성탄절', 'weekend');
  items.push({ d: lunar(4, 8), name: '부처님오신날', rule: 'weekend' });
  const seol = lunar(1, 1), chu = lunar(8, 15);
  const seolDays = [addDays(seol, -1), seol, addDays(seol, 1)];
  const chuDays = [addDays(chu, -1), chu, addDays(chu, 1)];
  seolDays.forEach(d => items.push({ d, name: '설날', rule: 'none' }));
  chuDays.forEach(d => items.push({ d, name: '추석', rule: 'none' }));

  // 같은 날 두 공휴일이 겹치는지 세려고 먼저 센다
  const count = new Map<string, number>();
  for (const it of items) count.set(ymdOf(it.d), (count.get(ymdOf(it.d)) || 0) + 1);
  for (const it of items) { const k = ymdOf(it.d); if (!map.has(k)) map.set(k, { ymd: k, name: it.name }); }

  const isOff = (d: Date) => d.getUTCDay() === 0 || d.getUTCDay() === 6 || map.has(ymdOf(d));
  const nextWeekday = (from: Date) => { let d = addDays(from, 1); while (isOff(d)) d = addDays(d, 1); return d; };
  const addSub = (after: Date, name: string) => { const d = nextWeekday(after); map.set(ymdOf(d), { ymd: ymdOf(d), name: name + ' 대체공휴일', sub: true }); };

  // 겹친 날은 대체공휴일을 하루만 준다(2017년 추석·개천절, 2025년 어린이날·부처님오신날).
  const done = new Set<string>();
  // 설·추석: 연휴 중 일요일이 있거나 다른 공휴일과 겹치면
  for (const [days, name] of [[seolDays, '설날'], [chuDays, '추석']] as [Date[], string][]) {
    if (days.some(d => d.getUTCDay() === 0 || (count.get(ymdOf(d)) || 0) > 1)) {
      addSub(days[2], name);
      days.forEach(d => done.add(ymdOf(d)));
    }
  }
  // 그 밖: 토·일이거나 겹치면. 날짜 순으로 처리해야 앞의 대체공휴일을 뒤의 것이 피해 간다.
  for (const it of items.filter(x => x.rule === 'weekend').sort((a, b) => a.d.getTime() - b.d.getTime())) {
    const k = ymdOf(it.d), dow = it.d.getUTCDay();
    if (done.has(k)) continue;
    if (dow === 0 || dow === 6 || (count.get(k) || 0) > 1) { addSub(it.d, it.name); done.add(k); }
  }
  return [...map.values()].filter(h => h.ymd.startsWith(String(year))).sort((a, b) => a.ymd.localeCompare(b.ymd));
}

const cache = new Map<number, Map<string, Holiday>>();
export function holidayOn(ymd: string): Holiday | null {
  const y = Number(ymd.slice(0, 4));
  if (!cache.has(y)) cache.set(y, new Map(holidaysOf(y).map(h => [h.ymd, h])));
  return cache.get(y)!.get(ymd) ?? null;
}

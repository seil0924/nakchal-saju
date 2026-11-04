'use client';
// 생년월일/설립일 통일 셀렉트박스 — 값은 YYYY-MM-DD 문자열.
// 부분 선택(년만/월만)도 내부 상태로 즉시 반영하고, 셋 다 고르면 onChange 발화.
import { useEffect, useState } from 'react';
import { birthMonthDays, solarMonthDays, type Calendar } from '@/lib/reading-input';
type Props = { value: string; onChange: (v: string) => void; yearFrom?: number; yearTo?: number; cal?: Calendar; leap?: boolean };

export default function DateSelect({ value, onChange, yearFrom = 1930, yearTo = 2012, cal = 'solar', leap = false }: Props) {
  const [y, setY] = useState<number>(value ? +value.slice(0, 4) : 0);
  const [m, setM] = useState<number>(value ? +value.slice(5, 7) : 0);
  const [d, setD] = useState<number>(value ? +value.slice(8, 10) : 0);
  // 외부에서 value가 바뀌면(프리필·불러오기 등) 내부 상태 동기화
  useEffect(() => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      setY(+value.slice(0, 4)); setM(+value.slice(5, 7)); setD(+value.slice(8, 10));
    }
  }, [value]);
  const YEARS = Array.from({ length: yearTo - yearFrom + 1 }, (_, i) => yearTo - i);
  const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = (year: number, month: number) => cal === 'solar' ? solarMonthDays(year, month) : birthMonthDays(year, month, cal, leap);
  const monthDays = daysInMonth(y, m);
  const DAYS = Array.from({ length: monthDays }, (_, i) => i + 1);
  useEffect(() => {
    if (d && d > monthDays) { setD(0); onChange(''); }
  }, [d, monthDays, onChange]);
  const commit = (ny: number, nm: number, nd: number) => {
    if (nd > daysInMonth(ny, nm)) { nd = 0; setD(0); }
    onChange(ny && nm && nd ? `${ny}-${String(nm).padStart(2, '0')}-${String(nd).padStart(2, '0')}` : '');
  };
  return (
    <div className="bdate">
      <select aria-label="연도" value={y || ''} onChange={e => { const v = +e.target.value; setY(v); commit(v, m, d); }}><option value="" disabled>년</option>{y && !YEARS.includes(y) ? <option value={y}>{y}년</option> : null}{YEARS.map(v => <option key={v} value={v}>{v}년</option>)}</select>
      <select aria-label="월" value={m || ''} onChange={e => { const v = +e.target.value; setM(v); commit(y, v, d); }}><option value="" disabled>월</option>{MONTHS.map(v => <option key={v} value={v}>{v}월</option>)}</select>
      <select aria-label="일" value={d || ''} onChange={e => { const v = +e.target.value; setD(v); commit(y, m, v); }}><option value="" disabled>일</option>{DAYS.map(v => <option key={v} value={v}>{v}일</option>)}</select>
    </div>
  );
}

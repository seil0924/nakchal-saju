'use client';
// 생년월일/설립일 통일 셀렉트박스 — 값은 YYYY-MM-DD 문자열. 셋 다 고르면 onChange 발화.
type Props = { value: string; onChange: (v: string) => void; yearFrom?: number; yearTo?: number };

export default function DateSelect({ value, onChange, yearFrom = 1930, yearTo = 2012 }: Props) {
  const y = value ? +value.slice(0, 4) : 0;
  const m = value ? +value.slice(5, 7) : 0;
  const d = value ? +value.slice(8, 10) : 0;
  const YEARS = Array.from({ length: yearTo - yearFrom + 1 }, (_, i) => yearTo - i);
  const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
  const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
  const set = (part: { y?: number; m?: number; d?: number }) => {
    const ny = part.y ?? y, nm = part.m ?? m, nd = part.d ?? d;
    if (ny && nm && nd) onChange(`${ny}-${String(nm).padStart(2, '0')}-${String(nd).padStart(2, '0')}`);
  };
  return (
    <div className="bdate">
      <select value={y || ''} onChange={e => set({ y: +e.target.value })}><option value="" disabled>년</option>{YEARS.map(v => <option key={v} value={v}>{v}년</option>)}</select>
      <select value={m || ''} onChange={e => set({ m: +e.target.value })}><option value="" disabled>월</option>{MONTHS.map(v => <option key={v} value={v}>{v}월</option>)}</select>
      <select value={d || ''} onChange={e => set({ d: +e.target.value })}><option value="" disabled>일</option>{DAYS.map(v => <option key={v} value={v}>{v}일</option>)}</select>
    </div>
  );
}

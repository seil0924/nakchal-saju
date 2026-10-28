'use client';
// 내 일간을 모르는 대표님용. 생년월일 한 칸 → 일간 → 그 일간 페이지로.
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { chartFromInput } from '@/lib/preview';
import { ILGAN } from '@/lib/ilgan';

export default function IlganFinder({ base }: { base: string }) {
  const [date, setDate] = useState('');
  const il = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const y = Number(date.slice(0, 4));
    if (y < 1900 || y > 2100) return null;
    const c = chartFromInput(date, null, 'solar', false);
    return c ? ILGAN[c.dGan] : null;
  }, [date]);
  return (
    <div className="il-find">
      <label htmlFor="il-find-date">내 일간을 모르시면 생년월일(양력)을 넣으세요</label>
      <input id="il-find-date" type="date" min="1900-01-01" max="2100-12-31" value={date} onChange={e => setDate(e.target.value)} />
      {il && <p>대표님 일간은 <b>{il.ko}{il.el}({il.hanja})</b>입니다. <Link href={`${base}/${encodeURIComponent(il.slug)}`}>{il.ko}{il.el} 페이지로 가기</Link></p>}
    </div>
  );
}

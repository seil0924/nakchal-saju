'use client';
// 오늘 날짜 + 일진(日辰) 넓은 띠 — 실시간 만세력 계산 (신뢰 신호). 제목 아래 배치.
import { useEffect, useState } from 'react';
import { chartFromInput, GAN, ZHI } from '@/lib/preview';

export default function TodayChip() {
  const [p, setP] = useState<{ date: string; gz: string }>({ date: '오늘', gz: '' });
  useEffect(() => {
    try {
      const n = new Date();
      const ymd = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
      const c = chartFromInput(ymd, null, 'solar', false);
      if (c) setP({ date: `${n.getFullYear()}년 ${n.getMonth() + 1}월 ${n.getDate()}일`, gz: `${GAN[c.dGan]}${ZHI[c.dZhi]}` });
    } catch {}
  }, []);
  return (
    <div className="todayband">
      {p.gz && <span className="tb-gz" aria-hidden="true">{p.gz}</span>}
      <div className="tb-mid">
        <span className="tb-date">{p.date}</span>
        {p.gz && <span className="tb-sub">{p.gz}日 · 실시간 만세력</span>}
      </div>
      <span className="tb-k" aria-hidden="true">日辰</span>
    </div>
  );
}

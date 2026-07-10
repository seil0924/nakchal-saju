'use client';
// 오늘 날짜 + 일진(日辰) 칩 — 하드코딩 대신 실시간 계산 (만세력 신뢰 신호)
import { useEffect, useState } from 'react';
import { chartFromInput, GAN, ZHI } from '@/lib/preview';

export default function TodayChip() {
  const [txt, setTxt] = useState('오늘');
  useEffect(() => {
    try {
      const n = new Date();
      const ymd = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
      const c = chartFromInput(ymd, null, 'solar', false);
      if (c) setTxt(`${n.getMonth() + 1}/${n.getDate()} · ${GAN[c.dGan]}${ZHI[c.dZhi]}일`);
    } catch {}
  }, []);
  return <span className="m">{txt}</span>;
}

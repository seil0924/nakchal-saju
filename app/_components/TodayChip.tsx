'use client';
// 오늘의 명식판(命式) — 년·월·일 간지를 오행 5색으로. 시주는 비워 입력 동기 유발(퍼널①).
// 실시간 만세력 계산. 한자는 명조(Noto Serif TC)로 표시해 인쇄체 인상을 준다.
import { useEffect, useState } from 'react';
import { chartFromInput, GAN, ZHI } from '@/lib/preview';

const EL = ['木', '火', '土', '金', '水'];
const EL_BG = ['#2f7d5b', '#c0392b', '#c79a3a', '#8a949e', '#1f2d4d'];
const GAN_EL = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const ZHI_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
const EL_NOTE = [
  '木 기운이 뻗는 날 — 새 판을 벌이기 좋습니다.',
  '火 기운이 오르는 날 — 발표·홍보에 힘이 실립니다.',
  '土 기운이 두터운 날 — 큰 결정은 오후가 낫습니다.',
  '金 기운이 단단한 날 — 계약·마무리에 유리합니다.',
  '水 기운이 도는 날 — 정보·협상이 매끄럽습니다.',
];

type P = { date: string; y: string; m: string; d: string; yEl: number[]; mEl: number[]; dEl: number[]; note: string };

export default function TodayChip() {
  const [p, setP] = useState<P | null>(null);
  useEffect(() => {
    try {
      const n = new Date();
      const ymd = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
      const c = chartFromInput(ymd, null, 'solar', false);
      if (!c) return;
      setP({
        date: `${n.getFullYear()}년 ${n.getMonth() + 1}월 ${n.getDate()}일`,
        y: `${GAN[c.yGan]}${ZHI[c.yZhi]}`, m: `${GAN[c.mGan]}${ZHI[c.mZhi]}`, d: `${GAN[c.dGan]}${ZHI[c.dZhi]}`,
        yEl: [GAN_EL[c.yGan], ZHI_EL[c.yZhi]], mEl: [GAN_EL[c.mGan], ZHI_EL[c.mZhi]], dEl: [GAN_EL[c.dGan], ZHI_EL[c.dZhi]],
        note: EL_NOTE[ZHI_EL[c.dZhi]],
      });
    } catch {}
  }, []);
  if (!p) return <div className="msboard" aria-hidden="true" />;

  const cell = (cap: string, gz: string, els: number[], now = false) => (
    <div className="mscol">
      <div className="mscap">{cap}</div>
      <div className={'msgz' + (now ? ' now' : '')} style={{ background: EL_BG[els[0]] }}>
        <span>{gz[0]}</span><span>{gz[1]}</span>
      </div>
      <div className="msel">{EL[els[0]]}·{EL[els[1]]}</div>
    </div>
  );

  return (
    <div className="msboard">
      <div className="mshd"><b>오늘의 명식</b><span>{p.date}</span></div>
      <div className="mspil">
        {cell('年', p.y, p.yEl)}
        {cell('月', p.m, p.mEl)}
        {cell('日', p.d, p.dEl, true)}
        <div className="mscol">
          <div className="mscap">時</div>
          <div className="msgz dim"><span>?</span><span>?</span></div>
          <div className="msel">생시</div>
        </div>
      </div>
      <div className="msflow"><i /><span>오늘 일진 <b>{p.d}</b> — {p.note}</span></div>
    </div>
  );
}

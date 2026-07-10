'use client';
import { GAN, ZHI, EL, EL_HEX } from '@/lib/preview';

export type Pillar = { pos: string; gan: number; zhi: number; ganEl: number; zhiEl: number; sip: string };
const POS_KO: Record<string, string> = { 年: '년주', 月: '월주', 日: '일주', 時: '시주' };

export default function WonGuk({ p }: { p: Pillar[] }) {
  if (!p || p.length === 0) return null;
  return (
    <div className="wonguk">
      <div className="wgt">대표님 사주팔자 원국 <span>元局</span></div>
      <div className="wgrid">
        {p.map((c, i) => (
          <div className={'wgcol' + (c.pos === '日' ? ' day' : '')} key={i}>
            <div className="wgpos">{c.pos}<small>{POS_KO[c.pos]}</small></div>
            <div className="wgsip">{c.sip}</div>
            <div className="wgc" style={{ background: EL_HEX[c.ganEl] }}>{GAN[c.gan]}</div>
            <div className="wgc" style={{ background: EL_HEX[c.zhiEl] }}>{ZHI[c.zhi]}</div>
            <div className="wgel">{EL[c.ganEl]} · {EL[c.zhiEl]}</div>
          </div>
        ))}
      </div>
      <div className="wgnote">만세력 · 절기(節氣) 천문 계산으로 뽑은 대표님의 명식입니다{p.length === 3 ? ' (태어난 시를 넣으면 시주까지 완성됩니다)' : ''}</div>
    </div>
  );
}

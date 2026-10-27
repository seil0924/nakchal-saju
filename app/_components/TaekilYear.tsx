'use client';
// 택일 연도판 화면. 위에 붙는 달 막대로 넘기고, 달마다 평일 으뜸날을 먼저 보여 준다.
// 날을 고르면 아래 막대에 모였다가 후보 날짜 비교(리딩)로 넘어간다.
import { useState } from 'react';
import { OFFICER_KO } from '@/lib/taekil';
import { isPurpose } from '@/lib/bigyo-input';
import type { YearMonth, YearDay } from '@/lib/taekil-year';
import BigyoBar, { toggleCand, shortYmd } from '@/app/_components/BigyoBar';

const TONE = ['a', 'b', 'c', 'd'];
const DOW_KO = ['일', '월', '화', '수', '목', '금', '토'];
const dowOf = (ymd: string) => DOW_KO[new Date(ymd + 'T00:00:00Z').getUTCDay()];

export default function TaekilYear({ slug, year, months }: { slug: string; year: number; months: YearMonth[] }) {
  const [sel, setSel] = useState<string[]>([]);
  const pickBtn = (d: YearDay) => {
    const on = sel.includes(d.ymd);
    return (
      <button type="button" className="dp-pickb" aria-pressed={on}
        aria-label={`${d.month}월 ${d.day}일 ${on ? '빼기' : '비교할 날로 고르기'}`}
        disabled={!on && sel.length >= 3} onClick={() => setSel(toggleCand(sel, d.ymd))}>
        {on ? '골랐음' : '고르기'}
      </button>
    );
  };

  return (
    <section className="dp ty">
      <nav className="ty-nav" aria-label="달 고르기">
        {months.map(m => <a key={m.m} href={'#m' + m.m}>{m.m}월</a>)}
      </nav>

      <p className="bg-note">이 표는 모든 업체가 같이 보는 날입니다. 대표님 일간과 일지까지 따지면 남는 날이 달라집니다. 날을 두세 개 고르시면 대표님 사주로 순위를 매겨 드립니다.</p>

      {months.map(m => (
        <div key={m.m} id={'m' + m.m} className="ty-month">
          <h2 className="ty-h">{year}년 {m.m}월<span>맞는 날 {m.good.length}일</span></h2>
          {m.best.length > 0 ? (
            <p className="ty-best"><b>평일 으뜸날</b>{m.best.map(d => shortYmd(d.ymd)).join(' · ')}</p>
          ) : (
            <p className="ty-best none">이달은 으뜸날이 모두 주말이나 공휴일입니다. 아래 맞는 날에서 평일을 고르세요.</p>
          )}
          <ul className="dp-days pick ty-days">
            {m.good.map(d => (
              <li key={d.ymd} className={(TONE[d.rank] || 'd') + (sel.includes(d.ymd) ? ' sel' : '') + (d.off ? ' off' : '')}>
                <span className="dd">{d.month}/{d.day}<em>{dowOf(d.ymd)}</em></span>
                <span className="dh">{OFFICER_KO[d.officer].hanja}</span>
                <span className="dw"><b>{OFFICER_KO[d.officer].name}</b>{d.hol ? <i className="ty-hol">{d.hol}</i> : d.off ? <i className="ty-hol wk">주말</i> : null}</span>
                <span className="dg">{d.ganji}{pickBtn(d)}</span>
              </li>
            ))}
          </ul>
          {m.avoid.length > 0 && (
            <details className="ty-avoid">
              <summary>{m.m}월 피하는 날 {m.avoid.length}일</summary>
              <p>{m.avoid.map(d => `${d.day}일(${dowOf(d.ymd)}) ${OFFICER_KO[d.officer].name}`).join(' · ')}</p>
            </details>
          )}
        </div>
      ))}

      {isPurpose(slug) && <BigyoBar purpose={slug} sel={sel} setSel={setSel} />}
    </section>
  );
}

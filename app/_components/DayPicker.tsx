'use client';
// 영어권 택일. 무엇을 하려는지 고르면 앞으로 석 달 중 맞는 날을 내놓는다.
// 피하는 날도 같이 보여 준다 — 겁주려는 게 아니라 왜 그날은 빼는지 보이려는 것이다.
import { useMemo, useState } from 'react';
import { PURPOSES, pickDays, avoidDays, OFFICERS, type Purpose } from '@/lib/daypicker-en';

const ORDER: Purpose[] = ['opening', 'contract', 'moving', 'travel', 'wedding'];
const RANK_TONE = ['a', 'b', 'c', 'd'];

export default function DayPicker() {
  const [purpose, setPurpose] = useState<Purpose>('opening');
  const [showAvoid, setShowAvoid] = useState(false);

  const today = useMemo(() => new Date(), []);
  const good = useMemo(() => pickDays(purpose, today, 90), [purpose, today]);
  const bad = useMemo(() => avoidDays(today, 90), [today]);
  const info = PURPOSES[purpose];

  return (
    <section className="dp" lang="en">
      <div className="dp-pick">
        <span className="dp-lab">What is it for</span>
        <div className="dp-btns">
          {ORDER.map(p => (
            <button key={p} type="button" className={'dp-b' + (purpose === p ? ' on' : '')}
              aria-pressed={purpose === p} onClick={() => setPurpose(p)}>{PURPOSES[p].label}</button>
          ))}
        </div>
      </div>

      <p className="dp-blurb">{info.blurb} Showing the next 90 days.</p>

      <div className="dp-key">
        {info.good.map((o, i) => (
          <span key={o} className={'dp-chip ' + RANK_TONE[i]}>
            <b>{OFFICERS[o].hanja}</b> {OFFICERS[o].en}
          </span>
        ))}
      </div>

      <ul className="dp-days">
        {good.map(d => (
          <li key={d.ymd} className={RANK_TONE[d.rank] || 'd'}>
            <span className="dd">{d.month}/{d.day}<em>{d.dow}</em></span>
            <span className="dh">{d.hanja}</span>
            <span className="dw"><b>{d.en}</b>{d.gist}</span>
            <span className="dg">{d.ganji}<em>{d.ganjiPinyin}</em></span>
          </li>
        ))}
      </ul>

      <button type="button" className="dp-toggle" onClick={() => setShowAvoid(v => !v)} aria-expanded={showAvoid}>
        {showAvoid ? 'Hide' : 'Show'} the {bad.length} days to avoid
      </button>

      {showAvoid && (
        <ul className="dp-days avoid">
          {bad.map(d => (
            <li key={d.ymd}>
              <span className="dd">{d.month}/{d.day}<em>{d.dow}</em></span>
              <span className="dh">{d.hanja}</span>
              <span className="dw"><b>{d.en}</b>{d.gist}</span>
              <span className="dg">{d.ganji}<em>{d.ganjiPinyin}</em></span>
            </li>
          ))}
        </ul>
      )}

      <p className="dp-disc">
        The month is set by the <b>solar term</b> the day falls in, computed from the sun&rsquo;s apparent longitude,
        and the officer follows from the day&rsquo;s earthly branch. This is a calendar tradition, not a forecast —
        take it as one input among the practical ones.
      </p>
    </section>
  );
}

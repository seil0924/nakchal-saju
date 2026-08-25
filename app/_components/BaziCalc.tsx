'use client';
// 영어권 BaZi 계산기. 우리가 이미 가진 것(절기 천문계산·진태양시·야자시)이 그대로 차별점이 되는 시장이다.
// 영어권 계산기 대부분은 태어난 시각을 표준시 그대로 쓴다 — 그래서 시주가 틀린다.
import { useMemo, useState } from 'react';
import { resolveBirth, corePillars } from '@/lib/manse-core';
import { CITIES, searchCities, cityKey, type City } from '@/lib/cities';
import { solarShiftMin } from '@/lib/manse-core';
import { baziOf, type Cell } from '@/lib/bazi-en';

const SEOUL = CITIES[0];

function Glyph({ c, sub }: { c: Cell; sub: string }) {
  return (
    <div className="bz-cell">
      <div className="bz-han" style={{ background: c.hex }}>{c.hanja}</div>
      <div className="bz-py">{c.pinyin}</div>
      <div className="bz-el" style={{ color: c.hexText }}>{c.yang ? 'Yang' : 'Yin'} {c.element}</div>
      <div className="bz-sub">{sub}</div>
    </div>
  );
}

export default function BaziCalc() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [noTime, setNoTime] = useState(true);
  const [q, setQ] = useState('');
  const [place, setPlace] = useState<City>(SEOUL);
  const [open, setOpen] = useState(false);

  const hits = useMemo(() => searchCities(q), [q]);

  const result = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const t = noTime ? null : (time || null);
    const r = resolveBirth(date, t, 'solar', false, place);
    const c = corePillars(r.y, r.m, r.d, r.hf, r.yaja);
    const [hh, mm] = (t || '12:00').split(':').map(Number);
    const [yy, mo, dd] = date.split('-').map(Number);
    return { bazi: baziOf(c), shift: solarShiftMin(place, yy, mo, dd, hh, mm), yaja: r.yaja };
  }, [date, time, noTime, place]);

  const shiftText = (n: number) =>
    n === 0 ? 'none' : `${n > 0 ? '+' : '−'}${Math.abs(n)} min`;

  return (
    <section className="bz" lang="en">
      <div className="bz-form">
        <label className="bz-fl"><span>Date of birth</span>
          <input type="date" value={date} min="1900-01-01" max="2100-12-31"
            onChange={e => setDate(e.target.value)} />
        </label>

        <label className="bz-fl"><span>Time of birth</span>
          <div className="bz-trow">
            <button type="button" className={'bz-tb' + (noTime ? ' on' : '')} onClick={() => setNoTime(true)}>Unknown</button>
            <button type="button" className={'bz-tb' + (!noTime ? ' on' : '')} onClick={() => setNoTime(false)}>Known</button>
            {!noTime && <input type="time" value={time} onChange={e => setTime(e.target.value)} />}
          </div>
        </label>

        <label className="bz-fl bz-place"><span>Place of birth</span>
          <input value={open ? q : cityKey(place)} placeholder="Search a city"
            onFocus={() => { setOpen(true); setQ(''); }}
            onChange={e => setQ(e.target.value)}
            onBlur={() => setTimeout(() => setOpen(false), 150)} />
          {open && hits.length > 0 && (
            <ul className="bz-hits">
              {hits.map(c => (
                <li key={cityKey(c)}>
                  <button type="button" onMouseDown={() => { setPlace(c); setOpen(false); }}>
                    {c.city}<em>{c.country}</em>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </label>
      </div>

      <p className="bz-why">
        Why we ask for the place: the hour pillar is set by <b>true solar time</b>, not by the clock on the wall.
        Two people born at the same clock time in Madrid and Beijing are more than an hour apart in solar time.
        If a calculator never asks where you were born, its hour pillar is a guess.
      </p>

      {result && (
        <>
          <div className="bz-out">
            <div className="bz-grid" style={{ gridTemplateColumns: `repeat(${result.bazi.pillars.length}, 1fr)` }}>
              {result.bazi.pillars.map(p => (
                <div className="bz-col" key={p.label}>
                  <div className="bz-lab">{p.label}</div>
                  <Glyph c={p.stem} sub={p.stem.star ?? 'Day Master'} />
                  <Glyph c={p.branch} sub={`${p.branch.animal} · ${p.branch.star}`} />
                </div>
              ))}
            </div>

            <div className="bz-dm">
              Day Master <b style={{ color: result.bazi.dayMaster.hex }}>
                {result.bazi.dayMaster.hanja} {result.bazi.dayMaster.pinyin} —
                {' '}{result.bazi.dayMaster.yang ? 'Yang' : 'Yin'} {result.bazi.dayMaster.element}</b>
            </div>

            <div className="bz-bal">
              {result.bazi.counts.map(c => (
                <div className="bz-bar" key={c.element}>
                  <span className="bz-bn">{c.element}</span>
                  <span className="bz-bt"><i style={{ width: `${(c.n / 8) * 100}%`, background: c.hex }} /></span>
                  <span className="bz-bc">{c.n}</span>
                </div>
              ))}
            </div>
            <p className="bz-note">
              Strongest <b>{result.bazi.strongest}</b>, thinnest <b>{result.bazi.weakest}</b>.
              {' '}Solar correction applied for {place.city}: <b>{shiftText(result.shift)}</b>.
              {result.yaja ? ' Late-night hour (23:00–01:00) handled as the following day pillar.' : ''}
            </p>
          </div>

          {noTime && (
            <div className="bz-hint">
              Without a birth time we read <b>three pillars</b>. The hour pillar changes the reading, so add the time if you know it.
            </div>
          )}
        </>
      )}

      <p className="bz-disc">
        Solar terms are computed astronomically from the sun&rsquo;s apparent longitude, not from a fixed calendar date,
        so births near a term boundary land in the right month. For reflection, not prediction.
      </p>
    </section>
  );
}

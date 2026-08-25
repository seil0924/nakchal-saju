'use client';
// 영어권 BaZi 계산기. 우리가 이미 가진 것(절기 천문계산·진태양시·야자시)이 그대로 차별점이 되는 시장이다.
// 영어권 계산기 대부분은 태어난 시각을 표준시 그대로 쓴다 — 그래서 시주가 틀린다.
import { useMemo, useState } from 'react';
import { resolveBirth, corePillars } from '@/lib/manse-core';
import { CITIES, searchCities, cityKey, type City } from '@/lib/cities';
import { solarShiftMin } from '@/lib/manse-core';
import { baziOf, type Cell } from '@/lib/bazi-en';
import { toZh, BZ_UI, type Lang } from '@/lib/bazi-i18n';

const SEOUL = CITIES[0];

function Glyph({ c, sub, yang, yin }: { c: Cell; sub: string; yang: string; yin: string }) {
  return (
    <div className="bz-cell">
      <div className="bz-han" style={{ background: c.hex }}>{c.hanja}</div>
      {c.pinyin ? <div className="bz-py">{c.pinyin}</div> : null}
      <div className="bz-el" style={{ color: c.hexText }}>{c.yang ? yang : yin} {c.element}</div>
      <div className="bz-sub">{sub}</div>
    </div>
  );
}

export default function BaziCalc({ lang = 'en' }: { lang?: Lang }) {
  const T = BZ_UI[lang];
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
    const chart = baziOf(c);
    return { bazi: lang === 'zh' ? toZh(chart) : chart, shift: solarShiftMin(place, yy, mo, dd, hh, mm), yaja: r.yaja };
  }, [date, time, noTime, place, lang]);

  const shiftText = (n: number) =>
    n === 0 ? T.none : `${n > 0 ? '+' : '−'}${Math.abs(n)} ${T.min}`;

  return (
    <section className="bz" lang={T.htmlLang}>
      <div className="bz-form">
        <label className="bz-fl"><span>{T.dateLabel}</span>
          <input type="date" value={date} min="1900-01-01" max="2100-12-31"
            onChange={e => setDate(e.target.value)} />
        </label>

        <label className="bz-fl"><span>{T.timeLabel}</span>
          <div className="bz-trow">
            <button type="button" className={'bz-tb' + (noTime ? ' on' : '')} onClick={() => setNoTime(true)}>{T.unknown}</button>
            <button type="button" className={'bz-tb' + (!noTime ? ' on' : '')} onClick={() => setNoTime(false)}>{T.known}</button>
            {!noTime && <input type="time" value={time} onChange={e => setTime(e.target.value)} />}
          </div>
        </label>

        <label className="bz-fl bz-place"><span>{T.placeLabel}</span>
          <input value={open ? q : cityKey(place)} placeholder={T.searchCity}
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
        {T.why}
      </p>

      {result && (
        <>
          <div className="bz-out">
            <div className="bz-grid" style={{ gridTemplateColumns: `repeat(${result.bazi.pillars.length}, 1fr)` }}>
              {result.bazi.pillars.map(p => (
                <div className="bz-col" key={p.label}>
                  <div className="bz-lab">{p.label}</div>
                  <Glyph c={p.stem} sub={p.stem.star ?? T.dayMasterSub} yang={T.yang} yin={T.yin} />
                  <Glyph c={p.branch} sub={`${p.branch.animal} · ${p.branch.star}`} yang={T.yang} yin={T.yin} />
                </div>
              ))}
            </div>

            <div className="bz-dm">
              {T.dayMaster} <b style={{ color: result.bazi.dayMaster.hex }}>
                {result.bazi.dayMaster.hanja}{result.bazi.dayMaster.pinyin ? ' ' + result.bazi.dayMaster.pinyin : ''} —
                {' '}{result.bazi.dayMaster.yang ? T.yang : T.yin} {result.bazi.dayMaster.element}</b>
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
              {T.strongest} <b>{result.bazi.strongest}</b>, {T.thinnest} <b>{result.bazi.weakest}</b>.
              {' '}{T.correctionFor(place.city)}: <b>{shiftText(result.shift)}</b>.
              {result.yaja ? T.yajaNote : ''}
            </p>
          </div>

          {noTime && (
            <div className="bz-hint">
              {T.noTimeHint}
            </div>
          )}
        </>
      )}

      <p className="bz-disc">
        {T.disc}
      </p>
    </section>
  );
}

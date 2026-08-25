'use client';
// 같은 생일로 두 가지 계산을 나란히 돌려 보여 준다.
// 왼쪽은 시계 시각 그대로 쓴 것, 오른쪽은 출생지 경도로 진태양시를 낸 것.
// '왜 사이트마다 차트가 다른가'는 설명보다 이렇게 보여 주는 편이 훨씬 빠르다.
import { useMemo, useState } from 'react';
import { resolveBirth, corePillars, solarShiftMin } from '@/lib/manse-core';
import { searchCities, cityKey, CITIES, type City } from '@/lib/cities';
import { STEM_HANJA, BRANCH_HANJA, STEM_PINYIN, BRANCH_PINYIN } from '@/lib/bazi-en';

const START = CITIES.find(c => c.city === 'Madrid') ?? CITIES[0];
const LABELS = ['Year', 'Month', 'Day', 'Hour'];
const LABELS_ZH = ['年', '月', '日', '時'];

// 화면 문구. 계산은 한 벌이고 이름표만 두 벌이다.
const CD = {
  en: {
    date: 'Date of birth', time: 'Time of birth', place: 'Place of birth', search: 'Search a city',
    capPlain: 'Clock time as given', subPlain: 'what a calculator does when it never asks where you were born',
    capSolar: 'True solar time', subSolar: (c: string) => `corrected for the longitude of ${c}, and for summer time if it applied`,
    note: 'Highlighted pillars are the ones that moved. Neither column is a trick — they are the same engine, run once without the correction and once with it.',
    vdPre: (c: string) => `Same birth data, two different charts. Correcting the clock for ${c} on that date takes `,
    vdPost: ' — longitude, plus summer time if it was in force — and that is enough to move a pillar.',
    vsPre: (c: string) => `For this birth the two agree. The correction for ${c} is `,
    vsPost: ' — not enough to cross a boundary this time. Try a time near an odd hour.',
    none: 'none', min: 'min', lang: 'en',
  },
  zh: {
    date: '出生日期', time: '出生時間', place: '出生地', search: '搜尋城市',
    capPlain: '直接用時鐘時間', subPlain: '不問出生地的排盤工具就是這樣算的',
    capSolar: '真太陽時', subSolar: (c: string) => `已按${c}的經度校正，夏令時間若適用亦一併校正`,
    note: '標紅的是移動了的柱。兩欄都不是花招 — 同一套算法，一次不校正，一次校正。',
    vdPre: (c: string) => `同一組出生資料，兩張不同的命盤。${c} 在該日需要校正 `,
    vdPost: ' — 經度，若當時實施夏令時間亦一併計入 — 這已足以讓一柱移位。',
    vsPre: (c: string) => `這組資料兩者一致。${c} 的校正為 `,
    vsPost: ' — 這次不足以跨過交界。試試接近單數整點的時間。',
    none: '無', min: '分', lang: 'zh-Hant',
  },
} as const;
export type CdLang = keyof typeof CD;

type Four = { gan: number; zhi: number }[];

function fourOf(c: ReturnType<typeof corePillars>): Four {
  const out: Four = [
    { gan: c.yGan, zhi: c.yZhi }, { gan: c.mGan, zhi: c.mZhi }, { gan: c.dGan, zhi: c.dZhi },
  ];
  if (c.hGan !== null && c.hZhi !== null) out.push({ gan: c.hGan, zhi: c.hZhi });
  return out;
}
const pair = (p: { gan: number; zhi: number }) => STEM_HANJA[p.gan] + BRANCH_HANJA[p.zhi];
const say = (p: { gan: number; zhi: number }) => STEM_PINYIN[p.gan] + ' ' + BRANCH_PINYIN[p.zhi];

export default function ChartDiff({ lang = 'en' }: { lang?: CdLang }) {
  const T = CD[lang];
  const L = lang === 'zh' ? LABELS_ZH : LABELS;
  const [date, setDate] = useState('1990-01-15');
  const [time, setTime] = useState('07:40');
  const [q, setQ] = useState('');
  const [place, setPlace] = useState<City>(START);
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => searchCities(q), [q]);

  const result = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);

    // ① 아무 보정 없이 — 시계 시각을 그대로 시주로 쓴다. 출생지를 안 묻는 계산기가 하는 일이다.
    const clock = hh + mm / 60;
    const plain = fourOf(corePillars(y, m, d, clock, false));

    // ② 출생지 경도로 진태양시를 내고, 자정을 넘나들면 날짜까지 옮긴다.
    const r = resolveBirth(date, time, 'solar', false, place);
    const solar = fourOf(corePillars(r.y, r.m, r.d, r.hf, r.yaja));

    const shift = solarShiftMin(place, y, m, d, hh, mm);
    const diff = solar.map((p, i) => pair(p) !== pair(plain[i]));
    return { plain, solar, shift, diff, any: diff.some(Boolean) };
  }, [date, time, place]);

  const shiftText = (n: number) => (n === 0 ? T.none : `${n > 0 ? '+' : '−'}${Math.abs(n)} ${T.min}`);

  return (
    <section className="cd" lang={T.lang}>
      <div className="cd-form">
        <label className="cd-fl"><span>{T.date}</span>
          <input type="date" value={date} min="1900-01-01" max="2100-12-31" onChange={e => setDate(e.target.value)} />
        </label>
        <label className="cd-fl"><span>{T.time}</span>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        </label>
        <label className="cd-fl cd-place"><span>{T.place}</span>
          <input value={open ? q : cityKey(place)} placeholder={T.search}
            onFocus={() => { setOpen(true); setQ(''); }}
            onChange={e => setQ(e.target.value)}
            onBlur={() => setTimeout(() => setOpen(false), 150)} />
          {open && hits.length > 0 && (
            <ul className="cd-hits">
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

      {result && (
        <>
          <div className={'cd-verdict ' + (result.any ? 'differ' : 'same')}>
            {result.any
              ? <>{T.vdPre(place.city)}<b>{shiftText(result.shift)}</b>{T.vdPost}</>
              : <>{T.vsPre(place.city)}<b>{shiftText(result.shift)}</b>{T.vsPost}</>}
          </div>

          <div className="cd-two">
            <div className="cd-card plain">
              <div className="cd-cap">{T.capPlain}
                <em>{T.subPlain}</em></div>
              <div className="cd-row">
                {result.plain.map((p, i) => (
                  <div key={i} className="cd-cell">
                    <span className="cd-lab">{L[i]}</span>
                    <span className="cd-han">{pair(p)}</span>
                    <span className="cd-say">{say(p)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cd-card solar">
              <div className="cd-cap">{T.capSolar}
                <em>{T.subSolar(place.city)}</em></div>
              <div className="cd-row">
                {result.solar.map((p, i) => (
                  <div key={i} className={'cd-cell' + (result.diff[i] ? ' moved' : '')}>
                    <span className="cd-lab">{L[i]}</span>
                    <span className="cd-han">{pair(p)}</span>
                    <span className="cd-say">{say(p)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="cd-note">
            {T.note}
          </p>
        </>
      )}
    </section>
  );
}

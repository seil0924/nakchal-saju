'use client';
// 자리 사주(宅) — ① 지금 앉은 자리를 보고 ② 옮길 자리를 견준다.
// 지도 타일 대신 나침반을 그린다. 좌표는 방위와 거리를 내는 데만 쓰고 저장하지 않는다
// (브이월드 이용조건상 응답을 저장할 수 없다).
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { chartFromInput } from '@/lib/preview';
import { migrateLegacy, peopleOf } from '@/lib/people';
import { sget } from '@/lib/scope';
import { DIR8, DIR8_HANJA, judgeMove, yearCaution, moveDays, type MoveVerdict } from '@/lib/taek-map';
import { guaOf, houseHarmony, biboFor, weakElOf, deskAdvice, type Harmony } from '@/lib/taek-house';
import { OH_HANJA, OH_NAME, OH_TEXT } from '@/lib/balju-map';
import { CAT_INFO } from '@/lib/report-categories';
import { won } from '@/lib/constants';

const VB = 400, C = 200;
const rad = (d: number) => ((d - 90) * Math.PI) / 180;   // 0도 = 북 = 위
const px = (r: number, deg: number): [number, number] => [C + r * Math.cos(rad(deg)), C + r * Math.sin(rad(deg))];

function wedge(i: number, rIn: number, rOut: number) {
  const a0 = i * 45 - 22.5, a1 = i * 45 + 22.5;
  const [x0, y0] = px(rOut, a0), [x1, y1] = px(rOut, a1);
  const [x2, y2] = px(rIn, a1), [x3, y3] = px(rIn, a0);
  return `M${x0} ${y0} A${rOut} ${rOut} 0 0 1 ${x1} ${y1} L${x2} ${y2} A${rIn} ${rIn} 0 0 0 ${x3} ${y3} Z`;
}

type Pt = { lat: number; lng: number; matched: string };
type Me = { el: number; name: string; date: string };

function readMe(): Me | null {
  try {
    migrateLegacy();
    const self = peopleOf('self')[0];
    if (self?.date) {
      const c = chartFromInput(self.date, self.time ?? null, self.cal ?? 'solar', !!self.leap);
      if (c) return { el: weakElOf(c), name: (self.name || '대표님').trim(), date: self.date };
    }
    const raw = sget('nakchal_self_v1');
    if (!raw) return null;
    const list = JSON.parse(raw);
    if (!Array.isArray(list) || !list.length) return null;
    const p = list[0];
    const date = p?.date || p?.birth;          // 구버전은 birth 로 저장돼 있다
    if (!date) return null;
    const c = chartFromInput(date, p.time ?? null, p.cal ?? 'solar', !!(p.leap ?? p.isLeap));
    if (!c) return null;
    return { el: weakElOf(c), name: (p.name || '대표님').trim(), date };
  } catch { return null; }
}

async function geocode(address: string): Promise<Pt | null> {
  try {
    const r = await fetch('/api/geocode?address=' + encodeURIComponent(address));
    const j = await r.json();
    return j?.ok ? { lat: j.lat, lng: j.lng, matched: j.matched } : null;
  } catch { return null; }
}

export default function JariMap() {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setMe(readMe()); setReady(true); }, []);

  // ① 지금 자리
  const [door, setDoor] = useState<number | null>(null);
  const [desk, setDesk] = useState<number | null>(null);
  const harmony: Harmony | null = useMemo(
    () => (door === null || desk === null ? null : houseHarmony(door, desk)),
    [door, desk],
  );

  // ② 옮길 자리
  const [addrA, setAddrA] = useState('');
  const [addrB, setAddrB] = useState('');
  const [ptA, setPtA] = useState<Pt | null>(null);
  const [ptB, setPtB] = useState<Pt | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function look() {
    if (!addrA.trim() || !addrB.trim()) return;
    setBusy(true); setErr('');
    const [a, b] = await Promise.all([geocode(addrA), geocode(addrB)]);
    setBusy(false);
    if (!a) { setErr('지금 주소를 찾지 못했습니다. 도로명이나 지번으로 다시 넣어 주세요.'); return; }
    if (!b) { setErr('옮길 주소를 찾지 못했습니다. 도로명이나 지번으로 다시 넣어 주세요.'); return; }
    setPtA(a); setPtB(b);
  }

  const year = new Date().getFullYear();
  const caution = useMemo(() => yearCaution(year), [year]);
  const verdict: MoveVerdict | null = useMemo(
    () => (ptA && ptB ? judgeMove(ptA, ptB, me?.el ?? 0, year) : null),
    [ptA, ptB, me, year],
  );
  const days = useMemo(() => moveDays(new Date(), 60).slice(0, 8), []);
  const advice = me ? deskAdvice(me.el) : null;
  const bibo = me ? biboFor(me.el, harmony ?? undefined) : [];

  // 리딩으로 넘길 때 좌표는 빼고 우리가 낸 방위각·거리만 싣는다.
  const payHref = (() => {
    const q = new URLSearchParams({ cat: 'ijeon' });
    if (verdict) { q.set('dg', String(verdict.deg)); q.set('km', String(verdict.km)); }
    if (door !== null) q.set('dr', String(door));
    if (desk !== null) q.set('dk', String(desk));
    if (addrA.trim()) q.set('pa', addrA.trim().slice(0, 40));
    if (addrB.trim()) q.set('pb', addrB.trim().slice(0, 40));
    if (me?.date) q.set('b', me.date);
    if (me?.name) q.set('n', me.name);
    return '/reading?' + q.toString();
  })();

  if (!ready) return <div className="jr-wrap" aria-hidden="true" />;

  return (
    <div className="jr-wrap">
      {/* ── 나침반 ── */}
      <div className="jr-card">
        <svg viewBox={`0 0 ${VB} ${VB}`} role="img" aria-label="사무실 방위 나침반">
          {DIR8.map((_, i) => (
            <path key={'w' + i} d={wedge(i, 74, 150)}
              fill={i === desk ? 'rgba(199,154,58,.34)' : i === door ? 'rgba(179,56,44,.30)'
                : (i === caution.daejanggun || i === caution.samsal) ? 'rgba(179,56,44,.12)' : 'rgba(255,255,255,.035)'}
              stroke="rgba(239,234,224,.14)" strokeWidth={0.8} />
          ))}
          {DIR8_HANJA.map((h, i) => {
            const [x, y] = px(168, i * 45);
            const on = i === door || i === desk;
            return (
              <text key={h} x={x} y={y + 4} textAnchor="middle" fontSize={i % 2 ? 11 : 14}
                fontWeight={on ? 900 : 600} fill={on ? '#efeae0' : 'rgba(239,234,224,.5)'}
                style={{ fontFamily: 'var(--serif)' }}>{h}</text>
            );
          })}
          {verdict && (() => {
            const [x, y] = px(146, verdict.deg);
            return (
              <g>
                <line x1={C} y1={C} x2={x} y2={y} stroke="#c79a3a" strokeWidth={2.4} />
                <circle cx={x} cy={y} r={7} fill="#c79a3a" />
                <text x={x} y={y + 3.2} textAnchor="middle" fontSize={8} fontWeight={900} fill="#1c1c1d">宅</text>
              </g>
            );
          })()}
          <circle cx={C} cy={C} r={40} fill="#26262a" stroke="rgba(239,234,224,.3)" />
          <text x={C} y={C - 3} textAnchor="middle" fontSize={16} fontWeight={800} fill="#efeae0" style={{ fontFamily: 'var(--serif)' }}>宅</text>
          <text x={C} y={C + 13} textAnchor="middle" fontSize={9} fill="rgba(239,234,224,.62)">{verdict ? `${verdict.km}km` : '지금 자리'}</text>
        </svg>
        <div className="jr-cap">
          {verdict
            ? <>옮길 자리는 지금 자리에서 <b>{verdict.dirName}쪽 {verdict.deg}°</b>, <b>{verdict.km}km</b> 떨어져 있습니다</>
            : <>붉은 칸이 <b>출입문</b>, 금빛 칸이 <b>대표 자리</b>입니다</>}
          <span className="jr-caut">
            {year}년에 예부터 조심하라 본 방면 — 대장군방 <b>{DIR8[caution.daejanggun]}</b>
            {caution.same ? <>, 삼살방도 같은 <b>{DIR8[caution.samsal]}</b></> : <>, 삼살방 <b>{DIR8[caution.samsal]}</b></>}
          </span>
        </div>
      </div>

      {/* ── ① 지금 자리 ── */}
      <section className="jr-sec">
        <h3 className="jr-h"><em>壹</em> 지금 앉은 자리</h3>
        <p className="jr-lead">사무실 문이 어느 쪽에 있고, 대표님 책상이 어느 쪽에 놓였는지만 짚어 주세요.</p>
        <div className="jr-pick">
          <div className="jr-plab">출입문 방위</div>
          <div className="jr-pbtns">
            {DIR8.map((d, i) => (
              <button key={'dr' + i} type="button" className={'jr-pb' + (door === i ? ' on door' : '')}
                aria-pressed={door === i} onClick={() => setDoor(i)}>{d}</button>
            ))}
          </div>
        </div>
        <div className="jr-pick">
          <div className="jr-plab">대표 자리 방위</div>
          <div className="jr-pbtns">
            {DIR8.map((d, i) => (
              <button key={'dk' + i} type="button" className={'jr-pb' + (desk === i ? ' on desk' : '')}
                aria-pressed={desk === i} onClick={() => setDesk(i)}>{d}</button>
            ))}
          </div>
        </div>

        {harmony && (
          <div className={'jr-verd ' + harmony.level}>
            <b>{harmony.title}</b>
            <span>{harmony.body}</span>
            <em>{harmony.door.dir} {harmony.door.gua} · {harmony.desk.dir} {harmony.desk.gua}</em>
          </div>
        )}

        {me && advice && (
          <div className="jr-el">
            {me.name}께 모자란 기운은 <b style={{ color: OH_TEXT[me.el] }}>{OH_HANJA[me.el]}({OH_NAME[me.el]})</b>입니다 —
            {' '}자리는 <b>{advice.main.dir}</b>, 어려우면 <b>{advice.alt.dir}</b> 쪽이 낫습니다.
          </div>
        )}

        {me ? (
          <ul className="jr-bibo">
            {bibo.map((b, i) => (
              <li key={i}><b>{b.item}</b><span>{b.where}</span><em>{b.why}</em></li>
            ))}
          </ul>
        ) : (
          <Link className="jr-cta" href="/reading?cat=daepyo">
            생년월일 넣고 모자란 기운 채우기
            <small>30초 · 무료 · 자리와 물건까지 맞춰 드립니다</small>
          </Link>
        )}
      </section>

      {/* ── ② 옮길 자리 ── */}
      <section className="jr-sec">
        <h3 className="jr-h"><em>貳</em> 옮길 자리</h3>
        <p className="jr-lead">지금 사무실과 옮길 곳 주소를 넣으면 방위와 거리를 재 드립니다.</p>
        <label className="jr-fl"><span>지금 사무실</span>
          <input value={addrA} onChange={e => setAddrA(e.target.value)} placeholder="예) 대전 서구 둔산동 1420" />
        </label>
        <label className="jr-fl"><span>옮길 곳</span>
          <input value={addrB} onChange={e => setAddrB(e.target.value)} placeholder="예) 서울 강남구 테헤란로 152" />
        </label>
        <button type="button" className="jr-go" onClick={look} disabled={busy || !addrA.trim() || !addrB.trim()}>
          {busy ? '방위 재는 중…' : '방위 보기'}
        </button>
        {err && <div className="jr-err">{err}</div>}

        {verdict && ptA && ptB && (
          <div className={'jr-verd ' + verdict.level}>
            <b>
              {verdict.level === 'caution'
                ? `${verdict.dirName}쪽은 ${year}년에 조심하라 본 방면입니다`
                : verdict.level === 'good'
                  ? `${verdict.dirName}쪽은 대표님께 결이 맞습니다`
                  : `${verdict.dirName}쪽은 특별히 걸리는 것이 없습니다`}
            </b>
            <span>
              {ptA.matched} → {ptB.matched} · {verdict.dirName} {verdict.deg}° · {verdict.km}km
              {verdict.isDaejanggun && ' · 대장군방(大將軍方)'}
              {verdict.isSamsal && ' · 삼살방(三殺方)'}
              {verdict.clearYear && ` — 이 방면은 ${verdict.clearYear}년에 풀립니다.`}
            </span>
            <em>대장군방·삼살방은 예부터 조심하라 본 자리일 뿐, 못 간다는 뜻이 아닙니다. 판단은 대표님 몫으로 남깁니다.</em>
          </div>
        )}
      </section>

      {/* ── ③ 이사 택일 ── */}
      <section className="jr-sec">
        <h3 className="jr-h"><em>參</em> 옮기기 좋은 날</h3>
        <p className="jr-lead">앞으로 60일 중 건제십이신의 만(滿)·정(定)·성(成)·개(開)에 드는 날입니다.</p>
        <ul className="jr-days">
          {days.map(d => (
            <li key={d.ymd}>
              <span className="jd">{d.month}/{d.day}<em>{d.dow}</em></span>
              <span className="jk">{d.key}</span>
              <span className="jw"><b>{d.name}</b>{d.why}</span>
              <span className="jg">{d.ganji}</span>
            </li>
          ))}
        </ul>
      </section>

      {verdict && (
        <Link className="jr-cta pay" href={payHref}>
          자리 사주 정식 리포트 열기
          <small>지금 자리 진단 · 옮길 자리 판단 · 석 달 치 택일과 시진 · {won(CAT_INFO.ijeon.price)}</small>
        </Link>
      )}

      <p className="jr-disc">
        방위는 두 좌표의 대권 방위각으로 재고, 택일은 절기로 잡은 월지와 일지의 건제십이신으로 가립니다.
        주소와 좌표는 방위를 재는 그 순간에만 쓰고 어디에도 저장하지 않습니다.
      </p>
    </div>
  );
}

'use client';
// 식신생재 자리 판정. 검색해서 들어온 사람이 원하는 건 설명이 아니라 '내 경우가 어떤가'다.
// 그래서 생년월일 한 줄만 받고 바로 답을 낸다 — 가입도, 결제도 앞에 두지 않는다.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { chartFromInput } from '@/lib/preview';
import { migrateLegacy, peopleOf } from '@/lib/people';
import { judgeSiksin, type Slot } from '@/lib/siksin';

const LEVEL_CLASS: Record<string, string> = { clear: 'clear', yes: 'yes', weak: 'weak', none: 'none' };
const LEVEL_TAG: Record<string, string> = { clear: '뚜렷함', yes: '있음', weak: '약함', none: '없음' };

function Chips({ title, list, tone }: { title: string; list: Slot[]; tone: string }) {
  return (
    <div className="sk-grp">
      <span className="sk-gt">{title}</span>
      {list.length ? list.map((s, i) => (
        <span key={i} className={'sk-chip ' + tone}>{s.where} {s.ch} · {s.star}</span>
      )) : <span className="sk-chip none">없음</span>}
    </div>
  );
}

export default function SiksinCheck() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [noTime, setNoTime] = useState(true);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState<{ date: string; name: string; time: string | null; cal?: string; leap?: boolean } | null>(null);
  const [ran, setRan] = useState(false);

  // 저장된 대표가 있으면 다시 묻지 않는다.
  useEffect(() => {
    try {
      migrateLegacy();
      const p = peopleOf('self')[0];
      if (p?.date) setSaved({ date: p.date, name: (p.name || '').trim(), time: p.time ?? null, cal: p.cal, leap: !!p.leap });
    } catch { /* 저장소가 없어도 그냥 진행한다 */ }
  }, []);

  const chart = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    return chartFromInput(date, noTime ? null : (time || null), 'solar', false);
  }, [date, noTime, time]);

  const r = useMemo(() => (chart ? judgeSiksin(chart) : null), [chart]);

  function useSaved() {
    if (!saved) return;
    setDate(saved.date);
    setName(saved.name);
    if (saved.time) { setTime(saved.time); setNoTime(false); } else setNoTime(true);
    setRan(true);
  }

  return (
    <section className="sk-wrap">
      <h2 className="sk-h">내 사주에 식신생재가 서 있나</h2>
      <p className="sk-lead">생년월일만 넣으면 바로 봅니다. 가입도 결제도 필요 없습니다.</p>

      {saved && !ran && (
        <button type="button" className="sk-saved" onClick={useSaved}>
          저장해 두신 <b>{saved.name || '대표님'} · {saved.date}</b>으로 보기
        </button>
      )}

      <div className="sk-form">
        <label className="sk-fl"><span>생년월일 (양력)</span>
          <input type="date" value={date} min="1900-01-01" max="2100-12-31"
            onChange={e => { setDate(e.target.value); setRan(true); }} />
        </label>
        <label className="sk-fl"><span>태어난 시각</span>
          <div className="sk-trow">
            <button type="button" className={'sk-tb' + (noTime ? ' on' : '')} onClick={() => setNoTime(true)}>모릅니다</button>
            <button type="button" className={'sk-tb' + (!noTime ? ' on' : '')} onClick={() => setNoTime(false)}>압니다</button>
            {!noTime && <input type="time" value={time} onChange={e => setTime(e.target.value)} />}
          </div>
        </label>
      </div>

      {ran && !chart && date && <div className="sk-err">날짜를 다시 확인해 주세요.</div>}

      {r && (
        <div className={'sk-out ' + LEVEL_CLASS[r.level]}>
          <div className="sk-badge">{LEVEL_TAG[r.level]}</div>
          <h3>{r.headline}</h3>
          <p>{r.body}</p>

          <div className="sk-chips">
            <Chips title="식신" list={r.sik} tone="sik" />
            <Chips title="상관" list={r.sang} tone="sang" />
            <Chips title="재성" list={r.jae} tone="jae" />
          </div>

          <ul className="sk-notes">
            {r.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>

          <div className="sk-meter">
            일간을 <b>돕는 글자 {r.strength.help}</b> · <b>빼는 글자 {r.strength.drain}</b>
            <em>월지에 두 몫을 준 대략 눈금입니다. 격국을 제대로 잡는 계산은 아닙니다.</em>
          </div>

          <Link className="sk-cta" href={`/reading?cat=daepyo${date ? '&b=' + date : ''}${name ? '&n=' + encodeURIComponent(name) : ''}`}>
            이 구조로 어떻게 벌지 자세히 보기
            <small>대표 사주 · 그릇과 재물·사람까지 · 무료로 시작</small>
          </Link>
        </div>
      )}

      <p className="sk-disc">
        원국 여덟 글자만 보고 매긴 판정입니다. 대운·세운으로 들어오는 식상·재성은 여기 넣지 않았습니다 —
        지금 없다고 나와도 앞으로 서는 경우가 있고, 그 시점은 대표 사주에서 따로 봅니다.
      </p>
    </section>
  );
}

'use client';
// 십성 구조 판정. 검색해서 들어온 사람이 원하는 건 설명이 아니라 '내 경우가 어떤가'다.
// 그래서 생년월일 한 줄만 받고 바로 답을 낸다 — 가입도, 결제도 앞에 두지 않는다.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { chartFromInput } from '@/lib/preview';
import { migrateLegacy, peopleOf } from '@/lib/people';
import { verdictFor, PATTERN_LABEL, type Pattern } from '@/lib/sipsung';
import { type Slot } from '@/lib/siksin';

const TONE_CHIP = ['a', 'b', 'c'];

function Chips({ title, list, i }: { title: string; list: Slot[]; i: number }) {
  return (
    <div className="sk-grp">
      <span className="sk-gt">{title}</span>
      {list.length ? list.map((s, k) => (
        <span key={k} className={'sk-chip ' + TONE_CHIP[i]}>{s.where} {s.ch} · {s.star}</span>
      )) : <span className="sk-chip none">없음</span>}
    </div>
  );
}

export default function SipsungCheck({ pattern = 'siksin' }: { pattern?: Pattern }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [noTime, setNoTime] = useState(true);
  const [name, setName] = useState('');
  const [saved, setSaved] = useState<{ date: string; name: string; time: string | null } | null>(null);
  const [ran, setRan] = useState(false);

  // 저장된 대표가 있으면 다시 묻지 않는다.
  useEffect(() => {
    try {
      migrateLegacy();
      const p = peopleOf('self')[0];
      if (p?.date) setSaved({ date: p.date, name: (p.name || '').trim(), time: p.time ?? null });
    } catch { /* 저장소가 없어도 그냥 진행한다 */ }
  }, []);

  const chart = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    return chartFromInput(date, noTime ? null : (time || null), 'solar', false);
  }, [date, noTime, time]);

  const r = useMemo(() => (chart ? verdictFor(pattern, chart) : null), [chart, pattern]);
  const label = PATTERN_LABEL[pattern];

  function useSaved() {
    if (!saved) return;
    setDate(saved.date);
    setName(saved.name);
    if (saved.time) { setTime(saved.time); setNoTime(false); } else setNoTime(true);
    setRan(true);
  }

  return (
    <section className="sk-wrap">
      <h2 className="sk-h">내 사주가 {label}에 해당하나</h2>
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
        <div className={'sk-out ' + r.tone}>
          <div className="sk-badge">{r.tag}</div>
          <h3>{r.headline}</h3>
          <p>{r.body}</p>

          <div className="sk-chips">
            {r.groups.map((g, i) => <Chips key={g.title} title={g.title} list={g.list} i={i} />)}
          </div>

          {noTime && (
            <div className="sk-hint">
              태어난 시각을 빼고 여섯 글자만 보았습니다. 시각을 알면 두 글자가 더 붙어 <b>판정이 달라질 수 있습니다.</b>
            </div>
          )}

          <ul className="sk-notes">
            {r.notes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>

          <div className="sk-meter">
            일간이 버티는 힘 —
            {' '}<b className={r.strength.ryeong ? 'on' : ''}>득령 {r.strength.ryeong ? '○' : '×'}</b>
            {' '}<b className={r.strength.ji ? 'on' : ''}>득지 {r.strength.ji ? '○' : '×'}</b>
            {' '}<b className={r.strength.se ? 'on' : ''}>득세 {r.strength.se ? '○' : '×'}</b>
            <em>태어난 달·앉은 자리·나머지 글자 셋을 봅니다. 둘 이상이면 버틴다고 봅니다 — 격국을 제대로 잡는 계산은 아닙니다.</em>
          </div>

          <Link className="sk-cta" href={`/reading?cat=daepyo${date ? '&b=' + date : ''}${name ? '&n=' + encodeURIComponent(name) : ''}`}>
            이 구조로 어떻게 풀지 자세히 보기
            <small>대표 사주 · 그릇과 재물·사람까지 · 무료로 시작</small>
          </Link>
        </div>
      )}

      <p className="sk-disc">
        원국 여덟 글자만 보고 매긴 판정입니다. 대운·세운으로 들어오는 기운은 여기 넣지 않았습니다 —
        지금 없다고 나와도 앞으로 서는 경우가 있고, 그 시점은 대표 사주에서 따로 봅니다.
      </p>
    </section>
  );
}

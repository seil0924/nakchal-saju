'use client';
// 생년월일 한 줄 → 대표가 될 바탕(신호 다섯) + 어떤 대표가 맞는지(다섯 갈래). 가입·결제 없이 브라우저에서 바로 낸다.
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { chartFromInput } from '@/lib/preview';
import { judgeSajang } from '@/lib/sajang';

const DAY_SLUG = ['갑목', '을목', '병화', '정화', '무토', '기토', '경금', '신금', '임수', '계수'];

export default function SajangCheck() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [noTime, setNoTime] = useState(true);

  const chart = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const y = Number(date.slice(0, 4));
    if (y < 1900 || y > 2100) return null;
    return chartFromInput(date, noTime ? null : (time || null), 'solar', false);
  }, [date, noTime, time]);
  const r = useMemo(() => (chart ? judgeSajang(chart) : null), [chart]);

  return (
    <section className="sj-wrap">
      <div className="sj-form">
        <label className="sj-fl" htmlFor="sj-date"><span>생년월일 (양력)</span>
          <input id="sj-date" type="date" value={date} min="1900-01-01" max="2100-12-31" onChange={e => setDate(e.target.value)} />
        </label>
        <div className="sj-fl"><span>태어난 시각</span>
          <div className="sj-trow">
            <button type="button" className={'sj-tb' + (noTime ? ' on' : '')} onClick={() => setNoTime(true)}>모릅니다</button>
            <button type="button" className={'sj-tb' + (!noTime ? ' on' : '')} onClick={() => setNoTime(false)}>압니다</button>
            {!noTime && <input id="sj-time" type="time" value={time} onChange={e => setTime(e.target.value)} aria-label="태어난 시각" />}
          </div>
        </div>
      </div>

      {!r && <p className="sj-wait">날짜를 고르면 바로 아래에 나옵니다.</p>}

      {r && (
        <div className="sj-out">
          <div className="sj-q">대표가 될 사주일까</div>
          <h2 className="sj-verdict">{r.verdict}</h2>
          <p className="sj-count">신호 5개 중 <b>{r.passed}개</b>가 섰습니다</p>
          <p className="sj-body">{r.verdictBody}</p>
          <ul className="sj-sig">
            {r.signals.map(s => (
              <li key={s.key} className={s.ok ? 'ok' : 'no'}><b>{s.title}</b>{s.line}</li>
            ))}
          </ul>

          <div className="sj-q second">대표가 된다면</div>
          <h2 className="sj-type">{r.type.name}</h2>
          <p className="sj-body">{r.type.one}</p>
          <div className="sj-cols">
            <div><h3>이런 점이 강합니다</h3><ul>{r.type.strong.map(t => <li key={t}>{t}</li>)}</ul></div>
            <div><h3>이것만 챙기세요</h3><ul>{r.type.watch.map(t => <li key={t}>{t}</li>)}</ul></div>
          </div>
          <p className="sj-fit"><b>잘 맞는 판</b>{r.type.fit}</p>
          {r.second && <p className="sj-second">두 번째로 많은 기운은 <b>{r.second.name}</b> 쪽입니다. {r.second.one}</p>}

          {noTime && <p className="sj-hint">태어난 시각을 빼고 여섯 글자만 봤습니다. 시각을 넣으면 두 글자가 더 붙어 결과가 달라질 수 있습니다.</p>}

          <div className="sj-next">
            <Link className="sj-cta" href={`/reading?cat=daepyo&b=${date}`}>
              내 대표 그릇 자세히 보기
              <small>승부 기질, 재물, 사람 운까지 · 첫 장은 무료</small>
            </Link>
            <Link className="sj-link" href="/ceo">나와 명식이 닮은 세계적 CEO 찾기</Link>
            <Link className="sj-link" href={`/saju/${encodeURIComponent(DAY_SLUG[chart!.dGan] + '-일간')}`}>내 일간 {r.dayKo}{['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'][chart!.dGan]} 이야기 읽기</Link>
          </div>
        </div>
      )}
    </section>
  );
}

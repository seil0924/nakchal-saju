'use client';
// 생년월일 한 줄 → 대표가 될 바탕(신호 다섯) + 어떤 대표가 맞는지(다섯 갈래). 가입·결제 없이 브라우저에서 바로 낸다.
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { chartFromInput } from '@/lib/preview';
import { CAT_INFO } from '@/lib/report-categories';
import { won } from '@/lib/constants';
import { birthDateError, validBirthTime } from '@/lib/reading-input';
import { judgeSajang, type Group } from '@/lib/sajang';

const DAY_SLUG = ['갑목', '을목', '병화', '정화', '무토', '기토', '경금', '신금', '임수', '계수'];

const NEXT_QUESTION: Record<Group, string> = {
  bi: '내 추진력은 언제 강점이 되고, 언제 무리가 될까요?',
  sik: '아이디어를 실행하는 힘, 어디까지 직접 맡는 게 좋을까요?',
  jae: '기회를 알아보는 감각과 감당할 범위는 어떻게 나눌까요?',
  gwan: '책임감을 살리면서 혼자 짊어지지 않으려면 어떻게 할까요?',
  in: '꼼꼼한 검토가 실행을 늦추지 않으려면 어떻게 할까요?',
};

export default function SajangCheck() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [noTime, setNoTime] = useState(true);

  const effectiveTime = !noTime && validBirthTime(time) ? time : null;
  const chart = useMemo(() => {
    if (birthDateError(date)) return null;
    return chartFromInput(date, effectiveTime, 'solar', false);
  }, [date, effectiveTime]);
  const r = useMemo(() => (chart ? judgeSajang(chart) : null), [chart]);
  const readingHref = '/reading?' + new URLSearchParams({ cat: 'daepyo', from: 'sajang', b: date, cal: 'solar', ...(effectiveTime ? { time: effectiveTime } : {}) }).toString();

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

          {!effectiveTime && <p className="sj-hint">태어난 시각을 빼고 여섯 글자만 봤습니다. 시각을 넣으면 두 글자가 더 붙어 결과가 달라질 수 있습니다.</p>}

          <section className="sj-followup" aria-labelledby="sj-followup-title">
            <p className="sj-eye">내 유형에서 이어지는 질문</p>
            <h2 id="sj-followup-title">{NEXT_QUESTION[r.type.group]}</h2>
            <p><b>{r.type.name}</b>의 강점과 주의점을 살펴봤습니다. 같은 성향도 맡은 일과 상황에 따라 다르게 나타날 수 있습니다.</p>
            {r.second && <p className="sj-hint">함께 나타난 ‘{r.second.name}’ 성향도 한쪽으로 단정하지 않고 살펴보세요.</p>}
            <div className="sj-followup-details">
              <h3>대표 사주에서 더 살펴볼 내용</h3>
              <ul>
                <li>내 강점을 살리는 조건과 부담이 되는 상황</li>
                <li>함께 일할 때 역할과 책임을 나누는 방법</li>
                <li>서로 다른 성향을 이해하고 적용하는 방법</li>
              </ul>
            </div>
            <Link className="sj-cta" href={readingHref}>
              내 강점과 주의점 자세히 보기 →
              <small>무료 결과와 유료 풀이 일부부터 확인</small>
            </Link>
            <p className="sj-followup-note">기본 성향과 미리보기는 무료입니다. 전체 풀이와 구체적인 적용 방법은 {won(CAT_INFO.daepyo.price)} · 선택 시 1회 결제합니다.</p>
            <p className="sj-followup-note">생년월일{effectiveTime ? '과 태어난 시간' : ''}이 이어집니다. 다음 화면에서 성함을 입력하고 정보를 확인해주세요.</p>
          </section>
          <div className="sj-next">
            <Link className="sj-link" href="/ceo">나와 명식이 닮은 세계적 CEO 찾기</Link>
            <Link className="sj-link" href={`/saju/${encodeURIComponent(DAY_SLUG[chart!.dGan] + '-일간')}`}>내 일간 {r.dayKo}{['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'][chart!.dGan]} 이야기 읽기</Link>
          </div>
        </div>
      )}
    </section>
  );
}

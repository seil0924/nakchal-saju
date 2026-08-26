'use client';
// 한국어 택일 화면. 무엇을 하려는지 고르면 앞으로 석 달 중 맞는 날을 내놓는다.
// 피하는 날도 접어서 같이 둔다 — 겁주려는 게 아니라 왜 그날은 빼는지 보이려는 것이다.
// 계산은 lib/daypicker-en 하나만 쓴다(lib/taekil 이 그걸 감싸고 있다).
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { TAEKIL, OFFICER_KO, goodDays, badDays, taekilBySlug } from '@/lib/taekil';

const TONE = ['a', 'b', 'c', 'd'];

export default function TaekilPick({ slug, showTabs = false }: { slug: string; showTabs?: boolean }) {
  const [cur, setCur] = useState(slug);
  const today = useMemo(() => new Date(), []);
  const good = useMemo(() => goodDays(cur, today, 90), [cur, today]);
  const bad = useMemo(() => badDays(today, 90), [today]);
  const [openAvoid, setOpenAvoid] = useState(false);
  const t = taekilBySlug(cur);
  if (!t) return null;

  return (
    <section className="dp">
      {showTabs && (
        <div className="dp-pick">
          <span className="dp-lab">무엇을 하려는 날인가</span>
          <div className="dp-btns">
            {TAEKIL.map(x => (
              <button key={x.slug} type="button" className={'dp-b' + (cur === x.slug ? ' on' : '')}
                aria-pressed={cur === x.slug} onClick={() => setCur(x.slug)}>{x.kw.replace(' 택일', '')}</button>
            ))}
          </div>
        </div>
      )}

      <p className="dp-blurb">{t.pick} 오늘부터 90일을 봅니다.</p>

      <div className="dp-key">
        {t.good.map((o, i) => (
          <span key={o} className={'dp-chip ' + TONE[i]}>
            <b>{OFFICER_KO[o].hanja}</b> {OFFICER_KO[o].name}
          </span>
        ))}
      </div>

      {good.length === 0 && <p className="dp-blurb">앞으로 90일 안에는 해당하는 날이 없습니다.</p>}

      <ul className="dp-days">
        {good.map(d => (
          <li key={d.ymd} className={TONE[d.rank] || 'd'}>
            <span className="dd">{d.month}/{d.day}<em>{d.dow}</em></span>
            <span className="dh">{OFFICER_KO[d.officer].hanja}</span>
            <span className="dw"><b>{OFFICER_KO[d.officer].name}</b>{OFFICER_KO[d.officer].gist}</span>
            <span className="dg">{d.ganji}</span>
          </li>
        ))}
      </ul>

      <button type="button" className="dp-toggle" onClick={() => setOpenAvoid(v => !v)} aria-expanded={openAvoid}>
        피하는 날 {bad.length}일 {openAvoid ? '접기' : '펼쳐 보기'}
      </button>

      {openAvoid && (
        <ul className="dp-days avoid">
          {bad.map(d => (
            <li key={d.ymd}>
              <span className="dd">{d.month}/{d.day}<em>{d.dow}</em></span>
              <span className="dh">{OFFICER_KO[d.officer].hanja}</span>
              <span className="dw"><b>{OFFICER_KO[d.officer].name}</b>{OFFICER_KO[d.officer].gist}</span>
              <span className="dg">{d.ganji}</span>
            </li>
          ))}
        </ul>
      )}

      <Link className="dp-cta" href={t.cta.href}>{t.cta.label}<em>{t.cta.note}</em></Link>

      <p className="dp-disc">
        달은 그날이 든 <b>절기</b> 구간으로 가르고, 그 구간에 일지를 견주어 건제십이신을 냅니다.
        절기 시각은 표에서 읽지 않고 태양 황경으로 직접 계산합니다. 책력의 셈법이지 예언이 아닙니다 —
        계약 조건과 비용과 사람이 먼저이고, 이건 그 위에 얹는 참고입니다.
      </p>
    </section>
  );
}


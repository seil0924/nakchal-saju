'use client';
// "대표님은 사업을 해도 되는 사주일까요?" — 거장 사주 페이지 끝의 입구(2026-10-21).
// 거장 명식을 다 보여 준 뒤, 같은 자리에서 내 명식으로 넘어오게 한다.
// 다른 화면으로 보내 다시 입력시키면 검색으로 온 사람은 떠난다. 여기서 견주고, 결과에서 무료 명식으로 잇는다.
import { useState } from 'react';
import Link from 'next/link';
import DateSelect from '@/app/_components/DateSelect';
import { josa } from '@/lib/josa';
import './person.css';

type Row = { key: string; label: string; me: string; them: string; same: boolean };
type Res = {
  myPills: string; type: string; year: number;
  verdict: { key: string; title: string; body: string; jae: number; power: number; sik: number; gwan: number; str?: { ryeong: boolean; ji: boolean; se: boolean } };
  total: number; top: { label: string; score: number }[]; hidden: number;
  vs: { count: number; rows: Row[]; rank?: number; total?: number } | null;
};

// 득령(태어난 달)·득지(앉은 자리)·득세(나머지 글자) — 둘 이상 얻으면 신강으로 본다(lib/siksin strengthOf).
function strText(st?: { ryeong: boolean; ji: boolean; se: boolean }) {
  if (!st) return '';
  const got = [st.ryeong && '득령', st.ji && '득지', st.se && '득세'].filter(Boolean) as string[];
  return got.length ? `${got.join('·')} (${got.length}/3)` : '없음 (0/3)';
}

export default function BizCheck({ name, tycoon }: { name: string; tycoon: string }) {
  const [birth, setBirth] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [res, setRes] = useState<Res | null>(null);

  async function go() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) { setErr('생년월일을 골라주세요.'); return; }
    setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/biz-check', { method: 'POST', body: JSON.stringify({ birth, tycoon }) });
      if (!r.ok) throw new Error();
      setRes(await r.json());
      setTimeout(() => document.getElementById('bz-res')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    } catch { setErr('결과를 뽑지 못했습니다. 잠시 뒤에 다시 눌러주세요.'); }
    setBusy(false);
  }

  const v = res?.verdict;
  return (
    <section className="tw" aria-labelledby="bz-h">
      <p className="tw-kick">{name}의 명식을 보셨다면, 이제 대표님 차례입니다</p>
      <h2 id="bz-h" className="tw-h">대표님은 사업을 해도 되는 사주일까요?</h2>
      <p className="tw-sub">생년월일만 넣으면 버는 방식과 사업 그릇 점수, {name}{josa(name, '와')} 닮은 정도가 바로 나옵니다. 가입 없이 무료입니다.</p>
      <div className="tw-form">
        <DateSelect value={birth} onChange={setBirth} yearFrom={1930} yearTo={2012} />
        <button type="button" className="tw-go" onClick={go} disabled={busy}>{busy ? '계산하는 중' : '내 사주로 보기'}</button>
      </div>
      {err && <p className="tw-err" role="alert">{err}</p>}

      {res && v && (
        <div id="bz-res" className="tw-res" aria-live="polite">
          <p className="bz-lab">대표님은</p>
          <p className="bz-title">{v.title}</p>
          <p className="tw-note">{v.body}</p>
          <p className="bz-why">근거: 재성(돈을 다루는 기운) {v.jae}개 · 일간이 얻은 힘 {strText(v.str)} · 비겁·인성 {v.power}개 · 식상 {v.sik}개 · 관성 {v.gwan}개 <span>태어난 시를 빼고 다섯 글자로 셌습니다. 일간의 힘은 득령·득지·득세 가운데 몇 개를 얻었는지로 봅니다</span></p>

          <div className="bz-score">
            <div><b>{res.total}</b><span>/ 30</span></div>
            <em>{res.year}년 사업 그릇 점수 · 6대 축 합계</em>
          </div>
          <ul className="bz-axes">
            {res.top.map(a => (
              <li key={a.label}><span>{a.label}</span><i><em style={{ width: `${a.score * 20}%` }} /></i><b>{a.score}/5</b></li>
            ))}
            <li className="lock"><span>나머지 {res.hidden}개 축</span><i /><b>무료 리포트에서</b></li>
          </ul>

          {res.vs && (
            <div className="bz-vs">
              <p className="bz-vs-h">{name}{josa(name, '와')} 겹치는 부호 <b>{res.vs.count}</b>/6{res.vs.rank ? ` · 거장 ${res.vs.total}명 중 ${res.vs.rank}번째` : ''}</p>
              <ul className="tw-rows">
                {res.vs.rows.map(r => (
                  <li key={r.key} className={r.same ? 'on' : ''}>
                    <span className="tw-l">{r.label}</span>
                    <span className="tw-v">대표님 {r.me} · {name} {r.them}</span>
                    <span className="tw-m">{r.same ? '같음' : '다름'}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="tw-note">대표님 일주는 <b>{res.myPills}</b>, 대표 유형은 <b>{res.type}</b>입니다.</p>
          <Link className="tw-cta" href={`/reading?cat=daepyo&b=${birth}`}>
            내 명식 전체 무료로 보기
            <small>방금 넣은 생년월일 그대로 · 6대 축 전체와 대표 유형까지</small>
          </Link>
        </div>
      )}
    </section>
  );
}

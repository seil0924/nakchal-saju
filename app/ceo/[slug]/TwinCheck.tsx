'use client';
// 거장 상세 페이지 안에서 바로 견주기(2026-10-21).
// "스티브 잡스 사주"를 검색해 들어온 사람에게 [나와 닮은 CEO 찾기]로 다른 화면을 띄우면,
// 거기서 생년월일을 다시 넣어야 해서 대부분 떠났다. 그 자리에서 견주고, 결과에서 무료 명식으로 넘긴다.
import { useState } from 'react';
import Link from 'next/link';
import DateSelect from '@/app/_components/DateSelect';
import { josa } from '@/lib/josa';

type Row = { key: string; label: string; me: string; them: string; same: boolean };
type Res = {
  myPills: string; type: string;
  tycoon: { name: string }; count: number;
  vs: { name: string; count: number; rows: Row[]; rank: number; total: number } | null;
};

export default function TwinCheck({ name, slugOf }: { name: string; slugOf: Record<string, string> }) {
  const [birth, setBirth] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [res, setRes] = useState<Res | null>(null);

  async function go() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birth)) { setErr('생년월일을 골라주세요.'); return; }
    setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/twin', { method: 'POST', body: JSON.stringify({ birth, cal: 'solar', target: name }) });
      if (!r.ok) throw new Error();
      setRes(await r.json());
    } catch { setErr('결과를 뽑지 못했습니다. 잠시 뒤에 다시 눌러주세요.'); }
    setBusy(false);
  }

  const vs = res?.vs;
  const best = res && res.tycoon.name !== name ? res.tycoon.name : null;

  return (
    <section className="tw" aria-labelledby="tw-h">
      <h2 id="tw-h" className="tw-h">대표님은 {name}{josa(name, '와')} 얼마나 닮았을까</h2>
      <p className="tw-sub">생년월일만 넣으면 여섯 가지 부호를 하나씩 견줍니다. 가입 없이 바로 나옵니다.</p>
      <div className="tw-form">
        <DateSelect value={birth} onChange={setBirth} yearFrom={1930} yearTo={2012} />
        <button type="button" className="tw-go" onClick={go} disabled={busy}>{busy ? '견주는 중' : '견줘 보기'}</button>
      </div>
      {err && <p className="tw-err" role="alert">{err}</p>}

      {vs && (
        <div className="tw-res" aria-live="polite">
          <div className="tw-score">
            <b>{vs.count}</b><span>/ 6 겹침</span>
            <em>거장 {vs.total}명 중 {vs.rank}번째로 닮았습니다</em>
          </div>
          <ul className="tw-rows">
            {vs.rows.map(r => (
              <li key={r.key} className={r.same ? 'on' : ''}>
                <span className="tw-l">{r.label}</span>
                <span className="tw-v">대표님 {r.me} · {name} {r.them}</span>
                <span className="tw-m">{r.same ? '같음' : '다름'}</span>
              </li>
            ))}
          </ul>
          <p className="tw-note">대표님 일주는 <b>{res!.myPills}</b>, 유형은 <b>{res!.type}</b>입니다.
            {best && <> 100명 중에서는 <Link href={`/ceo/${slugOf[best] || ''}`}>{best}</Link>{josa(best, '와')} 가장 닮았습니다({res!.count}가지).</>}
          </p>
          <Link className="tw-cta" href={`/reading?cat=daepyo&b=${birth}`}>
            내 명식 전체 무료로 보기
            <small>방금 넣은 생년월일 그대로 · 명식과 오행·대표 유형까지</small>
          </Link>
        </div>
      )}
    </section>
  );
}

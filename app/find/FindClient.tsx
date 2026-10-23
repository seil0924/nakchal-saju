'use client';
import { useState } from 'react';
import Link from 'next/link';
import { setTok } from '@/lib/rtok';

type Found = { reports: { id: string; item: string; paidAt: string | null }[]; pass: boolean };
const day = (iso: string | null) => (iso ? new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso)) : '');

export default function FindClient() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [found, setFound] = useState<Found | null>(null);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    setErr(''); setFound(null); setBusy(true);
    try {
      const r = await fetch('/api/report/find', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, phone }) });
      const j = await r.json();
      if (!r.ok) { setErr(j?.message || '찾지 못했습니다. 잠시 뒤 다시 해 주세요.'); return; }
      // 토큰 칸이 없는 리포트는 주소가 열쇠다. 이 브라우저에도 남겨 다음에 바로 열리게.
      for (const x of j.reports as Found['reports']) setTok(x.id, x.id);
      setFound(j);
    } catch { setErr('찾지 못했습니다. 잠시 뒤 다시 해 주세요.'); }
    finally { setBusy(false); }
  }

  return (
    <>
      <form className="card fd-form" onSubmit={go}>
        <label htmlFor="fd-name">성함</label>
        <input id="fd-name" value={name} onChange={e => setName(e.target.value)} maxLength={20} autoComplete="name" placeholder="결제 때 넣은 성함" required />
        <label htmlFor="fd-phone">휴대폰 번호</label>
        <input id="fd-phone" value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" required />
        {err && <div className="errbox" role="alert">{err}</div>}
        <button type="submit" className="ct-go" disabled={busy}>{busy ? '찾는 중' : '구매한 리포트 찾기'}</button>
        <p className="ct-note">성함과 번호가 둘 다 맞아야 열립니다. 같은 곳에서 한 시간에 10번까지 찾을 수 있습니다.</p>
      </form>

      {found && (
        <div className="card fd-res" aria-live="polite">
          {found.reports.length === 0 && !found.pass ? (
            <p>이 성함과 번호로 결제한 기록이 없습니다. 결제 때 넣은 그대로인지 확인해 주시고, 그래도 없으면 <Link href="/contact">이메일 문의</Link>로 알려 주세요.</p>
          ) : (
            <>
              {found.pass && <p className="fd-pass">발주처 프리미엄 패스가 있습니다. 이 기기에서도 핵심 발주처 상세가 열립니다.</p>}
              <ul className="fd-list">
                {found.reports.map(x => (
                  <li key={x.id}><Link href={`/report/${x.id}`}><b>{x.item}</b><span>{day(x.paidAt)} 결제 · 열기 ›</span></Link></li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </>
  );
}

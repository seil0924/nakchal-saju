'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { setTok } from '@/lib/rtok';
import { recordReport } from '@/lib/vault';
import { buyerInputError } from '@/lib/buyer-input';
import { requestJSON } from '@/lib/purchase-client';
import '@/app/_components/checkout.css';

type Found = { reports: { id: string; item: string; paidAt: string | null; token?: string }[]; pass: boolean };
const day = (iso: string | null) => (iso ? new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso)) : '');

export default function FindClient() {
  const sending = useRef(false);
  const results = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [found, setFound] = useState<Found | null>(null);

  async function go(e: React.FormEvent) {
    e.preventDefault();
    if (sending.current) return;
    const inputError = buyerInputError(name, phone);
    if (inputError) { setErr(inputError); return; }
    sending.current = true; setErr(''); setFound(null); setBusy(true);
    try {
      const { ok, data: j } = await requestJSON('/api/report/find', { name, phone });
      if (!ok) { setErr(j?.message || '구매 기록을 불러오지 못했습니다. 연결을 확인하고 다시 찾아주세요.'); return; }
      // 토큰 칸이 없는 리포트는 주소가 열쇠다. 이 브라우저에도 남겨 다음에 바로 열리게.
      for (const x of j.reports as Found['reports']) {
        setTok(x.id, x.token || x.id);
        recordReport({ id: x.id, label: x.item, when: x.paidAt ? new Date(x.paidAt).getTime() : Date.now(), unlocked: true });
      }
      setFound(j); requestAnimationFrame(() => { results.current?.focus(); results.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); });
    } catch { setErr('찾지 못했습니다. 잠시 뒤 다시 해 주세요.'); }
    finally { setBusy(false); sending.current = false; }
  }

  return (
    <>
      <form className="card fd-form" onSubmit={go}>
        <p className="checkout-help">① 결제 당시 정보 입력 → ② 구매 기록 확인 → ③ 리포트 열기</p><label htmlFor="fd-name">결제할 때 입력한 성함</label>
        <input id="fd-name" disabled={busy} value={name} onChange={e => setName(e.target.value)} maxLength={20} autoComplete="name" placeholder="결제 때 넣은 성함" required />
        <label htmlFor="fd-phone">휴대폰 번호</label>
        <input id="fd-phone" disabled={busy} value={phone} onChange={e => setPhone(e.target.value)} type="tel" maxLength={24} inputMode="tel" autoComplete="tel" placeholder="010-0000-0000" required />
        {err && <div className="errbox" role="alert">{err}</div>}
        <button type="submit" className="ct-go" disabled={busy}>{busy ? '찾는 중' : '구매한 리포트 찾기'}</button>
        <p className="ct-note">성함과 번호가 둘 다 맞아야 열립니다. 가입·로그인·추가 결제 없이 찾습니다. 조회는 한 시간에 10번까지 가능합니다.</p>
      </form>

      {found && (
        <div className="card fd-res" aria-live="polite" ref={results} tabIndex={-1}>
          {found.reports.length === 0 && !found.pass ? (
            <><h2>일치하는 구매 기록을 찾지 못했습니다</h2><p>풀이 대상의 성함이 아니라 결제할 때 입력한 구매자 성함과 번호인지 확인해주세요. 결제 직후라면 잠시 후 다시 찾아주세요.</p><p>카드 승인 내역은 있는데 계속 보이지 않으면 <Link href="/contact">결제 내역 문의하기</Link>를 이용해주세요. 다시 결제할 필요는 없습니다.</p></>
          ) : (
            <>
              <h2>구매 기록을 찾았습니다</h2><p>아래 항목을 누르면 열립니다. 찾은 리포트는 이 기기의 보관함에도 남습니다.</p>
              {found.pass && <p className="fd-pass">발주처 프리미엄 패스를 찾았습니다. <Link href="/balju">발주처 상세 보러 가기 →</Link></p>}
              <ul className="fd-list">
                {found.reports.map(x => (
                  <li key={x.id}><Link href={`/report/${x.id}?t=${encodeURIComponent(x.token || x.id)}`}><b>{x.item}</b><span>{day(x.paidAt)} 구매 · 리포트 다시 보기 ›</span></Link></li>
                ))}
              </ul><Link href="/vault">이 기기 보관함으로 →</Link>
            </>
          )}
        </div>
      )}
    </>
  );
}

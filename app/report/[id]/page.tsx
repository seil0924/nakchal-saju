'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PRICE_FIRST, PRICE_REGULAR, won } from '@/lib/constants';
import { markUnlocked } from '@/lib/vault';
import WonGuk, { type Pillar } from '@/app/_components/WonGuk';

type Section = { mk: string; free: boolean; t: string; html: string };
type Result = { reportId: string; title: string; unlocked: boolean; wonguk?: Pillar[]; hero?: any; gauge?: any; sections: Section[] };

export default function ReportView({ params }: { params: { id: string } }) {
  const id = params.id;
  const [res, setRes] = useState<Result | null>(null);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [consent, setConsent] = useState(false);
  const unlocked = !!res?.unlocked;

  async function load() {
    const r = await fetch('/api/report/get?id=' + id);
    if (!r.ok) { setErr('리포트를 찾을 수 없습니다.'); return; }
    setRes(await r.json());
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function pay() {
    if (!consent) { setErr('결제 전 안내에 동의해 주세요.'); return; }
    setErr(''); setBusy(true);
    try {
      const prep = await fetch('/api/payment/prepare', { method: 'POST', body: JSON.stringify({ reportId: id }) }).then(x => x.json());
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID, channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
      if (storeId && channelKey) {
        const PortOne = (await import('@portone/browser-sdk/v2')).default;
        const r = await PortOne.requestPayment({ storeId, channelKey, paymentId: prep.paymentId, orderName: prep.orderName ?? '낙찰사주 전체 리포트', totalAmount: prep.amount, currency: 'CURRENCY_KRW', payMethod: 'EASY_PAY' });
        if (r?.code) { setBusy(false); setErr('결제가 취소되었습니다.'); return; }
      } else {
        await fetch('/api/payment/mock-confirm', { method: 'POST', body: JSON.stringify({ paymentId: prep.paymentId }) });
      }
      await new Promise(r => setTimeout(r, 500));
      await load(); markUnlocked(id); setModal(false);
    } catch { setErr('결제 확인에 실패했습니다.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="app">
      <div className="hero"><div className="k">運 七 技 三</div><h1>보관된 리포트</h1>
        <p><Link href="/vault" style={{ color: '#c3cfe3', textDecoration: 'underline' }}>← 보관함</Link></p></div>
      <div className="wrap">
        {err && <div className="errbox">{err}</div>}
        {res && (
          <div>
            {res.wonguk && res.wonguk.length > 0 && <WonGuk p={res.wonguk} />}
            {res.hero && (
              <div className="rhero">
                <div className="hl" dangerouslySetInnerHTML={{ __html: res.hero.headline }} />
                <div className="num" style={{ color: res.hero.up ? 'var(--gold2)' : '#e88' }}>{res.hero.score}<span style={{ fontSize: 20 }}>점</span></div>
                <div className="lab">{res.hero.label}</div><div className="sub2">{res.hero.sub}</div>
              </div>
            )}
            <div className="rephd">{res.title}</div>
            <div className="print-only pfoot" style={{ display: 'none' }}>낙찰사주 · 士가 읽는 사주·사정률 리포트 · 명리 기반 참고 정보</div>
            {res.sections.map((sec, i) => {
              const open = sec.free || (unlocked && sec.html);
              const locked = !sec.free && !unlocked;
              return (
                <div key={i} className={'sec ' + (open ? 'open' : '') + (locked ? ' locked' : '')}>
                  <div className="hd"><div className="mk">{sec.mk}</div><div className="ti">{sec.t}</div>
                    {sec.free ? <span className="lb free">무료</span> : unlocked ? <span className="lb free">열림</span> : <span className="lb">🔒</span>}<div className="cv">▾</div></div>
                  <div className="bd">{sec.html ? <div dangerouslySetInnerHTML={{ __html: sec.html }} /> : <p style={{ color: '#a99f88' }}>🔒 결제 후 열람 가능한 섹션입니다.</p>}</div>
                </div>
              );
            })}
            {!unlocked && <div className="cta" onClick={() => { setErr(''); setModal(true); }}>잠긴 리포트 전체 열기<small>잠긴 섹션 + 소수점 정밀 사정률까지 · 첫 열람만 {won(PRICE_FIRST)}</small></div>}
            {unlocked && res.gauge?.precise && <div className="unlocked-note">✓ 결제 확인됨 · 소수점 정밀 사정률 <b>{res.gauge.precise}%</b></div>}
            <button className="sharebtn no-print" style={{ marginTop: 12 }} onClick={() => window.print()}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z" /></svg>
              PDF로 내보내기 · 저장
            </button>
            {!unlocked && <div className="no-print" style={{ textAlign: 'center', fontSize: 11.5, color: '#a99f88', marginTop: 6 }}>전체 리포트를 열면 잠긴 섹션까지 담아 PDF로 저장됩니다</div>}
          </div>
        )}
        {!res && !err && <div style={{ textAlign: 'center', color: '#a99f88', padding: 30 }}>불러오는 중…</div>}
      </div>

      {modal && (
        <div className="modal on" onClick={e => { if ((e.target as HTMLElement).classList.contains('modal')) setModal(false); }}>
          <div className="sheet">
            <div className="grip" /><h3>전체 리포트 잠금 해제</h3>
            <div className="price"><span className="p">{won(PRICE_FIRST)}</span><span className="o">{won(PRICE_REGULAR)}</span></div>
            <div className="plan">첫 열람 특가 · 전체 섹션 + 소수점 정밀값</div>
            <div className="pay kakao on2">카카오페이</div><div className="pay toss">토스페이</div><div className="pay">신용/체크카드</div>
            <label className="consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>결제 및 <Link href="/terms" className="legal-link">이용약관</Link>·<Link href="/privacy" className="legal-link">개인정보처리방침</Link>에 동의합니다.</span></label>
            {err && <div className="errbox">{err}</div>}
            <button className="paygo" onClick={pay} disabled={busy}>{busy ? '결제 처리중…' : `${won(PRICE_FIRST)} 결제하기`}</button>
            <div className="mclose" onClick={() => setModal(false)}>다음에 볼게요</div>
          </div>
        </div>
      )}
    </div>
  );
}

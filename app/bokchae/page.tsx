'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { won } from '@/lib/constants';
import { preloadKcp } from '@/app/_components/kcpPay';
import { startPurchase, PurchaseError } from '@/lib/purchase-client';
import { paymentReturnState } from '@/lib/payment-status';
import PaymentReturnNotice from '@/app/_components/PaymentReturnNotice';
import SiteTop from '@/app/_components/SiteTop';

// 복채(福債) — 홈 최하단에만 조용히 두는 자율 감사·기원 결제. 리포트/결제 흐름엔 등장하지 않는다.
const PRESETS = [50000, 100000, 200000, 500000, 1000000];

export default function Bokchae() {
  return <Suspense fallback={null}><BokchaeForm /></Suspense>;
}

function BokchaeForm() {
  useEffect(() => { preloadKcp(); }, []);
  const [amt, setAmt] = useState(0);
  const [custom, setCustom] = useState(false); // '직접' 입력 모드
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const search = useSearchParams();
  const returnState = paymentReturnState(search.get('paid'), search.get('why'));
  const recovery = returnState === 'pending';
  const paying = useRef(false);

  async function pay(amount: number) {
    if (!amount || paying.current || recovery) return;
    paying.current = true;
    setBusy(true); setErr('');
    try {
      const outcome = await startPurchase({ bokchae: true, amount });
      if (outcome === 'redirect') return;
      if (outcome === 'cancelled') { setErr('복채 결제창을 닫았습니다. 승인 알림을 받았다면 다시 결제하지 말고 결제 문의를 이용해주세요.'); return; }
      setDone(true);
    } catch (e) {
      if (!(e instanceof PurchaseError) || e.recover) {
        // Preserve uncertainty on reload, too; closing guidance must not re-enable payment.
        const url = new URL(window.location.href);
        url.searchParams.set('paid', '0'); url.searchParams.set('why', 'approve_unknown');
        window.history.replaceState(null, '', url.pathname + url.search);
      } else setErr(e.message);
    }
    finally { setBusy(false); paying.current = false; }
  }

  return (
    <div className="app bokpage">
      <SiteTop />
      <video className="bokbg" autoPlay muted loop playsInline poster="/bokchae-bg-poster.jpg">
        <source src="/bokchae-bg.mp4" type="video/mp4" />
      </video>
      <div className="bokscrim" />
      <div className="bokwrap">
        {done ? (
          <div className="bokdone">
            <div className="bdseal">印</div>
            <h1>복채, 잘 받았습니다</h1>
            <p>대표님의 마음을 인장으로 새겨 두었습니다.<br />비워 채운 그 자리에, 더 큰 복이 깃들기를 바랍니다.</p>
            <Link className="bokback" href="/">← 홈으로</Link>
          </div>
        ) : (
          <>
            <div className="bokseal">福</div>
            <div className="bokkick">福 債</div>
            <h1>복채 청산</h1>
            <div className="bokrule" />
            <p className="boklead">
              명리에서 복채는 이용료가 아니라, 받은 운(福)에 스스로 치르는 마음입니다.
              이곳의 풀이가 대표님의 한 해에 닿았다면: 그 마음만큼 조용히 놓고 가세요.
              정해진 값은 없습니다.
            </p>
            {returnState && <PaymentReturnNotice state={returnState} bokchae />}
            <div className="bokamts">
              {PRESETS.map(a => (
                <button key={a} className={'bokamt' + (!custom && amt === a ? ' on' : '')} onClick={() => { setCustom(false); setAmt(a); }}>{won(a)}</button>
              ))}
              <button className={'bokamt' + (custom ? ' on' : '')} onClick={() => { setCustom(true); setAmt(0); }}>직접</button>
            </div>
            {custom && (
              <input className="bokcustom" type="number" min={1000} max={1000000} step={1000} placeholder="복채 금액 (원)" autoFocus
                value={amt || ''}
                onChange={e => setAmt(Math.max(0, Math.min(1000000, Math.floor(+e.target.value) || 0)))} />
            )}
            {err && <div className="errbox" style={{ marginTop: 12 }}>{err}</div>}
            <button className="bokgo" disabled={busy || recovery || amt <= 0} onClick={() => pay(amt)}>
              {recovery ? '추가 결제 전에 승인 내역을 확인해주세요' : busy ? '결제 결과 확인 중…' : amt > 0 ? `복채 ${won(amt)} 올립니다 · 印` : '금액을 골라주세요'}
            </button>
            <div className="boknote">복채는 리포트 열람과 무관한 자율 결제입니다. 재미로 보는 명리 기반 서비스에 대한 감사·기원의 표시일 뿐, 특정한 효과를 보장하지 않습니다.</div>
            <Link className="bokback" href="/">← 홈으로</Link>
          </>
        )}
      </div>
    </div>
  );
}

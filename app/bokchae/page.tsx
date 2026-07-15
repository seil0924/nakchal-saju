'use client';
import { useState } from 'react';
import Link from 'next/link';
import { won } from '@/lib/constants';
import { openKcpPay, KCP_CLIENT_ENABLED } from '@/app/_components/kcpPay';

// 복채(福債) — 홈 최하단에만 조용히 두는 자율 감사·기원 결제. 리포트/결제 흐름엔 등장하지 않는다.
const PRESETS = [50000, 100000, 200000, 500000, 1000000];

export default function Bokchae() {
  const [amt, setAmt] = useState(0);
  const [custom, setCustom] = useState(false); // '직접' 입력 모드
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function pay(amount: number) {
    if (!amount) return;
    setBusy(true); setErr('');
    try {
      const prep = await fetch('/api/payment/prepare', { method: 'POST', body: JSON.stringify({ bokchae: true, amount }) }).then(x => x.json());
      if (KCP_CLIENT_ENABLED) {
        const kres = await openKcpPay({ paymentId: prep.paymentId, amount: prep.amount, goodName: prep.orderName ?? '낙찰사주 복채' });
        if (kres === 'redirect') return;
        if (!kres) { setBusy(false); setErr('복채 결제가 취소되었습니다.'); return; }
        const ap = await fetch('/api/payment/kcp/approve', { method: 'POST', body: JSON.stringify({ paymentId: prep.paymentId, enc_data: kres.enc_data, enc_info: kres.enc_info, tran_cd: kres.tran_cd }) }).then(x => x.json());
        if (!ap?.ok) { setBusy(false); setErr('복채 결제 승인에 실패했습니다. 다시 시도해 주세요.'); return; }
      } else {
        await fetch('/api/payment/mock-confirm', { method: 'POST', body: JSON.stringify({ paymentId: prep.paymentId }) });
      }
      setDone(true);
    } catch { setErr('결제 확인에 실패했습니다. 결제되었다면 잠시 후 반영됩니다.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="app bokpage">
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
              명리에서 복채(福債)는 이용료가 아니라, 받은 운(福)에 스스로 치르는 마음입니다.
              이곳의 풀이가 대표님의 한 해에 닿았다면 — 그 마음만큼 조용히 놓고 가십시오.
              정해진 값은 없습니다.
            </p>
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
            <button className="bokgo" disabled={busy || amt <= 0} onClick={() => pay(amt)}>
              {busy ? '올리는 중…' : amt > 0 ? `복채 ${won(amt)} 올립니다 · 印` : '금액을 골라주세요'}
            </button>
            <div className="boknote">복채는 리포트 열람과 무관한 자율 결제입니다. 재미로 보는 명리 기반 서비스에 대한 감사·기원의 표시일 뿐, 특정한 효과를 보장하지 않습니다.</div>
            <Link className="bokback" href="/">← 홈으로</Link>
          </>
        )}
      </div>
    </div>
  );
}

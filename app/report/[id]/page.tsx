'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { openKcpPay, KCP_CLIENT_ENABLED } from '@/app/_components/kcpPay';
import { won } from '@/lib/constants';
import { markUnlocked } from '@/lib/vault';
import { CAT_INFO, isCatKey, productOfMk } from '@/lib/report-categories';
import WonGuk, { type Pillar } from '@/app/_components/WonGuk';
import YearBar from '@/app/_components/YearBar';

type Section = { mk: string; free: boolean; tier: 'free' | 'taekil' | 'full'; t: string; html: string; teaser?: string };
type Result = { reportId: string; title: string; unlocked: boolean; level?: number; cat?: string | null; wonguk?: Pillar[]; hero?: any; gauge?: any; sections: Section[]; meta?: { chapters: number; items: number }; selYear?: number; seun?: { hanja: string; rel: string; tilt: number } };
const RANK: Record<string, number> = { free: 0, taekil: 1, full: 2 };

export default function ReportView({ params }: { params: { id: string } }) {
  const id = params.id;
  const [res, setRes] = useState<Result | null>(null);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [consent, setConsent] = useState(false);
  const [sku, setSku] = useState<'taekil' | 'full'>('full');
  const [seal, setSeal] = useState(false);
  const [sticky, setSticky] = useState(false);
  const level = res?.level ?? (res?.unlocked ? 2 : 0);
  const catInfo = isCatKey(res?.cat) ? CAT_INFO[res!.cat as string] : null;

  useEffect(() => {
    const on = () => {
      const el = document.getElementById('rep');
      if (!el) { setSticky(false); return; }
      setSticky(el.getBoundingClientRect().top < -420);
    };
    window.addEventListener('scroll', on, { passive: true }); on();
    return () => window.removeEventListener('scroll', on);
  }, [res, level]);

  async function load() {
    const r = await fetch('/api/report/get?id=' + id);
    if (!r.ok) { setErr('리포트를 찾을 수 없습니다.'); return; }
    setRes(await r.json());
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function switchYear(y: number) {
    if (busy) return; setBusy(true);
    try { const r = await fetch(`/api/report/get?id=${id}&year=${y}`); if (r.ok) { const d = await r.json(); if (d?.sections) setRes(prev => (prev ? { ...prev, ...d } : d)); } }
    catch {} finally { setBusy(false); }
  }

  async function pay(chosen: 'taekil' | 'full') {
    if (!consent) { setErr('결제 전 안내에 동의해 주세요.'); return; }
    setErr(''); setBusy(true);
    try {
      const prep = await fetch('/api/payment/prepare', { method: 'POST', body: JSON.stringify({ reportId: id, sku: chosen }) }).then(x => x.json());
      if (KCP_CLIENT_ENABLED) {
        const kres = await openKcpPay({ paymentId: prep.paymentId, amount: prep.amount, goodName: prep.orderName ?? '낙찰사주 리포트' });
        if (kres === 'redirect') return;
        if (!kres) { setBusy(false); setErr('결제가 취소되었습니다.'); return; }
        const ap = await fetch('/api/payment/kcp/approve', { method: 'POST', body: JSON.stringify({ paymentId: prep.paymentId, enc_data: kres.enc_data, enc_info: kres.enc_info, tran_cd: kres.tran_cd }) }).then(x => x.json());
        if (!ap?.ok) { setBusy(false); setErr('결제 승인에 실패했습니다. 다시 시도해 주세요.'); return; }
      } else {
        await fetch('/api/payment/mock-confirm', { method: 'POST', body: JSON.stringify({ paymentId: prep.paymentId }) });
      }
      await new Promise(r => setTimeout(r, 500));
      await load(); markUnlocked(id); setModal(false);
      setSeal(true); setTimeout(() => setSeal(false), 2600);
    } catch { setErr('결제 확인에 실패했습니다.'); }
    finally { setBusy(false); }
  }

  return (
    <div className="app">
      <div className="hero"><div className="k">運 七 技 三</div><h1>{catInfo ? catInfo.name : '사주 리포트'}</h1>
        <p><Link href="/vault" style={{ color: '#c3cfe3', textDecoration: 'underline' }}>← 보관함</Link></p></div>
      <div className="wrap">
        {err && <div className="errbox">{err}</div>}
        {res && (
          <div className="rcols" id="rep">
            <div className="rleft">
            {res.wonguk && res.wonguk.length > 0 && <WonGuk p={res.wonguk} />}
            {res.hero && (
              <div className="rhero">
                <div className="hl" dangerouslySetInnerHTML={{ __html: res.hero.headline }} />
                <div className="num" style={{ color: res.hero.up ? 'var(--gold2)' : '#e88' }}>{res.hero.score}<span style={{ fontSize: 20 }}>점</span></div>
                <div className="lab">{res.hero.label}</div><div className="sub2">{res.hero.sub}</div>
              </div>
            )}
            </div>
            <div className="rright">
            <div className="rephd">{res.title}</div>
            {res.selYear && <YearBar year={res.selYear} hanja={res.seun?.hanja} busy={busy} onChange={switchYear} />}
            {(() => { const total = res.sections.length; const opened = res.sections.filter(s => (RANK[s.tier] ?? 2) <= level && s.html).length;
              return (
                <div className="rprog">
                  <span className="rpl">열람 <b>{opened}</b> / {total} 섹션</span>
                  <span className="rpbar"><i style={{ width: Math.round(opened / total * 100) + '%' }} /></span>
                  <span className="rpr">{level >= 2 ? '전체 열람' : level === 1 ? '택일팩' : '무료 열람'}</span>
                </div>
              ); })()}
            <div className="print-only pfoot" style={{ display: 'none' }}>낙찰사주 · 士가 읽는 사주·사정률 리포트 · 명리 기반 참고 정보</div>
            {res.sections.map((sec, i) => {
              const rank = RANK[sec.tier] ?? 2;
              const open = rank <= level && !!sec.html;
              const locked = rank > level;
              const prod = productOfMk(sec.mk);
              const pPrice = catInfo ? catInfo.price : (prod?.price ?? 0);
              const pName = catInfo ? catInfo.name : (prod?.name ?? '개별 상품');
              const openThis = () => { setErr(''); if (catInfo) setModal(true); else location.href = prod ? `/reading?cat=${prod.key}` : '/reading'; };
              return (
                <div key={i} className={'sec ' + (open ? 'open' : '') + (locked ? ' locked' : '')} style={{ animationDelay: Math.min(i * 55, 440) + 'ms' }}>
                  <div className="hd" onClick={locked ? openThis : undefined}><div className="mk">{sec.mk}</div><div className="ti">{sec.t}</div>
                    {sec.free ? <span className="lb free">무료</span> : open ? <span className="lb free">열림</span> : <span className="lb">🔒 {won(pPrice)}</span>}<div className="cv">▾</div></div>
                  <div className="bd">{sec.html ? <div dangerouslySetInnerHTML={{ __html: sec.html }} />
                    : (<div className="teaser"><div className="ttx" dangerouslySetInnerHTML={{ __html: sec.teaser || '결제 후 열람 가능한 섹션입니다.' }} />
                      <button className="tunlock" onClick={openThis}>{`${pName} 열기 · ${won(pPrice)}`} →</button></div>)}</div>
                </div>
              );
            })}
            {level < 2 && catInfo && (
              <>
                <div className="readyline"><b>{catInfo.name}</b> {res.meta?.chapters ?? res.sections.length}장(章) · {res.meta?.items ?? '수십'}개 항목 풀이가 이미 산출을 마쳤습니다 — 열람만 잠겨 있습니다</div>
                <div className="cta" onClick={() => { setErr(''); setModal(true); }}>{catInfo.name} 열기<small>{catInfo.lead} · {won(catInfo.price)}</small></div>
                <div className="ctaassure">✓ 카카오페이·토스로 30초 · 결제 즉시 열람</div>
              </>
            )}
            {level >= 1 && res.gauge?.precise && res.sections?.some((s: any) => s.mk === '率') && <div className="unlocked-note">✓ 결제 확인됨 · 소수점 정밀 사정률 <b>{res.gauge.precise}%</b></div>}
            {/* 바이럴 루프 — 공유받은 사람의 입구 */}
            <Link className="bridge no-print" href="/ceo" style={{ marginTop: 14 }}>
              <div className="bi">鏡</div>
              <div className="bt"><b>나도 30초 만에 — 나와 닮은 세계적 CEO 찾기</b><span>잡스·록펠러·샤넬… 거장 100인 중 내 사주와 닮은 대표 · 무료</span></div>
              <div className="ba">→</div>
            </Link>
            <button className="sharebtn no-print" style={{ marginTop: 12 }} onClick={() => window.print()}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z" /></svg>
              PDF로 내보내기 · 저장
            </button>
            {level < 2 && <div className="no-print" style={{ textAlign: 'center', fontSize: 11.5, color: '#a99f88', marginTop: 6 }}>상품을 열면 잠긴 섹션까지 담아 PDF로 저장됩니다</div>}
            </div>
          </div>
        )}
        {!res && !err && <div style={{ textAlign: 'center', color: '#a99f88', padding: 30 }}>불러오는 중…</div>}
      </div>

      {seal && (
        <div className="sealov" aria-hidden>
          <div className="sealbox"><video className="sealvid" autoPlay muted playsInline poster="/openseal-poster.jpg"><source src="/openseal.mp4" type="video/mp4" /></video><div className="sealtxt">봉인 해제 — 잠긴 섹션이 열렸습니다</div></div>
        </div>
      )}
      {res && level < 2 && catInfo && sticky && !modal && (
        <div className="stickycta no-print" onClick={() => { setErr(''); setModal(true); }}>
          <span className="sl"><b>{catInfo.name} 열기</b><em>산출 완료 · 열람만 잠금</em></span>
          <span className="sr">{won(catInfo.price)} →</span>
        </div>
      )}

      {modal && (
        <div className="modal on" onClick={e => { if ((e.target as HTMLElement).classList.contains('modal')) setModal(false); }}>
          <div className="sheet">
            <div className="grip" />
            {catInfo ? (
              <>
                <h3>{catInfo.name} 전체 열기</h3>
                <div className="catbuy">
                  <div className="catbuy-hd"><span className="catbuy-seal">{catInfo.hanja}</span><div><div className="catbuy-nm">{catInfo.name}</div><div className="catbuy-kick">{catInfo.kicker}</div></div><div className="catbuy-pp">{won(catInfo.price)}</div></div>
                  <div className="catbuy-lead">{catInfo.lead}</div>
                </div>
              </>
            ) : null}
            <div className="paymethods">카카오페이 · 토스페이 · 신용/체크카드<span> · 결제창에서 선택</span></div>
            <label className="consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>결제 및 <Link href="/terms" className="legal-link">이용약관</Link>·<Link href="/privacy" className="legal-link">개인정보처리방침</Link>에 동의합니다. (열람 후 청약철회 제한 — <Link href="/refund" className="legal-link">청약철회·환불 안내</Link>)</span></label>
            {err && <div className="errbox">{err}</div>}
            <button className="paygo" onClick={() => pay(sku)} disabled={busy}>{busy ? '결제 처리중…' : `${won(catInfo ? catInfo.price : 0)} 결제하기`}</button>
            <div className="mclose" onClick={() => setModal(false)}>다음에 볼게요</div>
          </div>
        </div>
      )}
    </div>
  );
}

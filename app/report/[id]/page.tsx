'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { openKcpPay, KCP_CLIENT_ENABLED, preloadKcp } from '@/app/_components/kcpPay';
import { won } from '@/lib/constants';
import { markUnlocked } from '@/lib/vault';
import { tokParam } from '@/lib/rtok';
import { CAT_INFO, isCatKey, productOfMk } from '@/lib/report-categories';
import WonGuk, { type Pillar } from '@/app/_components/WonGuk';
import YearBar from '@/app/_components/YearBar';
import { markResultSeen } from '@/app/_components/AddToHome';
import SiteTop from '@/app/_components/SiteTop';

type Section = { mk: string; free: boolean; tier: 'free' | 'taekil' | 'full'; t: string; html: string; teaser?: string };
type Result = { reportId: string; title: string; unlocked: boolean; level?: number; mine?: boolean; cat?: string | null; wonguk?: Pillar[]; hero?: any; gauge?: any; sections: Section[]; meta?: { chapters: number; items: number }; selYear?: number; seun?: { hanja: string; rel: string; tilt: number } };
const RANK: Record<string, number> = { free: 0, taekil: 1, full: 2 };

export default function ReportView({ params }: { params: { id: string } }) {
  useEffect(() => { preloadKcp(); }, []);
  const id = params.id;
  const [res, setRes] = useState<Result | null>(null);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [consent, setConsent] = useState(false);
  // 카테고리 없는 리포트에서 손님이 고른 상품(결제 직전까지만 들고 있는다)
  const [pending, setPending] = useState<string | undefined>(undefined);
  const [sku, setSku] = useState<'taekil' | 'full'>('full');
  const [seal, setSeal] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
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
    const t = tokParam(id, new URLSearchParams(location.search).get('t'));
    const r = await fetch('/api/report/get?id=' + id + '&t=' + encodeURIComponent(t));
    if (!r.ok) { setErr('리포트를 찾을 수 없습니다.'); return; }
    setRes(await r.json());
    markResultSeen();
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function switchYear(y: number) {
    if (busy) return; setBusy(true);
    try { const t = tokParam(id, new URLSearchParams(location.search).get('t')); const r = await fetch(`/api/report/get?id=${id}&year=${y}&t=${encodeURIComponent(t)}`); if (r.ok) { const d = await r.json(); if (d?.sections) setRes(prev => (prev ? { ...prev, ...d } : d)); } }
    catch {} finally { setBusy(false); }
  }

  // pickCat: 카테고리 없이 만들어진 리포트를 결제할 때 손님이 고른 상품.
  // 서버가 needs 를 검증하고 금액도 서버가 정한다 — 여기서 보낸 값은 '무엇을 살지'일 뿐이다.
  async function pay(chosen: 'taekil' | 'full', pickCat?: string) {
    if (!consent) { setErr('결제 전 안내에 동의해 주세요.'); return; }
    setErr(''); setBusy(true);
    try {
      const prep = await fetch('/api/payment/prepare', { method: 'POST', body: JSON.stringify({ reportId: id, sku: chosen, cat: pickCat ?? pending }) }).then(x => x.json());
      if (prep?.error) { setBusy(false); setErr(prep.error === 'category_required' ? '어떤 풀이를 여실지 먼저 골라 주세요.' : '결제 준비에 실패했습니다.'); return; }
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

  function openModal(e?: any) {
    setErr('');
    if (e && typeof window !== 'undefined' && window.matchMedia('(min-width:721px)').matches) setAnchor({ x: e.clientX, y: e.clientY });
    else setAnchor(null);
    setModal(true);
  }
  // 데스크톱: 클릭한 결제 버튼 부근에 다이얼로그를 앵커링(뷰포트 내로 클램프). 모바일(anchor=null)은 하단 시트.
  const sheetStyle = anchor ? (() => {
    const W = 432, H = 360, M = 16;
    const left = Math.max(M, Math.min(anchor.x - W / 2, window.innerWidth - W - M));
    const top = Math.max(M, Math.min(anchor.y - 24, window.innerHeight - H - M));
    return { position: 'fixed' as const, left, top, margin: 0 };
  })() : undefined;

  const lockedCount = res ? res.sections.filter((s2: any) => (RANK[s2.tier] ?? 2) > level).length : 0;
  // 첫 장만 펼친다 — ReadingForm 과 같은 규칙
  const [expanded, setExpanded] = useState<number[]>([]);
  useEffect(() => {
    if (!res) return;
    const first = res.sections.findIndex((s2: any) => (RANK[s2.tier] ?? 2) <= level && !!s2.html);
    setExpanded(first >= 0 ? [first] : []);
  }, [res, level]);
  const toggleSec = (i: number) => setExpanded(ex => ex.includes(i) ? ex.filter(x => x !== i) : [...ex, i]);

  return (
    <div className="app">
      <SiteTop />
      <div className="hero"><h1>{catInfo ? catInfo.name : '사주 리포트'}</h1>
        <p><Link href="/vault" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>← 보관함</Link></p></div>
      <div className="wrap">
        {err && <div className="errbox">{err}</div>}
        {/* 리포트를 못 찾으면 한 줄 오류만 남아 막다른 화면이 됐다. 왜 그런지와 갈 곳을 같이 준다. */}
        {err && !res && (
          <div className="card" style={{ textAlign: 'center', lineHeight: 1.8, color: '#3a3f47', fontSize: 15 }}>
            <p style={{ margin: 0 }}>주소가 잘렸거나 공유 링크가 만료됐을 수 있습니다.<br />로그인하셨다면 보관함에 저장된 리포트가 있습니다.</p>
            <Link className="cta" href="/reading" style={{ marginTop: 14 }}>무료로 새로 뽑기 →</Link>
            <p style={{ marginTop: 10 }}><Link href="/vault" style={{ color: 'var(--navy)', fontWeight: 700 }}>보관함 열기</Link></p>
          </div>
        )}
        {res && (
          <div className="rcols" id="rep">
            <div className="rleft">
            {res.hero && (
              <div className="rhero">
                <div className="hl" dangerouslySetInnerHTML={{ __html: res.hero.headline }} />
                <div className={'num' + (res.hero.big && res.hero.big.length > 2 ? ' numtx' : '')} style={{ color: res.hero.up ? '#2f56c4' : '#b3382c' }}>{res.hero.big ?? res.hero.score}<span style={{ fontSize: 22 }}>{res.hero.unit ?? '점'}</span></div>
                <div className="lab">{res.hero.label}</div><div className="sub2">{res.hero.sub}</div>
              </div>
            )}
            {res.wonguk && res.wonguk.length > 0 && <WonGuk p={res.wonguk} />}
            </div>
            <div className="rright">
            <div className="rephd">{res.title}</div>
            {res.selYear && <YearBar year={res.selYear} hanja={res.seun?.hanja} busy={busy} onChange={switchYear} />}
            {(() => { const total = res.sections.length; const opened = res.sections.filter(s => (RANK[s.tier] ?? 2) <= level && s.html).length;
              return (
                <div className="rtoc">
                  <b>{total}장 중 {opened}장 열림</b>
                  <span>제목을 누르면 펼쳐집니다</span>
                </div>
              ); })()}
            <div className="print-only pfoot" style={{ display: 'none' }}>낙찰사주 · 사주·투찰 택일 리포트 · 명리 기반 참고 정보</div>
            {res.sections.map((sec, i) => {
              const rank = RANK[sec.tier] ?? 2;
              const open = rank <= level && !!sec.html;
              const locked = rank > level;
              const prod = productOfMk(sec.mk);
              const pPrice = catInfo ? catInfo.price : (prod?.price ?? 0);
              const pName = catInfo ? catInfo.name : (prod?.name ?? '개별 상품');
              // 예전엔 여기서 /reading?cat=... 으로 되돌려 보냈다. 생년월일을 이미 받아놓고
              // 폼을 처음부터 다시 시키는 셈이라, 그 자리에서 결제되게 바꿨다.
              const openThis = (e?: any) => { setErr(''); if (!catInfo && prod) setPending(prod.key); openModal(e); };
              return (
                <div key={i} className={'sec' + (open && expanded.includes(i) ? ' open' : '') + (locked ? ' locked' : '')} style={{ animationDelay: Math.min(i * 55, 440) + 'ms' }}>
                  <div className="hd" role="button" tabIndex={0} aria-expanded={locked ? undefined : expanded.includes(i)}
                    onClick={locked ? openThis : () => toggleSec(i)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (locked) openThis(); else toggleSec(i); } }}><div className="ti">{sec.t}</div>
                    {sec.free ? <span className="lb free">무료</span> : open ? <span className="lb free">열림</span> : <span className="lb lk" aria-label="잠김" />}<div className="cv">▾</div></div>
                  <div className="bd">{sec.html ? <div dangerouslySetInnerHTML={{ __html: sec.html }} />
                    : (<div className="teaser"><div className="ttx" dangerouslySetInnerHTML={{ __html: sec.teaser || '결제 후 열람 가능한 섹션입니다.' }} />
                      {catInfo ? <button type="button" className="tlink" onClick={openThis}>{pName}에 포함 · 열기</button> : <button className="tunlock" onClick={openThis}>{`${pName} 열기 · ${won(pPrice)}`} →</button>}</div>)}</div>
                </div>
              );
            })}
            {level < 2 && catInfo && (
              <>
                {/* 분량이 아니라 내용을 말한다. "5장·수십항목"은 아무도 안 궁금하다 —
                    궁금한 건 "돈 내면 내가 뭘 알게 되냐"다. */}
                <div className="readyline"><b>{catInfo.name}</b> — 열면 이걸 알게 됩니다</div>
                {catInfo.gives?.length > 0 && (
                  <ul className="gives lockgives">
                    {catInfo.gives.map((g: string) => <li key={g}>{g}</li>)}
                  </ul>
                )}
                                <div className="cta" onClick={(e) => openModal(e)}>{catInfo.name} 열기<small>{catInfo.lead} · {won(catInfo.price)}</small></div>
                <div className="ctaassure">✓ 카카오페이·토스로 30초 · 결제 즉시 열람</div>
              </>
            )}
            {level >= 1 && res.sections?.some((s: any) => s.mk === "率") && <div className="unlocked-note">✓ 결제 확인됨 · 이달 투찰 길일과 유리한 시진이 전부 열렸습니다</div>}
            {/* 나도 보기 / CEO 브리지 — 공유받은 비소유자에게만 노출(본인 유료 리포트엔 숨김) */}
            {!res.mine && (<>
            <Link className="cta cta2 no-print" href="/reading" style={{ marginTop: 14 }}>
              나도 보기 — 무료로 시작<small>생년월일만 30초 · 대표와 회사 사주로 오늘의 투찰 택일</small>
            </Link>
            <Link className="bridge no-print" href="/ceo" style={{ marginTop: 10 }}>
              <div className="bt"><b>나도 30초 만에 — 나와 닮은 세계적 CEO 찾기</b><span>잡스·록펠러·샤넬… 거장 100인 중 내 사주와 닮은 대표 · 무료</span></div>
              <div className="ba">→</div>
            </Link>
            </>)}
            {/* 본인 리포트에서만 후기를 청한다 — 공유받은 사람은 아직 써 본 게 아니다 */}
            {res.mine && (
              <p className="no-print" style={{ fontSize: 13, color: '#58616a', lineHeight: 1.7, textAlign: 'center', margin: '16px 0 0' }}>
                도움이 되셨다면 한 줄 남겨 주십시오 — <Link href="/review" style={{ color: 'var(--navy)', fontWeight: 700 }}>후기 남기기</Link>
              </p>
            )}
            <button className="sharebtn no-print" style={{ marginTop: 12 }} onClick={() => window.print()}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z" /></svg>
              PDF로 내보내기 · 저장
            </button>
            {level < 2 && <div className="no-print" style={{ textAlign: 'center', fontSize: 13, color: '#636d77', marginTop: 6 }}>상품을 열면 잠긴 섹션까지 담아 PDF로 저장됩니다</div>}
            </div>
          </div>
        )}
        {!res && !err && <div style={{ textAlign: 'center', color: '#636d77', padding: 30 }}>불러오는 중…</div>}
      </div>

      {seal && (
        <div className="sealov" aria-hidden>
          <div className="sealbox"><video className="sealvid" autoPlay muted playsInline poster="/openseal-poster.jpg"><source src="/openseal.mp4" type="video/mp4" /></video><div className="sealtxt">봉인 해제 — 잠긴 섹션이 열렸습니다</div></div>
        </div>
      )}
      {res && level < 2 && catInfo && sticky && !modal && (
        <div className="stickycta no-print" onClick={(e) => openModal(e)}>
          <span className="sl"><b>{catInfo.name} 열기</b><em>산출 완료 · 열람만 잠금</em></span>
          <span className="sr">{won(catInfo.price)} →</span>
        </div>
      )}

      {modal && (
        <div className="modal on" onClick={e => { if ((e.target as HTMLElement).classList.contains('modal')) setModal(false); }}>
          <div className="sheet" style={sheetStyle}>
            <div className="grip" />
            {/* 카테고리 없이 만들어진 리포트면 손님이 방금 고른 상품(pending)을 보여준다. */}
            {(() => {
              const pick = catInfo ?? (isCatKey(pending) ? CAT_INFO[pending] : null);
              return pick ? (
                <>
                  <h3>{pick.name} 전체 열기</h3>
                  <div className="catbuy">
                    <div className="catbuy-hd"><div className="catbuy-nm">{lockedCount > 0 ? `잠긴 ${lockedCount}장 전부` : '전체 풀이'}</div><div className="catbuy-pp">{won(pick.price)}</div></div>
                    {pick.gives?.length > 0
                      ? <ul className="gives catgives">{pick.gives.slice(0, 3).map((g: string) => <li key={g}>{g}</li>)}</ul>
                      : <div className="catbuy-lead">{pick.lead}</div>}
                  </div>
                </>
              ) : null;
            })()}
            <a className="catsample" href="/samples" target="_blank" rel="noopener">결제하면 열리는 화면, 예시로 먼저 보기 →</a>
            <div className="paymethods">카카오페이 · 토스페이 · 신용/체크카드<span> · 결제창에서 선택</span></div>
            <label className="consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>결제 및 <Link href="/terms" className="legal-link">이용약관</Link>·<Link href="/privacy" className="legal-link">개인정보처리방침</Link>에 동의합니다. (열람 후 청약철회 제한 — <Link href="/refund" className="legal-link">청약철회·환불 안내</Link>)</span></label>
            {err && <div className="errbox">{err}</div>}
            <button className="paygo" onClick={() => pay(sku)} disabled={busy}>{busy ? '결제 처리중…' : `${won((catInfo ?? (isCatKey(pending) ? CAT_INFO[pending] : null))?.price ?? 0)} 결제하기`}</button>
            <div className="mclose" onClick={() => setModal(false)}>다음에 볼게요</div>
            <div className="msec">🔒 NHN KCP 안전결제 · 결제 금액은 서버에서 재검증됩니다</div>
          </div>
        </div>
      )}
    </div>
  );
}

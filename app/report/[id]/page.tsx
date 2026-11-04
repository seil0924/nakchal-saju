'use client';
import ReadingFocus from '@/app/_components/ReadingFocus';
import { firstReadingSection, type Focus } from '@/lib/reading-focus';
import type { Journey } from '@/lib/funnel';
import { trackFunnel } from '@/lib/funnel-client';
import PaidReadingPreview from '@/app/_components/PaidReadingPreview';
import type { PaidPreview } from '@/lib/paid-preview';
import TaekilAccess from '@/app/_components/TaekilAccess';
import { Fragment, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { type BuyerState } from '@/app/_components/BuyerFields';
import { preloadKcp } from '@/app/_components/kcpPay';
import { won } from '@/lib/constants';
import { recordReport } from '@/lib/vault';
import { tokParam, setTok } from '@/lib/rtok';
import { CAT_INFO, isCatKey, productOfMk } from '@/lib/report-categories';
import WonGuk, { type Pillar } from '@/app/_components/WonGuk';
import YearBar from '@/app/_components/YearBar';
import { markResultSeen } from '@/app/_components/AddToHome';
import SiteTop from '@/app/_components/SiteTop';
import Checkout from '@/app/_components/Checkout';
import SupportLinks from '@/app/_components/SupportLinks';
import { supportHref } from '@/lib/support';
import { startPurchase, requestJSON, PurchaseError, PURCHASE_PENDING } from '@/lib/purchase-client';
import { paymentReturnState, PAYMENT_RETURN_COPY } from '@/lib/payment-status';

type Section = { mk: string; free: boolean; tier: 'free' | 'taekil' | 'full'; t: string; html: string; teaser?: string };
type Result = { focus?: Focus | null; journey?: Journey | null; reportId: string; title: string; unlocked: boolean; level?: number; mine?: boolean; admin?: boolean; cat?: string | null; wonguk?: Pillar[]; hero?: any; gauge?: any; sections: Section[]; purchasePreview?: PaidPreview | null; meta?: { chapters: number; items: number }; selYear?: number; seun?: { hanja: string; rel: string; tilt: number } };
const RANK: Record<string, number> = { free: 0, taekil: 1, full: 2 };

export default function ReportView({ params }: { params: { id: string } }) {
  useEffect(() => { preloadKcp(); }, []);
  const [payNote, setPayNote] = useState<{ kind: 'ok' | 'stuck' | 'cancel' | 'failed'; text: string } | null>(null);
  const [checking, setChecking] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const paying = useRef(false);
  const id = params.id;
  const [res, setRes] = useState<Result | null>(null);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [consent, setConsent] = useState(false);
  // 결제 창 구매자 칸(로그인 대신 휴대폰 번호, 2026-10-23)
  const [buyer, setBuyer] = useState<BuyerState>({ name: '', phone: '', agree: false });
  const setBuyerPart = (p: Partial<BuyerState>) => setBuyer(b => ({ ...b, ...p }));
  // 카테고리 없는 리포트에서 손님이 고른 상품(결제 직전까지만 들고 있는다)
  const [pending, setPending] = useState<string | undefined>(undefined);
  const sku = 'full' as const;
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
    setChecking(true); setErr('');
    const sp = new URLSearchParams(location.search);
    const returned = paymentReturnState(sp.get('paid'), sp.get('why'));
    const uncertain = returned === 'pending';
    if (uncertain) setRecovery(true);
    if (returned) setPayNote({ kind: uncertain ? 'stuck' : returned === 'cancelled' ? 'cancel' : 'failed', text: PAYMENT_RETURN_COPY[returned].text });
    try {
      const urlT = sp.get('t');
      if (urlT) setTok(id, urlT);
      const { ok, data } = await requestJSON('/api/report/get?id=' + encodeURIComponent(id) + '&t=' + encodeURIComponent(tokParam(id, urlT)));
      if (!ok || !data.sections) throw new Error('리포트를 불러오지 못했습니다. 잠시 후 다시 확인해주세요.');
      setRes(data); markResultSeen();
      if (returned && !data.unlocked) trackFunnel(data.journey, returned === 'cancelled' ? 'payment_cancel' : returned === 'pending' ? 'payment_pending' : 'payment_error', data.admin);
      recordReport({ id, label: data.title, when: Date.now(), unlocked: !!data.unlocked });
      if (data.unlocked && !data.admin) { setRecovery(false); setModal(false); setPayNote({ kind: 'ok', text: '구매한 풀이가 열려 있습니다. 추가 결제 없이 아래에서 다시 읽을 수 있습니다.' }); }
      else if (uncertain) setPayNote({ kind: 'stuck', text: PURCHASE_PENDING });
      return data as Result;
    } catch (e) { setErr(e instanceof Error ? e.message : '연결을 확인하고 다시 시도해주세요.'); if (uncertain) setPayNote({ kind: 'stuck', text: PURCHASE_PENDING }); return null; }
    finally { setChecking(false); }
  }
  useEffect(() => { setRes(null); setPayNote(null); setRecovery(false); load(); /* eslint-disable-next-line */ }, [id]);

  async function switchYear(y: number) {
    if (busy) return; setBusy(true);
    try { const t = tokParam(id, new URLSearchParams(location.search).get('t')); const r = await fetch(`/api/report/get?id=${id}&year=${y}&t=${encodeURIComponent(t)}`); if (r.ok) { const d = await r.json(); if (d?.sections) setRes(prev => (prev ? { ...prev, ...d } : d)); } }
    catch {} finally { setBusy(false); }
  }

  // pickCat: 카테고리 없이 만들어진 리포트를 결제할 때 손님이 고른 상품.
  // 서버가 needs 를 검증하고 금액도 서버가 정한다 — 여기서 보낸 값은 '무엇을 살지'일 뿐이다.
  async function pay(chosen: 'taekil' | 'full', pickCat?: string) {
    if (paying.current || recovery) return;
    paying.current = true; setBusy(true); setErr('');
    let confirmed = false;
    try {
      const outcome = await startPurchase({ reportId: id, sku: chosen, cat: pickCat ?? pending, buyerName: buyer.name, buyerPhone: buyer.phone, agree: buyer.agree }, res?.journey);
      if (outcome === 'redirect') return;
      if (outcome === 'cancelled') { setErr('결제창을 닫았습니다. 무료 결과는 그대로 볼 수 있습니다.'); return; }
      confirmed = true;
      const loaded = await load();
      if (!loaded || (loaded.level ?? 0) < (chosen === 'taekil' ? 1 : 2)) throw new PurchaseError(PURCHASE_PENDING, true);
      setModal(false);
      requestAnimationFrame(() => document.getElementById('purchase-status')?.scrollIntoView({ block: 'center' }));
    } catch (e) { const recover = confirmed || (e instanceof PurchaseError && e.recover); setErr(e instanceof Error ? e.message : PURCHASE_PENDING); setRecovery(recover); if (recover) setPayNote({ kind: 'stuck', text: PURCHASE_PENDING }); }
    finally { setBusy(false); paying.current = false; }
  }
  function openModal(_e?: unknown) { setErr(''); setModal(true); }

  // 첫 장만 펼친다 — ReadingForm 과 같은 규칙
  const [expanded, setExpanded] = useState<number[]>([]);
  useEffect(() => {
    if (!res) return;
    const first = firstReadingSection(res.sections, res.focus);
    setExpanded(first >= 0 ? [first] : []);
    trackFunnel(res.journey, res.sections.some(s => !s.free && !!s.html) ? 'paid_open' : 'free_result', res.admin);
  }, [res, level]);
  const toggleSec = (i: number) => setExpanded(ex => ex.includes(i) ? ex.filter(x => x !== i) : [...ex, i]);

  return (
    <div className="app">
      <SiteTop />
      <div className="hero"><h1>{catInfo ? catInfo.name : '사주 리포트'}</h1>
        <p><Link href="/vault" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>← 보관함</Link></p></div>
      <div className="wrap">
        {err && !modal && <div className="errbox" role="alert">{err}</div>}
        {(payNote || (checking && !res)) && <div id="purchase-status" className={'purchase-notice ' + (payNote?.kind ?? '')} role="status">
          <h2>{checking ? '리포트 열람 상태를 확인하고 있습니다' : payNote?.kind === 'ok' ? '구매한 리포트 다시 보기' : payNote?.kind === 'stuck' ? PAYMENT_RETURN_COPY.pending.title : payNote?.kind === 'cancel' ? PAYMENT_RETURN_COPY.cancelled.title : PAYMENT_RETURN_COPY.failed.title}</h2>
          <p>{payNote?.text}</p>
          <div className="purchase-actions">
            {payNote?.kind !== 'ok' && <Link href="/find">구매 기록 확인하기</Link>}
            {payNote?.kind !== 'ok' && <button type="button" disabled={checking} onClick={() => load()}>결제 상태 다시 확인</button>}
            {payNote?.kind === 'ok' && <button type="button" onClick={() => { const index = res ? firstReadingSection(res.sections, res.focus) : -1; if (index >= 0) setExpanded([index]); document.getElementById(index >= 0 ? 'report-section-' + index : 'rep')?.scrollIntoView({ block: 'start', behavior: 'smooth' }); }}>구매한 내용 읽기</button>}
            <Link href="/vault">보관함</Link>{payNote?.kind !== 'ok' && <Link href={supportHref('pay', id)}>결제 문의하기</Link>}
          </div>
        </div>}
        {err && !res && <div className="purchase-notice"><h2>다시 여는 방법을 선택해주세요</h2><p>결제할 때 입력한 성함과 휴대폰 번호로 구매 기록을 찾을 수 있습니다.</p><div className="purchase-actions"><button disabled={checking} onClick={() => load()}>다시 불러오기</button><Link href="/find">구매한 리포트 찾기</Link><Link href="/vault">보관함</Link></div></div>}
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
            <ReadingFocus focus={res.focus} onRead={() => { const i = firstReadingSection(res.sections, res.focus); setExpanded(i >= 0 ? [i] : []); requestAnimationFrame(() => document.getElementById('report-section-' + i)?.scrollIntoView({ block: 'start', behavior: 'smooth' })); }} />
            {/* 관리자는 결제 없이 전부 열린다. 표시가 없으면 결제가 그냥 넘어가는 줄 안다(2026-10-21 실제로 그렇게 보였다). */}
            {res.admin && (
              <div className="adminview no-print">
                관리자 열람 중: 결제 없이 전부 열려 보입니다. 손님에게는 잠겨 보이니, 결제 화면은 시크릿 창에서 확인하는 편이 낫습니다.
              </div>
            )}
            <div className="rephd">{res.title}</div>
            {res.sections.some(sec => sec.mk === '率') && <TaekilAccess unlocked={level >= 1} />}
            {res.selYear && <YearBar year={res.selYear} hanja={res.seun?.hanja} busy={busy} onChange={switchYear} />}
            {(() => { const total = res.sections.length; const opened = res.sections.filter(s => (RANK[s.tier] ?? 2) <= level && s.html).length;
              return (
                <div className="rtoc">
                  <b>{total}장 중 {opened}장 열림</b>
                  <span>제목을 누르면 펼쳐집니다</span>
                </div>
              ); })()}
            {res.purchasePreview && <a className="prp-jump no-print" href="#paid-reading-preview">내 유료 풀이 일부 미리보기 ↓</a>}
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
                <Fragment key={i}>
                {res.purchasePreview && i === res.sections.findIndex(s => !s.html && !s.free) && <PaidReadingPreview journey={res.journey} admin={res.admin} preview={res.purchasePreview} busy={busy || checking} onOpen={() => {
                  setErr(''); if (!catInfo) setPending(res.purchasePreview!.cat); openModal();
                }} />}
                <div id={'report-section-' + i} className={'sec' + (open && expanded.includes(i) ? ' open' : '') + (locked ? ' locked' : '')} style={{ animationDelay: Math.min(i * 55, 440) + 'ms' }}>
                  <div className="hd" role="button" tabIndex={0} aria-expanded={locked ? undefined : expanded.includes(i)}
                    onClick={locked ? openThis : () => toggleSec(i)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (locked) openThis(); else toggleSec(i); } }}><div className="ti">{sec.t}</div>
                    {sec.mk === '率' ? <span className="lb free">{level >= 1 ? '30일 열림' : '7일 무료'}</span> : sec.free ? <span className="lb free">무료</span> : open ? <span className="lb free">열림</span> : <span className="lb lk" aria-label="잠김" />}<div className="cv">▾</div></div>
                  <div className="bd">{sec.html && res.focus?.mk === sec.mk && <p className="focus-chapter-question">처음 궁금했던 질문 · {res.focus.question}</p>}{sec.html ? <div dangerouslySetInnerHTML={{ __html: sec.html }} />
                    : (<div className="teaser"><div className="ttx" dangerouslySetInnerHTML={{ __html: sec.teaser || '대표님 명식으로 계산해 둔 장입니다. 열면 바로 보입니다.' }} />
                      {catInfo ? <button type="button" className="tlink" onClick={openThis}>{pName}에 포함 · 열기</button> : <button className="tunlock" onClick={openThis}>{`${pName} 열기 · ${won(pPrice)}`} →</button>}</div>)}</div>
                </div>
                </Fragment>
              );
            })}
            {level < 2 && catInfo && !res.purchasePreview && (
              <>
                {/* 분량이 아니라 내용을 말한다. "5장·수십항목"은 아무도 안 궁금하다 —
                    궁금한 건 "돈 내면 내가 뭘 알게 되냐"다. */}
                <div className="readyline"><b>{catInfo.name}</b> 계산은 끝났습니다. 열면 이걸 알게 됩니다</div>
                {catInfo.gives?.length > 0 && (
                  <ul className="gives lockgives">
                    {catInfo.gives.map((g: string) => <li key={g}>{g}</li>)}
                  </ul>
                )}
                                <div className="cta" onClick={(e) => openModal(e)}>{catInfo.name} 열기<small>{catInfo.lead} · {won(catInfo.price)}</small></div>
                <div className="ctaassure">카드로 30초 · 결제하면 바로 열립니다</div>
                <div className="ctapromise">낙찰을 약속하지 않습니다. 정하는 건 대표님입니다.</div>
              </>
            )}
            {level >= 1 && res.sections?.some((s: any) => s.mk === "率") && <div className="unlocked-note">✓ 결제 확인됨 · 오늘부터 30일 투찰 길일과 유리한 시진이 전부 열렸습니다</div>}
            {/* 나도 보기 / CEO 브리지: 공유받은 비소유자에게만 노출(본인 유료 리포트엔 숨김) */}
            {!res.mine && (<>
            <Link className="cta cta2 no-print" href="/reading" style={{ marginTop: 14 }}>
              나도 무료로 보기<small>성함·생년월일만 30초 · 대표와 회사 사주로 오늘의 투찰 택일</small>
            </Link>
            <Link className="bridge no-print" href="/ceo" style={{ marginTop: 10 }}>
              <div className="bt"><b>나도 30초 만에: 나와 닮은 세계적 CEO 찾기</b><span>잡스·록펠러·샤넬… 거장 111인 중 내 사주와 닮은 대표 · 무료</span></div>
              <div className="ba">→</div>
            </Link>
            </>)}
            {/* 본인 리포트에서만 후기를 청한다: 공유받은 사람은 아직 써 본 게 아니다 */}
            {res.mine && (
              <p className="no-print" style={{ fontSize: 13, color: '#58616a', lineHeight: 1.7, textAlign: 'center', margin: '16px 0 0' }}>
                도움이 되셨다면 한 줄 남겨 주세요: <Link href="/review" style={{ color: 'var(--navy)', fontWeight: 700 }}>후기 남기기</Link>
              </p>
            )}
            <SupportLinks reportId={id} />
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

      {res && level < 2 && catInfo && sticky && !modal && (
        <div className="stickycta no-print" onClick={(e) => openModal(e)}>
          <span className="sl"><b>{catInfo.name} 열기</b><em>계산은 끝났습니다 · 열면 바로 보입니다</em></span>
          <span className="sr">{won(catInfo.price)} →</span>
        </div>
      )}

      {modal && <Checkout journey={res?.journey} focus={res?.focus} admin={res?.admin} reportId={id} name={(catInfo ?? (isCatKey(pending) ? CAT_INFO[pending] : null))?.name ?? '선택한 풀이'}
        price={(catInfo ?? (isCatKey(pending) ? CAT_INFO[pending] : null))?.price ?? 0} subject={res?.title}
        details={(catInfo ?? (isCatKey(pending) ? CAT_INFO[pending] : null))?.gives?.slice(0, 3) ?? ['선택한 상품의 유료 풀이가 열립니다']}
        buyer={buyer} setBuyer={setBuyerPart} consent={consent} setConsent={setConsent} busy={busy || checking}
        error={err} recovery={recovery} onPay={() => pay(sku)} onClose={() => setModal(false)} onCheck={() => load()} />}

    </div>
  );
}

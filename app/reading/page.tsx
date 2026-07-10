'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { PRICE_FIRST, PRICE_REGULAR, won } from '@/lib/constants';
import { chartFromInput, sipsungPreview, GAN, ZHI, EL, EL_HEX, GAN_ELc, ZHI_ELc, SIP, SIJIN, SIJIN_MID } from '@/lib/preview';
import { recordReport, markUnlocked } from '@/lib/vault';
import WonGuk, { type Pillar } from '@/app/_components/WonGuk';

type Section = { mk: string; free: boolean; t: string; html: string };
type Gauge = { dir: string; band: [string, string]; pos: number; precise?: string };
type Hero = { score: number; label: string; headline: string; sub: string; up: boolean };
type Result = { reportId: string; title: string; wonguk?: Pillar[]; gauge: Gauge; hero: Hero; sections: Section[] };

const BID_TYPES = ['관급 공사', '민간 공사', '용역', '물품·구매', '아직 미정'];
const CONDITIONS = ['저가경쟁 심함', '기술평가 중심', '재입찰', '첫 도전', '수의계약'];

// 관계 유형 (사주아이식: 유형 선택 → 대상 저장/재사용)
const REL_KINDS = [
  { key: 'client', label: '발주처 궁합', sub: '설립일', ph: '예) 한국도로공사' },
  { key: 'partner', label: '동업 궁합', sub: '생년월일', ph: '예) 김대영 대표' },
  { key: 'ally', label: '협정 궁합', sub: '회사 설립일', ph: '예) 대영토건(주)' },
] as const;
type RelKind = 'client' | 'partner' | 'ally';
type Target = { kind: RelKind; name: string; date: string };
const LS_KEY = 'nakchal_saved_targets_v1';

export default function Reading() {
  const [f, setF] = useState({
    name: '', cal: 'solar' as 'solar' | 'lunar', leap: false,
    birth: '', gender: 'M',
    timeMode: 'Y' as 'Y' | 'grid' | 'N', time: '09:20', sijin: 3,
    legal: '', company: '', client: '', partner: '', ally: '',
    bidType: '', condition: '', worry: '',
  });
  const [res, setRes] = useState<Result | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [consent, setConsent] = useState(false);
  const set = (k: string, v: any) => setF(s => ({ ...s, [k]: v }));

  // 관계 대상: 추가 목록 + 저장(재사용)
  const [targets, setTargets] = useState<Target[]>([]);
  const [addKind, setAddKind] = useState<RelKind>('client');
  const [addName, setAddName] = useState('');
  const [addDate, setAddDate] = useState('');
  const [saved, setSaved] = useState<Target[]>([]);
  useEffect(() => { try { const s = localStorage.getItem(LS_KEY); if (s) setSaved(JSON.parse(s)); } catch {} }, []);
  // 발주처 탭에서 넘어온 경우 프리필 (?ck=client&cn=이름&cd=날짜)
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const ck = p.get('ck') as RelKind | null, cn = p.get('cn'), cd = p.get('cd');
      if (ck && cd && ['client', 'partner', 'ally'].includes(ck)) {
        setAddKind(ck);
        setTargets(prev => [...prev.filter(x => x.kind !== ck), { kind: ck, name: cn || '', date: cd }]);
      }
    } catch {}
  }, []);
  function persistSaved(list: Target[]) { setSaved(list); try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {} }
  function addTarget() {
    if (!addDate) { setErr('대상의 날짜를 넣어주세요.'); return; }
    setErr('');
    const t: Target = { kind: addKind, name: addName.trim() || REL_KINDS.find(k => k.key === addKind)!.label, date: addDate };
    setTargets(prev => [...prev.filter(x => x.kind !== t.kind), t]); // 유형별 1개
    if (!saved.some(x => x.kind === t.kind && x.name === t.name && x.date === t.date)) persistSaved([t, ...saved].slice(0, 12));
    setAddName(''); setAddDate('');
  }
  const removeTarget = (kind: RelKind) => setTargets(prev => prev.filter(x => x.kind !== kind));
  const quickFill = (t: Target) => { setAddKind(t.kind); setAddName(t.name); setAddDate(t.date); };
  const kindLabel = (k: RelKind) => REL_KINDS.find(r => r.key === k)!.label;

  const effTime = f.timeMode === 'Y' ? f.time : f.timeMode === 'grid' ? SIJIN_MID[f.sijin] : null;
  const situation = [f.bidType, f.condition].filter(Boolean).join(' · ');

  // 실시간 명식 미리보기 (클라이언트 계산 — 사정률 정밀값은 서버에서만)
  const chart = useMemo(() => chartFromInput(f.birth, effTime, f.cal, f.leap), [f.birth, effTime, f.cal, f.leap]);
  const sip = chart ? sipsungPreview(chart) : null;
  const dom = sip ? sip.indexOf(Math.max(...sip)) : 0;

  function pill(lb: string, g: number, z: number, day = false) {
    return (
      <div className={'pilc' + (day ? ' day' : '')}>
        <div className="lb">{lb}</div>
        <div className="g" style={{ background: EL_HEX[GAN_ELc[g]] }}>{GAN[g]}</div>
        <div className="z" style={{ background: EL_HEX[ZHI_ELc[z]] }}>{ZHI[z]}</div>
        <div className="sb">{EL[GAN_ELc[g]]}·{EL[ZHI_ELc[z]]}</div>
      </div>
    );
  }

  async function submit() {
    setErr('');
    if (!f.birth) { setErr('대표님 생년월일을 입력해 주세요.'); return; }
    setConfirm(true); // 사주아이식 — 입력 확인 모달 먼저
  }

  async function run() {
    setConfirm(false); setBusy(true); setUnlocked(false);
    try {
      const tg = (k: RelKind) => targets.find(t => t.kind === k);
      const body = {
        name: f.name, birth: f.birth, time: f.timeMode === 'N' ? null : effTime,
        cal: f.cal, leap: f.leap,
        legal: f.legal || null, legalName: f.company || undefined,
        client: tg('client')?.date || null, clientName: tg('client')?.name,
        partner: tg('partner')?.date || null, partnerName: tg('partner')?.name,
        ally: tg('ally')?.date || null, allyName: tg('ally')?.name,
        situation, worry: f.worry,
      };
      const resp = await fetch('/api/report', { method: 'POST', body: JSON.stringify(body) });
      if (!resp.ok) throw new Error();
      const r = await resp.json();
      setRes(r);
      // 보관함 기록 (이 기기 · 로그인 시 계정) + 저장된 사주/대상 서버 기록(best-effort)
      recordReport({ id: r.reportId, label: r.label || r.title, when: Date.now(), unlocked: false });
      fetch('/api/charts', { method: 'POST', body: JSON.stringify({ kind: 'self', name: f.name, birth_date: f.birth, birth_time: f.timeMode === 'N' ? null : effTime, calendar: f.cal, is_leap: f.leap }) }).catch(() => {});
      targets.forEach(t => fetch('/api/charts', { method: 'POST', body: JSON.stringify({ kind: t.kind, name: t.name, birth_date: t.date }) }).catch(() => {}));
      setTimeout(() => document.getElementById('rep')?.scrollIntoView({ behavior: 'smooth' }), 60);
    } catch { setErr('리포트를 뽑는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.'); }
    finally { setBusy(false); }
  }

  async function pay() {
    if (!consent) { setErr('결제 전 안내에 동의해 주세요.'); return; }
    if (!res) return;
    setErr(''); setBusy(true);
    try {
      const prep = await fetch('/api/payment/prepare', { method: 'POST', body: JSON.stringify({ reportId: res.reportId }) }).then(x => x.json());
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID, channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
      if (storeId && channelKey) {
        const PortOne = (await import('@portone/browser-sdk/v2')).default;
        const r = await PortOne.requestPayment({ storeId, channelKey, paymentId: prep.paymentId, orderName: prep.orderName ?? '낙찰사주 전체 리포트', totalAmount: prep.amount, currency: 'CURRENCY_KRW', payMethod: 'EASY_PAY' });
        if (r?.code) { setBusy(false); setErr('결제가 취소되었습니다.'); return; }
      } else {
        await fetch('/api/payment/mock-confirm', { method: 'POST', body: JSON.stringify({ paymentId: prep.paymentId }) });
      }
      let full: any = null;
      for (let i = 0; i < 6; i++) { const resp = await fetch('/api/report/paid?id=' + res.reportId); if (resp.ok) { full = await resp.json(); break; } await new Promise(r => setTimeout(r, 700)); }
      if (!full) throw new Error();
      setRes({ ...res, ...full }); setUnlocked(true); setModal(false);
      markUnlocked(res.reportId);
    } catch { setErr('결제 확인에 실패했습니다. 결제되었다면 잠시 후 자동 반영됩니다.'); }
    finally { setBusy(false); }
  }

  async function share() {
    if (!res) return;
    const url = `${location.origin}/report/${res.reportId}`;
    const text = `[낙찰사주] 오늘 낙찰 유리도 ${res.hero?.score ?? ''}점 — ${res.hero?.sub ?? ''}. 대표와 회사 사주로 오늘의 사정률을 짚어 봤습니다. 대표님도 한번 보시죠:`;
    try {
      if (navigator.share) await navigator.share({ title: '낙찰사주', text, url });
      else { await navigator.clipboard.writeText(text + ' ' + url); alert('공유 문구와 링크를 복사했어요. 카톡에 붙여넣어 보내세요.'); }
    } catch {}
  }

  const seg = (on: boolean) => 'seg-b' + (on ? ' on' : '');

  return (
    <div className="app">
      <div className="hero">
        <div className="k">運 七 技 三</div>
        <h1>회사 사주 · 오늘의 사정률</h1>
        <p><Link href="/" style={{ color: '#c3cfe3', textDecoration: 'underline' }}>← 홈으로</Link></p>
      </div>
      <div className="wrap">
        {/* 1. 상황 (사주아이식 대화형 칩) */}
        <div className="card">
          <div className="st"><span className="l"><span className="b" />지금 어떤 입찰을 앞두고 계세요?</span></div>
          <div className="chips">
            {BID_TYPES.map(t => <button key={t} className={'chip2' + (f.bidType === t ? ' on' : '')} onClick={() => set('bidType', f.bidType === t ? '' : t)}>{t}</button>)}
          </div>
          <div className="qh">지금 상황은? <span className="opt">(고르면 리포트에 반영됩니다)</span></div>
          <div className="chips">
            {CONDITIONS.map(t => <button key={t} className={'chip2' + (f.condition === t ? ' on' : '')} onClick={() => set('condition', f.condition === t ? '' : t)}>{t}</button>)}
          </div>
          <label style={{ marginTop: 14 }}>지금 가장 고민되는 결정 <span className="opt">(선택)</span></label>
          <textarea value={f.worry} maxLength={200} onChange={e => set('worry', e.target.value)} placeholder="예) 이번 도로공사 큰 건, 넣을지 말지 고민입니다" />
        </div>

        {/* 2. 대표님 명식 + 실시간 미리보기 */}
        <div className="card">
          <div className="st"><span className="l"><span className="b" />대표님 정보</span></div>
          <label>성함 <span className="opt">(선택)</span></label>
          <input value={f.name} maxLength={12} placeholder="예) 오세일" onChange={e => set('name', e.target.value)} />
          <label>달력</label>
          <div className="seg">
            <button className={seg(f.cal === 'solar')} onClick={() => set('cal', 'solar')}>양력</button>
            <button className={seg(f.cal === 'lunar')} onClick={() => set('cal', 'lunar')}>음력</button>
          </div>
          {f.cal === 'lunar' && (
            <div className="seg" style={{ marginTop: 8 }}>
              <button className={seg(!f.leap)} onClick={() => set('leap', false)}>평달</button>
              <button className={seg(f.leap)} onClick={() => set('leap', true)}>윤달</button>
            </div>
          )}
          <label>생년월일</label>
          <input type="date" value={f.birth} onChange={e => set('birth', e.target.value)} />
          <label>성별</label>
          <div className="seg">
            <button className={seg(f.gender === 'M')} onClick={() => set('gender', 'M')}>남</button>
            <button className={seg(f.gender === 'F')} onClick={() => set('gender', 'F')}>여</button>
          </div>
          <label>태어난 시간을 아시나요?</label>
          <div className="seg">
            <button className={seg(f.timeMode === 'Y')} onClick={() => set('timeMode', 'Y')}>예</button>
            <button className={seg(f.timeMode === 'grid')} onClick={() => set('timeMode', 'grid')}>대략만</button>
            <button className={seg(f.timeMode === 'N')} onClick={() => set('timeMode', 'N')}>모름</button>
          </div>
          {f.timeMode === 'Y' && (
            <div>
              <input type="time" value={f.time} onChange={e => set('time', e.target.value)} style={{ marginTop: 8 }} />
              <div className="tsnote">✓ 진태양시 −30분 자동 보정 (한국 경도 기준)</div>
            </div>
          )}
          {f.timeMode === 'grid' && (
            <div className="sijin">
              {SIJIN.map(([nm, rng], i) => (
                <div key={i} className={'sj' + (f.sijin === i ? ' on' : '')} onClick={() => set('sijin', i)}><b>{nm}</b><span>{rng}</span></div>
              ))}
            </div>
          )}

          {/* 실시간 만세력 미리보기 */}
          <div className="prevbox">
            <div className="prevhd"><span>만세력 미리보기</span><span className="live">● 실시간</span></div>
            {chart ? (
              <div>
                <div className="msg4">
                  {pill('년', chart.yGan, chart.yZhi)}
                  {pill('월', chart.mGan, chart.mZhi)}
                  {pill('일', chart.dGan, chart.dZhi, true)}
                  {chart.hGan !== null ? pill('시', chart.hGan, chart.hZhi!)
                    : <div className="pilc"><div className="lb">시</div><div className="g pgray">?</div><div className="z pgray">?</div><div className="sb">모름</div></div>}
                </div>
                <div className="sipline">일간 <b style={{ color: 'var(--navy)' }}>{GAN[chart.dGan]}({EL[chart.dayMasterEl]})</b> · 강한 십성 <b style={{ color: 'var(--red)' }}>{SIP[dom]}</b></div>
              </div>
            ) : <div style={{ color: '#a99f88', fontSize: 12, padding: '6px 0' }}>생년월일을 입력하면 명식이 실시간으로 나타납니다.</div>}
          </div>
        </div>

        {/* 3. 회사 정보 (회사 사주 · 간판) */}
        <div className="card">
          <div className="st"><span className="l"><span className="b" />회사 정보</span><span className="chip free">회사 사주</span></div>
          <label>회사명 <span className="opt">(선택)</span></label>
          <input value={f.company} maxLength={20} placeholder="예) 세일건설(주)" onChange={e => set('company', e.target.value)} />
          <label>법인 설립일 <span className="opt">· 법인 운세 + 통합 사정률</span></label>
          <input type="date" value={f.legal} onChange={e => set('legal', e.target.value)} />
          <div className="note">※ 회사 설립일을 넣으면 대표+법인 통합으로 사정률과 회사 운세가 더 정교해집니다.</div>
        </div>

        {/* 4. 관계·궁합 (사주아이식: 유형 선택 → 대상 저장·재사용) */}
        <div className="card">
          <div className="st"><span className="l"><span className="b" />관계·궁합</span><span className="opt">선택</span></div>
          <div className="chips">
            {REL_KINDS.map(k => <button key={k.key} className={'chip2' + (addKind === k.key ? ' on' : '')} onClick={() => setAddKind(k.key)}>{k.label}</button>)}
          </div>
          {saved.filter(t => t.kind === addKind).length > 0 && (
            <div>
              <div className="qh" style={{ fontSize: 12 }}>저장된 대상 <span className="opt">(눌러서 불러오기)</span></div>
              <div className="chips">
                {saved.filter(t => t.kind === addKind).map((t, i) => (
                  <button key={i} className="chip2" onClick={() => quickFill(t)}>{t.name} · {t.date.slice(2)}</button>
                ))}
              </div>
            </div>
          )}
          <label style={{ marginTop: 12 }}>{kindLabel(addKind)} 대상 이름 <span className="opt">(선택)</span></label>
          <input value={addName} maxLength={20} placeholder={REL_KINDS.find(k => k.key === addKind)!.ph} onChange={e => setAddName(e.target.value)} />
          <label>{REL_KINDS.find(k => k.key === addKind)!.sub}</label>
          <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)} />
          <button className="go" style={{ marginTop: 12, padding: 12, fontSize: 14, background: 'linear-gradient(135deg,var(--navy),#182c49)' }} onClick={addTarget}>+ {kindLabel(addKind)} 추가</button>

          {targets.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {targets.map(t => (
                <div key={t.kind} className="sumrow">
                  <span className="k">{kindLabel(t.kind)}</span>
                  <span className="v">{t.name} · {t.date} <span onClick={() => removeTarget(t.kind)} style={{ color: 'var(--red)', cursor: 'pointer', marginLeft: 6 }}>✕</span></span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="go" onClick={submit} disabled={busy}>{busy ? '짚는 중…' : '회사 사주 리포트 뽑기 →'}</button>
        {err && !res && !confirm && <div className="errbox">{err}</div>}
        <div className="note" style={{ textAlign: 'center' }}>※ 재미로 보는 명리 기반 참고 정보. 투찰금액 산정 근거로 사용 불가.</div>

        {res && (
          <div id="rep" style={{ marginTop: 6 }}>
            {res.wonguk && res.wonguk.length > 0 && <WonGuk p={res.wonguk} />}
            {res.hero && (
              <div className="rhero">
                <div className="hl" dangerouslySetInnerHTML={{ __html: res.hero.headline }} />
                <div className="num" style={{ color: res.hero.up ? 'var(--gold2)' : '#e88' }}>{res.hero.score}<span style={{ fontSize: 20 }}>점</span></div>
                <div className="lab">{res.hero.label}</div>
                <div className="sub2">{res.hero.sub}</div>
              </div>
            )}
            <div className="rephd">{res.title}</div>
            <div id="acc">
              {res.sections.map((sec, i) => {
                const open = sec.free || (unlocked && sec.html);
                const locked = !sec.free && !unlocked;
                return (
                  <div key={i} className={'sec ' + (open ? 'open' : '') + (locked ? ' locked' : '')}>
                    <div className="hd">
                      <div className="mk">{sec.mk}</div>
                      <div className="ti">{sec.t}</div>
                      {sec.free ? <span className="lb free">무료</span> : unlocked ? <span className="lb free">열림</span> : <span className="lb">🔒</span>}
                      <div className="cv">▾</div>
                    </div>
                    <div className="bd">
                      {sec.html ? <div dangerouslySetInnerHTML={{ __html: sec.html }} /> : <p style={{ color: '#a99f88' }}>🔒 결제 후 열람 가능한 섹션입니다.</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            {!unlocked && (
              <div className="cta" onClick={() => { setErr(''); setModal(true); }}>잠긴 리포트 전체 열기<small>잠긴 섹션 + 소수점 정밀 사정률까지 · 첫 열람만 {won(PRICE_FIRST)}</small></div>
            )}
            {unlocked && res.gauge.precise && (
              <div className="unlocked-note">✓ 결제 확인됨 · 소수점 정밀 사정률 <b>{res.gauge.precise}%</b> 공개</div>
            )}
            <button className="sharebtn no-print" onClick={share}>결과 이미지로 공유 <span style={{ fontWeight: 500, fontSize: 12, color: 'var(--sub)' }}>· 카카오톡·문자</span></button>
            <button className="sharebtn no-print" style={{ marginTop: 9 }} onClick={() => window.print()}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z" /></svg>
              PDF로 내보내기 · 저장
            </button>
            <div className="disc">만세력·십성·오행 상성으로 산출한 명리 기반 참고 정보입니다.<br />실제 투찰금액 산정의 근거로 사용할 수 없습니다.</div>
          </div>
        )}
      </div>

      {/* 입력 확인 모달 (사주아이식) */}
      {confirm && (
        <div className="modal on" onClick={e => { if ((e.target as HTMLElement).classList.contains('modal')) setConfirm(false); }}>
          <div className="sheet">
            <div className="grip" />
            <div className="sumbox">
              <div className="sumhd">입력하신 내용이 맞나요?</div>
              <div className="sumrow"><span className="k">성함</span><span className="v">{f.name || '—'}</span></div>
              <div className="sumrow"><span className="k">생년월일</span><span className="v">{f.birth} ({f.cal === 'lunar' ? '음력' + (f.leap ? '·윤달' : '') : '양력'})</span></div>
              <div className="sumrow"><span className="k">태어난 시</span><span className="v">{f.timeMode === 'Y' ? f.time : f.timeMode === 'grid' ? SIJIN[f.sijin][0] + ' ' + SIJIN[f.sijin][1] : '모름 (삼주)'}</span></div>
              <div className="sumrow"><span className="k">성별</span><span className="v">{f.gender === 'M' ? '남' : '여'}</span></div>
              {situation && <div className="sumrow"><span className="k">상황</span><span className="v">{situation}</span></div>}
              {f.legal && <div className="sumrow"><span className="k">법인{f.company ? ' · ' + f.company : ''}</span><span className="v">{f.legal}</span></div>}
              {targets.map(t => <div key={t.kind} className="sumrow"><span className="k">{kindLabel(t.kind)}</span><span className="v">{t.name} · {t.date}</span></div>)}
            </div>
            <div className="sumbtns">
              <button onClick={() => setConfirm(false)}>수정하기</button>
              <button className="ok" onClick={run}>맞습니다 →</button>
            </div>
          </div>
        </div>
      )}

      {/* 결제 모달 */}
      {modal && (
        <div className="modal on" onClick={e => { if ((e.target as HTMLElement).classList.contains('modal')) setModal(false); }}>
          <div className="sheet">
            <div className="grip" />
            <h3>전체 리포트 잠금 해제</h3>
            <div className="price"><span className="p">{won(PRICE_FIRST)}</span><span className="o">{won(PRICE_REGULAR)}</span></div>
            <div className="plan">첫 열람 특가 · 전체 섹션 + 궁합 + 소수점 정밀값</div>
            <div className="pay kakao on2">카카오페이</div>
            <div className="pay toss">토스페이</div>
            <div className="pay">신용/체크카드</div>
            <label className="consent">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <span>결제 및 <Link href="/terms" className="legal-link">이용약관</Link>·<Link href="/privacy" className="legal-link">개인정보처리방침</Link>에 동의합니다. (열람 후 환불 제한될 수 있음)</span>
            </label>
            {err && <div className="errbox">{err}</div>}
            <button className="paygo" onClick={pay} disabled={busy}>{busy ? '결제 처리중…' : `${won(PRICE_FIRST)} 결제하기`}</button>
            <div className="mclose" onClick={() => setModal(false)}>다음에 볼게요</div>
            <div className="msec">🔒 데모: 결제 확정을 서버에서 시뮬레이션 · 실서비스는 포트원 웹훅 재검증</div>
          </div>
        </div>
      )}
    </div>
  );
}

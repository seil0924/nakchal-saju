'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { PRICE_TAEKIL, PRICE_FULL, won } from '@/lib/constants';
import { chartFromInput, sipsungPreview, GAN, ZHI, EL, EL_HEX, GAN_ELc, ZHI_ELc, SIP, SIJIN, SIJIN_MID } from '@/lib/preview';
import { recordReport, markUnlocked } from '@/lib/vault';
import { CLIENTS } from '@/lib/clients';
import { CAT_INFO, isCatKey } from '@/lib/report-categories';
import WonGuk, { type Pillar } from '@/app/_components/WonGuk';
import RiteProgress from '@/app/_components/RiteProgress';

// 로딩 리추얼 단계 — 실제 엔진 절차를 그대로 보여준다 (계산 과정의 가시화)
const RITE_STEPS = [
  '절기(節氣) 천문 계산 — 진태양시 보정',
  '원국(元局) 구성 — 십성·오행 배치',
  '신살(神殺) 대조',
  '오늘 일진 × 사정률 흐름 대조',
  '세계 거장 100인 명식 대조',
  '리포트 봉인 — 섹션 산출',
];

type Section = { mk: string; free: boolean; tier: 'free' | 'taekil' | 'full'; t: string; html: string; teaser?: string };
const RANK: Record<string, number> = { free: 0, taekil: 1, full: 2 };
type Gauge = { dir: string; band: [string, string]; pos: number; precise?: string };
type Hero = { score: number; label: string; headline: string; sub: string; up: boolean };
type Result = { reportId: string; title: string; wonguk?: Pillar[]; gauge: Gauge; hero: Hero; sections: Section[]; meta?: { chapters: number; items: number } };

const BID_TYPES = ['관급 공사', '민간 공사', '용역', '물품·구매', '아직 미정'];
const CONDITIONS = ['저가경쟁 심함', '기술평가 중심', '재입찰', '첫 도전', '수의계약'];
const YEARS = Array.from({ length: 83 }, (_, i) => 2012 - i); // 2012..1930
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

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
  const [level, setLevel] = useState(0);              // 0 무료 · 1 택일팩 · 2 전체
  const [sku, setSku] = useState<'taekil' | 'full'>('full');
  const [confirm, setConfirm] = useState(false);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [consent, setConsent] = useState(false);
  const [prog, setProg] = useState(false);     // 로딩 리추얼
  const [seal, setSeal] = useState(false);     // 결제 후 개봉 연출
  const [sticky, setSticky] = useState(false); // 스크롤 스티키 CTA
  const [cat, setCat] = useState('');           // 카테고리(대표·사정률·발주처·궁합·대운)
  const [bp, setBp] = useState({ y: 0, m: 0, d: 0 }); // 생년월일 3분할 선택 누적
  const catInfo = isCatKey(cat) ? CAT_INFO[cat] : null;
  // 카테고리 개별 결제가 (카테고리 모드면 단일가, 아니면 sku 기준가)
  const unlockPrice = catInfo ? catInfo.price : (sku === 'taekil' ? PRICE_TAEKIL : PRICE_FULL);
  const set = (k: string, v: any) => setF(s => ({ ...s, [k]: v }));

  // 잠긴 섹션을 지나 스크롤하면 슬림 CTA 노출 (결과 없거나 전체 열람이면 숨김)
  useEffect(() => {
    const on = () => {
      const el = document.getElementById('rep');
      if (!el) { setSticky(false); return; }
      setSticky(el.getBoundingClientRect().top < -420);
    };
    window.addEventListener('scroll', on, { passive: true }); on();
    return () => window.removeEventListener('scroll', on);
  }, [res, level]);

  // 관계 대상: 추가 목록 + 저장(재사용)
  const [targets, setTargets] = useState<Target[]>([]);
  const [addKind, setAddKind] = useState<RelKind>('client');
  const [addName, setAddName] = useState('');
  const [addDate, setAddDate] = useState('');
  const [saved, setSaved] = useState<Target[]>([]);
  const [cbOpen, setCbOpen] = useState(false); // 발주처 검색 셀렉트 열림
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
      // 닮은 CEO(/ceo)에서 넘어온 경우 대표 생년월일·성함 프리필
      const b = p.get('b'), n = p.get('n');
      if (b && /^\d{4}-\d{2}-\d{2}$/.test(b)) { setF(s => ({ ...s, birth: b, name: n || s.name })); const [yy, mm, dd] = b.split('-').map(Number); setBp({ y: yy, m: mm, d: dd }); }
      const ct = p.get('cat'); if (isCatKey(ct)) { setCat(ct); if (ct === 'gunghap') setAddKind('partner'); }
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
    // 카테고리별 필수 입력 안내
    if (cat === 'daeun' && !f.legal) { setErr('회사 대운은 법인 설립일이 필요합니다. 아래 「회사 정보」에 설립일을 넣어주세요.'); document.getElementById('cocard')?.scrollIntoView({ behavior: 'smooth' }); return; }
    if (cat === 'balju' && !targets.some(t => t.kind === 'client')) { setErr('발주처를 먼저 추가해 주세요.'); return; }
    if (cat === 'gunghap' && !targets.some(t => t.kind === 'partner' || t.kind === 'ally')) { setErr('동업 또는 협정 상대를 먼저 추가해 주세요.'); return; }
    setConfirm(true); // 사주아이식 — 입력 확인 모달 먼저
  }

  async function run() {
    setConfirm(false); setBusy(true); setLevel(0); setProg(true);
    try {
      const tg = (k: RelKind) => targets.find(t => t.kind === k);
      const body = {
        name: f.name, birth: f.birth, time: f.timeMode === 'N' ? null : effTime,
        cal: f.cal, leap: f.leap,
        legal: f.legal || null, legalName: f.company || undefined,
        client: tg('client')?.date || null, clientName: tg('client')?.name,
        partner: tg('partner')?.date || null, partnerName: tg('partner')?.name,
        ally: tg('ally')?.date || null, allyName: tg('ally')?.name,
        situation, worry: f.worry, cat: cat || undefined,
      };
      const minWait = new Promise(r => setTimeout(r, 2500)); // 리추얼 최소 상영 시간
      const resp = await fetch('/api/report', { method: 'POST', body: JSON.stringify(body) });
      if (!resp.ok) throw new Error();
      const r = await resp.json();
      await minWait;
      setRes(r);
      // 보관함 기록 (이 기기 · 로그인 시 계정) + 저장된 사주/대상 서버 기록(best-effort)
      recordReport({ id: r.reportId, label: r.label || r.title, when: Date.now(), unlocked: false });
      fetch('/api/charts', { method: 'POST', body: JSON.stringify({ kind: 'self', name: f.name, birth_date: f.birth, birth_time: f.timeMode === 'N' ? null : effTime, calendar: f.cal, is_leap: f.leap }) }).catch(() => {});
      targets.forEach(t => fetch('/api/charts', { method: 'POST', body: JSON.stringify({ kind: t.kind, name: t.name, birth_date: t.date }) }).catch(() => {}));
      setTimeout(() => document.getElementById('rep')?.scrollIntoView({ behavior: 'smooth' }), 60);
    } catch { setErr('리포트를 뽑는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.'); }
    finally { setBusy(false); setProg(false); }
  }

  async function pay(chosen: 'taekil' | 'full') {
    if (!consent) { setErr('결제 전 안내에 동의해 주세요.'); return; }
    if (!res) return;
    setErr(''); setBusy(true);
    try {
      const prep = await fetch('/api/payment/prepare', { method: 'POST', body: JSON.stringify({ reportId: res.reportId, sku: chosen }) }).then(x => x.json());
      const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID, channelKey = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;
      if (storeId && channelKey) {
        const PortOne = (await import('@portone/browser-sdk/v2')).default;
        const r = await PortOne.requestPayment({ storeId, channelKey, paymentId: prep.paymentId, orderName: prep.orderName ?? '낙찰사주 리포트', totalAmount: prep.amount, currency: 'CURRENCY_KRW', payMethod: 'EASY_PAY' });
        if (r?.code) { setBusy(false); setErr('결제가 취소되었습니다.'); return; }
      } else {
        await fetch('/api/payment/mock-confirm', { method: 'POST', body: JSON.stringify({ paymentId: prep.paymentId }) });
      }
      let full: any = null;
      for (let i = 0; i < 6; i++) { const resp = await fetch('/api/report/paid?id=' + res.reportId); if (resp.ok) { full = await resp.json(); break; } await new Promise(r => setTimeout(r, 700)); }
      if (!full) throw new Error();
      setRes({ ...res, ...full }); setLevel(full.level ?? (chosen === 'taekil' ? 1 : 2)); setModal(false);
      markUnlocked(res.reportId);
      setSeal(true); setTimeout(() => setSeal(false), 2600); // 개봉(開) 연출 — 절정으로 마무리
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
  const by = bp.y, bm = bp.m, bd = bp.d;
  // 년/월/일 3분할 — 부분 선택을 상태에 누적하고, 셋이 다 차면 birth를 세팅한다.
  const setB = (part: { y?: number; m?: number; d?: number }) => {
    setBp(prev => {
      const nx = { ...prev, ...part };
      if (nx.y && nx.m && nx.d) set('birth', `${nx.y}-${String(nx.m).padStart(2, '0')}-${String(nx.d).padStart(2, '0')}`);
      return nx;
    });
  };

  return (
    <div className="app">
      <div className="hero">
        <div className="k">運 七 技 三</div>
        <h1>{catInfo ? catInfo.name : '회사 사주 · 오늘의 사정률'}</h1>
        <p><Link href="/" style={{ color: '#c3cfe3', textDecoration: 'underline' }}>← 홈으로</Link></p>
      </div>
      <div className="wrap">
        {/* 1. 상황 (사정률·통합에서만) */}
        {(!cat || cat === 'sajeong') && (<div className="card">
          <div className="st"><span className="l"><span className="b" />지금 어떤 입찰을 앞두고 계세요?</span></div>
          <div className="chips">
            {BID_TYPES.map(t => <button key={t} className={'chip2' + (f.bidType === t ? ' on' : '')} onClick={() => set('bidType', f.bidType === t ? '' : t)}>{t}</button>)}
          </div>
          {f.bidType && (<div className="reveal">
          <div className="qh">지금 상황은? <span className="opt">(고르면 리포트에 반영됩니다)</span></div>
          <div className="chips">
            {CONDITIONS.map(t => <button key={t} className={'chip2' + (f.condition === t ? ' on' : '')} onClick={() => set('condition', f.condition === t ? '' : t)}>{t}</button>)}
          </div>
          <label style={{ marginTop: 14 }}>지금 가장 고민되는 결정 <span className="opt">(선택)</span></label>
          <textarea value={f.worry} maxLength={200} onChange={e => set('worry', e.target.value)} placeholder="예) 이번 도로공사 큰 건, 넣을지 말지 고민입니다" />
          </div>)}
        </div>)}

        {/* 2. 대표님 정보 */}
        <div className="card reveal" style={{ display: ((cat && cat !== 'sajeong') || f.bidType || f.birth) ? undefined : 'none' }}>
          <div className="st"><span className="l"><span className="b" />대표님 정보</span></div>
          <label>성함 <span className="opt">(선택)</span></label>
          <input value={f.name} maxLength={12} placeholder="예) 홍길동" onChange={e => set('name', e.target.value)} />
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
          <div className="bdate">
            <select required value={by || ''} onChange={e => setB({ y: +e.target.value })}><option value="" disabled>년</option>{YEARS.map(y => <option key={y} value={y}>{y}년</option>)}</select>
            <select required value={bm || ''} onChange={e => setB({ m: +e.target.value })}><option value="" disabled>월</option>{MONTHS.map(m => <option key={m} value={m}>{m}월</option>)}</select>
            <select required value={bd || ''} onChange={e => setB({ d: +e.target.value })}><option value="" disabled>일</option>{DAYS.map(d => <option key={d} value={d}>{d}일</option>)}</select>
          </div>
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

        {/* 3. 회사 정보 */}
        <div id="cocard" className="card reveal" style={{ display: (f.birth && (!cat || cat === 'daepyo' || cat === 'daeun' || cat === 'sajeong')) ? undefined : 'none' }}>
          <div className="st"><span className="l"><span className="b" />회사 정보</span><span className={'chip ' + (cat === 'daeun' ? 'paid' : 'free')}>{cat === 'daeun' ? '필수' : '회사 사주'}</span></div>
          <label>회사명 <span className="opt">(선택)</span></label>
          <input value={f.company} maxLength={20} placeholder="예) 대한건설(주)" onChange={e => set('company', e.target.value)} />
          <label>법인 설립일 {cat === 'daeun' ? <span className="opt" style={{ color: 'var(--red)' }}>· 대운·세운 계산의 기준</span> : <span className="opt">· 법인 운세 + 통합 사정률</span>}</label>
          <input type="date" value={f.legal} onChange={e => set('legal', e.target.value)} />
          <div className="note">{cat === 'daeun' ? '※ 회사 대운은 법인 설립일을 기준으로 연도별 큰 흐름(세운)을 산출합니다. 사업자등록증의 「개업연월일」을 넣어주세요.' : '※ 회사 설립일을 넣으면 대표+법인 통합으로 사정률과 회사 운세가 더 정교해집니다.'}</div>
        </div>

        {/* 4. 관계·궁합 */}
        <div className="card reveal" style={{ display: (f.birth && (!cat || cat === 'balju' || cat === 'gunghap')) ? undefined : 'none' }}>
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
          {addKind === 'client' ? (() => {
            const q = addName.trim();
            const hits = CLIENTS.filter(c => !q || c.name.includes(q) || c.cat.includes(q));
            return (
              <div className="cbx">
                <input value={addName} maxLength={20} placeholder="발주처 검색 — 예) 도로공사, LH"
                  onChange={e => { setAddName(e.target.value); setCbOpen(true); }}
                  onFocus={() => setCbOpen(true)}
                  onBlur={() => setTimeout(() => setCbOpen(false), 150)}
                  onKeyDown={e => { if (e.key === 'Escape') setCbOpen(false); }} />
                <span className={'cbxi' + (cbOpen ? ' up' : '')} onMouseDown={e => { e.preventDefault(); setCbOpen(v => !v); }}>▾</span>
                {cbOpen && (
                  <div className="cbxdd">
                    {hits.map((c, i) => (
                      <button key={i} type="button" className="cbxop"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => { setAddName(c.name); setAddDate(c.date); setCbOpen(false); }}>
                        <b>{c.name}</b><span>{c.date.slice(0, 4)} 설립 · {c.cat}</span>
                      </button>
                    ))}
                    {hits.length > 0
                      ? <div className="cbxhint">고르면 설립일이 자동으로 채워집니다 · 목록에 없으면 그대로 직접 입력</div>
                      : <div className="cbxnone">‘{q}’ — 아직 DB에 없는 발주처입니다. 이대로 쓰시고 아래 설립일만 직접 넣어주세요.</div>}
                  </div>
                )}
              </div>
            );
          })() : (
            <input value={addName} maxLength={20} placeholder={REL_KINDS.find(k => k.key === addKind)!.ph} onChange={e => setAddName(e.target.value)} />
          )}
          <label>{REL_KINDS.find(k => k.key === addKind)!.sub}</label>
          <input type="date" value={addDate} onChange={e => setAddDate(e.target.value)} />
          <button className="go" style={{ marginTop: 12, padding: 12, fontSize: 14, background: 'linear-gradient(135deg,#2b2119,#181209)' }} onClick={addTarget}>+ {kindLabel(addKind)} 추가</button>

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

        {f.birth && <button className="go reveal" onClick={submit} disabled={busy}>{busy ? '짚는 중…' : (catInfo ? `${catInfo.name} 보기 →` : '회사 사주 리포트 뽑기 →')}</button>}
        {err && !res && !confirm && <div className="errbox">{err}</div>}
        <div className="note" style={{ textAlign: 'center' }}>※ 재미로 보는 명리 기반 참고 정보. 투찰금액 산정 근거로 사용 불가.</div>

        {res && (
          <div id="rep" className="rcols" style={{ marginTop: 6 }}>
            <div className="rleft">
            {res.wonguk && res.wonguk.length > 0 && <WonGuk p={res.wonguk} />}
            {res.hero && (
              <div className="rhero">
                <div className="hl" dangerouslySetInnerHTML={{ __html: res.hero.headline }} />
                <div className="num" style={{ color: res.hero.up ? 'var(--gold2)' : '#e88' }}>{res.hero.score}<span style={{ fontSize: 20 }}>점</span></div>
                <div className="lab">{res.hero.label}</div>
                <div className="sub2">{res.hero.sub}</div>
              </div>
            )}
            </div>
            <div className="rright">
            <div className="rephd">{res.title}</div>
            {(() => { const total = res.sections.length; const opened = res.sections.filter(s => (RANK[s.tier] ?? 2) <= level && s.html).length;
              return (
                <div className="rprog">
                  <span className="rpl">열람 <b>{opened}</b> / {total} 섹션</span>
                  <span className="rpbar"><i style={{ width: Math.round(opened / total * 100) + '%' }} /></span>
                  <span className="rpr">{level >= 2 ? '전체 열람' : level === 1 ? '택일팩' : '무료 열람'}</span>
                </div>
              ); })()}
            <div id="acc">
              {res.sections.map((sec, i) => {
                const rank = RANK[sec.tier] ?? 2;
                const open = rank <= level && !!sec.html;
                const locked = rank > level;
                const openThis = () => { setErr(''); setSku(sec.tier === 'taekil' ? 'taekil' : 'full'); setModal(true); };
                return (
                  <div key={i} className={'sec ' + (open ? 'open' : '') + (locked ? ' locked' : '')} style={{ animationDelay: Math.min(i * 55, 440) + 'ms' }}>
                    <div className="hd" onClick={locked ? openThis : undefined}>
                      <div className="mk">{sec.mk}</div>
                      <div className="ti">{sec.t}</div>
                      {sec.free ? <span className="lb free">무료</span> : open ? <span className="lb free">열림</span> : <span className="lb">🔒 {won(catInfo ? catInfo.price : (sec.tier === 'taekil' ? PRICE_TAEKIL : PRICE_FULL))}</span>}
                      <div className="cv">▾</div>
                    </div>
                    <div className="bd">
                      {sec.html ? <div dangerouslySetInnerHTML={{ __html: sec.html }} />
                        : (
                          <div className="teaser">
                            <div className="ttx" dangerouslySetInnerHTML={{ __html: sec.teaser || '결제 후 열람 가능한 섹션입니다.' }} />
                            <button className="tunlock" onClick={openThis}>
                              {catInfo ? `${catInfo.name} 열기 · ${won(catInfo.price)}` : (sec.tier === 'taekil' ? `택일팩으로 지금 열기 · ${won(PRICE_TAEKIL)}` : `전체 리포트로 지금 열기 · ${won(PRICE_FULL)}`)} →
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
            {level < 2 && (
              <>
                <div className="readyline">{catInfo ? <><b>{catInfo.name}</b> {res.meta?.chapters ?? res.sections.length}장(章) · {res.meta?.items ?? '수십'}개 항목</> : <>전체 <b>{res.meta?.chapters ?? res.sections.length}장(章) · {res.meta?.items ?? '수십'}개 항목</b></>} 풀이가 이미 산출을 마쳤습니다 — 열람만 잠겨 있습니다</div>
                <div className="cta" onClick={() => { setErr(''); setSku('full'); setModal(true); }}>
                  {catInfo ? `${catInfo.name} 전체 열기` : (level === 0 ? '잠긴 리포트 전체 열기' : '전체 리포트로 업그레이드')}
                  <small>{catInfo ? `${catInfo.lead} · ${won(catInfo.price)}` : (level === 0 ? `잠긴 심층 해석 · 궁합 · 이달 택일 · 정밀 사정률까지 · ${won(PRICE_FULL)}` : `남은 심층 섹션까지 모두 열기 · ${won(PRICE_FULL)}`)}</small>
                </div>
                <div className="ctaassure">✓ 첫 리포트 만족 환불 · 카카오페이/토스로 30초</div>
              </>
            )}
            {level >= 1 && res.gauge.precise && (
              <div className="unlocked-note">✓ 결제 확인됨 · 소수점 정밀 사정률 <b>{res.gauge.precise}%</b> 공개</div>
            )}
            <button className="sharebtn no-print" onClick={share}>결과 이미지로 공유 <span style={{ fontWeight: 500, fontSize: 12, color: 'var(--sub)' }}>· 카카오톡·문자</span></button>
            <button className="sharebtn no-print" style={{ marginTop: 9 }} onClick={() => window.print()}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z" /></svg>
              PDF로 내보내기 · 저장
            </button>
            <div className="disc">만세력·십성·오행 상성으로 산출한 명리 기반 참고 정보입니다.<br />실제 투찰금액 산정의 근거로 사용할 수 없습니다.</div>
            </div>
          </div>
        )}
      </div>

      {/* 로딩 리추얼 */}
      <RiteProgress open={prog} title="만세력을 폅니다" steps={RITE_STEPS} stepMs={410} />

      {/* 결제 성공 — 개봉(開) 연출 */}
      {seal && (
        <div className="sealov" aria-hidden>
          <div className="sealbox">
            <video className="sealvid" autoPlay muted playsInline poster="/openseal-poster.jpg">
              <source src="/openseal.mp4" type="video/mp4" />
            </video>
            <div className="sealtxt">봉인 해제 — 잠긴 섹션이 열렸습니다</div>
          </div>
        </div>
      )}

      {/* 스크롤 스티키 CTA (전체 미열람 시) */}
      {res && level < 2 && sticky && !modal && !prog && (
        <div className="stickycta no-print" onClick={() => { setErr(''); setSku('full'); setModal(true); }}>
          <span className="sl"><b>{catInfo ? `${catInfo.name} 열기` : '전체 리포트 열기'}</b><em>산출 완료 · 열람만 잠금</em></span>
          <span className="sr">{won(catInfo ? catInfo.price : PRICE_FULL)} →</span>
        </div>
      )}

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
            {catInfo ? (
              <>
                <h3>{catInfo.name} 전체 열기</h3>
                <div className="catbuy">
                  <div className="catbuy-hd"><span className="catbuy-seal">{catInfo.hanja}</span><div><div className="catbuy-nm">{catInfo.name}</div><div className="catbuy-kick">{catInfo.kicker}</div></div><div className="catbuy-pp">{won(catInfo.price)}</div></div>
                  <div className="catbuy-lead">{catInfo.lead}</div>
                </div>
              </>
            ) : (
              <>
                <h3>어디까지 열어 볼까요?</h3>
                <div className="plans">
                  <button className={'plan2' + (sku === 'taekil' ? ' on' : '')} onClick={() => setSku('taekil')}>
                    <div className="pn">택일팩</div>
                    <div className="pp">{won(PRICE_TAEKIL)}</div>
                    <div className="pd">오늘 정밀 사정률 + 이번 달 투찰 길일 캘린더. 오늘 당장 쓰는 완결판.</div>
                  </button>
                  <button className={'plan2' + (sku === 'full' ? ' on' : '')} onClick={() => setSku('full')}>
                    <div className="pbest">추천</div>
                    <div className="pn">전체 리포트</div>
                    <div className="pp">{won(PRICE_FULL)}</div>
                    <div className="pd">잠긴 심층 해석 전부 · 발주처·동업·협정 궁합 · 택일 · 정밀값까지.</div>
                  </button>
                </div>
              </>
            )}
            <div className="guarantee">✓ 첫 리포트, 만족스럽지 않으면 환불해 드립니다 — 안심하고 확인하세요</div>
            <div className="pay kakao on2">카카오페이</div>
            <div className="pay toss">토스페이</div>
            <div className="pay">신용/체크카드</div>
            <label className="consent">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <span>결제 및 <Link href="/terms" className="legal-link">이용약관</Link>·<Link href="/privacy" className="legal-link">개인정보처리방침</Link>에 동의합니다. (열람 후 청약철회가 제한될 수 있으며, 위 만족 환불 정책과 별개로 관련 법령이 적용됩니다.)</span>
            </label>
            {err && <div className="errbox">{err}</div>}
            <button className="paygo" onClick={() => pay(sku)} disabled={busy}>{busy ? '결제 처리중…' : `${won(unlockPrice)} 결제하기`}</button>
            <div className="mclose" onClick={() => setModal(false)}>다음에 볼게요</div>
            <div className="msec">🔒 데모: 결제 확정을 서버에서 시뮬레이션 · 실서비스는 포트원 웹훅 재검증</div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import ReadingFocus from '@/app/_components/ReadingFocus';
import { firstReadingSection, type Focus } from '@/lib/reading-focus';
import { cleanJourney, type Journey } from '@/lib/funnel';
import { newJourney, trackFunnel } from '@/lib/funnel-client';
import PaidReadingPreview from '@/app/_components/PaidReadingPreview';
import type { PaidPreview } from '@/lib/paid-preview';
import Checkout from '@/app/_components/Checkout';
import SupportLinks from '@/app/_components/SupportLinks';
import { startPurchase, requestJSON, PurchaseError, PURCHASE_PENDING } from '@/lib/purchase-client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { PRICE_BALJU_PASS, won } from '@/lib/constants';
import { chartFromInput, sipsungPreview, GAN, ZHI, EL, EL_HEX, GAN_ELc, ZHI_ELc, SIP, SIJIN, SIJIN_MID } from '@/lib/preview';
import { recordReport, listVault } from '@/lib/vault';
import { CLIENTS, isCoreClient, CORE_CLIENT_COUNT } from '@/lib/clients';
import { CAT_INFO, isCatKey, productOfMk, catUI } from '@/lib/report-categories';
import { parseCands, isPurpose, BIGYO_MIN, BIGYO_LABEL, type BigyoPurpose } from '@/lib/bigyo-input';
import WonGuk, { type Pillar } from '@/app/_components/WonGuk';
import { birthDateError, relatedDateError, relatedSolarDate, birthMonthDays, updateBirthParts, validBirthTime, displayBirth } from '@/lib/reading-input';
import { requestReading } from '@/lib/reading-request';
import './reading.css';
import DateSelect from '@/app/_components/DateSelect';
import PersonPicker from '@/app/_components/PersonPicker';
import ClientPicker from '@/app/_components/ClientPicker';
import { type BuyerState } from '@/app/_components/BuyerFields';
import { type Person, type PersonKind, peopleOf, migrateLegacy } from '@/lib/people';
import YearBar from '@/app/_components/YearBar';
import TrustStrip from '@/app/_components/TrustStrip';
import TaekilAccess from '@/app/_components/TaekilAccess';
import { markResultSeen } from '@/app/_components/AddToHome';
import { preloadKcp } from '@/app/_components/kcpPay';
import { sget, sset } from '@/lib/scope';
import { setTok, tokParam } from '@/lib/rtok';

type Section = { mk: string; free: boolean; tier: 'free' | 'taekil' | 'full'; t: string; html: string; teaser?: string; passLock?: boolean };
const RANK: Record<string, number> = { free: 0, taekil: 1, full: 2 };
type Gauge = { dir: string; band: [string, string]; pos: number; precise?: string };
type Hero = { score: number; big?: string; unit?: string; label: string; headline: string; sub: string; up: boolean };
type Result = { focus?: Focus | null; journey?: Journey | null; reportId: string; title: string; wonguk?: Pillar[]; gauge: Gauge; hero: Hero; sections: Section[]; purchasePreview?: PaidPreview | null; meta?: { chapters: number; items: number }; selYear?: number; seun?: { hanja: string; rel: string; tilt: number }; admin?: boolean; level?: number };

const BID_TYPES = ['관급 공사', '민간 공사', '용역', '물품·구매', '아직 미정'];
const CONDITIONS = ['저가경쟁 심함', '기술평가 중심', '재입찰', '첫 도전', '수의계약'];
const YEARS = Array.from({ length: 83 }, (_, i) => 2012 - i); // 2012..1930
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// 관계 유형 (사주아이식: 유형 선택 → 대상 저장/재사용)
const REL_KINDS = [
  { key: 'client', label: '발주처 궁합', sub: '설립일', ph: '예) 한국도로공사' },
  { key: 'partner', label: '동업 궁합', sub: '생년월일', ph: '예) 김대영 대표' },
  { key: 'ally', label: '협정 궁합', sub: '회사 설립일', ph: '예) 대영토건(주)' },
] as const;
type RelKind = 'client' | 'partner' | 'ally';
type Target = { kind: RelKind; name: string; date: string };
const LS_KEY = 'nakchal_saved_targets_v1';
// 길일(.ics) — 날짜의 일간 오행 × 대표 일간 관계로 유리한 날 판정 (서버 정의와 동일: in/bi/jae/sik)
const DAY_GAN_EL = [0,0,1,1,2,2,3,3,4,4];
function dayElOf(y:number,m:number,d:number){ const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3; const j=d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045; return DAY_GAN_EL[(((j+49)%60+60)%60)%10]; }
function relCat(me:number,td:number){ if(td===me)return'bi'; if((td+1)%5===me)return'in'; if((me+1)%5===td)return'sik'; if((me+2)%5===td)return'jae'; if((td+2)%5===me)return'gwan'; return'bi'; }
// 카테고리별 '혹하게 하는' 컨셉 훅 — 입력 화면 상단에서 몰입을 잡는다.
const HOOK: Record<string, { seal: string; t: string; d: string }> = {
  daepyo:  { seal: '鏡', t: '잡스·록펠러와 같은 그릇일지 모릅니다', d: '타고난 승부 기질·재물·사람 다루는 법을 여덟 글자로 낱낱이: 위기에 드러나는 그 약점까지.' },
  sajeong: { seal: '率', t: '성함과 생년월일을 입력해주세요', d: '오늘의 해석과 7일 흐름은 무료입니다. 태어난 시간을 몰라도 시작할 수 있습니다.' },
  balju:   { seal: '宮', t: '그 발주처, 애초에 나와 맞는 판입니까', d: '설립일 사주 × 대표님 사주 궁합 점수: 큰 판에 손대기 전에 확인해주세요.' },
  gunghap: { seal: '合', t: '손잡기 전에, 깨질 궁합인지부터', d: '지분·역할·최종 결정권을 어떻게 나눠야 안 깨지는지: 계약 전에 봐야 할 궁합.' },
  daeun:   { seal: '運', t: '회사가 대표님을 밀어줍니까, 누릅니까', d: '법인 설립일로 본 회사의 그릇과 10년 대운의 길목: 지금이 확장기인지 정비기인지.' },
  calendar:{ seal: '曆', t: '이달, 언제 움직이고 언제 멈출까', d: '계약·채용·발표에 좋은 날과 갈등·지출을 조심할 날을 달력에 짚어 드립니다.' },
  bigyo:   { seal: '較', t: '고르신 날 가운데, 대표님께 맞는 날은', d: '모두가 보는 길일표에 대표님 일간과 일지를 겹쳐 순위를 매깁니다. 성함과 생년월일만 넣으면 됩니다.' },
  calendar_year: { seal: '曆', t: '올 한 해, 밀어주는 달에 큰 판을 거세요', d: '12개월 월운(月運)을 밀어주는 달·조여지는 달로 갈라: 한 해 농사의 밑그림.' },
};
function dedupe<T>(arr: T[], keyFn: (x: T) => string): T[] {
  const seen = new Set<string>(); const out: T[] = [];
  for (const x of arr) { const k = keyFn(x); if (!seen.has(k)) { seen.add(k); out.push(x); } }
  return out;
}

// initialCat: 서버(page.tsx)가 ?cat= 을 읽어 넘겨준다.
// 예전에는 이 값을 useEffect 안에서만 읽어서, 서버 HTML 에는 카테고리가 비어 있었다 —
// "이걸 알게 됩니다"가 하이드레이션 뒤에야 나타나 구글이 못 봤다.
export default function ReadingForm({ initialCat = '' }: { initialCat?: string }) {
  const [f, setF] = useState({
    name: '', cal: 'solar' as 'solar' | 'lunar', leap: false,
    // 성별은 계산에 쓰지 않는다(보관함 표시용). 시간은 '모름'이 기본 — 예전엔 '예 · 09:20'이 미리 골라져 있어
    // 손대지 않고 넘어간 사람이 전부 09:20생(巳時)으로 계산됐다(2026-09-14).
    birth: '', gender: '' as '' | 'M' | 'F',
    timeMode: 'N' as 'Y' | 'grid' | 'N', time: '', sijin: -1,
    legal: '', company: '', client: '', partner: '', ally: '',
    bidType: '', condition: '', worry: '',
  });
  const [res, setRes] = useState<Result | null>(null);
  const [level, setLevel] = useState(0);              // 0 무료 · 1 택일팩 · 2 전체
  // 펼친 장. 결과가 9,500px(스크롤 12번)까지 길어져 핵심이 묻혔다 — 첫 장만 펼치고 나머지는 제목으로 둔다.
  const [expanded, setExpanded] = useState<number[]>([]);
  const [sku, setSku] = useState<'taekil' | 'full'>('full');
  const [confirm, setConfirm] = useState(false);
  const [modal, setModal] = useState(false);
  const [passMode, setPassMode] = useState(false);   // 발주처 프리미엄 패스 결제 모드
  // 결제 창의 구매자 칸(성함·휴대폰·동의). 로그인 대신 이 번호로 산 것을 묶는다(2026-10-23, lib/buyer).
  const [buyer, setBuyer] = useState<BuyerState>({ name: '', phone: '', agree: false });
  const setBuyerPart = (p: Partial<BuyerState>) => setBuyer(b => ({ ...b, ...p }));
  useEffect(() => { if (modal) setBuyer(b => ({ ...b, name: b.name || f.name })); /* eslint-disable-next-line */ }, [modal]);
  const buyerBody = () => ({ buyerName: buyer.name, buyerPhone: buyer.phone, agree: buyer.agree });
  const [busy, setBusy] = useState(false);
  // 결제 재진입 가드. setBusy 는 다음 렌더에야 반영돼서 같은 틱에 두 번 들어오는 걸 못 막는다 —
  // 실제로 버튼 한 번에 /api/payment/prepare 가 두 번 나갔다. ref 는 즉시 바뀐다.
  const paying = useRef(false);
  const [err, setErr] = useState('');
  const [journey, setJourney] = useState<Journey | null>(null);
  const [focusId, setFocusId] = useState<string | undefined>(undefined);
  const [entrySource, setEntrySource] = useState<'ceo' | 'sajang' | ''>('');
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; birth?: string; time?: string }>({});
  const [dateNotice, setDateNotice] = useState('');
  const [savedResult, setSavedResult] = useState(false);
  const generating = useRef(false);
  const reportRequest = useRef<AbortController | null>(null);
  useEffect(() => () => reportRequest.current?.abort(), []);
  const [consent, setConsent] = useState(false);
  const [prog, setProg] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [purchased, setPurchased] = useState(false);     // 결제 후 개봉 연출
  const [sticky, setSticky] = useState(false); // 스크롤 스티키 CTA
  const [cat, setCat] = useState(isCatKey(initialCat) ? initialCat : ''); // 카테고리(대표·택일·발주처·궁합·대운)
  const [bp, setBp] = useState({ y: 0, m: 0, d: 0 }); // 생년월일 3분할 선택 누적
  const [picker, setPicker] = useState<{ open: boolean; kind: PersonKind }>({ open: false, kind: 'self' });
  const [more, setMore] = useState(false);
  const [clientPick, setClientPick] = useState(false);   // 발주처 고르기 창(입력 화면 안에서)   // 성함·시간·성별: 접어 두고 필요한 사람만 연다
  const catInfo = isCatKey(cat) ? CAT_INFO[cat] : null;
  const ui = catUI(cat);   // 카테고리별 UI 스키마(단일 소스)
  // 카테고리 개별 결제가 (카테고리 모드면 단일가, 아니면 sku 기준가)
  const unlockPrice = catInfo ? catInfo.price : 0;   // 카테고리 전용: 무카테고리는 개별 상품으로만 결제
  const set = (k: string, v: any) => setF(s => ({ ...s, [k]: v }));
  const focusField = (id: string) => requestAnimationFrame(() => {
    const el = document.getElementById(id);
    el?.focus({ preventScroll: true }); el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  });
  useEffect(() => {
    const id = res ? 'rd-result-title' : prog ? 'rd-progress-title' : confirm ? 'rd-review-title' : null;
    if (id) requestAnimationFrame(() => {
      const el = document.getElementById(id);
      el?.focus({ preventScroll: true }); el?.scrollIntoView({ block: 'start' });
    });
  }, [res?.reportId, confirm, prog]);

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
  // 자리 사주(宅) 핸드오프 — /jari 에서 이미 잰 값만 받는다.
  // 좌표가 아니라 방위각·거리라서 보관함에 남겨도 브이월드 조건을 어기지 않는다.
  const [jari, setJari] = useState<{ deg?: number; km?: number; door?: number; desk?: number; from?: string; to?: string } | null>(null);
  // 후보 날짜 비교(較) 핸드오프 — /taekil 에서 고른 날짜와 무엇을 하려는 날인지.
  const [bigyo, setBigyo] = useState<{ purpose: BigyoPurpose; cands: string[] } | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); preloadKcp(); }, []);
  useEffect(() => { try { const s = sget(LS_KEY); if (s) setSaved(JSON.parse(s)); } catch {} }, []);
  // 발주처 탭에서 넘어온 경우 프리필 (?ck=client&cn=이름&cd=날짜)
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      // 회사 사주에서 확인한 법인을 그대로 이어 본다. 대표 생일과는 별도 입력이다.
      const legalDate = p.get('ld');
      if (p.get('cat') === 'daeun' && legalDate && !relatedDateError(legalDate)) {
        setF(s => ({ ...s, legal: legalDate, company: (p.get('ln') || '').trim().slice(0, 40) }));
      }
      const ck = p.get('ck') as RelKind | null, cn = p.get('cn'), cd = p.get('cd');
      if (ck && cd && ['client', 'partner', 'ally'].includes(ck)) {
        setAddKind(ck);
        setTargets(prev => [...prev.filter(x => x.kind !== ck), { kind: ck, name: cn || '', date: cd }]);
      }
      // 닮은 CEO(/ceo)에서 넘어온 경우 대표 생년월일·성함 프리필
      const b = p.get('b'), n = p.get('n');
      if (b && /^\d{4}-\d{2}-\d{2}$/.test(b)) {
        const cal = p.get('cal') === 'lunar' ? 'lunar' : 'solar';
        const leap = cal === 'lunar' && p.get('leap') === '1';
        const time = validBirthTime(p.get('time')) ? p.get('time')! : '';
        const gender = p.get('gender');
        setF(s => ({ ...s, birth: b, name: n || s.name, cal, leap, time, timeMode: time ? 'Y' : 'N', sijin: -1, gender: gender === 'M' || gender === 'F' ? gender : s.gender }));
        const [yy, mm, dd] = b.split('-').map(Number); setBp({ y: yy, m: mm, d: dd });
        const source = p.get('from');
        setEntrySource(p.get('cat') === 'daepyo' && (source === 'ceo' || source === 'sajang') ? source : '');
      }
      // 다른 화면(발주처 지도 등)에서 이미 넣은 대표 생년월일이 있으면 채워 둔다. 같은 걸 두 번 넣게 하지 않는다(2026-10-23).
      else {
        try {
          migrateLegacy();
          const me = peopleOf('self')[0];
          if (me?.date && /^\d{4}-\d{2}-\d{2}$/.test(me.date)) {
            const savedTime = me.timeMode !== 'N' && validBirthTime(me.time) ? me.time! : '';
            setF(s => s.birth ? s : ({ ...s, birth: me.date, name: s.name || (me.name || '').trim(), cal: me.cal || s.cal, leap: !!me.leap, gender: me.gender || s.gender, time: savedTime, timeMode: savedTime ? 'Y' : 'N' }));
            const [yy, mm, dd] = me.date.split('-').map(Number); setBp(prev => (prev.y ? prev : { y: yy, m: mm, d: dd }));
          }
        } catch { /* 저장소를 못 읽으면 빈 폼 */ }
      }
      // ?cat= 은 여기서 읽는다. 서버(page.tsx)가 읽으면 이 화면이 정적 파일이 되지 못해
      // 접속마다 서버 렌더가 되고, 그게 Vercel CPU 로 그대로 나간다(2026-09-21).
      const ct = p.get('cat');
      setFocusId(p.get('q') || undefined);
      const source = p.get('from') === 'ceo' ? 'ceo' : p.get('from') === 'sajang' ? 'sajang' : 'direct';
      const storageKey = 'nf:input:' + source + ':' + ct;
      let incoming = cleanJourney({ id: p.get('j'), source, cat: ct });
      try { if (!incoming) incoming = cleanJourney(JSON.parse(sessionStorage.getItem(storageKey) || 'null')); } catch {}
      const nextJourney = incoming ?? newJourney(source, ct || '');
      try { sessionStorage.setItem(storageKey, JSON.stringify(nextJourney)); } catch {}
      setJourney(nextJourney); trackFunnel(nextJourney, 'input_view');
      if (isCatKey(ct)) { setCat(ct); if (ct === 'gunghap') setAddKind('partner'); }
      // /jari → /reading 핸드오프. 숫자만 받고, 범위를 벗어나면 조용히 버린다.
      const num = (v: string | null, lo: number, hi: number) => { const n = Number(v); return v !== null && Number.isFinite(n) && n >= lo && n <= hi ? n : undefined; };
      const dg = num(p.get('dg'), 0, 360), km = num(p.get('km'), 0, 20000);
      const dr = num(p.get('dr'), 0, 7), dk = num(p.get('dk'), 0, 7);
      const pa = (p.get('pa') || '').slice(0, 40), pb = (p.get('pb') || '').slice(0, 40);
      if (dg !== undefined || dr !== undefined) setJari({ deg: dg, km, door: dr, desk: dk, from: pa || undefined, to: pb || undefined });
      // 자리 사주는 주소(방위)가 먼저다. 그것 없이 여기 오면 생년월일을 다 넣은 뒤에야 '주소부터 넣으라'는 말을 듣고 막혔다(2026-10-23).
      // 처음부터 주소를 넣는 화면으로 보낸다. 뒤로 가기가 다시 여기로 오지 않게 replace.
      else if (ct === 'ijeon') { window.location.replace('/jari'); return; }
      // 후보 날짜 비교는 날짜가 먼저다. 없거나 하나뿐이면 날짜 고르는 화면으로 보낸다.
      if (ct === 'bigyo') {
        const pp = p.get('p'), cs = parseCands(p.get('d'));
        const pu: BigyoPurpose = isPurpose(pp) ? pp : '계약일';
        if (cs.length < BIGYO_MIN) { window.location.replace('/taekil/' + encodeURIComponent(pu) + '#bigyo'); return; }
        setBigyo({ purpose: pu, cands: cs });
      }
      // 저장된 대표가 있는 재방문자에게만 선택 시트를 자동으로 띄운다. 신규 방문자는 폼을 바로 보게 한다.
      if (!p.get('b')) { try { const s = sget('nakchal_self_v1'); const has = !!s && (JSON.parse(s)?.length > 0); void has; /* 퍼널②: 자동 모달 제거: 사용자가 직접 열 때만 */ } catch { /* noop */ } }
    } catch {}
  }, []);
  function persistSaved(list: Target[]) { setSaved(list); try { sset(LS_KEY, JSON.stringify(list)); } catch {} }
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

  // 로그인/이 기기 저장 — 대표·법인 프로필을 한 번 넣으면 다음부터 골라 쓴다 (사주아이식)
  const SELF_KEY = 'nakchal_self_v1', LEGAL_KEY = 'nakchal_legal_v1';
  const [savedSelf, setSavedSelf] = useState<any[]>([]);
  const [savedLegal, setSavedLegal] = useState<any[]>([]);
  useEffect(() => { try { const a = sget(SELF_KEY); if (a) setSavedSelf(JSON.parse(a)); const b = sget(LEGAL_KEY); if (b) setSavedLegal(JSON.parse(b)); } catch {} }, []);
  // 로그인 계정에 저장된 사주/대상 불러오기 (기기가 바뀌어도 이어짐 · 사주아이식)
  useEffect(() => {
    fetch('/api/charts').then(r => r.json()).then(d => {
      const cs: any[] = d?.charts || [];
      const selfs = cs.filter(c => c.kind === 'self').map(c => ({ name: c.name || '', birth: c.birth_date, gender: '', cal: c.calendar || 'solar', leap: !!c.is_leap, timeMode: (c.birth_time ? 'Y' : 'N'), time: c.birth_time || '09:20', sijin: 3 }));
      const legals = cs.filter(c => c.kind === 'legal').map(c => ({ company: c.name || '', legal: c.birth_date }));
      const tgts = cs.filter(c => ['client', 'partner', 'ally'].includes(c.kind)).map(c => ({ kind: c.kind as RelKind, name: c.name || '', date: c.birth_date }));
      if (selfs.length) setSavedSelf(prev => dedupe([...selfs, ...prev], (x: any) => x.birth + '|' + x.name).slice(0, 12));
      if (legals.length) setSavedLegal(prev => dedupe([...legals, ...prev], (x: any) => x.legal + '|' + x.company).slice(0, 12));
      if (tgts.length) setSaved(prev => dedupe([...tgts, ...prev], (x: any) => x.kind + '|' + x.date + '|' + x.name).slice(0, 20));
    }).catch(() => {});
  }, []);
  function saveSelfProfile() {
    if (!f.birth) return;
    const p = { name: f.name, birth: f.birth, gender: f.gender, cal: f.cal, leap: f.leap, timeMode: f.timeMode, time: f.time, sijin: f.sijin };
    setSavedSelf(prev => { const nx = [p, ...prev.filter(x => !(x.birth === p.birth && x.name === p.name))].slice(0, 8); try { sset(SELF_KEY, JSON.stringify(nx)); } catch {} return nx; });
  }
  function saveLegalProfile() {
    if (!f.legal) return;
    const p = { company: f.company, legal: f.legal };
    setSavedLegal(prev => { const nx = [p, ...prev.filter(x => !(x.legal === p.legal && x.company === p.company))].slice(0, 8); try { sset(LEGAL_KEY, JSON.stringify(nx)); } catch {} return nx; });
  }
  function loadSelf(p: any) { setF(s => ({ ...s, name: p.name || '', birth: p.birth, gender: p.gender || '', cal: p.cal || 'solar', leap: !!p.leap, timeMode: p.timeMode || 'N', time: p.time || '', sijin: p.sijin ?? -1 })); const [yy, mm, dd] = String(p.birth).split('-').map(Number); setBp({ y: yy, m: mm, d: dd }); }
  function loadLegalProfile(p: any) { setF(s => ({ ...s, company: p.company || '', legal: p.legal })); }
  // 통합 사람/업체 시트에서 선택 → 해당 슬롯 채우기
  function handlePick(pp: Person) {
    if (pp.kind === 'self') {
      setF(s => ({ ...s, name: pp.name || '', birth: pp.date, gender: pp.gender || '', cal: pp.cal || 'solar', leap: !!pp.leap, timeMode: (pp.timeMode as any) || (pp.time ? 'Y' : 'N'), time: pp.time || '' }));
      const [yy, mm, dd] = String(pp.date).split('-').map(Number); setBp({ y: yy, m: mm, d: dd });
    } else if (pp.kind === 'legal') {
      setF(s => ({ ...s, company: pp.name || '', legal: relatedSolarDate(pp.date, pp.cal, pp.leap) }));
    } else {
      setTargets(prev => [...prev.filter(x => x.kind !== pp.kind), { kind: pp.kind as RelKind, name: pp.name || kindLabel(pp.kind as RelKind), date: relatedSolarDate(pp.date, pp.cal, pp.leap) }]);
    }
    setErr(''); setFieldErrors({});
  }
  const yr2 = (d: string) => (d || '').slice(2);

  const effTime = f.timeMode === 'Y' ? f.time : f.timeMode === 'grid' ? SIJIN_MID[f.sijin] ?? null : null;
  const situation = [f.bidType, f.condition].filter(Boolean).join(' · ');

  // 실시간 명식 미리보기 (클라이언트 계산 — 사정률 정밀값은 서버에서만)
  const chart = useMemo(() => !birthDateError(f.birth, f.cal, f.leap) && (f.timeMode === 'N' || validBirthTime(effTime)) ? chartFromInput(f.birth, effTime, f.cal, f.leap) : null, [f.birth, effTime, f.cal, f.leap, f.timeMode]);
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
    if (busy || generating.current) return;
    setErr('');
    const errors = {
      name: f.name.trim() ? '' : '성함을 입력해주세요. 리포트 제목에 사용합니다.',
      birth: birthDateError(f.birth, f.cal, f.leap),
      time: f.timeMode === 'N' || validBirthTime(effTime) ? '' : '태어난 시간을 골라주세요. 모르면 ‘모름’으로 진행할 수 있습니다.',
    };
    setFieldErrors(errors);
    if (errors.name) { focusField('rd-name'); return; }
    if (errors.birth) { focusField(!bp.y ? 'rd-year' : !bp.m ? 'rd-month' : 'rd-day'); return; }
    if (errors.time) { setMore(true); focusField('rd-time-options'); return; }
    if (f.legal && relatedDateError(f.legal)) { setErr('회사 설립일을 다시 확인해주세요. 선택한 달에 있는 날짜여야 합니다.'); return; }
    if (targets.some(t => relatedDateError(t.date))) { setErr('상대방의 날짜를 다시 확인해주세요. 선택한 달에 있는 날짜여야 합니다.'); return; }
    // 카테고리별 필수 입력 안내
    const req = ui.requires;   // 카테고리 필수 입력(스키마 기반)
    if (req === 'legal' && !f.legal) { setErr('회사 대운은 법인 설립일이 필요합니다. 아래 「회사 정보」에 설립일을 넣어주세요.'); document.getElementById('cocard')?.scrollIntoView({ behavior: 'smooth' }); return; }
    // 빠진 칸으로 화면을 옮긴다. 안내만 띄우면 아래 결제 막대에 가려 손님이 못 봤다(2026-10-23 협정·궁합에서 대표 지적).
    const toRel = () => setTimeout(() => document.getElementById('relcard')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    if (req === 'client' && !targets.some(t => t.kind === 'client')) { setErr('발주처를 먼저 골라 주세요.'); setTimeout(() => document.getElementById('baljupick')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); setClientPick(true); return; }
    if (req === 'partnerOrAlly' && !targets.some(t => t.kind === 'partner' || t.kind === 'ally')) { setErr('동업 또는 협정 상대를 먼저 추가해 주세요. 위 관계·궁합 칸에서 고르거나 새로 넣을 수 있습니다.'); toRel(); return; }
    // 자리 사주는 주소·방위가 있어야 읽을 게 생긴다. 없이 팔면 빈 리포트가 나간다.
    if (cat === 'bigyo' && !bigyo) { setErr('비교할 날짜가 없습니다. 택일 화면에서 날짜를 두세 개 고른 뒤 다시 오세요.'); return; }
    if (cat === 'ijeon' && !jari) { setErr('자리 사주는 사무실 주소와 방위가 필요합니다. 「자리 사주」 화면에서 주소를 넣고 다시 오세요.'); return; }
    setConfirm(true); // 결과를 만들기 전에 달력 기준과 날짜를 확인한다.
  }

  async function run() {
    if (generating.current) return;
    generating.current = true; setPurchased(false); setRecovery(false);
    const controller = new AbortController();
    reportRequest.current = controller;
    setErr('');
    setConfirm(false); setBusy(true); setLevel(0); setProg(true);
    try {
      const tg = (k: RelKind) => targets.find(t => t.kind === k);
      const body = {
        name: f.name, birth: f.birth, time: f.timeMode === 'N' ? null : effTime,
        cal: f.cal, leap: f.leap,
        legal: f.legal || null, legalName: f.company || undefined,
        client: tg('client')?.date || null, clientName: tg('client')?.name, clientCore: isCoreClient(tg('client')?.name),
        partner: tg('partner')?.date || null, partnerName: tg('partner')?.name,
        ally: tg('ally')?.date || null, allyName: tg('ally')?.name,
        situation, worry: f.worry, cat: cat || undefined, focusId, journey,
        jari: jari || undefined,
        cands: bigyo?.cands, purpose: bigyo?.purpose,
      };
      const r = await requestReading<Result & { token?: string; label?: string }>(body, controller);
      setTok(r.reportId, r.token);   // 접근토큰 로컬 보관(비회원 리포트 IDOR 방어)
      setRes(r);
      markResultSeen();   // 홈 화면 추가 권유는 결과를 본 사람에게만
      // 관리자는 서버가 레벨 2로 본문을 만들어 보낸다. 그 값을 그대로 받아야
      // 배지(자물쇠/열림)와 본문이 같은 기준으로 그려진다.
      setLevel(r.level ?? 0);
      // 보관함 기록 (이 기기 · 로그인 시 계정) + 저장된 사주/대상 서버 기록(best-effort)
      recordReport({ id: r.reportId, label: r.label || r.title, when: Date.now(), unlocked: false });
      setSavedResult(listVault().some(item => item.id === r.reportId));
      fetch('/api/charts', { method: 'POST', body: JSON.stringify({ kind: 'self', name: f.name, birth_date: f.birth, birth_time: f.timeMode === 'N' ? null : effTime, calendar: f.cal, is_leap: f.leap }) }).catch(() => {});
      if (f.legal) fetch('/api/charts', { method: 'POST', body: JSON.stringify({ kind: 'legal', name: f.company, birth_date: f.legal }) }).catch(() => {});
      targets.forEach(t => fetch('/api/charts', { method: 'POST', body: JSON.stringify({ kind: t.kind, name: t.name, birth_date: t.date }) }).catch(() => {}));
      saveSelfProfile(); if (f.legal) saveLegalProfile();
    } catch (error) {
      setErr(error instanceof Error ? error.message : '결과를 불러오지 못했습니다. 입력 내용은 그대로입니다. 다시 시도해주세요.');
      focusField('rd-request-error');
    } finally { generating.current = false; reportRequest.current = null; setBusy(false); setProg(false); }
  }

  // 개별 상품(묶음 없음): 잠긴 섹션 → 그 섹션을 파는 카테고리 상품으로 리포트를 좁혀 다시 뽑는다.
  async function openProduct(catKey: string) {
    if (busy) return;
    setPurchased(false); setRecovery(false); setCat(catKey); setErr(''); setBusy(true); setLevel(0);
    try {
      const tg = (k: RelKind) => targets.find(t => t.kind === k);
      const body = {
        name: f.name, birth: f.birth, time: f.timeMode === 'N' ? null : effTime,
        cal: f.cal, leap: f.leap,
        legal: f.legal || null, legalName: f.company || undefined,
        client: tg('client')?.date || null, clientName: tg('client')?.name, clientCore: isCoreClient(tg('client')?.name),
        partner: tg('partner')?.date || null, partnerName: tg('partner')?.name,
        ally: tg('ally')?.date || null, allyName: tg('ally')?.name,
        situation, worry: f.worry, cat: catKey, focusId, journey: journey ? { ...journey, cat: catKey } : newJourney('direct', catKey),
      };
      const resp = await fetch('/api/report', { method: 'POST', body: JSON.stringify(body) });
      if (!resp.ok) throw new Error();
      const r = await resp.json();
      setTok(r.reportId, r.token);   // 접근토큰 로컬 보관(비회원 리포트 IDOR 방어)
      setRes(r);
      recordReport({ id: r.reportId, label: r.label || r.title, when: Date.now(), unlocked: false });
      // (스크롤 점프 제거 — 잠긴 항목 클릭 시 화면이 위로 튀지 않도록 제자리 갱신)
      // 버튼에 "열기 · 9,900원" 이라고 적어놓고 누르면 리포트만 다시 뽑고 끝났다 — 결제하려면
      // 새로 생긴 버튼을 또 찾아 눌러야 했다(2026-09-10 60명 점검). 뽑은 그 자리에서 결제창을 연다.
      setModal(true);
    } catch { setErr('상품을 여는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.'); }
    finally { setBusy(false); }
  }
  // 연도(세운) 전환 — 대표·회사·발주처 궁합을 그 해 기준으로 다시 계산
  async function switchYear(y: number) {
    if (!res || busy) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/report/get?id=${res.reportId}&year=${y}&t=${encodeURIComponent(tokParam(res.reportId))}`).then(x => x.json());
      if (r && r.sections) setRes(prev => (prev ? { ...prev, ...r } : r));
    } catch {} finally { setBusy(false); }
  }
  // 이 리포트에서 낱개로 살 수 있는 상품(잠긴 섹션 소속) — 중복 제거
  const lockedProducts = useMemo(() => {
    if (!res) return [] as { key: string; name: string; hanja: string; price: number; lead: string }[];
    const seen = new Set<string>(); const out: any[] = [];
    res.sections.forEach(s => {
      if ((RANK[s.tier] ?? 2) > level) { const p = productOfMk(s.mk); if (p && !seen.has(p.key)) { seen.add(p.key); out.push(p); } }
    });
    return out;
  }, [res, level]);
  const anyLocked = !!res && res.sections.some(s => (RANK[s.tier] ?? 2) > level && !s.html);
  const lockedCount = res ? res.sections.filter((s2: any) => (RANK[s2.tier] ?? 2) > level).length : 0;
  useEffect(() => {
    if (!res) return;
    const first = firstReadingSection(res.sections, res.focus);
    setExpanded(first >= 0 ? [first] : []);
    trackFunnel(res.journey, res.sections.some(s => !s.free && !!s.html) ? 'paid_open' : 'free_result', res.admin);
  }, [res, level]);
  const toggleSec = (i: number) => setExpanded(ex => ex.includes(i) ? ex.filter(x => x !== i) : [...ex, i]);
  const anyPass = !!res && res.sections.some(s => (s as any).passLock);   // 발주처 프리미엄 잠금 존재

  async function pay(chosen: 'taekil' | 'full' | 'baljuPass') {
    if (!res || paying.current || recovery) return;
    paying.current = true; setErr(''); setBusy(true);
    let confirmed = false;
    try {
      const outcome = await startPurchase({ reportId: res.reportId, sku: chosen, ...buyerBody() }, res.journey);
      if (outcome === 'redirect') return;
      if (outcome === 'cancelled') { setErr('결제창을 닫았습니다. 무료 결과는 그대로 볼 수 있습니다.'); return; }
      confirmed = true;
      if (chosen === 'baljuPass') { location.assign('/thanks?kind=pass&paid=1'); return; }
      const { ok, data: full } = await requestJSON('/api/report/paid?id=' + res.reportId + '&t=' + encodeURIComponent(tokParam(res.reportId)));
      if (!ok || !(full.level >= (chosen === 'taekil' ? 1 : 2))) throw new PurchaseError(PURCHASE_PENDING, true);
      setRes({ ...res, ...full }); setLevel(full.level); setModal(false); setPurchased(true);
      recordReport({ id: res.reportId, label: res.title, when: Date.now(), unlocked: true });
      requestAnimationFrame(() => document.getElementById('purchase-success')?.scrollIntoView({ block: 'center' }));
    } catch (e) { setErr(e instanceof Error ? e.message : PURCHASE_PENDING); setRecovery(confirmed || (e instanceof PurchaseError && e.recover)); }
    finally { setBusy(false); paying.current = false; }
  }
  const payPass = () => pay('baljuPass');

  async function share() {
    if (!res) return;
    const url = `${location.origin}/report/${res.reportId}?t=${encodeURIComponent(tokParam(res.reportId))}`;
    const text = `[낙찰사주] 오늘 낙찰 유리도 ${res.hero?.score ?? ''}점: ${res.hero?.sub ?? ''}. 대표와 회사 사주로 오늘의 투찰 택일을 짚어 봤습니다. 대표님도 한번 보시죠:`;
    try {
      if (navigator.share) await navigator.share({ title: '낙찰사주', text, url });
      else { await navigator.clipboard.writeText(text + ' ' + url); alert('공유 문구와 링크를 복사했어요. 카톡에 붙여넣어 보내세요.'); }
    } catch {}
  }

  function exportIcs() {
    if (!chart) return;
    const me = chart.dayMasterEl;
    const now = new Date();
    const days: string[] = [];
    for (let i = 0; i < 30; i++) {
      const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const rel = relCat(me, dayElOf(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()));
      if (rel === 'in' || rel === 'bi' || rel === 'jae' || rel === 'sik')
        days.push(`${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, '0')}${String(dt.getDate()).padStart(2, '0')}`);
    }
    let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//nakchal-saju//gilil//KR\r\nCALSCALE:GREGORIAN\r\n';
    for (const d of days) ics += `BEGIN:VEVENT\r\nUID:${d}-${Math.random().toString(36).slice(2)}@nakchal\r\nDTSTART;VALUE=DATE:${d}\r\nSUMMARY:\u5409\u65e5 \u2014 \ud22c\ucc30\u00b7\uacc4\uc57d\uc5d0 \uc720\ub9ac\r\nDESCRIPTION:\ub099\ucc30\uc0ac\uc8fc \u00b7 \ub300\ud45c\ub2d8 \uc77c\uac04\uc744 \uc0b4\ub9ac\ub294 \ub0a0\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nTRIGGER:PT9H\r\nDESCRIPTION:\ub099\ucc30\uc0ac\uc8fc \u2014 \uc624\ub298\uc740 \ud22c\ucc30\u00b7\uacc4\uc57d\uc5d0 \uc720\ub9ac\ud55c \ub0a0\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
    ics += 'END:VCALENDAR\r\n';
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'nakchal-gilil.ics'; a.click(); URL.revokeObjectURL(url);
  }
  const seg = (on: boolean) => 'seg-b' + (on ? ' on' : '');
  const by = bp.y, bm = bp.m, bd = bp.d;
  // 년/월/일 3분할 — 부분 선택을 상태에 누적하고, 셋이 다 차면 birth를 세팅한다.
  const setB = (part: { y?: number; m?: number; d?: number }) => {
    const next = updateBirthParts(bp, part, f.cal, f.leap);
    setBp(next.parts); set('birth', next.birth);
    setFieldErrors(e => ({ ...e, birth: '' }));
    setDateNotice(next.cleared ? '선택한 달에 맞게 태어난 날을 다시 골라주세요.' : '');
  };
  const setCalendar = (cal: 'solar' | 'lunar', leap: boolean) => {
    const next = updateBirthParts(bp, {}, cal, leap);
    setBp(next.parts); setF(s => ({ ...s, cal, leap, birth: next.birth }));
    setFieldErrors(e => ({ ...e, birth: '' }));
    setDateNotice(next.cleared ? '달력 기준이 바뀌었습니다. 태어난 날을 다시 골라주세요.' : '');
  };
  const birthDays = birthMonthDays(by, bm, f.cal, f.leap);
  const dateError = fieldErrors.birth || (by && bm && !birthDays ? '선택한 월은 윤달이 아닙니다. 평달·윤달과 월을 확인해주세요.' : '');
  const editInput = () => { const next = newJourney(journey?.source ?? 'direct', cat); setJourney(next); trackFunnel(next, 'input_view'); setPurchased(false); setRecovery(false); setRes(null); setLevel(0); setConfirm(false); setErr(''); focusField('rd-name'); };

  return (
    <div className="app reading-page">
      <header className="u-top">
        <Link href="/" className="u-back" aria-label="홈으로"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg></Link>
        <h1>{catInfo ? catInfo.name : '사주 보기'}</h1>
      </header>
      <div className="wrap">
        <ol className="rd-steps" aria-label="무료 풀이 진행 순서">
          {['정보 입력', '내용 확인', '무료 결과'].map((label, i) => <li key={label} aria-current={(res ? 2 : confirm || prog ? 1 : 0) === i ? 'step' : undefined}><span>{i + 1}</span>{label}</li>)}
        </ol>
        {purchased && res && <div className="purchase-notice" id="purchase-success" role="status"><h2>구매한 풀이가 열렸습니다</h2><p>{catInfo?.name ?? '구매한 리포트'} · 다음에도 보관함에서 다시 열 수 있습니다. 다른 기기에서는 결제할 때 입력한 성함과 번호로 찾아주세요.</p><div className="purchase-actions"><Link href={`/report/${res.reportId}?t=${encodeURIComponent(tokParam(res.reportId))}`}>구매한 리포트 보기</Link><Link href="/vault">보관함으로</Link><Link href="/find">다른 기기에서 찾기</Link></div></div>}
        {err && !modal && <div id="rd-request-error" className="errbox" role="alert" tabIndex={-1}>{err}</div>}
        {!res && !confirm && !prog && (<>
        {/* 0. 컨셉 훅: 카테고리별 몰입 배너 */}
        {entrySource && <div className="rd-hook"><b>{entrySource === 'sajang' ? '내 강점을 살리고, 조심할 점을 이해하는 방법' : '내가 대표가 된다면, 나의 강점과 일하는 방식'}</b><span>{entrySource === 'sajang' ? '‘대표가 될 사주일까’' : '닮은 CEO'}에서 입력한 정보를 가져왔습니다. 확인 후 무료 성향과 유료 풀이 일부를 볼 수 있습니다.</span></div>}
        {!entrySource && cat && HOOK[cat] && (
          <div className="rd-hook">
            <b>{HOOK[cat].t}</b>
            <span>{HOOK[cat].d}</span>
          </div>
        )}
        {cat === 'bigyo' && bigyo && (
          <div className="rd-hook rd-cands">
            <b>{BIGYO_LABEL[bigyo.purpose]} 후보 {bigyo.cands.length}개</b>
            <span>{bigyo.cands.map(d => { const [y, m, dd] = d.split('-').map(Number); return `${y !== new Date().getFullYear() ? y + '년 ' : ''}${m}월 ${dd}일`; }).join(' · ')}</span>
            <a href={'/taekil/' + encodeURIComponent(bigyo.purpose) + '#bigyo'}>날짜 다시 고르기</a>
          </div>
        )}
        {!cat && (
          <div className="rd-hook">
            <b>성함과 생년월일을 입력해주세요</b>
            <span>무료 풀이를 먼저 확인합니다. 태어난 시간을 몰라도 시작할 수 있습니다.</span>
          </div>
        )}
        {/* 0-2. 사업운 캘린더: 기간 선택(이달/연간 한 경로) */}
        {ui.calToggle && (
          <div className="card">
            <div className="st"><span className="l"><span className="b" />기간 선택</span><span className="opt">이달 · 연간</span></div>
            <div className="perntog">
              <button type="button" className={cat === 'calendar' ? 'on' : ''} onClick={() => setCat('calendar')}>
                <b>이달</b><em>오늘부터 한 달</em>
              </button>
              <button type="button" className={cat === 'calendar_year' ? 'on' : ''} onClick={() => setCat('calendar_year')}>
                <b>연간</b><em>올 한 해 12개월</em>
              </button>
            </div>
          </div>
        )}
        {/* 2. 대표님 정보 */}
        <div className="card">
          <div className="st"><span className="l"><span className="b" />기본 정보</span><span className="opt">필수</span></div>
          {savedSelf.length > 0 && (
            <button type="button" className="pickbtn" onClick={() => setPicker({ open: true, kind: 'self' })}>
              <span className="pktx"><b>저장된 정보 불러오기</b><em>{f.birth ? '아래 정보가 본인 정보인지 확인해주세요.' : '이전에 입력한 정보를 선택할 수 있습니다.'}</em></span>
              <span className="pkgo">›</span>
            </button>
          )}
          {/* 성함은 필수(2026-10-22). 리포트 제목과 보관함 목록이 성함으로 갈린다 — 비면 '대표님' 리포트가 줄줄이 쌓였다. */}
          <label htmlFor="rd-name" className="rd-namel">성함</label>
          <input id="rd-name" className="rd-name" value={f.name} maxLength={12} required aria-required="true" autoComplete="name" aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? 'rd-name-error' : 'rd-name-help'}
            placeholder="예) 홍길동" onChange={e => { set('name', e.target.value); setFieldErrors(x => ({ ...x, name: '' })); }} />
          {fieldErrors.name ? <p id="rd-name-error" className="rd-field-error" role="alert">{fieldErrors.name}</p> : <p id="rd-name-help" className="rd-help">리포트 제목과 보관함에서 구분할 이름입니다.</p>}
          <div className="rd-namel">생년월일</div>
          <div className="rd-cal" role="group" aria-label="달력">
            <button type="button" className={f.cal === 'solar' ? 'on' : ''} aria-pressed={f.cal === 'solar'} onClick={() => setCalendar('solar', false)}>양력</button>
            <button type="button" className={f.cal === 'lunar' ? 'on' : ''} aria-pressed={f.cal === 'lunar'} onClick={() => setCalendar('lunar', f.leap)}>음력</button>
            {f.cal === 'lunar' && (<>
              <span className="rd-sep" aria-hidden="true" />
              <button type="button" className={!f.leap ? 'on' : ''} aria-pressed={!f.leap} onClick={() => setCalendar('lunar', false)}>평달</button>
              <button type="button" className={f.leap ? 'on' : ''} aria-pressed={f.leap} onClick={() => setCalendar('lunar', true)}>윤달</button>
            </>)}
          </div>
          <p id="rd-calendar-help" className="rd-help">{f.cal === 'lunar' ? '음력 생일 그대로 골라주세요. 윤달에 태어났다고 확인한 경우에만 ‘윤달’을 선택하세요.' : '양력 생일을 골라주세요. 음력으로 알고 있다면 먼저 ‘음력’을 선택하세요.'}</p>
          <div className="bdate">
            <select id="rd-year" required aria-label="태어난 해" aria-invalid={!!dateError} aria-describedby={dateError ? 'rd-birth-error' : 'rd-calendar-help'} value={by || ''} onChange={e => setB({ y: +e.target.value })}><option value="" disabled>년도</option>{by && !YEARS.includes(by) ? <option value={by}>{by}년</option> : null}{YEARS.map(y => <option key={y} value={y}>{y}년</option>)}</select>
            <select id="rd-month" required aria-label="태어난 달" aria-invalid={!!dateError} aria-describedby={dateError ? 'rd-birth-error' : 'rd-calendar-help'} value={bm || ''} onChange={e => setB({ m: +e.target.value })}><option value="" disabled>월</option>{MONTHS.map(m => <option key={m} value={m}>{m}월</option>)}</select>
            <select id="rd-day" required aria-label="태어난 날" aria-invalid={!!dateError} aria-describedby={dateError ? 'rd-birth-error' : 'rd-calendar-help'} value={bd || ''} onChange={e => setB({ d: +e.target.value })}><option value="" disabled>일</option>{Array.from({ length: birthDays }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}일</option>)}</select>
          </div>
          {dateError && <p id="rd-birth-error" className="rd-field-error" role="alert">{dateError}</p>}
          {dateNotice && !dateError && <p className="rd-help" role="status">{dateNotice}</p>}
          <button type="button" className="rd-more" aria-expanded={more} onClick={() => setMore(v => !v)}>
            {more ? '태어난 시간·성별 접기' : '태어난 시간·성별 추가'}<span>선택</span>
          </button>
          {!more && <p className="rd-help">{f.timeMode === 'N' ? '시간을 모르면 추가하지 않고 다음으로 넘어가세요.' : `태어난 시간: ${effTime || '선택 필요'}`}</p>}
          {more && (<div className="rd-fold">
          <label>태어난 시간</label>
          <div id="rd-time-options" className="seg" role="group" aria-label="태어난 시간 입력 방법" tabIndex={-1} aria-describedby={fieldErrors.time ? 'rd-time-error' : undefined}>
            <button className={seg(f.timeMode === 'Y')} aria-pressed={f.timeMode === 'Y'} onClick={() => { set('timeMode', 'Y'); setFieldErrors(e => ({ ...e, time: '' })); }}>정확히 알아요</button>
            <button className={seg(f.timeMode === 'grid')} aria-pressed={f.timeMode === 'grid'} onClick={() => { set('timeMode', 'grid'); setFieldErrors(e => ({ ...e, time: '' })); }}>대략 알아요</button>
            <button className={seg(f.timeMode === 'N')} aria-pressed={f.timeMode === 'N'} onClick={() => { set('timeMode', 'N'); setFieldErrors(e => ({ ...e, time: '' })); }}>모름</button>
          </div>
          {fieldErrors.time && <p id="rd-time-error" className="rd-field-error" role="alert">{fieldErrors.time}</p>}
          {f.timeMode === 'N' && <div className="tsnote">생년월일만으로 풀이합니다. 시간에 따라 달라지는 해석은 제외합니다.</div>}
          {f.timeMode === 'Y' && (
            <div>
              <input type="time" aria-label="태어난 시각" aria-invalid={!!fieldErrors.time} value={f.time} onChange={e => { set('time', e.target.value); setFieldErrors(x => ({ ...x, time: '' })); }} style={{ marginTop: 8 }} />
              <div className="tsnote">오전·오후를 확인해주세요. 한국 출생 기준으로 시간을 보정합니다.</div>
            </div>
          )}
          {f.timeMode === 'grid' && (
            <div className="sijin">
              {SIJIN.map(([nm, rng], i) => (
                <button type="button" key={i} className={'sj' + (f.sijin === i ? ' on' : '')} aria-pressed={f.sijin === i} onClick={() => { set('sijin', i); setFieldErrors(x => ({ ...x, time: '' })); }}><b>{nm}</b><span>{rng}</span></button>
              ))}
            </div>
          )}
          <label>성별 <span className="opt">(선택 · 계산에는 쓰지 않습니다)</span></label>
          <div className="seg">
            <button className={seg(f.gender === 'M')} onClick={() => set('gender', f.gender === 'M' ? '' : 'M')}>남</button>
            <button className={seg(f.gender === 'F')} onClick={() => set('gender', f.gender === 'F' ? '' : 'F')}>여</button>
          </div>
          </div>)}

          {/* 실시간 만세력 미리보기: 생년월일이 들어온 뒤에만 */}
          {chart && <details className="prevbox rd-preview">
            <summary>입력한 생년월일의 사주 미리보기 <span>선택</span></summary>
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
            ) : null}
          </details>}
        </div>

        {/* 상황 (사정률·통합에서만): 고르지 않아도 뽑힌다. 생년월일 아래로 내렸다. */}
        {ui.situation && (<details className="card rd-optional">
          <summary>입찰 상황 추가 <span>선택</span></summary>
          <p className="rd-help">고르지 않아도 무료 결과를 볼 수 있습니다.</p>
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
        </details>)}
        {cat === 'sajeong' && <details className="card rd-optional"><summary>무료·유료 범위 확인</summary><TaekilAccess /></details>}


        {/* 0-1. 이걸 알게 됩니다. 폼보다 먼저 온다.
            전에는 이 자리가 비어 있어서, 처음 온 대표가 보는 게 빈 입력폼뿐이었다.
            뭘 얻는지 모르는 채로 생년월일부터 넣으라고 하면 아무도 안 넣는다. */}
        {cat !== 'sajeong' && catInfo && catInfo.gives?.length > 0 && (
          <div className="card">
            <div className="st"><span className="l"><span className="b" />이걸 알게 됩니다</span>
              <span className="opt">{catInfo.name}</span></div>
            <ul className="gives">
              {catInfo.gives.map((g: string) => <li key={g}>{g}</li>)}
            </ul>
            <p className="note">위에 생년월일을 넣으시면 <b>명식과 방향은 무료로</b> 먼저 나옵니다. 이 항목들은 열어보실 때 결제하세요.</p>
          </div>
        )}
        {/* 3. 회사 정보 */}
        <div id="cocard" className="card reveal" style={{ display: (f.birth && ui.legal !== 'hidden') ? undefined : 'none' }}>
          <div className="st"><span className="l"><span className="b" />회사 정보</span><span className={'chip ' + (ui.legal === 'required' ? 'paid' : 'free')}>{ui.legal === 'required' ? '필수' : '회사 사주'}</span></div>
          <button type="button" className="pickbtn" onClick={() => setPicker({ open: true, kind: 'legal' })}>
            <span className="pktx"><b>{f.legal ? `${f.company || '회사'} · ${yr2(f.legal)}` : '저장된 법인 선택 · 새로 추가'}</b><em>업체 목록에서 고르거나 새로 추가</em></span>
            <span className="pkgo">›</span>
          </button>
          <label>회사명 <span className="opt">(선택)</span></label>
          <input value={f.company} maxLength={20} aria-label="회사명" placeholder="예) 대한건설(주)" onChange={e => set('company', e.target.value)} />
          <label>법인 설립일 {ui.legal === 'required' ? <span className="opt" style={{ color: 'var(--red)' }}>· 대운·세운 계산의 기준</span> : <span className="opt">· 법인 운세 + 통합 택일</span>}</label>
          <DateSelect value={f.legal} onChange={v => set('legal', v)} yearFrom={1945} yearTo={2026} />
          <div className="note">{ui.legal === 'required' ? '※ 회사 대운은 법인 설립일을 기준으로 연도별 큰 흐름(세운)을 산출합니다. 사업자등록증의 「개업연월일」을 넣어주세요.' : '※ 회사 설립일을 넣으면 대표+법인 통합으로 택일과 회사 운세가 더 정교해집니다.'}</div>
        </div>

        {/* 4. 관계·궁합 */}
        {ui.baljuCard && (() => {
          const t = targets.find(x => x.kind === 'client');
          return (
            <div className="card reveal">
              <div className="st"><span className="l"><span className="b" />발주처 선택</span><span className="opt">궁합 대상</span></div>
              {t ? (
                <div className="baljusel">
                  <div className="bjinfo"><b>{t.name} {isCoreClient(t.name) && <span className="corelock">핵심</span>}</b><span>{t.date.slice(0, 4)} 설립 · 대표님과의 궁합</span></div>
                  <button type="button" className="bjchg" onClick={() => setClientPick(true)}>다른 발주처 ›</button>
                </div>
              ) : (
                <button type="button" id="baljupick" className="baljupick" onClick={() => setClientPick(true)}>
                  <span className="bptx"><b>발주처를 먼저 고르세요</b><em>{CLIENTS.length}곳 중에서 검색해 고르면 이 자리에 들어옵니다</em></span>
                  <span className="bpgo">고르기 ›</span>
                </button>
              )}
            </div>
          );
        })()}
        <div id="relcard" className="card reveal" style={{ display: (f.birth && ui.relation.length > 0) ? undefined : 'none' }}>
          <div className="st"><span className="l"><span className="b" />관계·궁합</span><span className="opt">{ui.requires === 'partnerOrAlly' || ui.requires === 'client' ? '필수' : '선택'}</span></div>
          <div className="pkgrid">
            {REL_KINDS.filter(k => ui.relation.includes(k.key as any)).map(k => (
              <button key={k.key} type="button" className="pickbtn" onClick={() => setPicker({ open: true, kind: k.key })}>
                <span className="pktx"><b>{k.label} 선택 · 추가</b><em>{k.sub} 기준 · 목록에서 고르거나 새로 추가</em></span>
                <span className="pkgo">›</span>
              </button>
            ))}
          </div>

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

        <div className="note" style={{ textAlign: 'center' }}>※ 재미로 보는 명리 기반 참고 정보. 투찰금액 산정 근거로 사용 불가.</div>
        {/* 아래 결제 막대(rd-bar, 고정) 높이만큼 비워 둔다. 바깥 .shell 여백은 화면 폭에 따라 안 먹었다. */}
        <div className="rd-spacer" aria-hidden="true" />
        </>)}

        {confirm && !prog && <section className="card rd-review" aria-labelledby="rd-review-title">
          <h2 id="rd-review-title" tabIndex={-1}>입력 내용을 확인해주세요</h2>
          <p className="rd-help">특히 양력·음력과 생년월일이 맞는지 확인해주세요.</p>
          <dl className="rd-summary">
            <div><dt>성함</dt><dd>{f.name}</dd></div>
            <div><dt>생년월일</dt><dd>{displayBirth(f.birth, f.cal, f.leap)}</dd></div>
            <div><dt>태어난 시간</dt><dd>{f.timeMode === 'Y' ? f.time : f.timeMode === 'grid' && f.sijin >= 0 ? `${SIJIN[f.sijin][0]} (${SIJIN[f.sijin][1]})` : '모름 · 생년월일만으로 풀이'}</dd></div>
            {f.gender && <div><dt>성별</dt><dd>{f.gender === 'M' ? '남' : '여'}</dd></div>}
            {situation && <div><dt>입찰 상황</dt><dd>{situation}</dd></div>}
            {f.legal && <div><dt>{f.company || '회사 설립일'}</dt><dd>{f.legal}</dd></div>}
            {targets.map(t => <div key={t.kind}><dt>{kindLabel(t.kind)}</dt><dd>{t.name} · {t.date} · 양력 기준</dd></div>)}
          </dl>
          <p className="rd-review-note">{cat === 'sajeong' ? '오늘의 해석과 7일 흐름을 무료로 확인합니다.' : '먼저 무료로 제공하는 결과를 확인합니다.'}<br />이 단계에서는 결제하지 않습니다.</p>
          <div className="rd-review-actions">
            <button type="button" onClick={editInput}>입력 내용 수정</button>
            <button type="button" className="primary" onClick={run} disabled={busy}>무료 결과 확인하기 →</button>
          </div>
        </section>}
        {prog && <section className="card rd-progress" aria-busy="true" aria-labelledby="rd-progress-title">
          <h2 id="rd-progress-title" tabIndex={-1}>무료 결과를 준비하고 있습니다</h2>
          <p role="status">입력한 생년월일로 풀이 중입니다. 완료되면 바로 결과를 보여드립니다.</p>
          <p className="rd-help">연결 상태에 따라 잠시 걸릴 수 있습니다.</p>
        </section>}
        {res && <section className="rd-result-intro" aria-labelledby="rd-result-title">
          <h2 id="rd-result-title" tabIndex={-1}>{level > 0 ? '상세 결과가 열렸습니다' : '무료 결과가 나왔습니다'}</h2>
          <p>{f.name} · {displayBirth(f.birth, f.cal, f.leap)}</p>
          <p className="rd-help">{cat === 'sajeong' ? '오늘의 해석과 7일 흐름은 아래 첫 풀이에서 확인하세요.' : '아래 첫 풀이가 펼쳐져 있습니다. 다른 제목을 누르면 이어서 볼 수 있습니다.'}</p>
          <div className="rd-result-actions no-print"><button type="button" onClick={editInput}>입력 내용 수정</button><Link href="/vault">내 리포트 보관함 →</Link></div>
          <p className="rd-help">{savedResult ? '이 기기의 보관함에 저장했습니다. 나중에 다시 열어볼 수 있습니다.' : '이 기기에 저장하지 못했습니다. 아래 [결과 공유]로 링크를 따로 보관해주세요.'}</p>
        </section>}
        {res && (
          <div id="rep" className="rcols" style={{ marginTop: 6 }}>
            <div className="rleft">
            {/* 결론(오늘 넣어도 되나)을 맨 앞으로, 명리 원국은 그 아래로 */}
            {res.hero && (
              <div className="rhero">
                <div className="hl" dangerouslySetInnerHTML={{ __html: res.hero.headline }} />
                <div className={'num' + (res.hero.big && (res.hero.big as any).length > 2 ? ' numtx' : '')} style={{ color: res.hero.up ? '#2f56c4' : '#b3382c' }}>{res.hero.big ?? res.hero.score}<span style={{ fontSize: 22 }}>{res.hero.unit ?? '점'}</span></div>
                <div className="lab">{res.hero.label}</div>
                <div className="sub2">{res.hero.sub}</div>
              </div>
            )}
            {res.wonguk && res.wonguk.length > 0 && <WonGuk p={res.wonguk} />}
            </div>
            <div className="rright">
            <ReadingFocus focus={res.focus} onRead={() => { const i = firstReadingSection(res.sections, res.focus); setExpanded(i >= 0 ? [i] : []); requestAnimationFrame(() => document.getElementById('report-section-' + i)?.scrollIntoView({ block: 'start', behavior: 'smooth' })); }} />
            {/* 관리자는 결제 없이 전부 열려 보인다. 그걸 안 적어두면 손님 화면이 이런 줄 알고
                유료 게이팅이 고장 난 걸 멀쩡한 걸로 착각하게 된다. */}
            {res.admin && (
              <div className="adminview no-print">
                관리자 열람 중: 손님에게는 잠겨 보입니다. 실제 화면은 시크릿 창에서 확인하는 편이 낫습니다.
              </div>
            )}
            <div className="rephd">{res.title}</div>
            {res.sections.some(sec => sec.mk === '率') && <TaekilAccess unlocked={level >= 1} />}
            <button className="topshare no-print" onClick={share} aria-label="결과 링크 공유">↗ 결과 공유</button>
            {res.hero && <a className="topshare no-print" href={`/api/og/card?score=${encodeURIComponent(String(res.hero.big ?? res.hero.score))}&unit=${encodeURIComponent(res.hero.unit ?? '점')}&type=${encodeURIComponent(res.hero.label)}&note=${encodeURIComponent(res.hero.sub || '')}&up=${res.hero.up ? '1' : '0'}`} target="_blank" rel="noopener" style={{ marginLeft: 6 }}>카드 저장</a>}
            {res.selYear && ui.yearBar && <YearBar year={res.selYear} hanja={res.seun?.hanja} busy={busy} onChange={switchYear} />}
            {(() => { const total = res.sections.length; const opened = res.sections.filter(s => (RANK[s.tier] ?? 2) <= level && s.html).length;
              return (
                <div className="rtoc">
                  <b>{total}장 중 {opened}장 열림</b>
                  <span>제목을 누르면 펼쳐집니다</span>
                </div>
              ); })()}
            {res.purchasePreview && <a className="prp-jump no-print" href="#paid-reading-preview">내 유료 풀이 일부 미리보기 ↓</a>}
            <div id="acc">
              {(() => { const firstLockedIdx = res.sections.findIndex((s2: any) => (RANK[s2.tier] ?? 2) > level && !s2.html); return res.sections.map((sec, i) => {
                const rank = RANK[sec.tier] ?? 2;
                const open = rank <= level && !!sec.html;
                const locked = rank > level;
                const prod = productOfMk(sec.mk);
                const pPrice = catInfo ? catInfo.price : (prod?.price ?? 0);
                const pName = catInfo ? catInfo.name : (prod?.name ?? '개별 상품');
                const openThis = () => { setErr(''); if (catInfo) setModal(true); else if (prod) openProduct(prod.key); };
                return (
                  <React.Fragment key={i}>
                    {res.purchasePreview && i === firstLockedIdx && <PaidReadingPreview journey={res.journey} admin={res.admin} preview={res.purchasePreview} busy={busy} onOpen={() => {
                      setErr(''); if (catInfo) setModal(true); else openProduct(res.purchasePreview!.cat);
                    }} />}
                    {!res.purchasePreview && catInfo && level < 2 && i === firstLockedIdx && (
                      <>
                        <div className="readyline"><b>{catInfo.name}</b> 계산은 끝났습니다. 열면 이걸 알게 됩니다</div>
                        {catInfo.gives?.length > 0 && <ul className="gives lockgives">{catInfo.gives.map((g: string) => <li key={g}>{g}</li>)}</ul>}
                        <div className="cta" onClick={() => { setErr(''); setModal(true); }}>{catInfo.name} 열기<small>{catInfo.lead} · {won(catInfo.price)}</small></div>
                        <div className="ctaassure">카드로 30초 · 결제하면 바로 열립니다</div>
                        <div className="ctapromise">낙찰을 약속하지 않습니다. 정하는 건 대표님입니다.</div>
                      </>
                    )}
                  <div id={'report-section-' + i} className={'sec' + (open && expanded.includes(i) ? ' open' : '') + (locked ? ' locked' : '')} style={{ animationDelay: Math.min(i * 55, 440) + 'ms' }}>
                    <div className="hd" role="button" tabIndex={0} aria-expanded={locked ? undefined : expanded.includes(i)}
                      onClick={locked ? openThis : () => toggleSec(i)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (locked) openThis(); else toggleSec(i); } }}>
                      <div className="ti">{sec.t}</div>
                      {sec.mk === '率' ? <span className="lb free">{level >= 1 ? '30일 열림' : '7일 무료'}</span> : sec.free ? <span className="lb free">무료</span> : open ? <span className="lb free">열림</span> : <span className="lb lk" aria-label="잠김" />}
                      <div className="cv">▾</div>
                    </div>
                    <div className="bd">
                      {sec.html && res.focus?.mk === sec.mk && <p className="focus-chapter-question">처음 궁금했던 질문 · {res.focus.question}</p>}
                      {sec.html ? <div dangerouslySetInnerHTML={{ __html: sec.html }} />
                        : (
                          <div className="teaser">
                            <div className="ttx" dangerouslySetInnerHTML={{ __html: sec.teaser || '대표님 명식으로 계산해 둔 장입니다. 열면 바로 보입니다.' }} />
                            {catInfo
                              ? <button type="button" className="tlink" onClick={openThis}>{pName}에 포함 · 열기</button>
                              : <button className="tunlock" onClick={openThis}>{`${pName} 열기 · ${won(pPrice)}`} →</button>}
                          </div>
                        )}
                    </div>
                  </div>
                  </React.Fragment>
                );
              }); })()}
            </div>
            {level < 2 && anyLocked && (catInfo ? null : lockedProducts.length > 0 ? (
              <div className="prodmenu">
                <div className="pmhd"><span className="pmh">필요한 것만 낱개로 여세요</span><span className="pms">묶음 없이 상품별로: 대표님께 필요한 풀이만 고르세요</span></div>
                {lockedProducts.map(p => (
                  <button key={p.key} className="pmrow" onClick={() => openProduct(p.key)} disabled={busy}>
                    <span className="pmtx"><b>{p.name}</b><em>{p.lead}</em></span>
                    <span className="pmpp">{won(p.price)} →</span>
                  </button>
                ))}
              </div>
            ) : null)}
            {anyPass && (<>
              {/* 이 발주처 하나만: 로그인 없이 990원(발주처 사주). 핵심 발주처 전체는 아래 패스(로그인). */}
              {cat === 'balju' && catInfo && level < 2 && (
                <div className="cta" onClick={() => { setErr(''); setPassMode(false); setSku('full'); setModal(true); }}>
                  이 발주처 상세 열기
                  <small>{catInfo.name} · 로그인 없이 · {won(catInfo.price)}</small>
                </div>
              )}
              <div className={cat === 'balju' && catInfo && level < 2 ? 'cta sub' : 'cta'} onClick={() => { setErr(''); setPassMode(true); setModal(true); }}>
                발주처 프리미엄 패스 열기
                <small>한 번 결제로 핵심 발주처 {CORE_CLIENT_COUNT}곳 상세 · {won(PRICE_BALJU_PASS)}</small>
              </div>
              <div className="ctaassure">✓ 30초 · 한 번 열면 모든 발주처</div>
            </>)}
            {level >= 1 && ui.gauge && (
              <div className="unlocked-note">✓ 결제 확인됨 · 오늘부터 30일 투찰 길일과 유리한 시진이 전부 열렸습니다</div>
            )}
            <button className="sharebtn no-print" onClick={share}>결과 링크 공유하기 <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--sub)' }}>· 카카오톡·문자</span></button>
            <button className="sharebtn no-print" style={{ marginTop: 9 }} onClick={() => window.print()}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z" /></svg>
              PDF로 내보내기 · 저장
            </button>
            {res.sections.some((s2: any) => s2.mk === '曆' || s2.mk === '曆詳' || s2.mk === '曆年') && (
            <button className="sharebtn no-print" style={{ marginTop: 9 }} onClick={exportIcs}>
              30일 길일 <b style={{ color: 'var(--navy)' }}>캘린더 담기</b> · .ics <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--sub)' }}>· 구글·애플·네이버</span>
            </button>)}
            <SupportLinks reportId={res.reportId} />
            <TrustStrip />
            <div className="disc">만세력·십성·오행 상성으로 산출한 명리 기반 참고 정보입니다.<br />실제 투찰금액 산정의 근거로 사용할 수 없습니다.</div>
            </div>
          </div>
        )}
      </div>

      <PersonPicker open={picker.open} kind={picker.kind} onPick={handlePick} onClose={() => setPicker(pp => ({ ...pp, open: false }))} />
      <ClientPicker open={clientPick} onClose={() => setClientPick(false)}
        onPick={c => { setTargets(prev => [...prev.filter(x => x.kind !== 'client'), { kind: 'client', name: c.name, date: c.date }]); setErr(''); }} />



      {/* 스크롤 스티키 CTA (전체 미열람 시) */}
      {res && level < 2 && catInfo && anyLocked && sticky && !modal && !prog && mounted && createPortal(
        <div className="stickycta no-print" onClick={() => { setErr(''); setModal(true); }}>
          <span className="sl"><b>{cat === 'sajeong' ? '30일 전체 흐름 열기' : `${catInfo.name} 열기`}</b><em>{cat === 'sajeong' ? '나머지 23일 · 길일별 시진 추가' : '계산은 끝났습니다 · 열면 바로 보입니다'}</em></span>
          <span className="sr">{won(catInfo.price)} →</span>
        </div>
      , document.body)}

      {/* 바닥 막대: 무엇을 얼마에 사는지 늘 보이게. 누르면 무료 결과부터 뽑는다(결제는 결과 뒤). */}
      {!res && !prog && !confirm && mounted && createPortal(
        <div className="rd-bar no-print">
          <div className="rd-bar-tx">
            <b>{catInfo ? catInfo.name : '사주 보기'}</b>
            <span>{cat === 'sajeong' ? `7일 흐름 무료 · 30일 전체 ${won(CAT_INFO.sajeong.price)}` : catInfo ? `명식·방향 무료 · 전체 ${won(catInfo.price)}` : '명식·오늘의 신호 무료'}</span>
          </div>
<button type="button" className="go" disabled={busy} onClick={submit}>입력 내용 확인 →</button>
        </div>
      , document.body)}

      {modal && res && mounted && <Checkout journey={passMode ? null : res.journey} focus={passMode ? null : res.focus} admin={res.admin} reportId={res.reportId}
        name={passMode ? '발주처 프리미엄 패스' : catInfo?.name ?? '선택한 풀이'}
        price={passMode ? PRICE_BALJU_PASS : unlockPrice} subject={res.title}
        details={passMode ? [`핵심 발주처 ${CORE_CLIENT_COUNT}곳의 상세 풀이`] : catInfo?.gives?.slice(0, 3) ?? [catInfo?.lead ?? '선택한 리포트의 유료 풀이']}
        buyer={buyer} setBuyer={setBuyerPart} consent={consent} setConsent={setConsent}
        busy={busy} error={err} recovery={recovery} onPay={() => passMode ? payPass() : pay(sku)}
        onClose={() => { setModal(false); setPassMode(false); }}
        onCheck={() => location.assign('/report/' + res.reportId + '?paid=1&t=' + encodeURIComponent(tokParam(res.reportId)))} />}

    </div>
  );
}

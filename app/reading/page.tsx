'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { PRICE_BALJU_PASS, won } from '@/lib/constants';
import { chartFromInput, sipsungPreview, GAN, ZHI, EL, EL_HEX, GAN_ELc, ZHI_ELc, SIP, SIJIN, SIJIN_MID } from '@/lib/preview';
import { recordReport, markUnlocked } from '@/lib/vault';
import { CLIENTS, isCoreClient } from '@/lib/clients';
import { CAT_INFO, isCatKey, productOfMk, catUI } from '@/lib/report-categories';
import WonGuk, { type Pillar } from '@/app/_components/WonGuk';
import RiteProgress from '@/app/_components/RiteProgress';
import DateSelect from '@/app/_components/DateSelect';
import PersonPicker from '@/app/_components/PersonPicker';
import { type Person, type PersonKind } from '@/lib/people';
import YearBar from '@/app/_components/YearBar';
import TrustStrip from '@/app/_components/TrustStrip';
import { openKcpPay, KCP_CLIENT_ENABLED, preloadKcp } from '@/app/_components/kcpPay';
import { sget, sset } from '@/lib/scope';

// 로딩 리추얼 단계 — 실제 엔진 절차를 그대로 보여준다 (계산 과정의 가시화)
const RITE_STEPS = [
  '절기(節氣) 천문 계산 — 진태양시 보정',
  '원국(元局) 구성 — 십성·오행 배치',
  '신살(神殺) 대조',
  '오늘 일진 × 사정률 흐름 대조',
  '세계 거장 100인 명식 대조',
  '리포트 봉인 — 섹션 산출',
];

type Section = { mk: string; free: boolean; tier: 'free' | 'taekil' | 'full'; t: string; html: string; teaser?: string; passLock?: boolean };
const RANK: Record<string, number> = { free: 0, taekil: 1, full: 2 };
type Gauge = { dir: string; band: [string, string]; pos: number; precise?: string };
type Hero = { score: number; big?: string; unit?: string; label: string; headline: string; sub: string; up: boolean };
type Result = { reportId: string; title: string; wonguk?: Pillar[]; gauge: Gauge; hero: Hero; sections: Section[]; meta?: { chapters: number; items: number }; selYear?: number; seun?: { hanja: string; rel: string; tilt: number } };

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
// 길일(.ics) — 날짜의 일간 오행 × 대표 일간 관계로 유리한 날 판정 (서버 정의와 동일: in/bi/jae/sik)
const DAY_GAN_EL = [0,0,1,1,2,2,3,3,4,4];
function dayElOf(y:number,m:number,d:number){ const a=Math.floor((14-m)/12),yy=y+4800-a,mm=m+12*a-3; const j=d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045; return DAY_GAN_EL[(((j+49)%60+60)%60)%10]; }
function relCat(me:number,td:number){ if(td===me)return'bi'; if((td+1)%5===me)return'in'; if((me+1)%5===td)return'sik'; if((me+2)%5===td)return'jae'; if((td+2)%5===me)return'gwan'; return'bi'; }
// 카테고리별 '혹하게 하는' 컨셉 훅 — 입력 화면 상단에서 몰입을 잡는다.
const HOOK: Record<string, { seal: string; t: string; d: string }> = {
  daepyo:  { seal: '鏡', t: '잡스·록펠러와 같은 그릇일지 모릅니다', d: '타고난 승부 기질·재물·사람 다루는 법을 여덟 글자로 낱낱이 — 위기에 드러나는 그 약점까지.' },
  sajeong: { seal: '率', t: '오늘 넣을까 미룰까 — 30초면 방향이 섭니다', d: '오늘의 사정률이 상단인지 하단인지, 이달 어느 날이 유리한지 한눈에 짚어 드립니다.' },
  balju:   { seal: '宮', t: '그 발주처, 애초에 나와 맞는 판입니까', d: '설립일 사주 × 대표님 사주 궁합 점수 — 큰 판에 손대기 전에 확인하십시오.' },
  gunghap: { seal: '合', t: '손잡기 전에, 깨질 궁합인지부터', d: '지분·역할·최종 결정권을 어떻게 나눠야 안 깨지는지 — 계약 전에 봐야 할 궁합.' },
  daeun:   { seal: '運', t: '회사가 대표님을 밀어줍니까, 누릅니까', d: '법인 설립일로 본 회사의 그릇과 10년 대운의 길목 — 지금이 확장기인지 정비기인지.' },
  calendar:{ seal: '曆', t: '이달, 언제 움직이고 언제 멈출까', d: '계약·채용·발표에 좋은 날과 갈등·지출을 조심할 날을 달력에 짚어 드립니다.' },
  calendar_year: { seal: '曆', t: '올 한 해, 밀어주는 달에 큰 판을 거십시오', d: '12개월 월운(月運)을 밀어주는 달·조여지는 달로 갈라 — 한 해 농사의 밑그림.' },
};
function dedupe<T>(arr: T[], keyFn: (x: T) => string): T[] {
  const seen = new Set<string>(); const out: T[] = [];
  for (const x of arr) { const k = keyFn(x); if (!seen.has(k)) { seen.add(k); out.push(x); } }
  return out;
}

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
  const [passMode, setPassMode] = useState(false);   // 발주처 프리미엄 패스 결제 모드
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [consent, setConsent] = useState(false);
  const [prog, setProg] = useState(false);     // 로딩 리추얼
  const [seal, setSeal] = useState(false);     // 결제 후 개봉 연출
  const [sticky, setSticky] = useState(false); // 스크롤 스티키 CTA
  const [cat, setCat] = useState('');           // 카테고리(대표·사정률·발주처·궁합·대운)
  const [bp, setBp] = useState({ y: 0, m: 0, d: 0 }); // 생년월일 3분할 선택 누적
  const [picker, setPicker] = useState<{ open: boolean; kind: PersonKind }>({ open: false, kind: 'self' });
  const catInfo = isCatKey(cat) ? CAT_INFO[cat] : null;
  const ui = catUI(cat);   // 카테고리별 UI 스키마(단일 소스)
  // 카테고리 개별 결제가 (카테고리 모드면 단일가, 아니면 sku 기준가)
  const unlockPrice = catInfo ? catInfo.price : 0;   // 카테고리 전용 — 무카테고리는 개별 상품으로만 결제
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); preloadKcp(); }, []);
  useEffect(() => { try { const s = sget(LS_KEY); if (s) setSaved(JSON.parse(s)); } catch {} }, []);
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
      // 사주아이식: 진입하자마자 대표 선택 시트를 띄운다 (본인이 프리필 안 됐을 때)
      if (!p.get('b')) setTimeout(() => setPicker({ open: true, kind: 'self' }), 380);
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
      const selfs = cs.filter(c => c.kind === 'self').map(c => ({ name: c.name || '', birth: c.birth_date, gender: 'M', cal: c.calendar || 'solar', leap: !!c.is_leap, timeMode: (c.birth_time ? 'Y' : 'N'), time: c.birth_time || '09:20', sijin: 3 }));
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
  function loadSelf(p: any) { setF(s => ({ ...s, name: p.name || '', birth: p.birth, gender: p.gender || 'M', cal: p.cal || 'solar', leap: !!p.leap, timeMode: p.timeMode || 'N', time: p.time || '09:20', sijin: p.sijin ?? 3 })); const [yy, mm, dd] = String(p.birth).split('-').map(Number); setBp({ y: yy, m: mm, d: dd }); }
  function loadLegalProfile(p: any) { setF(s => ({ ...s, company: p.company || '', legal: p.legal })); }
  // 통합 사람/업체 시트에서 선택 → 해당 슬롯 채우기
  function handlePick(pp: Person) {
    if (pp.kind === 'self') {
      setF(s => ({ ...s, name: pp.name || '', birth: pp.date, gender: pp.gender || 'M', cal: pp.cal || 'solar', leap: !!pp.leap, timeMode: (pp.timeMode as any) || (pp.time ? 'Y' : 'N'), time: pp.time || '09:20' }));
      const [yy, mm, dd] = String(pp.date).split('-').map(Number); setBp({ y: yy, m: mm, d: dd });
    } else if (pp.kind === 'legal') {
      setF(s => ({ ...s, company: pp.name || '', legal: pp.date }));
    } else {
      setTargets(prev => [...prev.filter(x => x.kind !== pp.kind), { kind: pp.kind as RelKind, name: pp.name || kindLabel(pp.kind as RelKind), date: pp.date }]);
    }
  }
  const yr2 = (d: string) => (d || '').slice(2);

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
    const req = ui.requires;   // 카테고리 필수 입력(스키마 기반)
    if (req === 'legal' && !f.legal) { setErr('회사 대운은 법인 설립일이 필요합니다. 아래 「회사 정보」에 설립일을 넣어주세요.'); document.getElementById('cocard')?.scrollIntoView({ behavior: 'smooth' }); return; }
    if (req === 'client' && !targets.some(t => t.kind === 'client')) { setErr('발주처를 먼저 추가해 주세요.'); return; }
    if (req === 'partnerOrAlly' && !targets.some(t => t.kind === 'partner' || t.kind === 'ally')) { setErr('동업 또는 협정 상대를 먼저 추가해 주세요.'); return; }
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
        client: tg('client')?.date || null, clientName: tg('client')?.name, clientCore: isCoreClient(tg('client')?.name),
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
      if (f.legal) fetch('/api/charts', { method: 'POST', body: JSON.stringify({ kind: 'legal', name: f.company, birth_date: f.legal }) }).catch(() => {});
      targets.forEach(t => fetch('/api/charts', { method: 'POST', body: JSON.stringify({ kind: t.kind, name: t.name, birth_date: t.date }) }).catch(() => {}));
      saveSelfProfile(); if (f.legal) saveLegalProfile();
      setTimeout(() => document.getElementById('rep')?.scrollIntoView({ behavior: 'smooth' }), 60);
    } catch { setErr('리포트를 뽑는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.'); }
    finally { setBusy(false); setProg(false); }
  }

  // 개별 상품(묶음 없음): 잠긴 섹션 → 그 섹션을 파는 카테고리 상품으로 리포트를 좁혀 다시 뽑는다.
  async function openProduct(catKey: string) {
    if (busy) return;
    setCat(catKey); setErr(''); setBusy(true); setLevel(0);
    try {
      const tg = (k: RelKind) => targets.find(t => t.kind === k);
      const body = {
        name: f.name, birth: f.birth, time: f.timeMode === 'N' ? null : effTime,
        cal: f.cal, leap: f.leap,
        legal: f.legal || null, legalName: f.company || undefined,
        client: tg('client')?.date || null, clientName: tg('client')?.name, clientCore: isCoreClient(tg('client')?.name),
        partner: tg('partner')?.date || null, partnerName: tg('partner')?.name,
        ally: tg('ally')?.date || null, allyName: tg('ally')?.name,
        situation, worry: f.worry, cat: catKey,
      };
      const resp = await fetch('/api/report', { method: 'POST', body: JSON.stringify(body) });
      if (!resp.ok) throw new Error();
      const r = await resp.json();
      setRes(r);
      recordReport({ id: r.reportId, label: r.label || r.title, when: Date.now(), unlocked: false });
      // (스크롤 점프 제거 — 잠긴 항목 클릭 시 화면이 위로 튀지 않도록 제자리 갱신)
    } catch { setErr('상품을 여는 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.'); }
    finally { setBusy(false); }
  }
  // 연도(세운) 전환 — 대표·회사·발주처 궁합을 그 해 기준으로 다시 계산
  async function switchYear(y: number) {
    if (!res || busy) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/report/get?id=${res.reportId}&year=${y}`).then(x => x.json());
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
  const anyPass = !!res && res.sections.some(s => (s as any).passLock);   // 발주처 프리미엄 잠금 존재

  async function pay(chosen: 'taekil' | 'full') {
    if (!consent) { setErr('결제 전 안내에 동의해 주세요.'); return; }
    if (!res) return;
    setErr(''); setBusy(true);
    try {
      const prep = await fetch('/api/payment/prepare', { method: 'POST', body: JSON.stringify({ reportId: res.reportId, sku: chosen }) }).then(x => x.json());
      if (KCP_CLIENT_ENABLED) {
        const kres = await openKcpPay({ paymentId: prep.paymentId, amount: prep.amount, goodName: prep.orderName ?? '낙찰사주 리포트' });
        if (kres === 'redirect') return;
        if (!kres) { setBusy(false); setErr('결제가 취소되었습니다.'); return; }
        const ap = await fetch('/api/payment/kcp/approve', { method: 'POST', body: JSON.stringify({ paymentId: prep.paymentId, enc_data: kres.enc_data, enc_info: kres.enc_info, tran_cd: kres.tran_cd }) }).then(x => x.json());
        if (!ap?.ok) { setBusy(false); setErr('결제 승인에 실패했습니다. 다시 시도해 주세요.'); return; }
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

  async function payPass() {
    if (!consent) { setErr('결제 전 안내에 동의해 주세요.'); return; }
    if (!res) return;
    setErr(''); setBusy(true);
    try {
      const prep = await fetch('/api/payment/prepare', { method: 'POST', body: JSON.stringify({ reportId: res.reportId, sku: 'baljuPass' }) }).then(x => x.json());
      if (KCP_CLIENT_ENABLED) {
        const kres = await openKcpPay({ paymentId: prep.paymentId, amount: prep.amount, goodName: prep.orderName ?? '낙찰사주 리포트' });
        if (kres === 'redirect') return;
        if (!kres) { setBusy(false); setErr('결제가 취소되었습니다.'); return; }
        const ap = await fetch('/api/payment/kcp/approve', { method: 'POST', body: JSON.stringify({ paymentId: prep.paymentId, enc_data: kres.enc_data, enc_info: kres.enc_info, tran_cd: kres.tran_cd }) }).then(x => x.json());
        if (!ap?.ok) { setBusy(false); setErr('결제 승인에 실패했습니다. 다시 시도해 주세요.'); return; }
      } else {
        await fetch('/api/payment/mock-confirm', { method: 'POST', body: JSON.stringify({ paymentId: prep.paymentId }) });
      }
      let full: any = null;
      for (let i = 0; i < 6; i++) { const resp = await fetch('/api/report/paid?id=' + res.reportId); if (resp.ok) { full = await resp.json(); break; } await new Promise(r => setTimeout(r, 700)); }
      if (!full) throw new Error();
      setRes({ ...res, ...full }); setModal(false); setPassMode(false);
      setSeal(true); setTimeout(() => setSeal(false), 2600);
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
    for (const d of days) ics += `BEGIN:VEVENT\r\nUID:${d}-${Math.random().toString(36).slice(2)}@nakchal\r\nDTSTART;VALUE=DATE:${d}\r\nSUMMARY:\u5409\u65e5 \u2014 \ud22c\ucc30\u00b7\uacc4\uc57d\uc5d0 \uc720\ub9ac\r\nDESCRIPTION:\ub099\ucc30\uc0ac\uc8fc \u00b7 \ub300\ud45c\ub2d8 \uc77c\uac04\uc744 \uc0b4\ub9ac\ub294 \ub0a0\r\nEND:VEVENT\r\n`;
    ics += 'END:VCALENDAR\r\n';
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = 'nakchal-gilil.ics'; a.click(); URL.revokeObjectURL(url);
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
        {!res && (<>
        {/* 0. 컨셉 훅 — 카테고리별 몰입 배너 */}
        {cat && HOOK[cat] && (
          <div className="chook">
            <span className="chseal">{HOOK[cat].seal}</span>
            <div className="chtx"><b>{HOOK[cat].t}</b><em>{HOOK[cat].d}</em></div>
          </div>
        )}
        {/* 0-2. 사업운 캘린더 — 기간 선택(이달/연간 한 경로) */}
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
        {/* 1. 상황 (사정률·통합에서만) */}
        {ui.situation && (<div className="card">
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
        <div className="card reveal" style={{ display: (ui.selfImmediate || f.bidType || f.birth) ? undefined : 'none' }}>
          <div className="st"><span className="l"><span className="b" />대표님 정보</span></div>
          <button type="button" className="pickbtn" onClick={() => setPicker({ open: true, kind: 'self' })}>
            <span className="pkseal">代</span>
            <span className="pktx"><b>{f.birth ? `${f.name || '대표'} · ${yr2(f.birth)}` : '저장된 대표 선택 · 새로 추가'}</b><em>사람 목록에서 고르거나 새로 추가</em></span>
            <span className="pkgo">›</span>
          </button>
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
        <div id="cocard" className="card reveal" style={{ display: (f.birth && ui.legal !== 'hidden') ? undefined : 'none' }}>
          <div className="st"><span className="l"><span className="b" />회사 정보</span><span className={'chip ' + (ui.legal === 'required' ? 'paid' : 'free')}>{ui.legal === 'required' ? '필수' : '회사 사주'}</span></div>
          <button type="button" className="pickbtn" onClick={() => setPicker({ open: true, kind: 'legal' })}>
            <span className="pkseal">法</span>
            <span className="pktx"><b>{f.legal ? `${f.company || '회사'} · ${yr2(f.legal)}` : '저장된 법인 선택 · 새로 추가'}</b><em>업체 목록에서 고르거나 새로 추가</em></span>
            <span className="pkgo">›</span>
          </button>
          <label>회사명 <span className="opt">(선택)</span></label>
          <input value={f.company} maxLength={20} placeholder="예) 대한건설(주)" onChange={e => set('company', e.target.value)} />
          <label>법인 설립일 {ui.legal === 'required' ? <span className="opt" style={{ color: 'var(--red)' }}>· 대운·세운 계산의 기준</span> : <span className="opt">· 법인 운세 + 통합 사정률</span>}</label>
          <DateSelect value={f.legal} onChange={v => set('legal', v)} yearFrom={1945} yearTo={2026} />
          <div className="note">{ui.legal === 'required' ? '※ 회사 대운은 법인 설립일을 기준으로 연도별 큰 흐름(세운)을 산출합니다. 사업자등록증의 「개업연월일」을 넣어주세요.' : '※ 회사 설립일을 넣으면 대표+법인 통합으로 사정률과 회사 운세가 더 정교해집니다.'}</div>
        </div>

        {/* 4. 관계·궁합 */}
        {ui.baljuCard && (() => {
          const t = targets.find(x => x.kind === 'client');
          return (
            <div className="card reveal">
              <div className="st"><span className="l"><span className="b" />발주처 선택</span><span className="opt">궁합 대상</span></div>
              {t ? (
                <div className="baljusel">
                  <div className="bjinfo"><b>{t.name} {isCoreClient(t.name) && <span className="corelock">封 핵심</span>}</b><span>{t.date.slice(0, 4)} 설립 · 대표님과의 궁합</span></div>
                  <Link href="/balju" className="bjchg">다른 발주처 ›</Link>
                </div>
              ) : (
                <Link href="/balju" className="baljupick">
                  <span className="bpseal">宮</span>
                  <span className="bptx"><b>발주처를 먼저 고르세요</b><em>목록에서 발주처를 선택하면 이 자리에 들어옵니다</em></span>
                  <span className="bpgo">고르기 ›</span>
                </Link>
              )}
            </div>
          );
        })()}
        <div className="card reveal" style={{ display: (f.birth && ui.relation.length > 0) ? undefined : 'none' }}>
          <div className="st"><span className="l"><span className="b" />관계·궁합</span><span className="opt">선택</span></div>
          <div className="pkgrid">
            {REL_KINDS.filter(k => ui.relation.includes(k.key as any)).map(k => (
              <button key={k.key} type="button" className="pickbtn" onClick={() => setPicker({ open: true, kind: k.key })}>
                <span className="pkseal">{k.key === 'client' ? '宮' : k.key === 'partner' ? '同' : '協'}</span>
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

        {f.birth && <button className="go reveal" onClick={submit} disabled={busy}>{busy ? '짚는 중…' : (catInfo ? `${catInfo.name} 보기 →` : '회사 사주 리포트 뽑기 →')}</button>}
        {err && !res && !confirm && <div className="errbox">{err}</div>}
        <div className="note" style={{ textAlign: 'center' }}>※ 재미로 보는 명리 기반 참고 정보. 투찰금액 산정 근거로 사용 불가.</div>
        </>)}

        {res && (
          <button className="reinput no-print" onClick={() => { setRes(null); setLevel(0); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 30); }}>← 정보 다시 입력</button>
        )}
        {res && (
          <div id="rep" className="rcols" style={{ marginTop: 6 }}>
            <div className="rleft">
            {res.wonguk && res.wonguk.length > 0 && <WonGuk p={res.wonguk} />}
            {res.hero && (
              <div className="rhero">
                <div className="hl" dangerouslySetInnerHTML={{ __html: res.hero.headline }} />
                <div className={'num' + (res.hero.big && (res.hero.big as any).length > 2 ? ' numtx' : '')} style={{ color: res.hero.up ? 'var(--gold2)' : '#e88' }}>{res.hero.big ?? res.hero.score}<span style={{ fontSize: 20 }}>{res.hero.unit ?? '점'}</span></div>
                <div className="lab">{res.hero.label}</div>
                <div className="sub2">{res.hero.sub}</div>
              </div>
            )}
            </div>
            <div className="rright">
            <div className="rephd">{res.title}</div>
            {res.selYear && ui.yearBar && <YearBar year={res.selYear} hanja={res.seun?.hanja} busy={busy} onChange={switchYear} />}
            {(() => { const total = res.sections.length; const opened = res.sections.filter(s => (RANK[s.tier] ?? 2) <= level && s.html).length;
              return (
                <div className="rprog">
                  <span className="rpl">열람 <b>{opened}</b> / {total} 섹션</span>
                  <span className="rpbar"><i style={{ width: Math.round(opened / total * 100) + '%' }} /></span>
                  <span className="rpr">{level >= 2 ? '전체 열람' : level === 1 ? '부분 열람' : '무료 열람'}</span>
                </div>
              ); })()}
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
                    {catInfo && level < 2 && i === firstLockedIdx && (
                      <>
                        <div className="readyline"><b>{catInfo.name}</b> {res.meta?.chapters ?? res.sections.length}장(章) · {res.meta?.items ?? '수십'}개 항목 풀이가 이미 산출을 마쳤습니다 — 열람만 잠겨 있습니다</div>
                        <div className="cta" onClick={() => { setErr(''); setModal(true); }}>{catInfo.name} 열기<small>{catInfo.lead} · {won(catInfo.price)}</small></div>
                        <div className="ctaassure">✓ 30초 · 결제 즉시 열람</div>
                      </>
                    )}
                  <div className={'sec ' + (open ? 'open' : '') + (locked ? ' locked' : '')} style={{ animationDelay: Math.min(i * 55, 440) + 'ms' }}>
                    <div className="hd" onClick={locked ? openThis : undefined}>
                      <div className="mk">{sec.mk}</div>
                      <div className="ti">{sec.t}</div>
                      {sec.free ? <span className="lb free">무료</span> : open ? <span className="lb free">열림</span> : <span className="lb">🔒</span>}
                      <div className="cv">▾</div>
                    </div>
                    <div className="bd">
                      {sec.html ? <div dangerouslySetInnerHTML={{ __html: sec.html }} />
                        : (
                          <div className="teaser">
                            <div className="ttx" dangerouslySetInnerHTML={{ __html: sec.teaser || '결제 후 열람 가능한 섹션입니다.' }} />
                            <button className="tunlock" onClick={openThis}>
                              {`${pName} 열기`} →
                            </button>
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
                <div className="pmhd"><span className="pmh">필요한 것만 낱개로 여십시오</span><span className="pms">묶음 없이 상품별로 — 대표님께 필요한 풀이만 고르세요</span></div>
                {lockedProducts.map(p => (
                  <button key={p.key} className="pmrow" onClick={() => openProduct(p.key)} disabled={busy}>
                    <span className="pmseal">{p.hanja}</span>
                    <span className="pmtx"><b>{p.name}</b><em>{p.lead}</em></span>
                    <span className="pmpp">{won(p.price)} →</span>
                  </button>
                ))}
              </div>
            ) : null)}
            {anyPass && (<>
              <div className="cta" onClick={() => { setErr(''); setPassMode(true); setModal(true); }}>
                발주처 프리미엄 패스 열기
                <small>한 번 결제로 43곳 모든 발주처 상세 · {won(PRICE_BALJU_PASS)}</small>
              </div>
              <div className="ctaassure">✓ 30초 · 한 번 열면 모든 발주처</div>
            </>)}
            {level >= 1 && res.gauge.precise && ui.gauge && (
              <div className="unlocked-note">✓ 결제 확인됨 · 소수점 정밀 사정률 <b>{res.gauge.precise}%</b> 공개</div>
            )}
            <button className="sharebtn no-print" onClick={share}>결과 링크 공유하기 <span style={{ fontWeight: 500, fontSize: 12, color: 'var(--sub)' }}>· 카카오톡·문자</span></button>
            <button className="sharebtn no-print" style={{ marginTop: 9 }} onClick={() => window.print()}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z" /></svg>
              PDF로 내보내기 · 저장
            </button>
            {res.sections.some((s2: any) => s2.mk === '曆' || s2.mk === '曆詳' || s2.mk === '曆年') && (
            <button className="sharebtn no-print" style={{ marginTop: 9 }} onClick={exportIcs}>
              이달 길일 <b style={{ color: 'var(--navy)' }}>캘린더 담기</b> · .ics <span style={{ fontWeight: 500, fontSize: 12, color: 'var(--sub)' }}>· 구글·애플·네이버</span>
            </button>)}
            <TrustStrip />
            <div className="disc">만세력·십성·오행 상성으로 산출한 명리 기반 참고 정보입니다.<br />실제 투찰금액 산정의 근거로 사용할 수 없습니다.</div>
            </div>
          </div>
        )}
      </div>

      <PersonPicker open={picker.open} kind={picker.kind} onPick={handlePick} onClose={() => setPicker(pp => ({ ...pp, open: false }))} />

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
      {res && level < 2 && catInfo && anyLocked && sticky && !modal && !prog && (
        <div className="stickycta no-print" onClick={() => { setErr(''); setModal(true); }}>
          <span className="sl"><b>{catInfo.name} 열기</b><em>산출 완료 · 열람만 잠금</em></span>
          <span className="sr">{won(catInfo.price)} →</span>
        </div>
      )}

      {/* 입력 확인 모달 (사주아이식) */}
      {confirm && mounted && createPortal(
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
      , document.body)}

      {/* 결제 모달 */}
      {modal && mounted && createPortal(
        <div className="modal on" onClick={e => { if ((e.target as HTMLElement).classList.contains('modal')) setModal(false); }}>
          <div className="sheet">
            <div className="grip" />
            {passMode ? (
              <>
                <h3>발주처 프리미엄 패스</h3>
                <div className="catbuy">
                  <div className="catbuy-hd"><span className="catbuy-seal">宮</span><div><div className="catbuy-nm">발주처 프리미엄 패스</div><div className="catbuy-kick">發注處 프리미엄</div></div><div className="catbuy-pp">{won(PRICE_BALJU_PASS)}</div></div>
                  <div className="catbuy-lead">한 번 결제로 <b>43곳 모든 발주처</b>의 3계·실전 시나리오·주의신호·연도 세운이 열립니다.</div>
                </div>
              </>
            ) : catInfo ? (
              <>
                <h3>{catInfo.name} 전체 열기</h3>
                <div className="catbuy">
                  <div className="catbuy-hd"><span className="catbuy-seal">{catInfo.hanja}</span><div><div className="catbuy-nm">{catInfo.name}</div><div className="catbuy-kick">{catInfo.kicker}</div></div><div className="catbuy-pp">{won(catInfo.price)}</div></div>
                  <div className="catbuy-lead">{catInfo.lead}</div>
                </div>
              </>
            ) : null}
            <div className="paymethods">카카오페이 · 토스페이 · 신용/체크카드<span> · 결제창에서 선택</span></div>
            <label className="consent">
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
              <span>결제 및 <Link href="/terms" className="legal-link">이용약관</Link>·<Link href="/privacy" className="legal-link">개인정보처리방침</Link>에 동의합니다. (콘텐츠 특성상 열람 후 청약철회가 제한될 수 있습니다 — <Link href="/refund" className="legal-link">청약철회·환불 안내</Link>)</span>
            </label>
            {err && <div className="errbox">{err}</div>}
            <button className="paygo" onClick={() => (passMode ? payPass() : pay(sku))} disabled={busy}>{busy ? '결제 처리중…' : `${won(passMode ? PRICE_BALJU_PASS : unlockPrice)} 결제하기`}</button>
            <div className="mclose" onClick={() => { setModal(false); setPassMode(false); }}>다음에 볼게요</div>
            <div className="msec">🔒 NHN KCP 안전결제 · 결제 금액은 서버에서 재검증됩니다</div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}

// lib/store.ts — 저장소 어댑터
// 환경변수(SUPABASE_URL + SERVICE_ROLE_KEY)가 있으면 Supabase를,
// 없으면 인메모리(데모/로컬)를 자동 선택합니다. 둘 다 같은 async API.
import 'server-only';
import type { ReportInput } from './report';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Order = { paymentId: string; reportId: string; amount: number; level: number; status: 'pending' | 'paid' | 'failed' | 'cancelled' };

// ── Supabase 백엔드 (서버 전용 · SERVICE_ROLE) ───────────
let _sb: SupabaseClient | null | undefined;
function sb(): SupabaseClient | null {
  if (_sb !== undefined) return _sb;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!(url && key) && process.env.NODE_ENV === 'production') {
    // 운영인데 Supabase 미구성 → 인메모리 폴백은 요청 간 데이터/결제 유실을 일으킴. 조용히 넘기지 말고 경고.
    console.error('[store] PRODUCTION without Supabase service role · falling back to in-memory (data will NOT persist across requests).');
  }
  _sb = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return _sb;
}
export const backend = () => (sb() ? 'supabase' : 'memory');

// ── 인메모리 백엔드 (폴백) ───────────────────────────────
const g = globalThis as any;
type MemReport = { input: ReportInput; userId: string | null; label?: string; created: number; token?: string };
type SavedChart = { id: string; kind: string; name?: string; birth_date: string; birth_time?: string | null; calendar?: string; is_leap?: boolean };
const memReports: Map<string, MemReport> = g.__reports ?? (g.__reports = new Map());
const memOrders: Map<string, Order> = g.__orders ?? (g.__orders = new Map());
const memUnlockLvl: Map<string, number> = g.__unlockLvl ?? (g.__unlockLvl = new Map()); // reportId → 0/1/2
const memPasses: Set<string> = g.__passes ?? (g.__passes = new Set());   // 사용자 권한(패스) 키 집합
const memCharts: Map<string, SavedChart[]> = g.__charts ?? (g.__charts = new Map()); // userId('demo') → charts
if (g.__seq === undefined) g.__seq = 1000;
const uid = (u?: string | null) => u || 'demo';
// 전역 유니크 id — 서버리스에서 g.__seq++ 카운터는 인스턴스별로 충돌하므로 UUID 사용
const genId = (p: string) => p + ((globalThis.crypto && 'randomUUID' in globalThis.crypto) ? globalThis.crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12));

// ── 공개 API (async) ─────────────────────────────────────
export async function saveReport(input: ReportInput, userId?: string, label?: string): Promise<{ id: string; token: string }> {
  const c = sb();
  // 접근 토큰(비회원 리포트 IDOR 방어). 소유자 아니면 이 토큰(?t=)이 있어야 열람 가능.
  const token = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
    ? globalThis.crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  if (c) {
    // access_token 컬럼 포함 insert를 먼저 시도. 컬럼이 아직 없으면(마이그레이션 전) 실패하므로
    // 컬럼 없이 재시도 → 리포트 생성은 절대 깨지지 않음(순서 안전). 이땐 토큰 미저장(레거시 폴백).
    const withTok = await c.from('reports').insert({ input, user_id: userId ?? null, label, access_token: token }).select('id').single();
    if (!withTok.error) return { id: withTok.data.id as string, token };
    const base = await c.from('reports').insert({ input, user_id: userId ?? null, label }).select('id').single();
    if (base.error) throw base.error;
    // 토큰 칸이 없어 저장하지 못했다. 랜덤 토큰을 돌려주면 브라우저만 그 값을 들고 있다가,
    // 나중에 0007(기존 행 토큰 = id 로 백필)을 적용하는 순간 안 맞아 잠긴다. 그래서 id 를 돌려준다.
    return { id: base.data.id as string, token: base.data.id as string };
  }
  const id = genId('r');
  memReports.set(id, { input, userId: userId ?? null, label, created: g.__seq, token });
  return { id, token };
}

// 보관함: 내 리포트 목록
export async function listReports(userId?: string): Promise<{ id: string; label?: string; unlocked: boolean }[]> {
  const c = sb();
  if (c) {
    const { data } = await c.from('reports').select('id,label,unlock_level').eq('user_id', userId ?? '').order('created_at', { ascending: false }).limit(50);
    return (data ?? []).map((r: any) => ({ id: r.id, label: r.label, unlocked: (r.unlock_level ?? 0) >= 1 }));
  }
  const out: { id: string; label?: string; unlocked: boolean }[] = [];
  for (const [id, r] of memReports) if (uid(r.userId) === uid(userId)) out.push({ id, label: r.label, unlocked: (memUnlockLvl.get(id) ?? 0) >= 1 });
  return out.reverse();
}

// 저장된 사주/대상
export async function saveChart(userId: string | null, ch: Omit<SavedChart, 'id'>): Promise<void> {
  const c = sb();
  if (c) { const { error } = await c.from('saved_charts').insert({ user_id: userId, kind: ch.kind, name: ch.name, birth_date: ch.birth_date, birth_time: ch.birth_time, calendar: ch.calendar, is_leap: ch.is_leap }); if (error) throw error; return; }
  const list = memCharts.get(uid(userId)) ?? [];
  const rec = { ...ch, id: genId('c') };
  memCharts.set(uid(userId), [rec, ...list.filter(x => !(x.kind === ch.kind && x.name === ch.name && x.birth_date === ch.birth_date))].slice(0, 24));
}
export async function listCharts(userId?: string): Promise<SavedChart[]> {
  const c = sb();
  if (c) { const { data } = await c.from('saved_charts').select('*').eq('user_id', userId ?? '').order('created_at', { ascending: false }).limit(24); return (data as SavedChart[]) ?? []; }
  return memCharts.get(uid(userId)) ?? [];
}

export async function getReport(id: string): Promise<ReportInput | null> {
  const c = sb();
  if (c) {
    const { data } = await c.from('reports').select('input').eq('id', id).maybeSingle();
    return (data?.input as ReportInput) ?? null;
  }
  return memReports.get(id)?.input ?? null;
}

// 리포트 소유자 — 실서비스에서 유료 라우트가 본인 확인에 사용
export async function getReportOwner(id: string): Promise<string | null> {
  const c = sb();
  if (c) {
    const { data } = await c.from('reports').select('user_id').eq('id', id).maybeSingle();
    return (data?.user_id as string) ?? null;
  }
  return memReports.get(id)?.userId ?? null;
}

// 소유자 + 접근토큰 조회. access_token 컬럼이 없으면(마이그레이션 전) token=null → 라우트가 기존 동작으로 폴백.
export async function getReportAccess(id: string): Promise<{ owner: string | null; token: string | null }> {
  const c = sb();
  if (c) {
    const { data } = await c.from('reports').select('user_id').eq('id', id).maybeSingle();
    const owner = (data?.user_id as string) ?? null;
    let token: string | null = null;
    const t = await c.from('reports').select('access_token').eq('id', id).maybeSingle(); // 컬럼 없으면 error→token null
    if (!t.error) token = (t.data?.access_token as string) ?? null;
    return { owner, token };
  }
  const r = memReports.get(id);
  return { owner: r?.userId ?? null, token: r?.token ?? null };
}

// userId — 결제한 회원. 2026-09-17 전에는 넣지 않아서 관리자 화면의 유료 회원·전환율이 늘 0이었다.
export async function createOrder(reportId: string, amount: number, level: number = 2, userId?: string | null, item?: string | null): Promise<Order> {
  const c = sb();
  // 결제ID는 전역 유니크해야 함(payments.payment_id UNIQUE). 서버리스에서 performance.now()는
  // 워커 시작후 경과시간이라 호출간 충돌 → 중복키(23505). crypto.randomUUID로 항상 유니크 생성.
  const rid = (globalThis.crypto && 'randomUUID' in globalThis.crypto)
    ? globalThis.crypto.randomUUID()
    : Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 12);
  const paymentId = 'pay_' + rid;
  if (c) {
    const isPass = reportId.startsWith('pass:');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(reportId);
    // report_id는 uuid(reports FK)만 허용 — 복채('bokchae') 등 비-uuid는 null 처리(invalid uuid 500 방지)
    const row = { payment_id: paymentId, report_id: (isPass || !isUuid) ? null : reportId, pass_key: isPass ? reportId : null, amount, level, status: 'pending' };
    // item(상품 이름) 컬럼은 0009 마이그레이션 뒤에 생긴다. 없는 환경이면 빼고 다시 넣는다. 기록 때문에 결제가 막히면 안 된다.
    let { error } = await c.from('payments').insert({ ...row, ...(item ? { item } : {}), ...(userId ? { user_id: userId } : {}) });
    if (error && item) ({ error } = await c.from('payments').insert(userId ? { ...row, user_id: userId } : row));
    // 회원 프로필이 없는 등으로 user_id 가 걸리면 회원 없이라도 주문은 만든다 — 계측 때문에 결제가 막히면 안 된다.
    if (error && userId) ({ error } = await c.from('payments').insert(row));
    if (error) throw error;
    return { paymentId, reportId, amount, level, status: 'pending' };
  }
  const o: Order = { paymentId, reportId, amount, level, status: 'pending' };
  memOrders.set(paymentId, o);
  return o;
}

// 실서비스: KCP 승인응답으로 검증한 실제 금액을 paidAmount로 넘김
export async function confirmOrder(paymentId: string, paidAmount: number): Promise<Order | null> {
  const c = sb();
  if (c) {
    const { data: o } = await c.from('payments').select('*').eq('payment_id', paymentId).maybeSingle();
    if (!o || paidAmount !== o.amount) return null;      // ★금액 재검증
    if (o.status === 'paid') {                            // ★멱등: 이미 처리된 주문은 재처리 없이 반환(재생 방어)
      return { paymentId, reportId: o.report_id ?? o.pass_key, amount: o.amount, level: o.level ?? 1, status: 'paid' };
    }
    // ★언락/이용권 부여를 '먼저', payments=paid 표시는 '마지막'에.
    // 언락 쓰기가 실패하면 status는 'pending'으로 남아 재시도가 전부 재실행된다(Math.max·upsert 멱등).
    // 최악의 경우도 '언락됐지만 paid 미표시'(안전, 재시도로 수렴)이지 '결제됐는데 영구 미언락'(위험)이 아니다.
    const markPaid = async () => { const { error: ep } = await c.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('payment_id', paymentId); if (ep) throw ep; };
    const key = o.report_id ?? o.pass_key;
    if (key && String(key).startsWith('pass:')) {
      const { error: e3 } = await c.from('entitlements').upsert({ key }); if (e3) throw e3;   // ★에러 확인(조용한 실패 차단)
      await markPaid();
      return { paymentId, reportId: key, amount: o.amount, level: o.level ?? 1, status: 'paid' };
    }
    if (!o.report_id) {   // 복채 등 언락 대상 없음: 확정만
      await markPaid();
      return { paymentId, reportId: null, amount: o.amount, level: o.level ?? 0, status: 'paid' };
    }
    const lvl = o.level ?? 2;
    const { data: cur } = await c.from('reports').select('unlock_level').eq('id', o.report_id).maybeSingle();
    const next = Math.max(cur?.unlock_level ?? 0, lvl);   // 상위 레벨은 유지 (다운그레이드 방지)
    { const { error: e2 } = await c.from('reports').update({ unlock_level: next }).eq('id', o.report_id); if (e2) throw e2; }
    await markPaid();
    return { paymentId, reportId: o.report_id, amount: o.amount, level: lvl, status: 'paid' };
  }
  const o = memOrders.get(paymentId);
  if (!o || paidAmount !== o.amount) return null;
  if (o.status === 'paid') return o;                     // ★멱등: 재생/중복 승인 방어
  o.status = 'paid';
  if (o.reportId.startsWith('pass:')) memPasses.add(o.reportId);
  else memUnlockLvl.set(o.reportId, Math.max(memUnlockLvl.get(o.reportId) ?? 0, o.level));
  return o;
}

// 승인까지 못 간 이유를 행에 적어 둔다.
//
// 지금까지 실패 경로가 상태를 안 바꿔서, 결제창을 닫은 것과 손님 돈이 빠져나갔는데
// 우리가 저장에 실패한 것이 관리자 화면에서 똑같이 'pending' 으로 보였다.
// 마지막 경우(why 가 confirm:*)는 상태를 pending 으로 남겨 둔다 — 승인은 났고
// 재시도로 수렴해야 하는 건이라 'failed' 로 덮으면 안 된다.
export async function failOrder(paymentId: string, why: string): Promise<void> {
  // confirm:* 는 승인됐는데 저장 실패, approve_unknown 은 승인 응답을 못 받음(돈이 나갔을 수 있다). 둘 다 failed 로 덮지 않는다.
  const approved = why.startsWith('confirm:') || why.startsWith('approve_unknown');
  const status = approved ? 'pending' : 'failed';
  const c = sb();
  if (c) {
    // fail_reason 컬럼이 아직 없으면(마이그레이션 전) 상태만 남기고 넘어간다.
    // 진단을 붙이려다 결제 흐름을 깨는 것이 제일 나쁘다.
    // 이미 paid 인 주문은 건드리지 않는다. 같은 인증결과가 두 번 들어오면 두 번째의 '중복 거절'이 paid 를 failed 로 덮었다.
    const withReason = await c.from('payments')
      .update({ status, fail_reason: why.slice(0, 200) }).eq('payment_id', paymentId).neq('status', 'paid');
    if (!withReason.error) return;
    await c.from('payments').update({ status }).eq('payment_id', paymentId).neq('status', 'paid');
    return;
  }
  const o = memOrders.get(paymentId);
  if (o) (o as any).status = status;
}

export async function getOrder(paymentId: string): Promise<Order | null> {
  const c = sb();
  if (c) {
    const { data } = await c.from('payments').select('*').eq('payment_id', paymentId).maybeSingle();
    return data ? { paymentId, reportId: data.report_id ?? data.pass_key, amount: data.amount, level: data.level ?? 2, status: data.status } : null;
  }
  return memOrders.get(paymentId) ?? null;
}

// 이 리포트에 돈이 나간(또는 나갔을 수 있는) 결제가 있는가 — 재결제를 막는다(2026-10-23).
// unlock_level 만 보면, 승인은 났는데 저장이 실패했거나(confirm:*) 승인 응답을 못 받은(approve_unknown) 건에서 다시 결제된다.
export async function reportHasPayment(reportId: string): Promise<boolean> {
  const c = sb();
  if (!c) return (memUnlockLvl.get(reportId) ?? 0) >= 2;
  const { data } = await c.from('payments').select('status, fail_reason').eq('report_id', reportId);
  return (data ?? []).some((r: any) => r.status === 'paid' || /^(confirm:|approve_unknown)/.test(String(r.fail_reason ?? '')));
}

// KCP 거래번호를 남긴다(환불·대사용). tno 칸(0010)이 없으면 조용히 넘어간다 — 기록 때문에 결제가 막히면 안 된다.
export async function recordTno(paymentId: string, tno?: string | null): Promise<void> {
  const c = sb(); if (!c || !tno) return;
  try { await c.from('payments').update({ tno: String(tno).slice(0, 40) }).eq('payment_id', paymentId); } catch { /* noop */ }
}

// 리포트 언락 레벨 (0 무료 · 1 택일팩 · 2 전체)
export async function unlockLevel(reportId: string): Promise<number> {
  const c = sb();
  if (c) {
    const { data } = await c.from('reports').select('unlock_level').eq('id', reportId).maybeSingle();
    return data?.unlock_level ?? 0;
  }
  return memUnlockLvl.get(reportId) ?? 0;
}
export async function isUnlocked(reportId: string): Promise<boolean> {
  return (await unlockLevel(reportId)) >= 1;
}

// ── 사용자 단위 권한(패스) ────────────────────────────────
export const BALJU_PASS_KEY = (userId?: string | null) => 'pass:balju:' + uid(userId);
export async function hasEntitlement(key: string): Promise<boolean> {
  const c = sb();
  if (c) { const { data } = await c.from('entitlements').select('key').eq('key', key).maybeSingle(); return !!data; }
  return memPasses.has(key);
}
export async function hasBaljuPass(userId?: string | null): Promise<boolean> {
  // 운영(DB 연결)에서 비회원은 패스가 없다. 예전엔 'pass:balju:demo' 를 조회해, 데모로 산 패스가 있으면 비회원 전원이 열렸다.
  if (!userId && sb()) return false;
  return hasEntitlement(BALJU_PASS_KEY(userId));
}

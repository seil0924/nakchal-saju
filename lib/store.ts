// lib/store.ts — 저장소 어댑터
// 환경변수(SUPABASE_URL + SERVICE_ROLE_KEY)가 있으면 Supabase를,
// 없으면 인메모리(데모/로컬)를 자동 선택합니다. 둘 다 같은 async API.
import 'server-only';
import type { ReportInput } from './report';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Order = { paymentId: string; reportId: string; amount: number; level: number; status: 'pending' | 'paid' };

// ── Supabase 백엔드 (서버 전용 · SERVICE_ROLE) ───────────
let _sb: SupabaseClient | null | undefined;
function sb(): SupabaseClient | null {
  if (_sb !== undefined) return _sb;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!(url && key) && process.env.NODE_ENV === 'production') {
    // 운영인데 Supabase 미구성 → 인메모리 폴백은 요청 간 데이터/결제 유실을 일으킴. 조용히 넘기지 말고 경고.
    console.error('[store] PRODUCTION without Supabase service role — falling back to in-memory (data will NOT persist across requests).');
  }
  _sb = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return _sb;
}
export const backend = () => (sb() ? 'supabase' : 'memory');

// ── 인메모리 백엔드 (폴백) ───────────────────────────────
const g = globalThis as any;
type MemReport = { input: ReportInput; userId: string | null; label?: string; created: number };
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
export async function saveReport(input: ReportInput, userId?: string, label?: string): Promise<string> {
  const c = sb();
  if (c) {
    const { data, error } = await c.from('reports').insert({ input, user_id: userId ?? null, label }).select('id').single();
    if (error) throw error;
    return data.id as string;
  }
  const id = genId('r');
  memReports.set(id, { input, userId: userId ?? null, label, created: g.__seq });
  return id;
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

export async function createOrder(reportId: string, amount: number, level: number = 2): Promise<Order> {
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
    const { error } = await c.from('payments').insert({ payment_id: paymentId, report_id: (isPass || !isUuid) ? null : reportId, pass_key: isPass ? reportId : null, amount, level, status: 'pending' });
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
    { const { error: e1 } = await c.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('payment_id', paymentId); if (e1) throw e1; }
    const key = o.report_id ?? o.pass_key;
    if (key && String(key).startsWith('pass:')) { await c.from('entitlements').upsert({ key }); return { paymentId, reportId: key, amount: o.amount, level: o.level ?? 1, status: 'paid' }; }
    if (!o.report_id) { return { paymentId, reportId: null, amount: o.amount, level: o.level ?? 0, status: 'paid' }; }
    const lvl = o.level ?? 2;
    const { data: cur } = await c.from('reports').select('unlock_level').eq('id', o.report_id).maybeSingle();
    const next = Math.max(cur?.unlock_level ?? 0, lvl);   // 상위 레벨은 유지 (다운그레이드 방지)
    { const { error: e2 } = await c.from('reports').update({ unlock_level: next }).eq('id', o.report_id); if (e2) throw e2; }
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

export async function getOrder(paymentId: string): Promise<Order | null> {
  const c = sb();
  if (c) {
    const { data } = await c.from('payments').select('*').eq('payment_id', paymentId).maybeSingle();
    return data ? { paymentId, reportId: data.report_id ?? data.pass_key, amount: data.amount, level: data.level ?? 2, status: data.status } : null;
  }
  return memOrders.get(paymentId) ?? null;
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
  return hasEntitlement(BALJU_PASS_KEY(userId));
}

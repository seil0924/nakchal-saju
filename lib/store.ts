// lib/store.ts — 저장소 어댑터
// 환경변수(SUPABASE_URL + SERVICE_ROLE_KEY)가 있으면 Supabase를,
// 없으면 인메모리(데모/로컬)를 자동 선택합니다. 둘 다 같은 async API.
import 'server-only';
import type { ReportInput } from './report';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type Order = { paymentId: string; reportId: string; amount: number; status: 'pending' | 'paid' };

// ── Supabase 백엔드 (서버 전용 · SERVICE_ROLE) ───────────
let _sb: SupabaseClient | null | undefined;
function sb(): SupabaseClient | null {
  if (_sb !== undefined) return _sb;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
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
const memUnlocked: Set<string> = g.__unlocked ?? (g.__unlocked = new Set());
const memCharts: Map<string, SavedChart[]> = g.__charts ?? (g.__charts = new Map()); // userId('demo') → charts
if (g.__seq === undefined) g.__seq = 1000;
const uid = (u?: string | null) => u || 'demo';

// ── 공개 API (async) ─────────────────────────────────────
export async function saveReport(input: ReportInput, userId?: string, label?: string): Promise<string> {
  const c = sb();
  if (c) {
    const { data, error } = await c.from('reports').insert({ input, user_id: userId ?? null, label }).select('id').single();
    if (error) throw error;
    return data.id as string;
  }
  const id = 'r' + g.__seq++;
  memReports.set(id, { input, userId: userId ?? null, label, created: g.__seq });
  return id;
}

// 보관함: 내 리포트 목록
export async function listReports(userId?: string): Promise<{ id: string; label?: string; unlocked: boolean }[]> {
  const c = sb();
  if (c) {
    const { data } = await c.from('reports').select('id,label,unlocked').eq('user_id', userId ?? '').order('created_at', { ascending: false }).limit(50);
    return (data ?? []).map((r: any) => ({ id: r.id, label: r.label, unlocked: !!r.unlocked }));
  }
  const out: { id: string; label?: string; unlocked: boolean }[] = [];
  for (const [id, r] of memReports) if (uid(r.userId) === uid(userId)) out.push({ id, label: r.label, unlocked: memUnlocked.has(id) });
  return out.reverse();
}

// 저장된 사주/대상
export async function saveChart(userId: string | null, ch: Omit<SavedChart, 'id'>): Promise<void> {
  const c = sb();
  if (c) { await c.from('saved_charts').insert({ user_id: userId, kind: ch.kind, name: ch.name, birth_date: ch.birth_date, birth_time: ch.birth_time, calendar: ch.calendar, is_leap: ch.is_leap }); return; }
  const list = memCharts.get(uid(userId)) ?? [];
  const rec = { ...ch, id: 'c' + g.__seq++ };
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

export async function createOrder(reportId: string, amount: number): Promise<Order> {
  const c = sb();
  const paymentId = 'pay_' + (g.__seq ? g.__seq++ : Math.floor(performance.now()));
  if (c) {
    const { error } = await c.from('payments').insert({ payment_id: paymentId, report_id: reportId, amount, status: 'pending' });
    if (error) throw error;
    return { paymentId, reportId, amount, status: 'pending' };
  }
  const o: Order = { paymentId, reportId, amount, status: 'pending' };
  memOrders.set(paymentId, o);
  return o;
}

// 실서비스: 포트원 단건조회로 검증한 실제 금액을 paidAmount로 넘김
export async function confirmOrder(paymentId: string, paidAmount: number): Promise<Order | null> {
  const c = sb();
  if (c) {
    const { data: o } = await c.from('payments').select('*').eq('payment_id', paymentId).maybeSingle();
    if (!o || paidAmount !== o.amount) return null;      // ★금액 재검증
    await c.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('payment_id', paymentId);
    await c.from('reports').update({ unlocked: true }).eq('id', o.report_id);
    return { paymentId, reportId: o.report_id, amount: o.amount, status: 'paid' };
  }
  const o = memOrders.get(paymentId);
  if (!o || paidAmount !== o.amount) return null;
  o.status = 'paid';
  memUnlocked.add(o.reportId);
  return o;
}

export async function isUnlocked(reportId: string): Promise<boolean> {
  const c = sb();
  if (c) {
    const { data } = await c.from('reports').select('unlocked').eq('id', reportId).maybeSingle();
    return !!data?.unlocked;
  }
  return memUnlocked.has(reportId);
}

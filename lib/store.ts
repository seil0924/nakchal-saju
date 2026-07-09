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
const memReports: Map<string, ReportInput> = g.__reports ?? (g.__reports = new Map());
const memOrders: Map<string, Order> = g.__orders ?? (g.__orders = new Map());
const memUnlocked: Set<string> = g.__unlocked ?? (g.__unlocked = new Set());
if (g.__seq === undefined) g.__seq = 1000;

// ── 공개 API (async) ─────────────────────────────────────
export async function saveReport(input: ReportInput, userId?: string): Promise<string> {
  const c = sb();
  if (c) {
    const { data, error } = await c.from('reports').insert({ input, user_id: userId ?? null }).select('id').single();
    if (error) throw error;
    return data.id as string;
  }
  const id = 'r' + g.__seq++;
  memReports.set(id, input);
  return id;
}

export async function getReport(id: string): Promise<ReportInput | null> {
  const c = sb();
  if (c) {
    const { data } = await c.from('reports').select('input').eq('id', id).maybeSingle();
    return (data?.input as ReportInput) ?? null;
  }
  return memReports.get(id) ?? null;
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

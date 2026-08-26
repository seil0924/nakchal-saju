// lib/admin-data.ts — 관리자 페이지 데이터 (Supabase Service Role · 실데이터)
// ※ 더미/데모 데이터 제거 — 백엔드 미설정 시 빈 값 반환
import 'server-only';
import { adminEnabled, supabaseAdmin } from './supabase/admin';
import { chartFromBirth, sajeong, todayPillar } from './engine';
import { CAT_INFO, isCatKey } from './report-categories';

const won = (n: number) => n.toLocaleString('ko-KR');

// 결제가 승인까지 못 간 사유를 사람 말로.
function whyLabel(reason?: string | null): string {
  if (!reason) return '';
  if (reason.startsWith('confirm:')) return '승인됨 · 저장실패(확인 필요)';
  if (reason.startsWith('approve:')) return '승인 거절';
  if (reason.startsWith('amount:')) return '금액 불일치';
  if (reason.startsWith('auth:')) return '인증 실패·취소';
  if (reason === 'missing_enc') return '인증값 누락';
  if (reason === 'order_not_found') return '주문 없음';
  if (reason.startsWith('fatal:')) return '서버 오류';
  return reason.slice(0, 24);
}

// 결제 카테고리/금액 → 상품명
function itemName(cat?: string | null, amount?: number): string {
  if (cat && isCatKey(cat)) return CAT_INFO[cat].name;
  if (amount === 990) return '택일팩';
  return amount ? `${won(amount)}원 상품` : '리포트';
}
function dirOf(input: any): string {
  try {
    const c = chartFromBirth(input.birth, input.time ?? null, input.cal ?? 'solar', input.leap ?? false);
    const now = new Date();
    return sajeong(c, todayPillar(now.getFullYear(), now.getMonth() + 1, now.getDate())).dir;
  } catch { return '-'; }
}
const isoDayStart = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()).toISOString(); };
const isoMonthStart = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1).toISOString(); };

const EMPTY_STATS = { members: 0, todaySignup: 0, paid: 0, convRate: '0.0', mrr: 0, subs: 0, todayReports: 0, todayPay: 0, todayPayAmt: 0 };

export async function getStats() {
  if (!adminEnabled()) return EMPTY_STATS;
  try {
    const sb = supabaseAdmin();
    const dayStart = isoDayStart(), monthStart = isoMonthStart();
    const [mAll, mToday, payRows, rToday] = await Promise.all([
      sb.from('profiles').select('*', { count: 'exact', head: true }),
      sb.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', dayStart),
      sb.from('payments').select('amount,paid_at,user_id').eq('status', 'paid'),
      sb.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', dayStart),
    ]);
    const members = mAll.count ?? 0;
    const paidList = payRows.data ?? [];
    const paidUsers = new Set(paidList.map((p: any) => p.user_id).filter(Boolean)).size;
    const monthAmt = paidList.filter((p: any) => p.paid_at && p.paid_at >= monthStart).reduce((a: number, p: any) => a + (p.amount || 0), 0);
    const todayList = paidList.filter((p: any) => p.paid_at && p.paid_at >= dayStart);
    return {
      members, todaySignup: mToday.count ?? 0, paid: paidList.length,
      convRate: members ? ((paidUsers / members) * 100).toFixed(1) : '0.0',
      mrr: monthAmt, subs: paidUsers,
      todayReports: rToday.count ?? 0,
      todayPay: todayList.length,
      todayPayAmt: todayList.reduce((a: number, p: any) => a + (p.amount || 0), 0),
    };
  } catch { return EMPTY_STATS; }
}

export async function listMembers() {
  if (!adminEnabled()) return [];
  try {
    const sb = supabaseAdmin();
    const { data: profs } = await sb.from('profiles').select('id,name,email,provider,created_at').order('created_at', { ascending: false }).limit(50);
    const ids = (profs ?? []).map((p: any) => p.id);
    const [pays, reps] = ids.length ? await Promise.all([
      sb.from('payments').select('user_id,amount').eq('status', 'paid').in('user_id', ids),
      sb.from('reports').select('user_id').in('user_id', ids),
    ]) : [{ data: [] }, { data: [] }] as any;
    const paidBy: Record<string, number> = {}, repBy: Record<string, number> = {};
    (pays.data ?? []).forEach((p: any) => { paidBy[p.user_id] = (paidBy[p.user_id] || 0) + (p.amount || 0); });
    (reps.data ?? []).forEach((r: any) => { repBy[r.user_id] = (repBy[r.user_id] || 0) + 1; });
    return (profs ?? []).map((p: any) => ({
      name: p.name ?? '(이름없음)', email: p.email ?? '', provider: p.provider ?? 'email',
      joined: (p.created_at ?? '').slice(2, 16).replace('T', ' ').replace(/-/g, '.'),
      sub: (paidBy[p.id] || 0) > 0 ? '유료' : '무료',
      paidTotal: paidBy[p.id] || 0, reports: repBy[p.id] || 0,
    }));
  } catch { return []; }
}

export async function listPayments() {
  if (!adminEnabled()) return [];
  try {
    const sb = supabaseAdmin();
    // fail_reason 컬럼이 없는 환경도 있어서, 없으면 그 컬럼만 빼고 다시 읽는다.
    let pays: any[] | null = null;
    {
      const withReason = await sb.from('payments')
        .select('payment_id,amount,status,paid_at,created_at,user_id,report_id,fail_reason')
        .order('created_at', { ascending: false }).limit(50);
      if (!withReason.error) pays = withReason.data;
      else {
        const base = await sb.from('payments')
          .select('payment_id,amount,status,paid_at,created_at,user_id,report_id')
          .order('created_at', { ascending: false }).limit(50);
        pays = base.data;
      }
    }
    const uids = [...new Set((pays ?? []).map((p: any) => p.user_id).filter(Boolean))];
    const rids = [...new Set((pays ?? []).map((p: any) => p.report_id).filter(Boolean))];
    const [profs, reps] = await Promise.all([
      uids.length ? sb.from('profiles').select('id,name,email').in('id', uids) : Promise.resolve({ data: [] } as any),
      rids.length ? sb.from('reports').select('id,input').in('id', rids) : Promise.resolve({ data: [] } as any),
    ]);
    const pmap: Record<string, any> = {}; (profs.data ?? []).forEach((p: any) => { pmap[p.id] = p; });
    const cmap: Record<string, string> = {}; (reps.data ?? []).forEach((r: any) => { cmap[r.id] = r.input?.cat; });
    return (pays ?? []).map((p: any) => ({
      id: (p.payment_id ?? '').slice(-6),
      name: pmap[p.user_id]?.name ?? '비회원', email: pmap[p.user_id]?.email ?? '',
      item: itemName(cmap[p.report_id], p.amount), amount: p.amount ?? 0, pay: '간편결제',
      status: p.status === 'paid' ? '완료' : (p.status === 'cancelled' || p.status === 'refunded' ? '환불' : (p.status === 'failed' ? '실패' : p.status)),
      // 왜 승인까지 못 갔는지. confirm:* 는 승인은 났는데 우리 저장이 실패한 것이라 제일 위험하다.
      why: whyLabel(p.fail_reason),
      at: (p.paid_at ?? p.created_at ?? '').slice(5, 16),
    }));
  } catch { return []; }
}

export async function listReports() {
  if (!adminEnabled()) return [];
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.from('reports').select('id,input,unlock_level,created_at').order('created_at', { ascending: false }).limit(50);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      name: r.input?.name || '(이름없음)',
      corp: r.input?.legalName || '-',
      dir: dirOf(r.input || {}),
      unlocked: (r.unlock_level ?? 0) >= 1,
      at: (r.created_at ?? '').slice(5, 16),
    }));
  } catch { return []; }
}
export { won };

// lib/admin-data.ts — 관리자 페이지 데이터 (Supabase Service Role · 실데이터)
// ※ 더미/데모 데이터 제거 — 백엔드 미설정 시 빈 값 반환
import 'server-only';
import { adminEnabled, supabaseAdmin } from './supabase/admin';
import { chartFromBirth, sajeong, todayPillar } from './engine';
import { kstYmd } from './kst';
import { kstDayStartIso, kstMonthStartIso, kstStamp, payerOf, payItemName, payStatusLabel } from './admin-format';
import { splitDeletable, isReportId } from './report-cleanup';
import { fetchAll } from './sb-page';

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

function dirOf(input: any): string {
  try {
    const c = chartFromBirth(input.birth, input.time ?? null, input.cal ?? 'solar', input.leap ?? false);
    const [y, m, d] = kstYmd().split('-').map(Number);
    return sajeong(c, todayPillar(y, m, d)).dir;
  } catch { return '-'; }
}

type SB = ReturnType<typeof supabaseAdmin>;

// 리포트 id → 주인·카테고리 (결제 줄에 회원·상품이 없을 때 거꾸로 찾는 데 쓴다)
async function reportMeta(sb: SB, ids: string[]) {
  const owner: Record<string, string | null> = {}, cat: Record<string, string | undefined> = {};
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await sb.from('reports').select('id,user_id,input').in('id', ids.slice(i, i + 200));
    for (const r of (data ?? []) as any[]) { owner[r.id] = r.user_id ?? null; cat[r.id] = r.input?.cat; }
  }
  return { owner, cat };
}

const PAY_COLS = 'payment_id,user_id,report_id,pass_key,amount';

const EMPTY_STATS = { members: 0, todaySignup: 0, paid: 0, convRate: '0.0', mrr: 0, subs: 0, guestPaid: 0, todayReports: 0, testReports: 0, todayPay: 0, todayPayAmt: 0 };

export { fetchAll };

export async function getStats() {
  if (!adminEnabled()) return EMPTY_STATS;
  try {
    const sb = supabaseAdmin();
    const dayStart = kstDayStartIso(), monthStart = kstMonthStartIso();
    const [mAll, mToday, rToday, rTest, paidList] = await Promise.all([
      sb.from('profiles').select('*', { count: 'exact', head: true }),
      sb.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', dayStart),
      sb.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', dayStart),
      // 점검 로봇이 '점검용' 이름으로 뽑은 리포트 — 실제 손님 수에서 뺀다
      sb.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', dayStart).eq('input->>name', '점검용'),
      fetchAll<any>((a, b) => sb.from('payments').select(PAY_COLS + ',paid_at').eq('status', 'paid').order('created_at', { ascending: true }).range(a, b)),
    ]);
    const members = mAll.count ?? 0;
    const { owner } = await reportMeta(sb, [...new Set(paidList.map((p: any) => p.report_id).filter(Boolean))] as string[]);
    const payers = paidList.map((p: any) => payerOf(p, owner));
    const paidUsers = new Set(payers.filter(Boolean)).size;
    const monthAmt = paidList.filter((p: any) => p.paid_at && p.paid_at >= monthStart).reduce((a: number, p: any) => a + (p.amount || 0), 0);
    const todayList = paidList.filter((p: any) => p.paid_at && p.paid_at >= dayStart);
    const test = rTest.count ?? 0;
    return {
      members, todaySignup: mToday.count ?? 0,
      paid: paidList.length,                        // 결제 완료 '건수'
      convRate: members ? ((paidUsers / members) * 100).toFixed(1) : '0.0',
      mrr: monthAmt, subs: paidUsers,
      guestPaid: payers.filter(x => !x).length,     // 회원을 찾지 못한 결제(비회원 결제)
      todayReports: Math.max(0, (rToday.count ?? 0) - test), testReports: test,
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
    if (!ids.length) return [];
    // 회원의 리포트에 붙은 결제 + 회원이 직접 붙은 결제(2026-09-17 이후) + 발주처 패스
    const reps = await fetchAll<any>((a, b) => sb.from('reports').select('id,user_id').in('user_id', ids).range(a, b));
    const repOwner: Record<string, string> = {};
    reps.forEach(r => { repOwner[r.id] = r.user_id; });
    const repIds = reps.map(r => r.id);
    const pays: any[] = [];
    for (let i = 0; i < repIds.length; i += 200) {
      const { data } = await sb.from('payments').select(PAY_COLS).eq('status', 'paid').in('report_id', repIds.slice(i, i + 200));
      pays.push(...(data ?? []));
    }
    const direct = await sb.from('payments').select(PAY_COLS).eq('status', 'paid').in('user_id', ids);
    pays.push(...(direct.data ?? []));
    const passes = await sb.from('payments').select(PAY_COLS).eq('status', 'paid').in('pass_key', ids.map((id: string) => 'pass:balju:' + id));
    pays.push(...(passes.data ?? []));
    const seen = new Set<string>();
    const paidBy: Record<string, number> = {}, repBy: Record<string, number> = {};
    for (const p of pays) {
      if (seen.has(p.payment_id)) continue;
      seen.add(p.payment_id);
      const who = payerOf(p, repOwner);
      if (who) paidBy[who] = (paidBy[who] || 0) + (p.amount || 0);
    }
    reps.forEach(r => { repBy[r.user_id] = (repBy[r.user_id] || 0) + 1; });
    return (profs ?? []).map((p: any) => ({
      name: p.name ?? '(이름없음)', email: p.email ?? '', provider: p.provider ?? 'email',
      joined: kstStamp(p.created_at, true),
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
    const cols = PAY_COLS + ',status,paid_at,created_at,level';
    let pays: any[] | null = null;
    {
      const withReason = await sb.from('payments').select(cols + ',fail_reason').order('created_at', { ascending: false }).limit(100);
      if (!withReason.error) pays = withReason.data;
      else pays = (await sb.from('payments').select(cols).order('created_at', { ascending: false }).limit(100)).data;
    }
    const rows = (pays ?? []) as any[];
    const rids = [...new Set(rows.map(p => p.report_id).filter(Boolean))] as string[];
    const { owner, cat } = await reportMeta(sb, rids);
    const payer = rows.map(p => payerOf(p, owner));
    const uids = [...new Set(payer.filter(Boolean))] as string[];
    const profs = uids.length ? (await sb.from('profiles').select('id,name,email').in('id', uids)).data ?? [] : [];
    const pmap: Record<string, any> = {};
    profs.forEach((p: any) => { pmap[p.id] = p; });
    return rows.map((p, i) => {
      const who = payer[i];
      return {
        id: (p.payment_id ?? '').slice(-6),
        name: who ? (pmap[who]?.name ?? '회원') : '비회원',
        email: who ? (pmap[who]?.email ?? '') : '',
        item: payItemName(p, p.report_id ? cat[p.report_id] : null),
        amount: p.amount ?? 0,
        status: payStatusLabel(p.status),
        // 왜 승인까지 못 갔는지. confirm:* 는 승인은 났는데 우리 저장이 실패한 것이라 제일 위험하다.
        why: whyLabel(p.fail_reason),
        at: kstStamp(p.paid_at ?? p.created_at),
      };
    });
  } catch { return []; }
}

// 결제가 붙은 리포트 id. 조회가 실패하면 던진다 — '모름' 을 '결제 없음' 으로 읽으면
// 지우면 안 되는 리포트를 지우게 된다(리포트 삭제는 결제 기록까지 cascade 로 지운다).
async function paidReportIds(sb: SB, ids: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await sb.from('payments').select('report_id').in('report_id', ids.slice(i, i + 200));
    if (error) throw error;
    for (const p of (data ?? []) as any[]) if (p.report_id) out.add(p.report_id);
  }
  return out;
}

// name 을 주면 그 성함으로 뽑은 리포트만(최대 500). 없으면 최근 50.
export async function listReports(name?: string) {
  if (!adminEnabled()) return [];
  try {
    const sb = supabaseAdmin();
    let q = sb.from('reports').select('id,input,unlock_level,created_at').order('created_at', { ascending: false });
    q = name ? q.eq('input->>name', name).limit(500) : q.limit(50);
    const { data } = await q;
    const rows = (data ?? []) as any[];
    let paid = new Set<string>(); let paidKnown = true;
    try { paid = await paidReportIds(sb, rows.map(r => r.id)); } catch { paidKnown = false; }
    const { deletable } = splitDeletable(rows.map(r => ({ id: r.id, unlockLevel: r.unlock_level })), paid);
    const canDelete = new Set(paidKnown ? deletable : []);
    return rows.map((r) => ({
      id: r.id,
      name: r.input?.name || '(이름없음)',
      corp: r.input?.legalName || '-',
      dir: dirOf(r.input || {}),
      unlocked: (r.unlock_level ?? 0) >= 1,
      paid: paid.has(r.id),
      paidKnown,
      deletable: canDelete.has(r.id),
      at: kstStamp(r.created_at),
    }));
  } catch { return []; }
}

// 지운다 — 화면이 보낸 판단은 믿지 않고 서버에서 결제·유료 여부를 다시 확인한다.
async function deleteWhereAllowed(sb: SB, ids: string[]) {
  if (!ids.length) return { deleted: 0, kept: 0 };
  const { data, error } = await sb.from('reports').select('id,unlock_level').in('id', ids);
  if (error) throw error;
  const rows = (data ?? []) as any[];
  const paid = await paidReportIds(sb, rows.map(r => r.id));
  const { deletable, kept } = splitDeletable(rows.map(r => ({ id: r.id, unlockLevel: r.unlock_level })), paid);
  let deleted = 0;
  for (let i = 0; i < deletable.length; i += 200) {
    const { error: e, count } = await sb.from('reports').delete({ count: 'exact' }).in('id', deletable.slice(i, i + 200));
    if (e) throw e;
    deleted += count ?? 0;
  }
  return { deleted, kept: kept.length };
}

export async function deleteReports(ids: string[]) {
  if (!adminEnabled()) return { deleted: 0, kept: 0 };
  return deleteWhereAllowed(supabaseAdmin(), ids.filter(isReportId));
}

export async function deleteReportsByName(name: string) {
  if (!adminEnabled() || !name) return { deleted: 0, kept: 0 };
  const sb = supabaseAdmin();
  const { data, error } = await sb.from('reports').select('id').eq('input->>name', name).limit(2000);
  if (error) throw error;
  return deleteWhereAllowed(sb, ((data ?? []) as any[]).map(r => r.id));
}
export { won };

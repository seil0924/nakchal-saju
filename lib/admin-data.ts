// lib/admin-data.ts — 관리자 페이지 데이터 (Supabase Service Role · 실데이터)
// ※ 더미/데모 데이터 제거 — 백엔드 미설정 시 빈 값 반환
import 'server-only';
import { adminEnabled, supabaseAdmin } from './supabase/admin';
import { chartFromBirth, sajeong, todayPillar } from './engine';
import { kstYmd } from './kst';
import { kstDayStartIso, kstMonthStartIso, kstStamp, payerOf, payItemName, payStatusLabel } from './admin-format';
import { splitDeletable, isReportId } from './report-cleanup';
import { fetchAll } from './sb-page';
import { dashPhone } from './buyer';
import { isTestName, isTestProfile } from './admin-test';

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
  if (reason === 'approve_unknown') return '승인 응답 없음(KCP 확인 필요)';
  if (reason === 'refund:admin') return '관리자 환불 처리';
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

const EMPTY_STATS = { members: 0, todaySignup: 0, paid: 0, convRate: '0.0', mrr: 0, subs: 0, guestPaid: 0, todayReports: 0, testReports: 0, todayPay: 0, todayPayAmt: 0, todayViews: 0, weekViews: 0, todayTries: 0, refunded: 0, testPaid: 0 };

export { fetchAll };

export async function getStats() {
  if (!adminEnabled()) return EMPTY_STATS;
  try {
    const sb = supabaseAdmin();
    const dayStart = kstDayStartIso(), monthStart = kstMonthStartIso();
    const weekStart = new Date(Date.now() - 7 * 86400000).toISOString();
    const [mAll, mToday, rToday, rTest, paidAll, vToday, vWeek, tries, refunds] = await Promise.all([
      sb.from('profiles').select('*', { count: 'exact', head: true }),
      sb.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', dayStart),
      sb.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', dayStart),
      // 점검 로봇이 '점검용' 이름으로 뽑은 리포트 — 실제 손님 수에서 뺀다
      sb.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', dayStart).eq('input->>name', '점검용'),
      fetchAll<any>((a, b) => sb.from('payments').select(PAY_COLS + ',paid_at').eq('status', 'paid').order('created_at', { ascending: true }).range(a, b)),
      // 로그인을 뺀 뒤(2026-10-23)로는 회원 수보다 '오늘 몇 명이 봤고, 몇 번 결제창을 열었나'가 쓸모 있다
      sb.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', dayStart),
      sb.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', weekStart),
      sb.from('payments').select('*', { count: 'exact', head: true }).gte('created_at', dayStart),
      sb.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    ]);
    const members = mAll.count ?? 0;
    const { owner } = await reportMeta(sb, [...new Set(paidAll.map((p: any) => p.report_id).filter(Boolean))] as string[]);
    // 운영자가 직접 해 본 결제는 매출·건수에서 뺀다(lib/admin-test). 가려내는 조회가 실패하면 빼지 않고 그대로 센다.
    const testUsers = new Set<string>(), testPays = new Set<string>();
    try {
      const profs = await fetchAll<any>((a, b) => sb.from('profiles').select('id,name,email,role').range(a, b));
      profs.forEach(p => { if (isTestProfile(p)) testUsers.add(p.id); });
    } catch { /* 회원 표를 못 읽으면 가려내지 않는다 */ }
    try {
      const named = await fetchAll<any>((a, b) => sb.from('payments').select('payment_id,buyer_name').eq('status', 'paid').not('buyer_name', 'is', null).range(a, b));
      named.forEach(p => { if (isTestName(p.buyer_name)) testPays.add(p.payment_id); });
    } catch { /* buyer_name 칸이 없는 환경 */ }
    const isTestPay = (p: any) => testPays.has(p.payment_id) || testUsers.has(payerOf(p, owner) ?? '');
    const testPaid = paidAll.filter(isTestPay).length;
    const paidList = paidAll.filter((p: any) => !isTestPay(p));
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
      todayViews: vToday.count ?? 0, weekViews: vWeek.count ?? 0,
      todayTries: tries.count ?? 0, refunded: refunds.count ?? 0, testPaid,
    };
  } catch { return EMPTY_STATS; }
}

export async function listMembers() {
  if (!adminEnabled()) return [];
  try {
    const sb = supabaseAdmin();
    const { data: profs } = await sb.from('profiles').select('id,name,email,provider,created_at,role').order('created_at', { ascending: false }).limit(100);
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
      test: isTestProfile(p),
    }));
  } catch { return []; }
}

// q 를 주면 구매자 성함이나 휴대폰 번호로 찾는다(숫자 4자리 이상이면 번호, 아니면 성함).
export async function listPayments(q?: string) {
  if (!adminEnabled()) return [];
  try {
    const sb = supabaseAdmin();
    // fail_reason 컬럼이 없는 환경도 있어서, 없으면 그 컬럼만 빼고 다시 읽는다.
    const cols = PAY_COLS + ',status,paid_at,created_at,level';
    const digits = (q ?? '').replace(/\D/g, '');
    const byPhone = digits.length >= 4, byName = !byPhone && !!q?.trim();
    let pays: any[] | null = null;
    {
      // buyer_*(0011)·tno(0010)·item(0009)·fail_reason(0008) 컬럼이 없는 환경도 있다. 있는 만큼만 읽는다.
      for (const extra of [',fail_reason,item,tno,buyer_name,buyer_phone', ',fail_reason,item', ',fail_reason', '']) {
        if ((byPhone || byName) && !extra.includes('buyer_')) break;   // 구매자 칸이 없으면 찾을 수 없다
        let r = sb.from('payments').select(cols + extra).order('created_at', { ascending: false });
        if (byPhone) r = r.like('buyer_phone', `%${digits}%`);
        if (byName) r = r.eq('buyer_name', q!.trim());
        const res = await r.limit(byPhone || byName ? 300 : 100);
        if (!res.error) { pays = res.data; break; }
      }
    }
    const rows = (pays ?? []) as any[];
    const rids = [...new Set(rows.map(p => p.report_id).filter(Boolean))] as string[];
    const { owner, cat } = await reportMeta(sb, rids);
    const payer = rows.map(p => payerOf(p, owner));
    const uids = [...new Set(payer.filter(Boolean))] as string[];
    const profs = uids.length ? (await sb.from('profiles').select('id,name,email,role').in('id', uids)).data ?? [] : [];
    const pmap: Record<string, any> = {};
    profs.forEach((p: any) => { pmap[p.id] = p; });
    return rows.map((p, i) => {
      const who = payer[i];
      return {
        id: (p.payment_id ?? '').slice(-6),
        paymentId: p.payment_id ?? '',
        // 결제 때 받은 성함이 먼저다(로그인 없이 산 사람). 없으면 회원 이름.
        name: p.buyer_name || (who ? (pmap[who]?.name ?? '회원') : '비회원'),
        email: who ? (pmap[who]?.email ?? '') : '',
        phone: p.buyer_phone ? dashPhone(p.buyer_phone) : '',
        tno: p.tno ?? '',
        refundable: p.status === 'paid',
        // 운영자가 직접 해 본 결제. 목록에서 기본으로 숨기고 합계에서 뺀다.
        test: isTestName(p.buyer_name) || (who ? isTestProfile(pmap[who] ?? {}) : false),
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

// KCP 관리자에서 환불(취소)한 뒤 여기서 표시한다. 기록은 지우지 않고 상태만 바꾼다.
// 같은 리포트·패스에 다른 완료 결제가 없을 때만 다시 잠근다(두 번 결제 중 하나만 환불한 경우는 열어 둔다).
export async function markRefunded(paymentId: string): Promise<boolean> {
  if (!adminEnabled() || !/^pay_[\w-]{6,60}$/.test(paymentId)) return false;
  const sb = supabaseAdmin();
  const { data: o, error: e0 } = await sb.from('payments').select('payment_id,report_id,pass_key,status').eq('payment_id', paymentId).maybeSingle();
  if (e0) throw e0;
  if (!o || (o as any).status !== 'paid') return false;
  let { error } = await sb.from('payments').update({ status: 'cancelled', fail_reason: 'refund:admin' }).eq('payment_id', paymentId);
  if (error) ({ error } = await sb.from('payments').update({ status: 'cancelled' }).eq('payment_id', paymentId));
  if (error) throw error;
  const { report_id, pass_key } = o as any;
  const col = report_id ? 'report_id' : pass_key ? 'pass_key' : null;
  if (col) {
    const { count, error: e1 } = await sb.from('payments').select('payment_id', { count: 'exact', head: true }).eq(col, report_id ?? pass_key).eq('status', 'paid');
    if (!e1 && !count) {
      if (report_id) await sb.from('reports').update({ unlock_level: 0, unlocked: false }).eq('id', report_id);
      else await sb.from('entitlements').delete().eq('key', pass_key);
    }
  }
  return true;
}

// 결제가 붙은 리포트 id. 조회가 실패하면 던진다 — '모름' 을 '결제 없음' 으로 읽으면
// 지우면 안 되는 리포트를 지우게 된다
// 결제창만 열고 닫은 주문(대기·실패)은 막지 않는다. 0010 부터 리포트를 지워도 결제 줄은 남고(report_id 만 비움),
// 점검하며 연 주문 때문에 점검용 리포트 27건 중 25건이 지워지지 않았다(2026-10-23). 완료·환불만 지키면 된다.
async function paidReportIds(sb: SB, ids: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  for (let i = 0; i < ids.length; i += 200) {
    const { data, error } = await sb.from('payments').select('report_id').in('report_id', ids.slice(i, i + 200)).in('status', ['paid', 'cancelled']);
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

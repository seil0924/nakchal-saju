// lib/admin-data.ts — 관리자 페이지 데이터 (Supabase Service Role, 미설정 시 데모)
import 'server-only';
import { adminEnabled, supabaseAdmin } from './supabase/admin';

const won = (n: number) => n.toLocaleString('ko-KR');

const DEMO = {
  stats: { members: 3428, todaySignup: 42, paid: 512, convRate: '14.9', mrr: 4982000, subs: 388, todayReports: 271, todayPay: 37, todayPayAmt: 412300 },
  members: [
    { name: '오세일', email: 'ohseil@company.co.kr', provider: 'kakao', joined: '26.07.10', sub: '월 정기', paidTotal: 42700, reports: 7 },
    { name: '김상무', email: 'kim@daehan.co.kr', provider: 'naver', joined: '26.07.09', sub: '무료', paidTotal: 990, reports: 2 },
    { name: '박대표', email: 'park@ilsung.com', provider: 'google', joined: '26.07.08', sub: '월 정기', paidTotal: 21700, reports: 5 },
    { name: '정회장', email: 'jung@hanla.co.kr', provider: 'kakao', joined: '26.07.07', sub: '무료', paidTotal: 0, reports: 1 },
    { name: '최이사', email: 'choi@sungwoo.kr', provider: 'google', joined: '26.07.06', sub: '월 정기', paidTotal: 31600, reports: 9 },
    { name: '한부장', email: 'han@kumho.co.kr', provider: 'naver', joined: '26.07.05', sub: '무료', paidTotal: 1900, reports: 3 },
  ],
  payments: [
    { id: 'A8213', name: '오세일', email: 'ohseil@company.co.kr', item: '월 정기 구독', amount: 9900, pay: '카카오페이', status: '완료', at: '07.10 09:12' },
    { id: 'A8212', name: '김상무', email: 'kim@daehan.co.kr', item: '첫 열람', amount: 990, pay: '토스페이', status: '완료', at: '07.10 08:41' },
    { id: 'A8211', name: '박대표', email: 'park@ilsung.com', item: '전체 리포트', amount: 1900, pay: '신용카드', status: '완료', at: '07.09 22:03' },
    { id: 'A8210', name: '정회장', email: 'jung@hanla.co.kr', item: '월 정기 구독', amount: 9900, pay: '카카오페이', status: '환불', at: '07.09 19:20' },
    { id: 'A8209', name: '최이사', email: 'choi@sungwoo.kr', item: '첫 열람', amount: 990, pay: '네이버페이', status: '완료', at: '07.09 15:55' },
  ],
  reports: [
    { id: 'r1042', name: '오세일', corp: '세일건설(주)', dir: '상단', unlocked: true, at: '07.10 09:05' },
    { id: 'r1041', name: '김상무', corp: '대한ENG', dir: '하단', unlocked: false, at: '07.10 08:40' },
    { id: 'r1040', name: '박대표', corp: '일성산업', dir: '상단', unlocked: true, at: '07.09 21:58' },
  ],
};

export async function getStats() {
  if (!adminEnabled()) return DEMO.stats;
  try {
    const sb = supabaseAdmin();
    const [{ count: members }, { count: paid }] = await Promise.all([
      sb.from('profiles').select('*', { count: 'exact', head: true }),
      sb.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
    ]);
    return { ...DEMO.stats, members: members ?? 0, paid: paid ?? 0 };
  } catch { return DEMO.stats; }
}
export async function listMembers() {
  if (!adminEnabled()) return DEMO.members;
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.from('profiles').select('name,email,provider,created_at,role').order('created_at', { ascending: false }).limit(50);
    return (data ?? []).map((p: any) => ({ name: p.name ?? '(이름없음)', email: p.email ?? '', provider: p.provider ?? 'email', joined: (p.created_at ?? '').slice(2, 10).replace(/-/g, '.'), sub: '무료', paidTotal: 0, reports: 0 }));
  } catch { return DEMO.members; }
}
export async function listPayments() {
  if (!adminEnabled()) return DEMO.payments;
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.from('payments').select('payment_id,amount,status,paid_at,user_id').order('created_at', { ascending: false }).limit(50);
    return (data ?? []).map((p: any) => ({ id: (p.payment_id ?? '').slice(-5), name: '-', email: '', item: '-', amount: p.amount ?? 0, pay: '-', status: p.status === 'paid' ? '완료' : p.status, at: (p.paid_at ?? '').slice(5, 16) }));
  } catch { return DEMO.payments; }
}
export async function listReports() {
  if (!adminEnabled()) return DEMO.reports;
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.from('reports').select('id,unlocked,created_at,user_id').order('created_at', { ascending: false }).limit(50);
    return (data ?? []).map((r: any) => ({ id: (r.id ?? '').slice(0, 6), name: '-', corp: '-', dir: '-', unlocked: !!r.unlocked, at: (r.created_at ?? '').slice(5, 16) }));
  } catch { return DEMO.reports; }
}
export { won };

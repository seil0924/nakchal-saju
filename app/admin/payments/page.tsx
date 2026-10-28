export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { listPayments, markRefunded, won } from '@/lib/admin-data';
import { purgeOldBuyers } from '@/lib/store';
import { BUYER_KEEP_YEARS } from '@/lib/buyer';
import { authEnabled, isAdmin } from '@/lib/supabase/server';
import ConfirmSubmit from '../reports/ConfirmSubmit';

// 서버 액션은 레이아웃의 관리자 확인을 거치지 않는다. 여기서 한 번 더 막는다.
async function guard() { return authEnabled() && (await isAdmin()); }

// KCP 관리자에서 취소한 뒤 누른다. 돈은 여기서 움직이지 않는다.
async function refund(formData: FormData) {
  'use server';
  if (!(await guard())) return;
  await markRefunded(String(formData.get('pid') || ''));
  revalidatePath('/admin/payments');
}

// 운영자가 직접 해 본 결제는 기본으로 숨기고 '점검·운영' 칸에 모은다(lib/admin-test).
const FILTERS: [string, string, string[]][] = [
  ['all', '손님 전체', []],
  ['done', '완료', ['완료']],
  ['wait', '대기(결제창 이탈)', ['대기']],
  ['fail', '실패', ['실패']],
  ['refund', '환불', ['환불']],
  ['test', '점검·운영', []],
];

export default async function AdminPayments({ searchParams }: { searchParams?: { f?: string; q?: string } }) {
  const q = String(searchParams?.q ?? '').trim().slice(0, 20);
  // 보관 기간(5년)이 지난 구매자 성함·번호는 이 화면을 열 때 지운다. 거래 기록은 남는다.
  await purgeOldBuyers(BUYER_KEEP_YEARS);
  const listed = await listPayments(q || undefined);
  const tests = listed.filter(p => p.test);
  // 이름이나 번호로 찾을 때는 점검 결제도 같이 보여 준다. 찾는 사람이 점검 결제를 찾고 있을 수 있다.
  const all = q ? listed : listed.filter(p => !p.test);
  const f = FILTERS.find(x => x[0] === searchParams?.f) ?? FILTERS[0];
  const pays = f[0] === 'test' ? tests : f[2].length ? all.filter(p => f[2].includes(p.status)) : all;
  const done = all.filter(p => p.status === '완료');
  const total = done.reduce((a, p) => a + p.amount, 0);
  return (
    <>
      <div className="atop"><div><h1>결제·주문 내역</h1><div className="sub">{q ? `‘${q}’ 로 찾은 주문 ` : '최근 주문 '}{all.length}건 · 그중 완료 {done.length}건 ₩{won(total)}{!q && tests.length ? ` · 점검 결제 ${tests.length}건은 따로 모음` : ''} · 한국시간 · 누적 합계는 대시보드</div></div></div>
      <div className="abody">
        <form method="get" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <input name="q" defaultValue={q} maxLength={20} placeholder="구매자 성함 또는 휴대폰 번호" aria-label="구매자 성함 또는 휴대폰 번호로 찾기"
            style={{ padding: '9px 12px', fontSize: 14, border: '1px solid #ddd3bd', borderRadius: 8, minWidth: 240, fontFamily: 'inherit' }} />
          <button type="submit" style={{ padding: '9px 14px', fontSize: 13.5, fontWeight: 700, borderRadius: 8, border: '1px solid #26231c', background: '#26231c', color: '#fff', cursor: 'pointer', minHeight: 38 }}>찾기</button>
          {q && <Link href="/admin/payments" style={{ fontSize: 13, color: '#8a806a' }}>전체로</Link>}
        </form>
        <div className="filters">
          {FILTERS.map(([k, label, st]) => (
            <Link key={k} href={k === 'all' ? '/admin/payments' : `/admin/payments?f=${k}`} className={'fx' + (f[0] === k ? ' on' : '')} style={{ textDecoration: 'none' }}>
              {label} {k === 'test' ? tests.length : st.length ? all.filter(p => st.includes(p.status)).length : all.length}
            </Link>
          ))}
        </div>
        <div className="acard">
          <table><tbody>
            <tr><th>주문번호</th><th>구매자</th><th>상품</th><th>금액</th><th>상태</th><th>일시</th><th></th></tr>
            {pays.map((p, i) => (
              <tr key={i}>
                <td>#{p.id}</td>
                <td className="who">{p.name}{p.test && <span className="pill free" style={{ marginLeft: 6 }}>점검</span>}<em>{[p.phone, p.email].filter(Boolean).join(' · ')}</em></td>
                <td>{p.item}</td>
                <td className="amt">{won(p.amount)}</td>
                <td><span className={'pill ' + (p.status === '완료' ? 'done' : 'refund')}>{p.status}</span>{p.why && <em style={{ display: 'block', fontSize: 11.5, color: '#b3382c', marginTop: 3, fontStyle: 'normal' }}>{p.why}</em>}</td>
                <td style={{ color: '#a39c8e' }}>{p.at}{p.tno && <em style={{ display: 'block', fontSize: 11, fontStyle: 'normal' }}>KCP {p.tno}</em>}</td>
                <td>{p.refundable && (
                  <form action={refund}><input type="hidden" name="pid" value={p.paymentId} />
                    <ConfirmSubmit small label="환불 처리" message={`#${p.id} ${p.name} ₩${won(p.amount)} 를 환불로 표시합니다. KCP 관리자에서 먼저 취소하셨나요? 이 리포트에 다른 결제가 없으면 다시 잠깁니다.`} />
                  </form>)}</td>
              </tr>
            ))}
            {pays.length === 0 && <tr><td colSpan={7}><div className="empty">해당하는 결제가 없습니다.</div></td></tr>}
          </tbody></table>
        </div>
        <p style={{ fontSize: 12.5, color: '#8a806a', lineHeight: 1.7, marginTop: 10 }}>
          결제 수단은 저장하지 않아 표시하지 않습니다(KCP 관리자에서 확인). 구매자는 결제 때 받은 성함·번호가 먼저이고, 없으면 결제 기록 → 리포트 주인 → 패스 순으로 회원을 찾습니다.
          환불 처리는 돈을 돌려주지 않습니다. KCP 관리자에서 취소한 뒤 눌러 상태를 맞춰 주세요. 구매자 성함·번호는 {BUYER_KEEP_YEARS}년이 지나면 지웁니다.
          카테고리 없이 뽑은 리포트의 결제는 금액이 같은 상품끼리 구분되지 않아 ‘A / B 중’으로 보입니다.
        </p>
      </div>
    </>
  );
}

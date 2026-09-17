export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { listPayments, won } from '@/lib/admin-data';

const FILTERS: [string, string, string[]][] = [
  ['all', '전체', []],
  ['done', '완료', ['완료']],
  ['wait', '대기(결제창 이탈)', ['대기']],
  ['fail', '실패', ['실패']],
  ['refund', '환불', ['환불']],
];

export default async function AdminPayments({ searchParams }: { searchParams?: { f?: string } }) {
  const all = await listPayments();
  const f = FILTERS.find(x => x[0] === searchParams?.f) ?? FILTERS[0];
  const pays = f[2].length ? all.filter(p => f[2].includes(p.status)) : all;
  const done = all.filter(p => p.status === '완료');
  const total = done.reduce((a, p) => a + p.amount, 0);
  return (
    <>
      <div className="atop"><div><h1>결제·주문 내역</h1><div className="sub">최근 주문 {all.length}건 · 그중 완료 {done.length}건 ₩{won(total)} · 한국시간 · 누적 합계는 대시보드</div></div></div>
      <div className="abody">
        <div className="filters">
          {FILTERS.map(([k, label, st]) => (
            <Link key={k} href={k === 'all' ? '/admin/payments' : `/admin/payments?f=${k}`} className={'fx' + (f[0] === k ? ' on' : '')} style={{ textDecoration: 'none' }}>
              {label} {st.length ? all.filter(p => st.includes(p.status)).length : all.length}
            </Link>
          ))}
        </div>
        <div className="acard">
          <table><tbody>
            <tr><th>주문번호</th><th>회원</th><th>상품</th><th>금액</th><th>상태</th><th>일시</th></tr>
            {pays.map((p, i) => (
              <tr key={i}>
                <td>#{p.id}</td>
                <td className="who">{p.name}<em>{p.email}</em></td>
                <td>{p.item}</td>
                <td className="amt">{won(p.amount)}</td>
                <td><span className={'pill ' + (p.status === '완료' ? 'done' : 'refund')}>{p.status}</span>{p.why && <em style={{ display: 'block', fontSize: 11.5, color: '#b3382c', marginTop: 3, fontStyle: 'normal' }}>{p.why}</em>}</td>
                <td style={{ color: '#a39c8e' }}>{p.at}</td>
              </tr>
            ))}
            {pays.length === 0 && <tr><td colSpan={6}><div className="empty">해당하는 결제가 없습니다.</div></td></tr>}
          </tbody></table>
        </div>
        <p style={{ fontSize: 12.5, color: '#8a806a', lineHeight: 1.7, marginTop: 10 }}>
          결제 수단은 저장하지 않아 표시하지 않습니다(KCP 관리자에서 확인). 회원은 결제 기록 → 리포트 주인 → 패스 순으로 찾습니다.
          카테고리 없이 뽑은 리포트의 결제는 금액이 같은 상품끼리 구분되지 않아 ‘A / B 중’으로 보입니다.
        </p>
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
import { listPayments, won } from '@/lib/admin-data';

export default async function AdminPayments() {
  const pays = await listPayments();
  const total = pays.filter(p => p.status === '완료').reduce((a, p) => a + p.amount, 0);
  return (
    <>
      <div className="atop"><div><h1>결제·주문 내역</h1><div className="sub">완료 합계 ₩{won(total)}</div></div></div>
      <div className="abody">
        <div className="filters"><div className="fx on">전체</div><div className="fx">완료</div><div className="fx">환불</div><div className="fx">기간</div></div>
        <div className="acard">
          <table><tbody>
            <tr><th>주문번호</th><th>회원</th><th>상품</th><th>금액</th><th>수단</th><th>상태</th><th>일시</th></tr>
            {pays.map((p, i) => (
              <tr key={i}><td>#{p.id}</td><td className="who">{p.name}<em>{p.email}</em></td><td>{p.item}</td><td className="amt">{won(p.amount)}</td><td>{p.pay}</td><td><span className={'pill ' + (p.status === '완료' ? 'done' : 'refund')}>{p.status}</span></td><td style={{ color: '#a39c8e' }}>{p.at}</td></tr>
            ))}
            {pays.length === 0 && <tr><td colSpan={7}><div className="empty">결제 내역이 없습니다.</div></td></tr>}
          </tbody></table>
        </div>
      </div>
    </>
  );
}

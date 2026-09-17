export const dynamic = 'force-dynamic';
import { getStats, listPayments, listMembers, won } from '@/lib/admin-data';

export default async function AdminDash() {
  const s = await getStats();
  const pays = (await listPayments()).slice(0, 5);
  const mems = (await listMembers()).slice(0, 5);
  return (
    <>
      <div className="atop"><div><h1>대시보드</h1><div className="sub">오늘의 운영 현황 · 한국시간 기준</div></div></div>
      <div className="abody">
        <div className="kpis">
          <div className="kpi"><div className="k"><span className="dot" style={{ background: '#2f4a7a' }} />총 회원</div><div className="v">{s.members.toLocaleString('ko-KR')}<small> 명</small></div><div className="dl up">▲ 오늘 +{s.todaySignup}</div></div>
          <div className="kpi"><div className="k"><span className="dot" style={{ background: '#2f6b57' }} />유료 회원</div><div className="v">{s.subs.toLocaleString('ko-KR')}<small> 명</small></div><div className="dl mut">1회 이상 결제 · 전환율 {s.convRate}%</div></div>
          <div className="kpi"><div className="k"><span className="dot" style={{ background: 'var(--gold)' }} />결제 완료</div><div className="v">{s.paid.toLocaleString('ko-KR')}<small> 건</small></div><div className="dl mut">누적 · 그중 비회원 {s.guestPaid}건</div></div>
          <div className="kpi"><div className="k"><span className="dot" style={{ background: 'var(--red)' }} />이번 달 매출</div><div className="v">{won(s.mrr)}<small> 원</small></div><div className="dl mut">이번 달 1일부터 완료 결제 합계</div></div>
          <div className="kpi"><div className="k"><span className="dot" style={{ background: '#7a5cae' }} />오늘 발급 리포트</div><div className="v">{s.todayReports.toLocaleString('ko-KR')}<small> 건</small></div><div className="dl mut">{s.testReports ? `점검용 ${s.testReports}건 제외` : '오늘 0시부터'}</div></div>
          <div className="kpi"><div className="k"><span className="dot" style={{ background: '#b5852f' }} />오늘 결제</div><div className="v">{s.todayPay}<small> 건</small></div><div className="dl mut">{won(s.todayPayAmt)}원</div></div>
        </div>
        <div className="cols">
          <div className="acard">
            <div className="h"><div className="t">최근 결제 시도</div><a href="/admin/payments">전체 보기 →</a></div>
            <table><tbody>
              <tr><th>주문</th><th>회원</th><th>상품</th><th>금액</th><th>상태</th><th>일시</th></tr>
              {pays.map((p, i) => (
                <tr key={i}><td>#{p.id}</td><td className="who">{p.name}<em>{p.email}</em></td><td>{p.item}</td><td className="amt">{won(p.amount)}</td><td><span className={'pill ' + (p.status === '완료' ? 'done' : 'refund')}>{p.status}</span></td><td style={{ color: '#a39c8e' }}>{p.at}</td></tr>
              ))}
              {pays.length === 0 && <tr><td colSpan={6}><div className="empty">결제 내역이 없습니다.</div></td></tr>}
            </tbody></table>
          </div>
          <div className="acard">
            <div className="h"><div className="t">최근 가입</div><a href="/admin/members">전체 보기 →</a></div>
            <table><tbody>
              {mems.map((m, i) => (
                <tr key={i}><td><span className={'ci ' + m.provider}>{m.provider[0].toUpperCase()}</span></td><td className="who">{m.name}<em>{m.email}</em></td><td style={{ textAlign: 'right', color: '#a39c8e' }}>{m.joined}</td></tr>
              ))}
              {mems.length === 0 && <tr><td colSpan={3}><div className="empty">회원이 없습니다.</div></td></tr>}
            </tbody></table>
          </div>
        </div>
      </div>
    </>
  );
}

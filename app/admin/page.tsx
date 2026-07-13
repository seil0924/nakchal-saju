export const dynamic = 'force-dynamic';
import { getStats, listPayments, listMembers, won } from '@/lib/admin-data';

export default async function AdminDash() {
  const s = await getStats();
  const pays = (await listPayments()).slice(0, 5);
  const mems = (await listMembers()).slice(0, 5);
  return (
    <>
      <div className="atop"><div><h1>대시보드</h1><div className="sub">오늘의 운영 현황</div></div></div>
      <div className="abody">
        <div className="kpis">
          <div className="kpi"><div className="k"><span className="dot" style={{ background: '#2f4a7a' }} />총 회원</div><div className="v">{won(s.members)}</div><div className="dl up">▲ 오늘 +{s.todaySignup}</div></div>
          <div className="kpi"><div className="k"><span className="dot" style={{ background: 'var(--gold)' }} />유료 전환</div><div className="v">{won(s.paid)}<small> 명</small></div><div className="dl mut">전환율 {s.convRate}%</div></div>
          <div className="kpi"><div className="k"><span className="dot" style={{ background: 'var(--red)' }} />이번 달 매출</div><div className="v">₩{won(s.mrr)}</div><div className="dl mut">완료 결제 합계</div></div>
          <div className="kpi"><div className="k"><span className="dot" style={{ background: '#2f6b57' }} />유료 회원</div><div className="v">{won(s.subs)}<small> 명</small></div><div className="dl mut">1회 이상 결제</div></div>
          <div className="kpi"><div className="k"><span className="dot" style={{ background: '#7a5cae' }} />오늘 발급 리포트</div><div className="v">{won(s.todayReports)}<small> 건</small></div><div className="dl mut">오늘 생성 기준</div></div>
          <div className="kpi"><div className="k"><span className="dot" style={{ background: '#b5852f' }} />오늘 결제</div><div className="v">{s.todayPay}<small> 건</small></div><div className="dl mut">₩{won(s.todayPayAmt)}</div></div>
        </div>
        <div className="cols">
          <div className="acard">
            <div className="h"><div className="t">최근 결제</div><a href="/admin/payments">전체 보기 →</a></div>
            <table><tbody>
              <tr><th>주문</th><th>회원</th><th>상품</th><th>금액</th><th>수단</th><th>상태</th></tr>
              {pays.map((p, i) => (
                <tr key={i}><td>#{p.id}</td><td className="who">{p.name}<em>{p.email}</em></td><td>{p.item}</td><td className="amt">{won(p.amount)}</td><td>{p.pay}</td><td><span className={'pill ' + (p.status === '완료' ? 'done' : 'refund')}>{p.status}</span></td></tr>
              ))}
            </tbody></table>
          </div>
          <div className="acard">
            <div className="h"><div className="t">최근 가입</div><a href="/admin/members">전체 보기 →</a></div>
            <table><tbody>
              {mems.map((m, i) => (
                <tr key={i}><td><span className={'ci ' + m.provider}>{m.provider[0].toUpperCase()}</span></td><td className="who">{m.name}<em>{m.email}</em></td><td style={{ textAlign: 'right', color: '#a39c8e' }}>{m.joined}</td></tr>
              ))}
            </tbody></table>
          </div>
        </div>
      </div>
    </>
  );
}

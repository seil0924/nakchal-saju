import { listMembers, won } from '@/lib/admin-data';

export default async function AdminMembers() {
  const mems = await listMembers();
  return (
    <>
      <div className="atop"><div><h1>회원 관리</h1><div className="sub">전체 {won(mems.length)}명 표시</div></div></div>
      <div className="abody">
        <div className="filters">
          <div className="fx on">전체</div><div className="fx">구독중</div><div className="fx">무료</div><div className="fx">카카오·네이버·구글</div>
        </div>
        <div className="acard">
          <table><tbody>
            <tr><th>회원</th><th>수단</th><th>가입일</th><th>구독</th><th>결제총액</th><th>리포트</th></tr>
            {mems.map((m, i) => (
              <tr key={i}>
                <td className="who">{m.name}<em>{m.email}</em></td>
                <td><span className={'ci ' + m.provider}>{m.provider[0].toUpperCase()}</span></td>
                <td>{m.joined}</td>
                <td><span className={'pill ' + (m.sub === '무료' ? 'free' : 'sub')}>{m.sub}</span></td>
                <td className="amt">{won(m.paidTotal)}</td>
                <td>{m.reports}건</td>
              </tr>
            ))}
            {mems.length === 0 && <tr><td colSpan={6}><div className="empty">회원이 없습니다.</div></td></tr>}
          </tbody></table>
        </div>
      </div>
    </>
  );
}

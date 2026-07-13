export const dynamic = 'force-dynamic';
import { listReports } from '@/lib/admin-data';

export default async function AdminReports() {
  const reps = await listReports();
  return (
    <>
      <div className="atop"><div><h1>리포트 원문 조회</h1><div className="sub">CS·분쟁 확인용 · 발급 리포트 열람</div></div></div>
      <div className="abody">
        <div className="filters"><div className="fx on">전체</div><div className="fx">잠금해제(유료)</div><div className="fx">회원 검색</div></div>
        <div className="acard">
          <table><tbody>
            <tr><th>리포트</th><th>회원</th><th>회사</th><th>방향</th><th>상태</th><th>발급</th><th>원문</th></tr>
            {reps.map((r, i) => (
              <tr key={i}><td style={{ fontFamily: 'monospace', fontSize: 11, color: '#a39c8e' }}>{String(r.id).slice(0, 8)}</td><td className="who">{r.name}</td><td>{r.corp}</td><td>{r.dir}</td><td><span className={'pill ' + (r.unlocked ? 'unlock' : 'lock')}>{r.unlocked ? '유료' : '무료'}</span></td><td style={{ color: '#a39c8e' }}>{r.at}</td><td><a href={`/report/${r.id}`} style={{ color: 'var(--gold)', fontWeight: 700, textDecoration: 'none', fontSize: 11 }}>열람 →</a></td></tr>
            ))}
            {reps.length === 0 && <tr><td colSpan={7}><div className="empty">리포트가 없습니다.</div></td></tr>}
          </tbody></table>
        </div>
      </div>
    </>
  );
}

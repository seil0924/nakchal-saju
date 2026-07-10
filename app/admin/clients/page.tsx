import { CLIENTS } from '@/lib/clients';

export default function AdminClients() {
  return (
    <>
      <div className="atop"><div><h1>발주처 DB 관리</h1><div className="sub">설립일 = 궁합·정확도의 근거 데이터 · 총 {CLIENTS.length}곳</div></div></div>
      <div className="abody">
        <div className="filters"><div className="fx on">전체</div><div className="fx">＋ 발주처 추가</div></div>
        <div className="acard">
          <table><tbody>
            <tr><th>발주처</th><th>설립일</th><th>분야</th><th>노출</th><th>관리</th></tr>
            {CLIENTS.map((c: any, i: number) => (
              <tr key={i}><td className="who">{c.name}</td><td>{c.date ?? "-"}</td><td>{c.cat ?? "-"}</td><td><span className="pill unlock">노출</span></td><td><a style={{ color: 'var(--gold)', fontWeight: 700, textDecoration: 'none', fontSize: 11 }}>수정 →</a></td></tr>
            ))}
          </tbody></table>
        </div>
      </div>
    </>
  );
}

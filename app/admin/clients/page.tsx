import { CLIENTS } from '@/lib/clients';

// 발주처 목록은 코드(lib/clients.ts)에 있다 — 이 화면에서 추가·수정할 수 없다.
// 예전에는 눌러도 아무 일 없는 '＋ 발주처 추가'·'수정 →' 버튼과, 늘 '노출'인 칸이 있었다.
export default function AdminClients() {
  const noDate = CLIENTS.filter(c => !c.date).length;
  return (
    <>
      <div className="atop"><div><h1>발주처 DB</h1><div className="sub">설립일 = 궁합 계산의 근거 · 총 {CLIENTS.length}곳{noDate ? ` · 설립일 없음 ${noDate}곳` : ''} · 수정은 lib/clients.ts 에서</div></div></div>
      <div className="abody">
        <div className="acard">
          <table><tbody>
            <tr><th>발주처</th><th>설립일</th><th>분야</th></tr>
            {CLIENTS.map((c, i) => (
              <tr key={i}><td className="who">{c.name}</td><td>{c.date ?? '-'}</td><td>{c.cat ?? '-'}</td></tr>
            ))}
          </tbody></table>
        </div>
      </div>
    </>
  );
}

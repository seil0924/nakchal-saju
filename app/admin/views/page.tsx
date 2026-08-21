export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getViewStats } from '@/lib/admin-views';
import { getAllColumns } from '@/lib/column';

export default async function AdminViews() {
  const s = await getViewStats();
  // 슬러그만으로는 어떤 글인지 모르니 제목을 붙여준다.
  const titleOf = new Map(getAllColumns().map(c => [c.slug, c.title]));

  return (
    <>
      <div className="atop">
        <div>
          <h1>조회수</h1>
          <div className="sub">익명 집계 · 같은 기기에서 하루 1회만 셉니다</div>
        </div>
      </div>

      <div className="abody">
        {!s.ready && (
          <div className="acard">
            <div className="empty">
              집계 테이블이 아직 없습니다.<br />
              Supabase → SQL Editor 에서 <b>supabase/page_views.sql</b> 을 한 번 실행하면 이 화면이 채워집니다.
            </div>
          </div>
        )}

        {s.ready && (
          <>
            <div className="acard">
              <table><tbody>
                <tr><th>화면</th><th style={{ textAlign: 'right' }}>오늘</th><th style={{ textAlign: 'right' }}>최근 7일</th><th style={{ textAlign: 'right' }}>누적</th></tr>
                {s.kinds.map(k => (
                  <tr key={k.kind}>
                    <td><b>{k.label}</b></td>
                    <td style={{ textAlign: 'right' }}>{k.today.toLocaleString()}</td>
                    <td style={{ textAlign: 'right' }}>{k.d7.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{k.total.toLocaleString()}</td>
                  </tr>
                ))}
                {s.kinds.length === 0 && <tr><td colSpan={4}><div className="empty">아직 기록이 없습니다. 방문이 쌓이면 표시됩니다.</div></td></tr>}
              </tbody></table>
            </div>

            <div className="atop" style={{ marginTop: 22 }}><div><h1 style={{ fontSize: 17 }}>칼럼별 조회수</h1><div className="sub">상위 20편</div></div></div>
            <div className="acard">
              <table><tbody>
                <tr><th>칼럼</th><th style={{ textAlign: 'right' }}>조회</th></tr>
                {s.columns.map(c => (
                  <tr key={c.slug}>
                    <td>
                      <Link href={`/column/${c.slug}`} style={{ color: 'inherit' }}>{titleOf.get(c.slug) ?? c.slug}</Link>
                      <div style={{ fontSize: 11, color: '#a39c8e', fontFamily: 'monospace' }}>{c.slug}</div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{c.count.toLocaleString()}</td>
                  </tr>
                ))}
                {s.columns.length === 0 && <tr><td colSpan={2}><div className="empty">아직 칼럼 조회 기록이 없습니다.</div></td></tr>}
              </tbody></table>
            </div>

            <div className="atop" style={{ marginTop: 22 }}><div><h1 style={{ fontSize: 17 }}>닮은 CEO · 발주처</h1><div className="sub">상세 페이지별 조회</div></div></div>
            <div className="acard">
              <table><tbody>
                <tr><th>구분</th><th>대상</th><th style={{ textAlign: 'right' }}>조회</th></tr>
                {s.ceo.map(c => (
                  <tr key={'ceo-' + c.slug}><td>닮은 CEO</td><td>{decodeURIComponent(c.slug)}</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{c.count.toLocaleString()}</td></tr>
                ))}
                {s.balju.map(c => (
                  <tr key={'bal-' + c.slug}><td>발주처</td><td>{decodeURIComponent(c.slug)}</td><td style={{ textAlign: 'right', fontWeight: 700 }}>{c.count.toLocaleString()}</td></tr>
                ))}
                {s.ceo.length === 0 && s.balju.length === 0 && <tr><td colSpan={3}><div className="empty">아직 기록이 없습니다.</div></td></tr>}
              </tbody></table>
            </div>
          </>
        )}
      </div>
    </>
  );
}

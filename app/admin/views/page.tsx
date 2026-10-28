export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getViewStats } from '@/lib/admin-views';
import { getAllColumns } from '@/lib/column';
import { pageOf, srcName, srcLine } from './page-name';

const MAIN_SRC = ['naver', 'google', 'direct'];
const R: React.CSSProperties = { textAlign: 'right' };

export default async function AdminViews() {
  const s = await getViewStats();
  // 슬러그만으로는 어떤 글인지 모르니 제목을 붙여준다.
  const titleOf = new Map(getAllColumns().map(c => [c.slug, c.title]));

  return (
    <>
      <div className="atop">
        <div>
          <h1>조회수</h1>
          <div className="sub">익명 집계 · 같은 기기에서 하루 1회만 셉니다 · 관리자 화면을 연 기기는 세지 않습니다</div>
        </div>
      </div>

      {/* 이 경고를 지우지 말 것. 지우면 옛 숫자를 다시 진짜로 착각하게 된다. */}
      <div className="abody">
        <details className="acard" style={{ background: '#faf6ec', borderColor: '#e2cd97' }}>
          <summary style={{ padding: '11px 15px', fontSize: 13, fontWeight: 700, color: '#4a4636', cursor: 'pointer' }}>옛 숫자 주의: 2026-10-23 이전에는 운영자 방문, 2026-08-27 이전에는 검색엔진 크롤러가 섞여 있습니다</summary>
          <div style={{ padding: '0 15px 13px', fontSize: 12.5, lineHeight: 1.75, color: '#4a4636' }}>
            <b>2026-10-23 이전 ‘무료 입력 화면’ 숫자에는 리포트 결과 화면이 섞여 있습니다.</b> 그날부터 둘을 따로 셉니다.
            같은 날부터 관리자 화면을 연 기기(운영자·점검)는 세지 않습니다. 그 전 숫자에는 운영자 점검 방문이 들어 있습니다.<br />
            <b>2026-08-27 이전 수치에는 검색엔진 크롤러가 섞여 있습니다.</b><br />
            칼럼 133회·닮은 CEO 116회가 찍혔는데 사이트맵의 그 계열 URL 수가 각각 124개·101개였습니다 —
            사람이 아니라 크롤러가 사이트맵을 한 번 훑은 자국입니다. 서치콘솔 클릭 수와도 맞지 않았습니다.
            그날부터 봇을 걸러 저장하지 않습니다. <b>추세는 그 이후 숫자로만 보세요.</b>
          </div>
        </details>
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
            <div className="atop" style={{ marginTop: 8 }}><div><h1 style={{ fontSize: 17 }}>최근 7일, 날짜별로 어디서 왔나</h1><div className="sub">한 기기가 한 화면을 하루 1회 · 한국시간</div></div></div>
            <div className="acard">
              <table><tbody>
                <tr><th>날짜</th><th style={R}>합계</th>{MAIN_SRC.map(x => <th key={x} style={R}>{srcName(x)}</th>)}<th style={R}>그 밖</th></tr>
                {s.days.map((d, i) => {
                  const rest = d.total - MAIN_SRC.reduce((a, x) => a + (d.bySrc[x] ?? 0), 0);
                  return (
                    <tr key={d.ymd}>
                      <td><b>{d.ymd.slice(5).replace('-', '.')}</b>{i === 0 && <span style={{ color: '#a39c8e' }}> 오늘</span>}</td>
                      <td style={{ ...R, fontWeight: 700 }}>{d.total}</td>
                      {MAIN_SRC.map(x => <td key={x} style={R}>{d.bySrc[x] ?? 0}</td>)}
                      <td style={R} title={srcLine(Object.fromEntries(Object.entries(d.bySrc).filter(([k]) => !MAIN_SRC.includes(k))))}>{rest}</td>
                    </tr>
                  );
                })}
              </tbody></table>
            </div>

            <div className="atop" style={{ marginTop: 22 }}><div><h1 style={{ fontSize: 17 }}>방금 들어온 방문</h1><div className="sub">최근 50건 · 언제, 어느 화면을, 어디서 · 누가 봤는지는 남기지 않습니다</div></div></div>
            <div className="acard">
              <table><tbody>
                <tr><th>시각</th><th>화면</th><th>어디서</th></tr>
                {s.recent.map((r, i) => {
                  const p = pageOf(r.kind, r.slug);
                  return (
                    <tr key={i}>
                      <td style={{ color: '#a39c8e', whiteSpace: 'nowrap' }}>{r.at}</td>
                      <td>{p.href ? <Link href={p.href} target="_blank" style={{ color: 'inherit' }}>{p.name}</Link> : p.name}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{srcName(r.src)}</td>
                    </tr>
                  );
                })}
                {s.recent.length === 0 && <tr><td colSpan={3}><div className="empty">아직 기록이 없습니다.</div></td></tr>}
              </tbody></table>
            </div>

            <div className="atop" style={{ marginTop: 22 }}><div><h1 style={{ fontSize: 17 }}>최근 7일 많이 본 화면</h1><div className="sub">상위 20 · 어디서 왔는지 같이</div></div></div>
            <div className="acard">
              <table><tbody>
                <tr><th>화면</th><th style={R}>조회</th><th>어디서</th></tr>
                {s.pages7.map((p, i) => {
                  const n = pageOf(p.kind, p.slug);
                  return (
                    <tr key={i}>
                      <td>{n.href ? <Link href={n.href} target="_blank" style={{ color: 'inherit' }}>{n.name}</Link> : n.name}</td>
                      <td style={{ ...R, fontWeight: 700 }}>{p.count}</td>
                      <td style={{ fontSize: 12.5, color: '#57523f' }}>{srcLine(p.bySrc)}</td>
                    </tr>
                  );
                })}
                {s.pages7.length === 0 && <tr><td colSpan={3}><div className="empty">최근 7일 기록이 없습니다.</div></td></tr>}
              </tbody></table>
            </div>

            <div className="atop" style={{ marginTop: 22 }}><div><h1 style={{ fontSize: 17 }}>화면 종류별</h1><div className="sub">오늘 · 최근 7일 · 누적</div></div></div>
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


            <div className="atop" style={{ marginTop: 22 }}><div><h1 style={{ fontSize: 17 }}>유입원</h1><div className="sub">어디서 들어왔는가 · 방문 첫 화면 기준</div></div></div>
            <div className="acard">
              {!s.srcReady ? (
                <div className="empty">
                  유입원 계측이 아직 켜지지 않았습니다.<br />
                  Supabase → SQL Editor 에서 <b>supabase/page_views_src.sql</b> 을 한 번 실행하면 이 표가 채워집니다.
                </div>
              ) : (
                <table><tbody>
                  <tr><th>유입원</th><th style={{ textAlign: 'right' }}>오늘</th><th style={{ textAlign: 'right' }}>최근 7일</th><th style={{ textAlign: 'right' }}>누적</th></tr>
                  {s.srcs.map(v => (
                    <tr key={v.src}>
                      <td><b>{v.label}</b></td>
                      <td style={{ textAlign: 'right' }}>{v.today.toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>{v.d7.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{v.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  {s.srcs.length === 0 && <tr><td colSpan={4}><div className="empty">아직 기록이 없습니다.</div></td></tr>}
                </tbody></table>
              )}
            </div>
            <div className="atop" style={{ marginTop: 22 }}><div><h1 style={{ fontSize: 17 }}>상품 상세페이지별 조회수</h1><div className="sub">여기서 무료 입력으로 넘어간다</div></div></div>
            <div className="acard">
              <table><tbody>
                <tr><th>상품</th><th style={{ textAlign: 'right' }}>조회</th></tr>
                {s.products.map(p => (
                  <tr key={p.slug}>
                    <td><Link href={`/product/${p.slug}`} style={{ color: 'inherit' }}>{p.slug}</Link></td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{p.count.toLocaleString()}</td>
                  </tr>
                ))}
                {s.products.length === 0 && <tr><td colSpan={2}><div className="empty">아직 상세페이지 조회 기록이 없습니다.</div></td></tr>}
              </tbody></table>
            </div>

            <div className="atop" style={{ marginTop: 22 }}><div><h1 style={{ fontSize: 17 }}>도구·안내 화면별 조회수</h1><div className="sub">회사·자리·요금·보관함 등</div></div></div>
            <div className="acard">
              <table><tbody>
                <tr><th>화면</th><th style={{ textAlign: 'right' }}>조회</th></tr>
                {s.tools.map(t => (
                  <tr key={t.slug}><td><Link href={`/${t.slug}`} style={{ color: 'inherit' }}>/{t.slug}</Link></td><td style={{ textAlign: 'right', fontWeight: 700 }}>{t.count.toLocaleString()}</td></tr>
                ))}
                {s.tools.length === 0 && <tr><td colSpan={2}><div className="empty">아직 기록이 없습니다.</div></td></tr>}
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
                      <div style={{ fontSize: 12, color: '#a39c8e', fontFamily: 'monospace' }}>{c.slug}</div>
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

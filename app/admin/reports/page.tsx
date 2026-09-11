export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { listReports, deleteReports, deleteReportsByName } from '@/lib/admin-data';
import { authEnabled, isAdmin } from '@/lib/supabase/server';
import { cleanName, isReportId } from '@/lib/report-cleanup';
import ConfirmSubmit from './ConfirmSubmit';

// 서버 액션은 레이아웃의 관리자 확인을 거치지 않는다 — 액션 주소만 알면 누구나 POST 할 수 있다.
// 지우는 버튼이라 여기서 한 번 더 막는다.
async function guard() { return authEnabled() && (await isAdmin()); }

async function removeOne(formData: FormData) {
  'use server';
  if (!(await guard())) return;
  const id = String(formData.get('id') || '');
  if (!isReportId(id)) return;
  await deleteReports([id]);
  revalidatePath('/admin/reports');
}

async function removeByName(formData: FormData) {
  'use server';
  if (!(await guard())) return;
  const name = cleanName(formData.get('name'));
  if (!name) return;
  await deleteReportsByName(name);
  revalidatePath('/admin/reports');
}

const QUICK = ['점검용', '오세일'];

export default async function AdminReports({ searchParams }: { searchParams?: { q?: string } }) {
  const q = cleanName(searchParams?.q);
  const reps = await listReports(q || undefined);
  const canDel = reps.filter(r => r.deletable).length;
  const keep = reps.length - canDel;
  const paidUnknown = reps.some(r => !r.paidKnown);

  return (
    <>
      <div className="atop"><div><h1>리포트 원문 조회</h1><div className="sub">CS·분쟁 확인용 · 발급 리포트 열람 · 점검용 정리</div></div></div>
      <div className="abody">
        <form method="get" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <input name="q" defaultValue={q} maxLength={12} placeholder="성함으로 찾기 (예: 점검용)" aria-label="성함으로 찾기"
            style={{ padding: '9px 12px', fontSize: 14, border: '1px solid #ddd3bd', borderRadius: 8, minWidth: 220, fontFamily: 'inherit' }} />
          <button type="submit" style={{ padding: '9px 14px', fontSize: 13.5, fontWeight: 700, borderRadius: 8, border: '1px solid #26231c', background: '#26231c', color: '#fff', cursor: 'pointer', minHeight: 38 }}>찾기</button>
          {QUICK.map(n => <Link key={n} href={`/admin/reports?q=${encodeURIComponent(n)}`} style={{ padding: '8px 12px', fontSize: 13, fontWeight: 700, borderRadius: 999, border: '1px solid #ddd3bd', background: q === n ? '#faf6ec' : '#fff', color: '#57523f', textDecoration: 'none' }}>{n}</Link>)}
          {q && <Link href="/admin/reports" style={{ fontSize: 13, color: '#8a806a' }}>전체로</Link>}
        </form>

        {q && (
          <div className="acard" style={{ padding: 16, marginBottom: 12, lineHeight: 1.7 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#26231c' }}>‘{q}’ 성함 리포트 {reps.length}건{reps.length >= 500 ? ' (최대 500건 표시)' : ''}</div>
            <div style={{ fontSize: 13.5, color: '#57523f', marginTop: 4 }}>
              지울 수 있음 <b style={{ color: '#c0392b' }}>{canDel}</b>건 · 결제가 붙었거나 유료로 열려 남김 <b>{keep}</b>건
            </div>
            <div style={{ fontSize: 12.5, color: '#8a806a', marginTop: 4 }}>
              리포트를 지우면 거기 딸린 결제 기록도 같이 지워지는 구조라, 결제·유료 리포트는 서버가 지우지 않습니다.
              {paidUnknown && ' 지금은 결제 조회가 실패해 아무것도 지울 수 없습니다.'}
            </div>
            <form action={removeByName} style={{ marginTop: 12 }}>
              <input type="hidden" name="name" value={q} />
              <ConfirmSubmit
                label={canDel > 0 ? `‘${q}’ 리포트 ${canDel}건 삭제` : '지울 리포트가 없습니다'}
                message={`‘${q}’ 성함 리포트 ${canDel}건을 지웁니다. 되돌릴 수 없습니다.\n결제가 붙었거나 유료로 열린 ${keep}건은 남깁니다.`}
                disabled={canDel === 0}
              />
            </form>
          </div>
        )}

        <div className="acard">
          <table><tbody>
            <tr><th>리포트</th><th>회원</th><th>회사</th><th>방향</th><th>상태</th><th>발급</th><th>원문</th><th>삭제</th></tr>
            {reps.map((r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#a39c8e' }}>{String(r.id).slice(0, 8)}</td>
                <td className="who">{r.name}</td><td>{r.corp}</td><td>{r.dir}</td>
                <td><span className={'pill ' + (r.unlocked ? 'unlock' : 'lock')}>{r.unlocked ? '유료' : '무료'}</span></td>
                <td style={{ color: '#a39c8e' }}>{r.at}</td>
                <td><a href={`/report/${r.id}`} style={{ color: 'var(--gold)', fontWeight: 700, textDecoration: 'none', fontSize: 12 }}>열람 →</a></td>
                <td>
                  {r.deletable ? (
                    <form action={removeOne}>
                      <input type="hidden" name="id" value={r.id} />
                      <ConfirmSubmit small label="삭제" message={`${r.name} · ${r.at} 리포트를 지웁니다. 되돌릴 수 없습니다.`} />
                    </form>
                  ) : (
                    <span style={{ fontSize: 12, color: '#8a806a' }}>{!r.paidKnown ? '확인 불가' : r.paid ? '결제 있음' : '유료 열람'}</span>
                  )}
                </td>
              </tr>
            ))}
            {reps.length === 0 && <tr><td colSpan={8}><div className="empty">{q ? `‘${q}’ 성함 리포트가 없습니다.` : '리포트가 없습니다.'}</div></td></tr>}
          </tbody></table>
        </div>
      </div>
    </>
  );
}

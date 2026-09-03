// /admin/reviews — 후기 승인.
// 접수는 전부 숨김으로 들어온다. 여기서 올려야 /review 에 보인다.
// 광고로 보이는 글은 표시만 해 두고 판단은 사람이 한다 — 자동 반려는 멀쩡한 후기를 먹는다.
export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import { listAllReviews, setApproved } from '@/lib/reviews-db';
import { looksPromotional, stars } from '@/lib/reviews';

async function approve(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  const to = String(formData.get('to')) === '1';
  if (Number.isInteger(id)) { await setApproved(id, to); revalidatePath('/admin/reviews'); revalidatePath('/review'); }
}

export default async function AdminReviews() {
  const { ready, rows } = await listAllReviews();
  const pending = rows.filter(r => !r.approved);
  const live = rows.filter(r => r.approved);

  return (
    <>
      <div className="atop">
        <div>
          <h1>후기</h1>
          <div className="sub">접수는 숨김으로 들어옵니다 · 올려야 /review 에 보입니다</div>
        </div>
      </div>

      <div className="abody">
        {!ready && (
          <div className="acard"><div className="empty">
            후기 표가 아직 없습니다.<br />
            Supabase → SQL Editor 에서 <b>supabase/reviews.sql</b> 을 한 번 실행하면 이 화면이 채워집니다.
          </div></div>
        )}

        {ready && (
          <>
            <div className="atop" style={{ marginTop: 4 }}><div><h1 style={{ fontSize: 17 }}>승인 대기 {pending.length}건</h1></div></div>
            <div className="acard">
              {pending.length === 0 && <div className="empty">대기 중인 후기가 없습니다.</div>}
              {pending.map(r => (
                <div key={r.id} style={{ borderTop: '1px solid #efe7d6', padding: '12px 0' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <b>{r.nickname}</b>
                    {r.biz && <span style={{ fontSize: 11.5, color: '#7c7768' }}>{r.biz}</span>}
                    <span style={{ color: '#b58a2f', fontSize: 13 }}>{stars(r.rating)}</span>
                    <span style={{ fontSize: 11.5, color: '#8d8672' }}>{(r.created_at || '').slice(0, 16).replace('T', ' ')}</span>
                    {looksPromotional(r.body) && (
                      <span style={{ fontSize: 11.5, fontWeight: 800, color: '#8f2f1c', background: '#fbf0ee', border: '1px solid #e6c4bc', borderRadius: 999, padding: '2px 8px' }}>
                        광고 의심 — 링크·연락처
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.75, color: '#3a3630', margin: '6px 0 9px', whiteSpace: 'pre-wrap' }}>{r.body}</p>
                  <form action={approve}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="to" value="1" />
                    <button type="submit" style={{ padding: '7px 14px', borderRadius: 9, border: 0, background: 'var(--navy)', color: '#fff', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>올리기</button>
                  </form>
                </div>
              ))}
            </div>

            <div className="atop" style={{ marginTop: 22 }}><div><h1 style={{ fontSize: 17 }}>게시 중 {live.length}건</h1></div></div>
            <div className="acard">
              {live.length === 0 && <div className="empty">게시된 후기가 없습니다.</div>}
              {live.map(r => (
                <div key={r.id} style={{ borderTop: '1px solid #efe7d6', padding: '12px 0' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <b>{r.nickname}</b>
                    {r.biz && <span style={{ fontSize: 11.5, color: '#7c7768' }}>{r.biz}</span>}
                    <span style={{ color: '#b58a2f', fontSize: 13 }}>{stars(r.rating)}</span>
                    <span style={{ fontSize: 11.5, color: '#8d8672' }}>{(r.created_at || '').slice(0, 16).replace('T', ' ')}</span>
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.75, color: '#3a3630', margin: '6px 0 9px', whiteSpace: 'pre-wrap' }}>{r.body}</p>
                  <form action={approve}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="to" value="0" />
                    <button type="submit" style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid #ddd3bd', background: '#fff', color: '#57523f', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>내리기</button>
                  </form>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

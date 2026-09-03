// /admin/reviews — 후기 승인.
// 접수는 전부 숨김으로 들어온다. 여기서 올려야 /review 에 보인다.
// 광고로 보이는 글은 표시만 해 두고 판단은 사람이 한다 — 자동 반려는 멀쩡한 후기를 먹는다.
export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import { listAllReviews, setApproved, insertAdminReview, deleteReview, SOURCES } from '@/lib/reviews-db';
import { looksPromotional, stars, validateReview, BIZ, NICK_MAX, BODY_MAX } from '@/lib/reviews';

const touch = () => { revalidatePath('/admin/reviews'); revalidatePath('/review'); revalidatePath('/'); };

async function approve(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  const to = String(formData.get('to')) === '1';
  if (Number.isInteger(id)) { await setApproved(id, to); touch(); }
}

async function remove(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  if (Number.isInteger(id)) { await deleteReview(id); touch(); }
}

// 전화·카톡으로 받은 후기를 옮겨 적는 자리. 공개 폼과 같은 검증을 태운다.
async function addReview(formData: FormData) {
  'use server';
  const v = validateReview({
    nickname: formData.get('nickname'), biz: formData.get('biz'),
    rating: formData.get('rating'), body: formData.get('body'),
  });
  if (!v.ok || !v.value) return;
  await insertAdminReview(v.value, String(formData.get('source') || '기타'), String(formData.get('received') || ''));
  touch();
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: 14, fontFamily: 'inherit',
  border: '1px solid #ddd3bd', borderRadius: 9, background: '#fff', color: '#26231c',
};
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#57523f', display: 'block', marginBottom: 5 };

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
            {/* 직접 입력 — 전화·카톡으로 받은 후기를 옮겨 적는 자리 */}
            <div className="acard" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, margin: '0 0 4px' }}>후기 직접 입력</h2>
              <p style={{ fontSize: 12.5, color: '#7c7768', lineHeight: 1.7, margin: '0 0 14px' }}>
                전화·카톡으로 받은 후기를 옮겨 적는 자리입니다. 입력하면 <b>바로 게시</b>됩니다.
              </p>
              <form action={addReview} style={{ display: 'grid', gap: 11 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
                  <div><label style={lbl} htmlFor="a-nick">표시할 이름</label>
                    <input style={inp} id="a-nick" name="nickname" required maxLength={NICK_MAX} placeholder="대전 K대표" /></div>
                  <div><label style={lbl} htmlFor="a-biz">업종</label>
                    <select style={inp} id="a-biz" name="biz" defaultValue="">
                      <option value="">고르지 않음</option>
                      {BIZ.map(b => <option key={b} value={b}>{b}</option>)}
                    </select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 11 }}>
                  <div><label style={lbl} htmlFor="a-rating">별점</label>
                    <select style={inp} id="a-rating" name="rating" defaultValue="5">
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}점</option>)}
                    </select></div>
                  <div><label style={lbl} htmlFor="a-src">받은 경로</label>
                    <select style={inp} id="a-src" name="source" defaultValue="전화">
                      {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select></div>
                  <div><label style={lbl} htmlFor="a-rcv">받은 날짜</label>
                    <input style={inp} id="a-rcv" name="received" type="date" /></div>
                </div>
                <div><label style={lbl} htmlFor="a-body">후기 내용</label>
                  <textarea style={{ ...inp, minHeight: 96, lineHeight: 1.7, resize: 'vertical' }}
                    id="a-body" name="body" required maxLength={BODY_MAX}
                    placeholder="받은 말씀을 그대로 옮겨 적어 주십시오." /></div>
                <button type="submit" style={{ justifySelf: 'start', padding: '10px 20px', borderRadius: 10, border: 0, background: 'var(--navy)', color: '#fff', fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>
                  등록하고 바로 게시
                </button>
              </form>
              <p style={{ fontSize: 11.5, color: '#a09884', lineHeight: 1.65, margin: '12px 0 0' }}>
                받은 경로와 날짜는 관리자 화면에만 남고 손님에게는 안 보입니다.
              </p>
            </div>

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
                    {r.source && <span style={{ fontSize: 11, color: '#7c7768', background: '#faf6ec', border: '1px solid #e6dcc4', borderRadius: 999, padding: '2px 8px' }}>{r.source}로 받음</span>}
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.75, color: '#3a3630', margin: '6px 0 9px', whiteSpace: 'pre-wrap' }}>{r.body}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <form action={approve}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="to" value="0" />
                      <button type="submit" style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid #ddd3bd', background: '#fff', color: '#57523f', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>내리기</button>
                    </form>
                    <form action={remove}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" style={{ padding: '7px 14px', borderRadius: 9, border: '1px solid #e6c4bc', background: '#fff', color: '#8f2f1c', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>삭제</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

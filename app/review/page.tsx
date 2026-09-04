// app/review — 이용 후기.
//
// **없는 후기를 지어내지 않는다.** 2026-08-21 결정이 그대로 걸린다. 시드 데이터가 없고,
// 0건이면 0건이라고 말한다. 평균 별점도 0건일 땐 아예 안 띄운다 — "0.0점"은 없다는 뜻이
// 아니라 나쁘다는 뜻으로 읽힌다.
//
// **승인제.** 공개 폼에는 반드시 광고가 들어온다. 접수는 숨김으로 들어가고
// 관리자가 /admin/reviews 에서 올린다.
//
// **연락처를 안 받는다.** 닉네임과 업종뿐이다. 후기를 받자고 이메일·전화를 모으면
// 그때부터 보관·파기 의무가 생긴다. 지금 규모에서 치를 값이 아니다.
import type { Metadata } from 'next';
import Link from 'next/link';
import { ogCard, ogCardUrl } from '@/lib/og';
import { bizFooterLine } from '@/lib/bizinfo';
import { BIZ, NICK_MAX, BODY_MIN, BODY_MAX, stars, averageRating } from '@/lib/reviews';
import { listPublicReviews } from '@/lib/reviews-db';
import './review.css';

export const dynamic = 'force-dynamic';

const BASE = 'https://nakchalsaju.com';
const T = '이용 후기 — 써 본 대표들의 말';
const D = '낙찰사주를 실제로 써 본 대표님들이 남긴 후기입니다. 지어낸 후기는 싣지 않습니다. 직접 남기실 수도 있습니다.';

export const metadata: Metadata = {
  title: T, description: D,
  alternates: { canonical: '/review' },
  keywords: ['낙찰사주 후기', '낙찰사주 리뷰', '회사 사주 후기', '입찰 사주 후기'],
  openGraph: {
    title: T, description: D, url: `${BASE}/review`, type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
    images: ogCard({ seal: '評', k: '利用 後記', t: '써 본 대표들의 말', s: '지어낸 후기는 싣지 않습니다' }),
  },
  twitter: {
    card: 'summary_large_image', title: T, description: D,
    images: [ogCardUrl({ seal: '評', k: '利用 後記', t: '써 본 대표들의 말', s: '지어낸 후기는 싣지 않습니다' })],
  },
};

const fmt = (iso: string) => (iso || '').slice(0, 10).replace(/-/g, '.');

export default async function ReviewPage({ searchParams }: { searchParams: { sent?: string; err?: string } }) {
  const { ready, rows, why } = await listPublicReviews();
  const avg = averageRating(rows);
  const sent = searchParams?.sent === '1';
  const err = (searchParams?.err || '').slice(0, 120);

  return (
    <div className="app">
      <div className="hero">
        <div className="k">利 用 後 記</div>
        <h1>써 본 대표들의 말</h1>
        <p>지어낸 후기는 싣지 않습니다</p>
      </div>

      <div className="wrap">
        {sent && (
          <div className="card"><div className="rvmsg ok">
            후기 감사합니다. <b>확인 후 게시</b>됩니다 — 광고·욕설을 거르느라 바로 올라가지 않습니다.
          </div></div>
        )}
        {err && <div className="card"><div className="rvmsg no">{err}</div></div>}

        <div className="card">
          <div className="st">
            <span className="b" />
            후기 {rows.length}건
            {avg !== null && <span style={{ fontWeight: 500, color: '#8d8672', fontSize: 12 }}>· 평균 {avg}점</span>}
          </div>

          {!ready && (
            <div className="rvempty">
              <div className="big">후기 게시판이 아직 켜지지 않았습니다</div>
              <div className="sm">Supabase → SQL Editor 에서 <b>supabase/reviews.sql</b> 을 한 번 실행하면 이 화면이 살아납니다.
                {why && <><br /><span style={{ fontSize: 11.5, color: '#8f2f1c' }}>({why})</span></>}
              </div>
            </div>
          )}

          {ready && rows.length === 0 && (
            <>
              <div className="rvempty">
                <div className="big">아직 올라온 후기가 없습니다</div>
                <div className="sm">
                  지어낸 후기로 채우지 않기로 했습니다. 그래서 지금은 비어 있습니다.<br />
                  써 보셨다면 아래에 한 줄 남겨 주십시오 — <b>첫 번째 후기</b>가 됩니다.
                </div>
              </div>

              {/* 후기가 아니라 '무엇을 쓰면 되는지'다. 후기 카드와 안 닮게 그린다 —
                  점선·회색·별점 없음·이름 없음. 손님 말인 척하는 순간 가짜 후기가 된다. */}
              <div className="rvguide">
                <div className="gh">이렇게 써 주시면 됩니다 <span>· 예시 문항</span></div>
                <ol>
                  <li><b>어떤 상황이었는지</b> — 어떤 입찰·수주를 앞두고 보셨습니까</li>
                  <li><b>무엇을 보셨는지</b> — 회사 사주, 투찰 택일, 발주처 궁합 중 어느 것</li>
                  <li><b>실제로 어땠는지</b> — 도움이 된 점, 아쉬웠던 점 그대로</li>
                </ol>
                <p className="gn">
                  좋게 써 달라는 뜻이 아닙니다. <b>아쉬웠던 점이 있으면 그대로 적어 주십시오</b> —
                  그쪽이 고칠 거리가 되고, 읽는 분께도 더 믿음이 갑니다.
                </p>
              </div>
            </>
          )}

          {ready && rows.map(r => (
            <div className="rvitem" key={r.id}>
              <div className="rvhd">
                <span className="who">{r.nickname}</span>
                {r.biz && <span className="biz">{r.biz}</span>}
                <span className="st" aria-label={`5점 만점에 ${r.rating}점`}>{stars(r.rating)}</span>
                <span className="dt">{fmt(r.created_at)}</span>
              </div>
              <p className="rvbody">{r.body}</p>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="st"><span className="b" />후기 남기기</div>
          <form className="rvform" method="post" action="/api/review">
            {/* 허니팟 — 사람에게는 안 보이고 봇만 채운다 */}
            <div className="rvhp" aria-hidden="true">
              <label htmlFor="company">회사명</label>
              <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label htmlFor="nickname">표시할 이름</label>
              <input id="nickname" name="nickname" type="text" required maxLength={NICK_MAX} placeholder="대전 K대표" />
            </div>

            <div>
              <label htmlFor="biz">업종 <span style={{ fontWeight: 500, color: '#8d8672' }}>(선택)</span></label>
              <select id="biz" name="biz" defaultValue="">
                <option value="">고르지 않음</option>
                {BIZ.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label>별점</label>
              <div className="rvstars">
                {[1, 2, 3, 4, 5].map(n => (
                  <label key={n}>
                    <input type="radio" name="rating" value={n} required defaultChecked={n === 5} />
                    <span>{n}점</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="body">후기</label>
              <textarea id="body" name="body" required minLength={BODY_MIN} maxLength={BODY_MAX}
                placeholder="어떤 상황에서 보셨고, 실제로 도움이 됐는지 적어 주시면 다음 대표님께 도움이 됩니다." />
            </div>

            <button className="rvgo" type="submit">후기 남기기 →</button>
          </form>
          <p className="note">
            <b>연락처는 받지 않습니다.</b> 표시 이름과 업종만 남고, 이메일·전화·회사명 칸이 없습니다.<br />
            광고·욕설·개인정보가 담긴 글은 게시하지 않습니다. 게시 후에도 요청하시면 내려 드립니다.
          </p>
        </div>

        <div className="card">
          <div className="st"><span className="b" />먼저 써 보시겠다면</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[['/hoesa', '회사 사주 — 설립일만'], ['/reading', '오늘, 넣을 날인가'], ['/ceo', '나와 닮은 CEO']].map(([h, t]) => (
              <Link key={h} href={h} style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', background: '#f3ede0', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' }}>{t}</Link>
            ))}
          </div>
        </div>
      </div>

      <div className="foot">
        <div className="crule" />
        <div aria-hidden="true" className="colo">士</div>
        명리 기반 참고 정보입니다 · 경영 판단의 근거로 사용할 수 없습니다<br />
        <Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link> · <Link href="/pricing">이용안내·요금</Link>
        <div className="bizinfo">{bizFooterLine()}</div>
      </div>
    </div>
  );
}

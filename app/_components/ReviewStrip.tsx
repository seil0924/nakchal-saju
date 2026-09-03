// 홈 후기 띠 — 카드가 옆으로 넘어간다.
//
// **후기가 없으면 통째로 안 그린다.** 빈 캐러셀은 "아직 아무도 안 썼다"를 크게 광고하는 것과
// 같다. 1건이라도 승인되면 그때부터 나타난다.
//
// 스크롤은 CSS 만으로 한다(scroll-snap). 홈에 자바스크립트를 더 얹을 이유가 없다.
import Link from 'next/link';
import { listPublicReviews } from '@/lib/reviews-db';
import { stars, averageRating } from '@/lib/reviews';
import './review-strip.css';

export default async function ReviewStrip() {
  const { rows } = await listPublicReviews(12);
  if (!rows.length) return null;

  const avg = averageRating(rows);

  return (
    <div className="rstrip" data-reveal>
      <div className="rshd">
        <span className="rsk">利用 後記</span>
        <b>써 본 대표들의 말</b>
        {avg !== null && <span className="rsavg">{stars(Math.round(avg))} {avg}</span>}
        <Link href="/review" className="rsall">전체 보기 →</Link>
      </div>

      <div className="rsrow">
        {rows.map(r => (
          <article className="rscard" key={r.id}>
            <div className="rsst">{stars(r.rating)}</div>
            <p className="rstx">{r.body}</p>
            <div className="rswho">
              <b>{r.nickname}</b>
              {r.biz && <em>{r.biz}</em>}
            </div>
          </article>
        ))}
        <Link className="rscard rsmore" href="/review">
          <span>후기<br />남기기 →</span>
        </Link>
      </div>
    </div>
  );
}

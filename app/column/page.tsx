import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllColumns } from '@/lib/column';

export const metadata: Metadata = {
  title: '사주 칼럼 — 입찰·경매·수주 대표를 위한 명리 이야기',
  description: '오늘의 낙찰 사정률부터 투찰 택일·발주처 궁합까지. 입찰·경매·조달 수주 대표를 위한 사주명리 칼럼을 연재합니다.',
  alternates: { canonical: '/column' },
  openGraph: {
    title: '낙찰사주 칼럼 — 會社 사주 이야기',
    description: '입찰·경매·수주 대표를 위한 사주명리 칼럼',
    type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
  },
};

function fmtDate(d: string): string {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${y}. ${m}. ${day}`;
}

export default function ColumnIndex() {
  const posts = getAllColumns();
  return (
    <div className="app home5 colpage">
      <div className="mast">
        <Link href="/" className="mb" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="s">士</span>
          <div className="n">낙찰사주<em>會社 사주 전문</em></div>
        </Link>
        <Link href="/reading" style={{ fontSize: 12, color: '#7f786c', textDecoration: 'none', fontWeight: 600 }}>무료로 보기 ›</Link>
      </div>

      <div className="colhead">
        <div className="kick">士 · 사주 칼럼</div>
        <h1>입찰·수주 대표를 위한<br />명리 이야기</h1>
        <div className="sub">재주는 갖추셨습니다. 그 운칠(運七)을 짚는 이야기를 연재합니다.</div>
      </div>

      {posts.length === 0 ? (
        <div className="colempty">아직 발행된 칼럼이 없습니다. 곧 첫 글로 찾아뵙겠습니다.</div>
      ) : (
        <ul className="collist">
          {posts.map(p => (
            <li key={p.slug} className="colcard">
              <Link href={`/column/${p.slug}`}>
                <div className="colmeta">{fmtDate(p.date)} · {p.readingMin}분</div>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                {p.tags.length > 0 && (
                  <div className="coltags">{p.tags.slice(0, 4).map(t => <span key={t}>#{t}</span>)}</div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="foot">
        <div className="crule" />
        <div className="colo">士</div>
        명리 기반 참고 정보입니다 · 투찰금액 산정 근거가 아닙니다<br />
        <Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link> · <Link href="/refund">청약철회·환불</Link>
      </div>
    </div>
  );
}

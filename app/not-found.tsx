import Link from 'next/link';
import type { Metadata } from 'next';

// 없는 주소. 예전엔 미들웨어가 이런 주소를 전부 /login 으로 튕겨서 이 화면이 한 번도 안 떴다.
// Next 기본 404 는 영어("This page could not be found")라 여기서 한국어로 받는다.
export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
  robots: { index: false, follow: true },
};

const WAYS: [string, string][] = [
  ['/reading', '무료로 사주 보기'],
  ['/hoesa', '회사 사주'],
  ['/column', '사주 칼럼'],
  ['/glossary', '입찰 용어사전'],
  ['/balju', '발주처 궁합'],
];

export default function NotFound() {
  return (
    <div className="app">
      <div className="hero"><h1>찾으시는 페이지가 없습니다</h1>
        <p>주소가 바뀌었거나 정리된 글일 수 있습니다.</p></div>
      <div className="wrap">
        <div className="card" style={{ lineHeight: 1.8, fontSize: 14, color: '#3a3f47' }}>
          <p style={{ margin: 0 }}>자주 찾으시는 곳으로 안내해 드립니다.</p>
          <Link className="cta" href="/reading" style={{ marginTop: 14 }}>무료로 사주 보기 →</Link>
          <nav aria-label="다른 곳으로" style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
            <Link href="/">홈</Link>
            {WAYS.slice(1).map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
        </div>
      </div>
    </div>
  );
}

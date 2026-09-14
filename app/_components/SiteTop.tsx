import Link from 'next/link';

// 모든 콘텐츠 페이지의 머리 한 줄 — 로고 + 메뉴. 홈(.h6-top)과 같은 모양이다.
// 예전엔 페이지마다 .topbar(짙은 막대)·.mast·머리 없음이 섞였고, 로고 자리 글자도 '발주처'·'자리'·'보관함'으로 제각각이었다.
// 페이지 이름은 아래 제목(h1)이 말한다. 입력·결제 흐름(/reading)은 뒤로 가기 막대(.u-top)를 쓴다.
export default function SiteTop() {
  return (
    <header className="site-top">
      <Link href="/" className="st-brand" aria-label="낙찰사주 홈">
        <svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true">
          <rect x="2" y="2" width="36" height="36" rx="9" fill="#3f6be0" />
          <rect x="10" y="19" width="3.8" height="12" rx="1.9" fill="#fff" /><rect x="16" y="14" width="3.8" height="17" rx="1.9" fill="#fff" />
          <rect x="22" y="17" width="3.8" height="14" rx="1.9" fill="#fff" /><rect x="28" y="11" width="3.8" height="20" rx="1.9" fill="#fff" />
        </svg>
        <span>낙찰사주</span>
      </Link>
      <Link href="/more" className="st-menu" aria-label="메뉴 · 더보기">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </Link>
    </header>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import './home6.css';
import { GUIDES, REGIONS, INDUSTRIES } from '@/lib/seo-landings';
import { CONCEPTS } from '@/lib/seo-concepts';
import TodayChip from '@/app/_components/TodayChip';
import LangNudge from '@/app/_components/LangNudge';
import TrustStrip from '@/app/_components/TrustStrip';
import ReviewStrip from '@/app/_components/ReviewStrip';
import { bizFooterLine } from '@/lib/bizinfo';
import { CLIENTS } from '@/lib/clients';
import { TYCOONS } from '@/lib/tycoon';
import { GLOSSARY } from '@/lib/glossary';
import { getAllColumns } from '@/lib/column';

// 홈만 스스로를 정본으로 선언한다. 레이아웃에 두면 모든 페이지가 이걸 물려받아 홈을 가리킨다.
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    // 영어판이 어디 있는지 알려 준다. 자동 리다이렉트 대신 이걸로 구글이 알아서 고른다.
    languages: { 'ko-KR': '/', 'en': '/en/bazi', 'zh-Hant': '/zh/bazi', 'x-default': '/en/bazi' },
  },
};

// 홈 — home6 (2026-09-14). 모바일 사주 사이트 15곳을 비교해 다시 짰다.
// 규칙: 첫 화면엔 한 줄 + 버튼 하나 + 상품 3×3. 배경은 흰색·연회색·파랑 셋. 글씨는 13·15·17·22 네 단계.
// 장식 한자는 쓰지 않는다 — 명식 간지·건제십이신처럼 뜻이 있는 한자만 남긴다.
// 후기가 붙으면 홈도 갱신돼야 한다. 관리자 등록 때 revalidatePath('/') 로 즉시 반영되고, 10분 주기도 함께 건다.
export const revalidate = 600;

// 상품 아홉 칸. 아이콘은 한 스타일(24px 선, 굵기 1.8)로만 그린다.
const TILES: { href: string; label: string; d: string }[] = [
  { href: '/hoesa', label: '회사 사주', d: 'M4 20V6l7-2v16M11 9h9v11M7 8h1M7 12h1M7 16h1M14 13h3M14 16h3M3 20h18' },
  { href: '/reading?cat=daepyo', label: '대표 사주', d: 'M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c1.2-3.5 3.9-5.3 7-5.3s5.8 1.8 7 5.3' },
  { href: '/reading?cat=sajeong', label: '투찰 택일', d: 'M5 6h14v14H5zM8.5 4v4M15.5 4v4M5 10h14M9.5 15l2 2 3.5-3.5' },
  { href: '/balju', label: '발주처 궁합', d: 'M3 10l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18' },
  { href: '/reading?cat=gunghap', label: '동업·협정 궁합', d: 'M9 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM15 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z' },
  { href: '/reading?cat=daeun', label: '회사 대운', d: 'M4 18l5-5 4 3 7-8M15 8h5v5' },
  { href: '/reading?cat=calendar', label: '사업운 캘린더', d: 'M5 6h14v14H5zM8.5 4v4M15.5 4v4M5 10h14M8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 16.5h.01M12 16.5h.01' },
  { href: '/jari', label: '사무실 자리', d: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z' },
  { href: '/ceo', label: '닮은 CEO', d: 'M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 19c.9-2.9 3.2-4.4 6-4.4M17 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19 18l2 2' },
];

const MORE: { href: string; label: string; sub: string }[] = [
  { href: '/why', label: '하한가·연패·큰 건 고민', sub: '실력이 아니라 흐름의 문제일 수 있습니다' },
  { href: '/samples', label: '샘플 리포트', sub: '결제하면 무엇이 열리는지 미리 봅니다' },
  { href: '/faq', label: '자주 묻는 질문', sub: '사정률·환불·계산 방법' },
  { href: '/bokchae', label: '복채', sub: '받은 풀이에 스스로 놓고 가는 마음' },
];

export default function Home() {
  // 하드코딩하지 않는다 — 실제 데이터에서 세야 콘텐츠가 늘 때 같이 오른다.
  const scale = [
    { n: getAllColumns().length, u: '편', t: '사주 칼럼' },
    { n: CLIENTS.length, u: '곳', t: '발주처' },
    { n: TYCOONS.length, u: '인', t: '거장 명식' },
    { n: GLOSSARY.length, u: '개', t: '용어' },
  ];
  return (
    <div className="app home6">
      <LangNudge />

      <header className="h6-top">
        <Link href="/" className="h6-brand" aria-label="낙찰사주 홈">
          <svg viewBox="0 0 40 40" width="30" height="30" aria-hidden="true">
            <rect x="2" y="2" width="36" height="36" rx="9" fill="#3f6be0" />
            <rect x="10" y="19" width="3.8" height="12" rx="1.9" fill="#fff" /><rect x="16" y="14" width="3.8" height="17" rx="1.9" fill="#fff" />
            <rect x="22" y="17" width="3.8" height="14" rx="1.9" fill="#fff" /><rect x="28" y="11" width="3.8" height="20" rx="1.9" fill="#fff" />
          </svg>
          <span>낙찰사주</span>
        </Link>
        <Link href="/more" className="h6-menu" aria-label="메뉴 · 더보기">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </Link>
      </header>

      <section className="h6-intro">
        <p className="h6-eye">공공입찰·수주 대표를 위한 사주</p>
        <h1>대표와 회사의 사주,<br />생년월일 하나로 봅니다</h1>
        <p className="h6-lead">명식과 오늘의 방향은 가입 없이 무료로 먼저 나옵니다.</p>
        <Link className="h6-cta" href="/reading">무료로 시작하기</Link>
      </section>

      <section className="h6-sec" aria-labelledby="h6-pick">
        <h2 id="h6-pick" className="h6-h">무엇을 볼까요</h2>
        <ul className="h6-grid">
          {TILES.map(t => (
            <li key={t.href}>
              <Link href={t.href} className="h6-tile">
                <span className="h6-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={t.d} /></svg></span>
                <span className="h6-tl">{t.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="h6-sec h6-gray" aria-labelledby="h6-today">
        <h2 id="h6-today" className="h6-h">오늘, 넣을 날인가</h2>
        <TodayChip />
      </section>

      <ReviewStrip />

      <section className="h6-sec" aria-labelledby="h6-scale">
        <h2 id="h6-scale" className="h6-h">지금까지 쌓은 것</h2>
        <dl className="h6-scale">
          {scale.map(s => (
            <div key={s.t}><dt>{s.t}</dt><dd>{s.n}<small>{s.u}</small></dd></div>
          ))}
        </dl>
        <p className="h6-note">절기는 태양황경으로 계산하고 진태양시·야자시를 보정합니다. 고정 만세력표를 쓰지 않습니다.</p>
      </section>

      <section className="h6-sec h6-gray"><TrustStrip /></section>

      <section className="h6-sec" aria-labelledby="h6-more">
        <h2 id="h6-more" className="h6-h">더 알아보기</h2>
        <ul className="h6-rows">
          {MORE.map(m => (
            <li key={m.href}><Link href={m.href}><b>{m.label}</b><span>{m.sub}</span></Link></li>
          ))}
        </ul>
      </section>

      <nav className="h6-sec h6-links" aria-label="입찰 사주 가이드">
        <h2 className="h6-h">입찰 사주 가이드</h2>
        <div className="h6-chips">
          {GUIDES.map(g => <Link key={g.slug} href={`/guide/${g.slug}`}>{g.keywords[0]}</Link>)}
          {REGIONS.map(r => <Link key={r.slug} href={`/region/${r.slug}`}>{r.name} 입찰</Link>)}
          {INDUSTRIES.map(x => <Link key={x.slug} href={`/industry/${x.slug}`}>{x.name}</Link>)}
          <Link href="/glossary">용어사전</Link>
          <Link href="/method">계산 방법</Link>
        </div>
      </nav>

      {/* 사주 개념 18장(/saju/*). 네이버 검색 유입의 대부분이 '식신생재'·'재다신약' 같은 개념어라 홈에서 길을 둔다. */}
      <nav className="h6-sec h6-links" aria-label="사주 개념">
        <h2 className="h6-h">사주 개념</h2>
        <div className="h6-chips">
          {CONCEPTS.map(c => <Link key={c.slug} href={`/saju/${c.slug}`}>{c.label}</Link>)}
        </div>
      </nav>

      <footer className="h6-foot">
        <p>명리 기반 참고 정보입니다. 투찰금액 산정 근거가 아닙니다.</p>
        <p className="h6-flinks"><Link href="/terms">이용약관</Link><Link href="/privacy">개인정보처리방침</Link><Link href="/refund">청약철회·환불</Link><Link href="/pricing">이용안내·요금</Link></p>
        <p className="h6-biz">{bizFooterLine()}</p>
      </footer>
    </div>
  );
}

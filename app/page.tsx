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
import { GAN, ZHI, EL_HEX, GAN_ELc, ZHI_ELc } from '@/lib/preview';

// 홈만 스스로를 정본으로 선언한다. 레이아웃에 두면 모든 페이지가 이걸 물려받아 홈을 가리킨다.
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    // 영어판이 어디 있는지 알려 준다. 자동 리다이렉트 대신 이걸로 구글이 알아서 고른다.
    languages: { 'ko-KR': '/', 'en': '/en/bazi', 'zh-Hant': '/zh/bazi', 'x-default': '/en/bazi' },
  },
};

// 홈 — home6 (2026-09-14). 모바일 사주 사이트 15곳을 비교해 다시 짰다.
// 규칙: 첫 화면엔 한 줄 + 결과 예시 카드 + 버튼 하나, 그 아래 권하는 두 상품 → 나머지 목록(가격 없이 전부 '무료').
// 배경은 흰색·연회색·파랑 셋. 글씨는 13·15·17·22 네 단계. 표식은 오행 다섯 색 한 줄.
// 장식 한자는 쓰지 않는다 — 명식 간지·건제십이신처럼 뜻이 있는 한자만 남긴다.
// 후기가 붙으면 홈도 갱신돼야 한다. 관리자 등록 때 revalidatePath('/') 로 즉시 반영되고, 10분 주기도 함께 건다.
export const revalidate = 600;

// 아이콘은 한 스타일(24px 선, 굵기 1.8)로만 그린다.
const IC = {
  company: 'M4 20V6l7-2v16M11 9h9v11M7 8h1M7 12h1M7 16h1M14 13h3M14 16h3M3 20h18',
  person: 'M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5 20c1.2-3.5 3.9-5.3 7-5.3s5.8 1.8 7 5.3',
  pick: 'M5 6h14v14H5zM8.5 4v4M15.5 4v4M5 10h14M9.5 15l2 2 3.5-3.5',
  client: 'M3 10l9-5 9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18',
  pair: 'M9 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM15 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
  trend: 'M4 18l5-5 4 3 7-8M15 8h5v5',
  cal: 'M5 6h14v14H5zM8.5 4v4M15.5 4v4M5 10h14M8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 16.5h.01M12 16.5h.01',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  ceo: 'M10 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM4 19c.9-2.9 3.2-4.4 6-4.4M17 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM19 18l2 2',
};

// 처음 온 대표에게 권하는 두 가지. 아홉 칸이 같은 무게로 늘어서 있으면 무엇부터 누를지 모른다.
// 홈에는 가격을 적지 않는다(2026-09-15 대표 지시) — 금액이 줄줄이 보이면 아무도 안 들어온다.
// 모든 상품이 명식·방향·첫 장은 무료로 나오고, 결제는 결과 화면에서 잠긴 장을 열 때만 한다.
const FEATURED: { href: string; title: string; hook: string; d: string }[] = [
  { href: '/reading?cat=sajeong', title: '오늘의 투찰 택일', hook: '오늘 넣을 날인지, 이번 달 길일은 언제인지', d: IC.pick },
  { href: '/reading?cat=daepyo', title: '대표 사주', hook: '어떤 그릇의 대표인지 — 승부 기질·재물·사람', d: IC.person },
];
const OTHERS: { href: string; label: string; sub: string; d: string }[] = [
  { href: '/hoesa', label: '회사 사주', sub: '설립일만 넣고 30초', d: IC.company },
  { href: '/balju', label: '발주처 사주', sub: '그 발주처와 맞는 판인가', d: IC.client },
  { href: '/reading?cat=gunghap', label: '협정·궁합 사주', sub: '손잡기 전에 깨질 궁합인지', d: IC.pair },
  { href: '/reading?cat=daeun', label: '회사 대운', sub: '회사가 대표님을 밀어주는가', d: IC.trend },
  { href: '/reading?cat=calendar', label: '사업운 캘린더', sub: '앞으로 한 달, 움직일 날과 조심할 날', d: IC.cal },
  { href: '/jari', label: '사무실 자리', sub: '옮기기 전에 방위부터', d: IC.compass },
  { href: '/ceo', label: '닮은 CEO', sub: '거장 100인 중 명식이 닮은 사람', d: IC.ceo },
];

// 첫 화면 예시 카드 — 실제 결과 화면과 같은 모양의 '예시'. 명식 간지와 오행 색은 실제 계산값(1971-07-16생)이다.
const SAMPLE = [
  { pos: '년주', g: 7, z: 11 }, { pos: '월주', g: 1, z: 7 }, { pos: '일주', g: 8, z: 2 },
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
        <h1>오늘 넣어도 되는 날인지,<br />대표님 명식으로 먼저 봅니다</h1>
        <p className="h6-lead">생년월일만 넣으면 명식과 오늘의 투찰 신호가 무료로 나옵니다.</p>

        <figure className="h6-sample" aria-label="결과 화면 예시">
          <figcaption><span className="h6-tag">예시</span>1971년 7월 16일생 대표</figcaption>
          <div className="h6-smain">
            <div className="h6-pils" aria-label="명식 辛亥 乙未 壬寅">
              {SAMPLE.map(p => (
                <div key={p.pos} className={'h6-pil' + (p.pos === '일주' ? ' day' : '')}>
                  <span className="h6-pp">{p.pos}</span>
                  <b style={{ background: EL_HEX[GAN_ELc[p.g]] }}>{GAN[p.g]}</b>
                  <b style={{ background: EL_HEX[ZHI_ELc[p.z]] }}>{ZHI[p.z]}</b>
                </div>
              ))}
            </div>
            <div className="h6-sig">
              <span className="h6-sl">투찰 택일 신호</span>
              <span className="h6-sn">65<small>점</small></span>
              <span className="h6-sv">넣을 만한 흐름</span>
            </div>
          </div>
          <p className="h6-snote">분석형 대표 · 이번 달 투찰 길일 · 시진별 흐름까지</p>
        </figure>

        <Link className="h6-cta" href="/reading?cat=sajeong">내 생년월일로 무료로 보기</Link>
        <p className="h6-assure">가입 없이 30초 · 결제는 결과를 본 뒤에 고릅니다</p>
      </section>

      <section className="h6-sec" aria-labelledby="h6-first">
        <h2 id="h6-first" className="h6-h">처음이라면 이 둘부터</h2>
        <ul className="h6-feat">
          {FEATURED.map(f => (
            <li key={f.href}>
              <Link href={f.href} className="h6-fcard">
                <span className="h6-ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={f.d} /></svg></span>
                <span className="h6-ftx">
                  <b>{f.title}</b>
                  <span>{f.hook}</span>
                  <em>무료로 보기</em>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="h6-sec" aria-labelledby="h6-pick">
        <h2 id="h6-pick" className="h6-h">다른 풀이</h2>
        <ul className="h6-list">
          {OTHERS.map(o => (
            <li key={o.href}>
              <Link href={o.href} className="h6-row">
                <span className="h6-ic sm"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={o.d} /></svg></span>
                <span className="h6-rtx"><b>{o.label}</b><span>{o.sub}</span></span>
                <span className="h6-pr free">무료</span>
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

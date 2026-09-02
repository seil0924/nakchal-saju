import type { Metadata } from 'next';
import Link from 'next/link';
import { GUIDES, REGIONS, INDUSTRIES } from '@/lib/seo-landings';
import { CONCEPTS } from '@/lib/seo-concepts';
import TodayChip from '@/app/_components/TodayChip';
import LangNudge from '@/app/_components/LangNudge';
import CountUp from '@/app/_components/CountUp';
import HeroCarousel from '@/app/_components/HeroCarousel';
import ScrollReveal from '@/app/_components/ScrollReveal';
import TrustStrip from '@/app/_components/TrustStrip';
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

// 홈 — home5 정본: 정관장×무복의 현대적 해석 (먹빛·금박·인주·괘선·인장)
export default function Home() {
  // 하드코딩하지 않는다 — 실제 데이터에서 세야 콘텐츠가 늘 때 같이 오른다.
  // 최근 발행 3편 — "이 사이트 지금도 글이 올라오는구나"가 활발함의 가장 정직한 증거다.
  const recent = getAllColumns().slice(0, 3);
  const ago = (d: string) => {
    const t = new Date(d.replace(' ', 'T'));
    if (isNaN(t.getTime())) return '';
    const days = Math.floor((Date.now() - t.getTime()) / 86400000);
    if (days <= 0) return '오늘 발행';
    if (days === 1) return '어제 발행';
    if (days < 7) return days + '일 전 발행';
    if (days < 30) return Math.floor(days / 7) + '주 전 발행';
    return Math.floor(days / 30) + '개월 전 발행';
  };
  const scale = [
    { n: getAllColumns().length, u: '편', t: '사주 칼럼' },
    { n: CLIENTS.length, u: '곳', t: '발주처 수록' },
    { n: TYCOONS.length, u: '인', t: '거장 명식' },
    { n: GLOSSARY.length, u: '항목', t: '명리 용어' },
  ];
  return (
    <div className="app home5">
      <LangNudge />
      <ScrollReveal />
      {/* 마스트헤드 */}
      <div className="mast">
        <Link href="/" className="mb" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="brandseal" aria-label="낙찰사주">
            <svg viewBox="0 0 40 40" width="38" height="38">
              <defs>
                <linearGradient id="inju" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#5c85ea" /><stop offset="1" stopColor="#3f6be0" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="36" height="36" rx="9" fill="url(#inju)" />
              <rect x="2" y="2" width="36" height="36" rx="9" fill="none" stroke="#2f56c4" strokeWidth="1" />
              <rect x="5" y="5" width="30" height="30" rx="6.5" fill="none" stroke="#c6b07d" strokeWidth="0.8" opacity="0.3" />
              <g><rect x="10" y="19" width="3.8" height="12" rx="1.9" fill="#f2ede0"/><rect x="16" y="14" width="3.8" height="17" rx="1.9" fill="#f2ede0"/><rect x="22" y="17" width="3.8" height="14" rx="1.9" fill="#f2ede0"/><rect x="28" y="11" width="3.8" height="20" rx="1.9" fill="#f2ede0"/><circle cx="29.9" cy="8.2" r="2.6" fill="#b3382c"/></g>
            </svg>
          </span>
          <div className="n">낙찰사주<em>落札四柱 · 會社 사주 전문</em></div>
        </Link>
        <Link href="/more" className="ham" aria-label="메뉴 · 더보기"><i /><i /><i /></Link>
      </div>

      <p className="hometag">공공입찰·경매·수주 대표를 위한 <b>회사 사주</b> — 오늘의 사정률·발주처 궁합·투찰 택일을 30초, <b>무료</b>로.</p>

      {/* 수록 규모 — 실제 보유량. 처음 온 사람에게 "여기 진짜 팠구나"를 전한다.
          숫자를 지어내지 않고 데이터에서 직접 세므로 콘텐츠가 늘면 같이 오른다. */}
      {/* 히어로 — 자동 넘김 롤링 배너 (4장) */}
      <HeroCarousel />

      <div className="scale" data-reveal>
        <div className="sc-row">
          {scale.map(s => (
            <div className="sc-i" key={s.t}>
              <span className="sc-n"><CountUp n={s.n} /><em>{s.u}</em></span>
              <span className="sc-t">{s.t}</span>
            </div>
          ))}
        </div>
        <div className="sc-note">절기는 태양황경으로 계산하고 진태양시·야자시를 보정합니다 — 고정 만세력표를 쓰지 않습니다.</div>
      </div>

      {/* 닮은 CEO — 바이럴 입구 */}
      <Link data-reveal className="ceoband" href="/ceo">
        <span aria-hidden="true" className="cbseal">鏡</span>
        <span className="cbtx"><b>나와 닮은 세계적 CEO는?</b><em>잡스·록펠러·샤넬 … 거장 100인 × 내 사주 · 30초</em></span>
        <span className="cbgo">무료 →</span>
      </Link>

      {/* 오늘, 넣을 날인가 — 투찰 택일 */}
      <div className="lab"><i /><span>오늘, 넣을 날인가</span></div>
      <TodayChip />
      <div className="today">
        <div className="in">
          <div aria-hidden="true" className="stamp">封</div>
          <div>
            <h3>오늘 이 투찰,<br />나에게 유리한 날인가</h3>
            <p>좋은 날만 말씀드리지 않습니다 — <b style={{ color: '#9a2a20' }}>피해야 할 날</b>도 짚어드립니다.</p>
          </div>
        </div>
        <Link className="tcta" href="/reading"><b>오늘의 전망 열기<span className="a">→</span></b><em>무료로 시작 · 생년월일만 30초</em></Link>
      </div>

      {/* 해설 보기 — 카테고리별 개별 사주 (사주아이식) */}
      <div className="lab"><i /><span>사주별로 골라 보기</span></div>
      <div className="list">
        {/* 회사 사주 — 사장만 검색하는 자리라 여기를 상품 목록의 첫 칸으로 올렸다.
            개인 사주 앱은 법인 개념이 없어 못 하고, 입찰정보 서비스는 사주가 없다. */}
        <Link data-reveal className="li5" href="/hoesa">
          <div aria-hidden="true" className="gz" style={{ color: '#2f56c4' }}>會</div>
          <div className="bd5"><div className="t">회사 사주 <small>會社 四柱</small></div><div className="d">설립일만 넣으면 — 지금 우리 회사가 확장할 때인가, 다질 때인가</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link data-reveal className="li5" href="/reading?cat=daepyo">
          <div aria-hidden="true" className="gz" style={{ color: '#46a07d' }}>代</div>
          <div className="bd5"><div className="t">대표 사주 <small>代表 四柱</small></div><div className="d">대표님이 어떤 그릇인가 — 성정·승부 기질·재물·사람까지</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link data-reveal className="li5" href="/reading?cat=sajeong">
          <div aria-hidden="true" className="gz" style={{ color: '#3f8f80' }}>率</div>
          <div className="bd5"><div className="t">투찰 택일 사주 <small>投札 擇日</small></div><div className="d">오늘 넣을까, 미룰까 — 30초면 방향이 나옵니다</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link data-reveal className="li5" href="/balju">
          <div aria-hidden="true" className="gz" style={{ color: '#46a07d' }}>宮</div>
          <div className="bd5"><div className="t">발주처 사주 <small>發注處 宮合</small></div><div className="d">그 발주처, 나와 맞는 판인가 — 손대기 전에</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link data-reveal className="li5" href="/jari">
            <div aria-hidden="true" className="gz" style={{ color: '#cfa64e' }}>宅</div>
            <div className="bd5"><div className="t">자리 사주 <small>事務室 移轉 方位</small></div><div className="d">사무실을 옮기기 전에, 어느 쪽인지부터</div></div>
            <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
          </Link>
          <Link data-reveal className="li5" href="/reading?cat=gunghap">
          <div aria-hidden="true" className="gz" style={{ color: '#d15c4a' }}>合</div>
          <div className="bd5"><div className="t">협정·궁합 사주 <small>同業 · 協定</small></div><div className="d">손잡기 전에, 깨질 궁합인지부터</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link data-reveal className="li5" href="/reading?cat=daeun">
          <div aria-hidden="true" className="gz" style={{ color: '#cfa64e' }}>運</div>
          <div className="bd5"><div className="t">회사 대운 <small>會社 大運</small></div><div className="d">회사가 대표님을 밀어주는가 — 년도별 큰 흐름</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link data-reveal className="li5" href="/reading?cat=calendar">
          <div aria-hidden="true" className="gz" style={{ color: '#d15c4a' }}>曆</div>
          <div className="bd5"><div className="t">사업운 캘린더 <small>事業運 曆</small></div><div className="d">이달·연간 — 계약·채용·발표에 좋은 날, 조심할 날</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
      </div>

      {/* 통점 위로 랜딩 */}
      <Link data-reveal className="ceoband" href="/why" style={{ marginTop: 26 }}>
        <span aria-hidden="true" className="cbseal" style={{ borderColor: '#c98b4a', color: '#e3c27a' }}>運</span>
        <span className="cbtx"><b>하한가·연패·큰 건… 대표님 잘못이 아닙니다</b><em>그 고민, 실력이 아니라 흐름의 문제일 수 있습니다</em></span>
        <span className="cbgo">→</span>
      </Link>

      {/* 복채(福債) — 콜로폰 위, 조용한 감사 한 줄 */}
      <Link data-reveal className="bokline" href="/bokchae">
        <span aria-hidden="true" className="blseal">福</span>
        <span className="bltx"><b>복채 청산</b><em>받은 풀이에, 스스로 놓고 가는 마음 — 정해진 값은 없습니다</em></span>
        <span className="blgo">›</span>
      </Link>

      <div data-reveal style={{ margin: '0 0 4px' }}><TrustStrip /></div>

      <nav aria-label="입찰 사주 가이드" style={{ padding: '6px 22px 4px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.02em', color: '#6b6249', margin: '10px 0 8px' }}>입찰 사주 가이드 · 지역별</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {GUIDES.map(g => (<Link key={g.slug} href={`/guide/${g.slug}`} style={{ fontSize: 11.5, fontWeight: 600, color: '#7c7768', background: '#faf6ec', border: '1px solid #e6dcc4', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>{g.keywords[0]}</Link>))}
          {REGIONS.map(r => (<Link key={r.slug} href={`/region/${r.slug}`} style={{ fontSize: 11.5, fontWeight: 600, color: '#7c7768', background: '#faf6ec', border: '1px solid #e6dcc4', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>{r.name} 입찰</Link>))}
          {INDUSTRIES.map(x => (<Link key={x.slug} href={`/industry/${x.slug}`} style={{ fontSize: 11.5, fontWeight: 600, color: '#7c7768', background: '#faf6ec', border: '1px solid #e6dcc4', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>{x.name}</Link>))}
          <Link href="/faq" style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--navy)', background: '#f3ede0', border: '1px solid #e2cd97', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>자주 묻는 질문</Link>
          <Link href="/why" style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--navy)', background: '#f3ede0', border: '1px solid #e2cd97', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>대표 고민별</Link>
          <Link href="/samples" style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--navy)', background: '#f3ede0', border: '1px solid #e2cd97', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>샘플 리포트</Link>
          <Link href="/glossary" style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--navy)', background: '#f3ede0', border: '1px solid #e2cd97', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>용어사전</Link>
          <Link href="/method" style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--navy)', background: '#f3ede0', border: '1px solid #e2cd97', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>계산 방법</Link>
        </div>
      </nav>

      {/* 사주 개념 18장(/saju/*). 사이트맵에는 있는데 안에서 걸린 링크가 /glossary 하나뿐이라
          크롤러가 고아로 봤다. 네이버 검색 유입의 72%가 '식신생재'·'재다신약' 두 낱말인데
          정작 그 이름의 페이지로 가는 길이 홈에 없었다. */}
      <nav aria-label="사주 개념" style={{ padding: '2px 22px 8px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.02em', color: '#6b6249', margin: '10px 0 8px' }}>사주 개념 · 내 사주로 확인</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CONCEPTS.map(c => (<Link key={c.slug} href={`/saju/${c.slug}`} style={{ fontSize: 11.5, fontWeight: 600, color: '#7c7768', background: '#faf6ec', border: '1px solid #e6dcc4', borderRadius: 999, padding: '5px 10px', textDecoration: 'none' }}>{c.label}</Link>))}
        </div>
      </nav>

      {/* 콜로폰 */}
      <div className="foot">
        <div className="crule" />
        <div aria-hidden="true" className="colo">士</div>
        명리 기반 참고 정보입니다 · 투찰금액 산정 근거가 아닙니다<br />
        <Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link> · <Link href="/refund">청약철회·환불</Link> · <Link href="/pricing">이용안내·요금</Link>
        <div className="bizinfo">{bizFooterLine()}</div>
      </div>

      {/* 하단 내비 */}
      <div className="nav5">
        <a className="on"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21H3z" /></svg>홈</a>
        <Link href="/balju"><svg viewBox="0 0 24 24"><path d="M3 21V7l9-4 9 4v14M3 21h18M9 21v-5h6v5" /></svg>발주처</Link>
        <Link className="c" href="/reading"><span className="btn">士</span><span className="cl">오늘 전망</span></Link>
        <Link href="/vault"><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM4 7l2-3h12l2 3" /></svg>보관함</Link>
        <Link href="/more"><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>더보기</Link>
      </div>
    </div>
  );
}

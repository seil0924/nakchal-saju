import Link from 'next/link';
import TodayChip from '@/app/_components/TodayChip';
import HeroCarousel from '@/app/_components/HeroCarousel';
import ScrollReveal from '@/app/_components/ScrollReveal';
import TrustStrip from '@/app/_components/TrustStrip';
import { bizFooterLine } from '@/lib/bizinfo';

// 홈 — home5 정본: 정관장×무복의 현대적 해석 (먹빛·금박·인주·괘선·인장)
export default function Home() {
  return (
    <div className="app home5">
      <ScrollReveal />
      {/* 마스트헤드 */}
      <div className="mast">
        <Link href="/" className="mb" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="brandseal" aria-label="낙찰사주">
            <svg viewBox="0 0 40 40" width="38" height="38">
              <defs>
                <linearGradient id="inju" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#b23a2b" /><stop offset="1" stopColor="#7d1d12" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="36" height="36" rx="9" fill="url(#inju)" />
              <rect x="2" y="2" width="36" height="36" rx="9" fill="none" stroke="#5c140b" strokeWidth="1" />
              <rect x="5" y="5" width="30" height="30" rx="6.5" fill="none" stroke="#e6c680" strokeWidth="1" opacity="0.9" />
              <text x="20" y="21.5" textAnchor="middle" dominantBaseline="central" fontFamily="'Noto Serif KR',serif" fontWeight="900" fontSize="21" fill="#f7ecd4">士</text>
            </svg>
          </span>
          <div className="n">낙찰사주<em>落札四柱 · 會社 사주 전문</em></div>
        </Link>
        <Link href="/more" className="ham" aria-label="메뉴 · 더보기"><i /><i /><i /></Link>
      </div>

      <p className="hometag">공공입찰·경매·수주 대표를 위한 <b>회사 사주</b> — 오늘의 사정률·발주처 궁합·투찰 택일을 30초, <b>무료</b>로.</p>

      {/* 히어로 — 자동 넘김 롤링 배너 (4장) */}
      <HeroCarousel />

      {/* 닮은 CEO — 바이럴 입구 */}
      <Link data-reveal className="ceoband" href="/ceo">
        <span aria-hidden="true" className="cbseal">鏡</span>
        <span className="cbtx"><b>나와 닮은 세계적 CEO는?</b><em>잡스·록펠러·샤넬 … 거장 100인 × 내 사주 · 30초</em></span>
        <span className="cbgo">무료 →</span>
      </Link>

      {/* 오늘의 사정률 전망 */}
      <div className="lab"><i /><span>오늘의 사정률 전망</span></div>
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
        <Link data-reveal className="li5" href="/reading?cat=daepyo">
          <div aria-hidden="true" className="gz" style={{ color: '#46a07d' }}>代</div>
          <div className="bd5"><div className="t">대표 사주 <small>代表 四柱</small></div><div className="d">대표님이 어떤 그릇인가 — 성정·승부 기질·재물·사람까지</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link data-reveal className="li5" href="/reading?cat=sajeong">
          <div aria-hidden="true" className="gz" style={{ color: '#3f8f80' }}>率</div>
          <div className="bd5"><div className="t">사정률 사주 <small>査定率</small></div><div className="d">오늘 넣을까, 미룰까 — 30초면 방향이 나옵니다</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link data-reveal className="li5" href="/balju">
          <div aria-hidden="true" className="gz" style={{ color: '#46a07d' }}>宮</div>
          <div className="bd5"><div className="t">발주처 사주 <small>發注處 宮合</small></div><div className="d">그 발주처, 나와 맞는 판인가 — 손대기 전에</div></div>
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

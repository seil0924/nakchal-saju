import Link from 'next/link';
import TodayChip from '@/app/_components/TodayChip';
import HeroCarousel from '@/app/_components/HeroCarousel';

// 홈 — home5 정본: 정관장×무복의 현대적 해석 (먹빛·금박·인주·괘선·인장)
export default function Home() {
  return (
    <div className="app home5">
      {/* 마스트헤드 */}
      <div className="mast">
        <div className="mb">
          <div className="s">士</div>
          <div className="n">낙찰사주<em>會社 사주 전문</em></div>
        </div>
        <div className="ham"><i /><i /><i /></div>
      </div>

      {/* 히어로 — 자동 넘김 롤링 배너 (4장) */}
      <HeroCarousel />

      {/* 닮은 CEO — 바이럴 입구 */}
      <Link className="ceoband" href="/ceo">
        <span className="cbseal">鏡</span>
        <span className="cbtx"><b>나와 닮은 세계적 CEO는?</b><em>잡스·록펠러·샤넬 … 거장 100인 × 내 사주 · 30초</em></span>
        <span className="cbgo">무료 →</span>
      </Link>

      {/* 오늘의 사정률 전망 */}
      <div className="lab"><i /><span>오늘의 사정률 전망</span><TodayChip /></div>
      <div className="today">
        <div className="in">
          <div className="stamp">封</div>
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
        <Link className="li5" href="/reading?cat=daepyo">
          <div className="gz" style={{ color: '#46a07d' }}>代</div>
          <div className="bd5"><div className="t">대표 사주 <small>代表 四柱</small></div><div className="d">대표님이 어떤 그릇인가 — 성정·승부 기질·재물·사람까지</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link className="li5" href="/reading?cat=sajeong">
          <div className="gz" style={{ color: '#3f8f80' }}>率</div>
          <div className="bd5"><div className="t">사정률 사주 <small>査定率</small></div><div className="d">오늘 넣을까, 미룰까 — 30초면 방향이 나옵니다</div></div>
          <div className="rt"><div className="pz free">무료</div><div className="arw">→</div></div>
        </Link>
        <Link className="li5" href="/reading?cat=balju">
          <div className="gz" style={{ color: '#46a07d' }}>宮</div>
          <div className="bd5"><div className="t">발주처 사주 <small>發注處 宮合</small></div><div className="d">그 발주처, 나와 맞는 판인가 — 손대기 전에</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link className="li5" href="/reading?cat=gunghap">
          <div className="gz" style={{ color: '#d15c4a' }}>合</div>
          <div className="bd5"><div className="t">협정·궁합 사주 <small>同業 · 協定</small></div><div className="d">손잡기 전에, 깨질 궁합인지부터</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link className="li5" href="/reading?cat=daeun">
          <div className="gz" style={{ color: '#cfa64e' }}>運</div>
          <div className="bd5"><div className="t">회사 대운 <small>會社 大運</small></div><div className="d">회사가 대표님을 밀어주는가 — 년도별 큰 흐름</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link className="li5" href="/reading?cat=calendar">
          <div className="gz" style={{ color: '#d15c4a' }}>曆</div>
          <div className="bd5"><div className="t">사업운 캘린더 · 이달 <small>事業運 月曆</small></div><div className="d">오늘부터 한 달 — 계약·채용·발표에 좋은 날, 조심할 날</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
        <Link className="li5" href="/reading?cat=calendar_year">
          <div className="gz" style={{ color: '#c98b4a' }}>曆</div>
          <div className="bd5"><div className="t">사업운 캘린더 · 연간 <small>事業運 年曆</small></div><div className="d">올 한 해 12개월 — 밀어주는 달, 조여지는 달을 한눈에</div></div>
          <div className="rt"><div className="pz free">무료로 시작</div><div className="arw">→</div></div>
        </Link>
      </div>

      {/* 통점 위로 랜딩 */}
      <Link className="ceoband" href="/why" style={{ marginTop: 26 }}>
        <span className="cbseal" style={{ borderColor: '#c98b4a', color: '#e3c27a' }}>運</span>
        <span className="cbtx"><b>하한가·연패·큰 건… 대표님 잘못이 아닙니다</b><em>그 고민, 실력이 아니라 흐름의 문제일 수 있습니다</em></span>
        <span className="cbgo">→</span>
      </Link>

      {/* 동업·협정 궁합 */}
      <Link className="ally" href="/product/dongup" style={{ marginTop: 16 }}>
        <div className="h">同業宮合 · 協定宮合</div>
        <div className="b">
          <div><div className="t">손잡기 전, 궁합부터</div><div className="d">대표×대표 · 회사×회사 진단</div></div>
          <div className="p" style={{ fontSize: 12.5, color: '#8a8270', fontWeight: 700 }}>무료로 시작 →</div>
        </div>
      </Link>

      {/* 콜로폰 */}
      <div className="foot">
        <div className="crule" />
        <div className="colo">士</div>
        명리 기반 참고 정보입니다 · 투찰금액 산정 근거가 아닙니다<br />
        <Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link>
        <Link className="bokquiet" href="/bokchae"><span>福</span>복채 청산</Link>
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

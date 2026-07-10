import Link from 'next/link';
import TodayChip from '@/app/_components/TodayChip';

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

      {/* 히어로 — 먹빛 */}
      <div className="hero5">
        <div className="wm">士</div>
        <div className="kick">運七技三</div>
        <h1>대표와 회사의 사주,<br />그 <b>운칠(運七)</b>을 짚어드립니다</h1>
        <div className="rule" />
        <div className="sub">낙찰 사정률과 이달의 투찰 길일, 법인 운세와 발주처 궁합까지 — 만세력으로 짚어 드립니다.</div>
      </div>

      {/* 닮은 CEO — 바이럴 입구 */}
      <Link className="ceoband" href="/ceo">
        <span className="cbseal">鏡</span>
        <span className="cbtx"><b>나와 닮은 세계적 CEO는?</b><em>잡스·록펠러·샤넬 … 거장 50인 × 내 사주 · 30초</em></span>
        <span className="cbgo">무료 →</span>
      </Link>

      {/* 오늘의 사정률 전망 */}
      <div className="lab"><i /><span>오늘의 사정률 전망</span><TodayChip /></div>
      <div className="today">
        <div className="in">
          <div className="stamp">封</div>
          <div>
            <h3>오늘 이 투찰,<br />나에게 유리한 날인가</h3>
            <p>대표님 생년월일만 넣으면 30초, 무료로 열립니다.</p>
          </div>
        </div>
        <Link className="tcta" href="/reading"><b>오늘의 전망 열기<span className="a">→</span></b><em>무료 · 정밀값은 택일팩(990원)부터</em></Link>
      </div>

      {/* 해설 보기 — 괘선 리스트 */}
      <div className="lab"><i /><span>해설 보기</span></div>
      <div className="list">
        <Link className="li5" href="/reading">
          <div className="gz" style={{ color: '#2f4a7a' }}>率</div>
          <div className="bd5"><div className="t">사정률 뽑기</div><div className="d">내 사주와 오늘 일진으로 방향을 봅니다</div></div>
          <div className="rt"><div className="pz free">무료</div><div className="arw">→</div></div>
        </Link>
        <Link className="li5" href="/balju">
          <div className="gz" style={{ color: '#a5342a' }}>宮</div>
          <div className="bd5"><div className="t">발주처 궁합</div><div className="d">발주처 설립일 사주와 대표님의 상성</div></div>
          <div className="rt"><div className="pz paid">전체 12,900</div><div className="arw">→</div></div>
        </Link>
        <Link className="li5" href="/reading">
          <div className="gz" style={{ color: '#2f6b57' }}>代</div>
          <div className="bd5"><div className="t">대표 사주</div><div className="d">만세력 원국과 오늘의 기운</div></div>
          <div className="rt"><div className="pz free">무료</div><div className="arw">→</div></div>
        </Link>
        <Link className="li5" href="/reading">
          <div className="gz" style={{ color: '#9c7a2a' }}>法</div>
          <div className="bd5"><div className="t">법인 운세 <small>설립일 사주</small></div><div className="d">회사의 그릇과 대운의 흐름</div></div>
          <div className="rt"><div className="pz free">무료</div><div className="arw">→</div></div>
        </Link>
      </div>

      {/* 동업·협정 궁합 */}
      <Link className="ally" href="/reading">
        <div className="h">同業宮合 · 協定宮合</div>
        <div className="b">
          <div><div className="t">손잡기 전, 궁합부터</div><div className="d">대표×대표 · 회사×회사 진단</div></div>
          <div className="p">전체 12,900원</div>
        </div>
      </Link>

      {/* 콜로폰 */}
      <div className="foot">
        <div className="crule" />
        <div className="colo">士</div>
        명리 기반 참고 정보입니다 · 투찰금액 산정 근거가 아닙니다<br />
        <Link href="/terms">이용약관</Link> · <Link href="/privacy">개인정보처리방침</Link>
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

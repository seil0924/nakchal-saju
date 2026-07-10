import Link from 'next/link';

// 첫 메인 (v5 정본 01) — 봉인 + 오늘의 사정률 전망 + 해설 5카드
const Hamburger = () => (<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg>);

export default function Home() {
  const cards = [
    { h: '사정률 뽑기', p: '내 사주+일진 · 방향 무료', bt: '사정률', btc: 'var(--gold2)', bg: 'linear-gradient(135deg,#25406a,#182c49)', price: '무료', cls: 'free', href: '/reading' },
    { h: '발주처 궁합', p: '발주처 고르면 상성', bt: '궁합', btc: '#f6e7d6', bg: 'linear-gradient(135deg,#7f1a17,#a5241f)', price: '첫 990원', cls: 'paid', href: '/balju' },
    { h: '대표 사주', p: '만세력 · 오늘 기운', bt: '대표', btc: 'var(--gold2)', bg: 'linear-gradient(135deg,#2f4d7d,#1a2c46)', price: '무료', cls: 'free', href: '/reading' },
    { h: '법인 운세', p: '설립일 사주 · 흐름', bt: '법인', btc: 'var(--gold2)', bg: 'linear-gradient(135deg,#3a2c19,#232a38)', price: '무료', cls: 'free', href: '/reading' },
  ];

  return (
    <div className="app home">
      <div className="topbar"><div className="logo"><span className="s">士</span>낙찰사주</div><div className="ic"><Hamburger /></div></div>

      <div className="hero"><div className="kick">運 七 技 三 · 회사 사주 전문</div>
        <h2>대표와 회사의 사주,<br />그 <b>운칠(運七)</b>을 짚어드립니다</h2>
        <div style={{ color: '#c3cfe3', fontSize: 12, marginTop: 8, fontWeight: 500 }}>낙찰 사정률 · 법인 운세 · 발주처/동업/협정 궁합</div>
      </div>

      <div className="sechd" style={{ marginTop: 15 }}><span className="t"><span className="b" />오늘의 사정률 전망</span><span className="m">7/9 · 丙午일</span></div>
      <div className="hcard seal-card">
        <div className="seal-stamp">封</div>
        <div className="seal-t">내 사주로 보는 오늘의 전망</div>
        <div className="seal-s">생년월일만 넣으면 바로 열립니다</div>
        <Link className="hcta" href="/reading">오늘의 전망 확인<small>무료 · 로그인/입력은 여기서</small></Link>
      </div>

      <div className="sechd"><span className="t"><span className="b" />해설 보기</span></div>
      <div className="hgrid">
        {cards.map((c, i) => (
          <Link key={i} className="gc" href={c.href}>
            <div className="art" style={{ background: c.bg }}><span className="bt" style={{ color: c.btc }}>{c.bt}</span></div>
            <div className="info"><h3>{c.h}</h3><p>{c.p}</p>
              <div className="row"><span className={'price ' + c.cls}>{c.price}</span><span className="go">›</span></div>
            </div>
          </Link>
        ))}
        <Link className="gc" href="/reading" style={{ gridColumn: '1 / -1' }}>
          <div className="art" style={{ height: 58, background: 'linear-gradient(135deg,#b98f3f,#e3c27a)' }}><span className="bt" style={{ color: '#2a2013' }}>同業宮合 · 協定</span></div>
          <div className="info"><h3>동업 궁합 <span style={{ fontSize: 10.5, color: 'var(--sub)', fontWeight: 600 }}>(협정 궁합)</span></h3>
            <p>대표×대표 · 회사×회사 — 손잡기 전 진단</p>
            <div className="row"><span className="price paid">9,900원 ~</span><span className="go">›</span></div>
          </div>
        </Link>
      </div>

      <div className="hdisc">명리 기반 참고 정보 · 투찰금액 산정 근거 아님<br />
        <a href="/prototype.html" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>전체 화면 세트(19) 미리보기 →</a>
      </div>

      <div className="tab">
        <a className="on"><svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21H3z" /></svg>홈</a>
        <Link href="/balju"><svg viewBox="0 0 24 24"><path d="M3 21V7l9-4 9 4v14M3 21h18M9 21v-5h6v5" /></svg>발주처</Link>
        <Link className="fab" href="/reading"><span className="fi">士</span><span className="fl">오늘 전망</span></Link>
        <Link href="/vault"><svg viewBox="0 0 24 24"><path d="M4 7h16v13H4zM4 7l2-3h12l2 3" /></svg>보관함</Link>
        <a><svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.7" /><circle cx="12" cy="12" r="1.7" /><circle cx="19" cy="12" r="1.7" /></svg>더보기</a>
      </div>
    </div>
  );
}

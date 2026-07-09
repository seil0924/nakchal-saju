import Link from 'next/link';

// 서버 컴포넌트 — 첫 방문 랜딩 (봉인封 + 어제 증명 + 4블록)
export default function Landing() {
  const today = new Date();
  const dt = today.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  const blocks = [
    { mk: '率', h: '사정률 뽑기', p: '오늘 내 사주로 방향·밴드를', hot: true },
    { mk: '處', h: '발주처 궁합', p: '설립일 사주로 상성 보기' },
    { mk: '器', h: '대표 사주', p: '만세력·십성 그릇 풀이' },
    { mk: '法', h: '법인 운세', p: '회사 설립일 사주 진단' },
  ];

  return (
    <div className="app">
      <div className="hero">
        <div className="k">運 七 技 三</div>
        <h1>낙찰사주</h1>
        <p>재주는 갖추셨습니다.<br />그 운칠(運七)을 짚어드립니다</p>
      </div>
      <div className="wrap">
        <div className="card seal">
          <div className="stamp">封</div>
          <div className="dt">{dt}</div>
          <h2>오늘의 사정률은 봉인되어 있습니다</h2>
          <p>대표님 사주를 넣으면, 오늘 일진과 맞물린<br />사정률의 <b>방향과 흐름</b>을 짚어 드립니다.</p>
          <Link className="landing-cta" href="/reading">내 사주로 오늘 짚기 →<small>생년월일만 넣으면 무료로 방향을 봅니다</small></Link>
        </div>

        <div className="card">
          <div className="st"><span className="b" />어제, 짚은 대로였는지</div>
          <div className="proof">
            <div className="col"><div className="l">어제 짚은 흐름</div><div className="v" style={{ color: 'var(--navy)' }}>하단 ▼</div></div>
            <div className="arw">→</div>
            <div className="col"><div className="l">실제 개찰 사정률</div><div className="v" style={{ color: 'var(--red)' }}>99.12%</div></div>
          </div>
          <div className="hit">✓ 방향 적중 — 하단 밴드로 짚었고, 실제도 100% 아래</div>
          <div className="mini">매일 개찰 결과를 조달청 OpenAPI로 자동 대조합니다 · 빗나간 날도 그대로 공개</div>
        </div>

        <div className="grid">
          {blocks.map((b, i) => (
            <Link key={i} className={'blk' + (b.hot ? ' hot' : '')} href="/reading">
              {b.hot && <span className="tag">오늘</span>}
              <div className="mk">{b.mk}</div>
              <h3>{b.h}</h3>
              <p>{b.p}</p>
            </Link>
          ))}
        </div>

        <div className="card" style={{ marginTop: 13 }}>
          <div className="rec">
            <div><div className="big">7 / 10</div><div className="lab">최근 10건 방향 적중 · 공개 기록</div></div>
            <span className="go2">전체 보기 →</span>
          </div>
        </div>

        <div className="disc">
          재미로 보는 명리 기반 참고 정보입니다.<br />실제 투찰금액 산정의 근거로 사용할 수 없습니다.<br />
          <Link className="legal-link" href="/terms">이용약관</Link> · <Link className="legal-link" href="/privacy">개인정보처리방침</Link>
        </div>
      </div>

      <div className="tab">
        <div className="t on"><span className="i">🏠</span>홈</div>
        <div className="t"><span className="i">📋</span>내 공고</div>
        <Link className="fab" href="/reading">오늘<br />전망</Link>
        <div className="t"><span className="i">🗂</span>기록</div>
        <div className="t"><span className="i">⋯</span>더보기</div>
      </div>
    </div>
  );
}

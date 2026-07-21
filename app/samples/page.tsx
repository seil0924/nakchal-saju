import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '샘플 리포트 — 이런 결과가 나옵니다 | 낙찰사주',
  description: '낙찰사주 결과가 실제로 어떻게 나오는지 가상 대표 3인의 예시로 미리 보세요. 오늘의 사정률·대표 유형·실전 수칙까지.',
  alternates: { canonical: '/samples' },
  openGraph: { title: '샘플 리포트 | 낙찰사주', description: '가상 대표 3인 예시로 미리 보는 결과', type: 'article', siteName: '낙찰사주' },
};

const SAMPLES = [
  { seal: '甲', name: 'A 대표 · 전기공사', type: '공격형', score: '28점', up: false,
    line: '오늘은 火가 대표님 木을 태우는 날 — 서두르기보다 관망이 유리합니다.',
    points: ['가장 강한 무기: 곧게 밀어붙이는 추진력(일간 甲木)', '주의: 조급한 저가 투찰 — 큰 건은 마감 직전 재점검', '유리한 방위: 부족한 金을 채우는 西쪽 현장'] },
  { seal: '庚', name: 'B 대표 · 시설관리 용역', type: '안정형', score: '71점', up: true,
    line: '오늘은 대표님 金을 土가 받쳐주는 날 — 밀어붙여도 좋은 흐름입니다.',
    points: ['가장 강한 무기: 오래 버티는 뚝심(일간 庚金)', '재계약·다년 용역에 강한 구조 — 신뢰가 자산', '이달 유리한 날 9일 · 조심할 날 3일'] },
  { seal: '癸', name: 'C 대표 · 건설·토목', type: '분석형', score: '54점', up: true,
    line: '오늘은 평이한 흐름 — 판을 읽고 다음 큰 건을 준비할 때입니다.',
    points: ['가장 강한 무기: 판을 읽고 돌아갈 길을 찾는 지략(일간 癸水)', '약한 축: 자금·조달 — 큰 건 앞에서 조건을 조심', '발주처 궁합: 水와 결이 맞는 수자원·환경 발주처 유리'] },
];

export default function SamplesPage() {
  return (
    <div className="app home">
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/reading" aria-label="오늘의 전망"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link>
      </div>
      <div style={{ padding: '18px 18px 4px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.28em', color: '#a99f88', fontWeight: 700, marginBottom: 6 }}>SAMPLE 四柱</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 23, lineHeight: 1.4, color: 'var(--ink)', margin: '2px 0 8px' }}>이런 결과가 나옵니다</h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 18px' }}>가상 대표 3인의 예시입니다. 실제로는 대표님 생년월일로 오늘의 사정률·유형·실전 수칙이 산출됩니다.</p>

        {SAMPLES.map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 16, padding: '16px 17px', marginBottom: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#a5241f,#7d1d12)', color: '#f6e7c8', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 20 }}>{s.seal}</span>
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>{s.name}</div>
                <div style={{ fontSize: 12.5, color: '#8a806a', fontWeight: 600 }}>대표 유형 · {s.type}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 26, color: s.up ? '#b58a2f' : '#c0574a', lineHeight: 1 }}>{s.score}</div>
                <div style={{ fontSize: 11, color: '#a99f88' }}>오늘의 신호</div>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#33383f', margin: '0 0 10px', fontWeight: 500 }}>{s.line}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {s.points.map((pt, j) => (
                <div key={j} style={{ display: 'flex', gap: 7, fontSize: 13, color: '#4a4438', lineHeight: 1.55 }}><span style={{ color: 'var(--gold2)', fontWeight: 900 }}>·</span><span>{pt}</span></div>
              ))}
            </div>
          </div>
        ))}

        <Link href="/reading" style={{ display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none', marginTop: 4 }}>내 결과 무료로 보기 →<span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>생년월일만 · 30초 무료로 시작</span></Link>
        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, margin: '14px 0 22px' }}>※ 위 사례는 이해를 돕기 위한 가상 예시입니다. 실제 인물과 무관하며, 명리 기반 참고·오락용 정보입니다.</p>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';

const BASE = 'https://nakchalsaju.com';

export const metadata: Metadata = {
  title: '계산 방법론 — 절기 천문계산·진태양시·야자시 보정 | 낙찰사주',
  description: '낙찰사주가 사주 명식을 세우는 방법: 절기를 태양황경으로 판정하고, 진태양시(경도 -30분)·서머타임·야자시를 보정하며 음·양력을 자동 변환합니다. 해석은 명리 기반 참고용입니다.',
  alternates: { canonical: '/method' },
  keywords: ['사주 계산 방법', '절기 천문계산', '진태양시 보정', '야자시', '만세력 정확도', '낙찰사주 방법론'],
  openGraph: { title: '계산 방법론 | 낙찰사주', description: '절기 천문계산·진태양시·야자시 보정으로 명식을 세우는 방법', url: `${BASE}/method`, type: 'article', siteName: '낙찰사주' },
};

const SEC = [
  { h: '절기(節氣)를 천문으로 판정', p: '명리에서 월(月)의 경계는 달력이 아니라 절기로 정합니다. 낙찰사주는 절기를 태양의 위치(황경)로 계산해 판정하므로, 입춘·경칩 같은 절입 시각 부근에 태어난 경우에도 월주(月柱)를 정확히 세웁니다.' },
  { h: '진태양시(眞太陽時) 보정 — 경도 약 −30분', p: '한국 표준시(동경 135도 기준)와 실제 국토의 경도 차이로 인해, 시(時)를 정확히 정하려면 약 30분의 보정이 필요합니다. 태어난 시각을 진태양시로 환산해 시주(時柱)의 지지를 바로잡습니다.' },
  { h: '서머타임·야자시 보정', p: '과거 서머타임 시행 기간에 태어난 경우 그 시차를 되돌리고, 밤 11시~자정의 야자시(夜子時) 구간은 날짜 경계 규칙에 따라 일주(日柱)를 정확히 정합니다.' },
  { h: '음·양력 자동 변환', p: '음력·양력, 윤달까지 자동으로 변환해 간지를 찾습니다. 사용자는 알고 있는 달력으로 입력하면 되고, 내부에서 만세력 기준으로 명식을 완성합니다.' },
];

export default function MethodPage() {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: '낙찰사주 계산 방법론 — 절기 천문계산·진태양시·야자시 보정',
      description: '사주 명식을 세우는 계산 방법과 보정 원리', mainEntityOfPage: `${BASE}/method`,
      publisher: { '@type': 'Organization', name: '낙찰사주', url: BASE } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '홈', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: '계산 방법론', item: `${BASE}/method` },
    ] },
  ];
  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/glossary" aria-label="용어사전" style={{ fontSize: 12, fontWeight: 700, color: '#7f786c', textDecoration: 'none' }}>용어사전 ›</Link>
      </div>
      <div style={{ padding: '18px 18px 4px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.28em', color: '#a99f88', fontWeight: 700, marginBottom: 6 }}>計算 方法論</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 23, lineHeight: 1.4, color: 'var(--ink)', margin: '2px 0 8px' }}>어떻게 계산하나 — 명식을 세우는 방법</h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 16px' }}>사주 해석의 정확도는 명식을 얼마나 정확히 세우는가에서 갈립니다. 낙찰사주는 아래 원리로 여덟 글자를 계산합니다. 해석 자체는 명리 이론에 기반한 참고·오락용입니다.</p>
        {SEC.map((s, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '15px 16px', marginBottom: 11 }}>
            <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15.5, color: 'var(--navy)', marginBottom: 6 }}>{s.h}</div>
            <p style={{ fontSize: 15, lineHeight: 1.78, color: '#33383f', margin: 0, fontWeight: 500 }}>{s.p}</p>
          </div>
        ))}
        <Link href="/reading" style={cta}>내 명식으로 오늘 흐름 보기 →<span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>생년월일만 · 30초 무료로 시작</span></Link>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '18px 0 22px' }}>
          <Link href="/glossary/절기" style={chip}>절기</Link><Link href="/glossary/진태양시" style={chip}>진태양시</Link><Link href="/glossary/야자시" style={chip}>야자시</Link><Link href="/glossary/만세력" style={chip}>만세력</Link><Link href="/faq" style={chip}>자주 묻는 질문</Link>
        </div>
        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, marginBottom: 20 }}>※ 만세력 계산의 정확도를 높인 것이며, 해석과 예측은 명리 이론에 기반한 참고·오락용 정보입니다.</p>
      </div>
    </div>
  );
}
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none', marginTop: 6 };
const chip: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', background: '#faf6ec', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };

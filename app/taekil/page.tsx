import '@/app/en/date-picker/date-picker.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { TAEKIL, OFFICER_KO } from '@/lib/taekil';
import TaekilPick from '@/app/_components/TaekilPick';

const BASE = 'https://nakchalsaju.com';

export const metadata: Metadata = {
  title: { absolute: '택일 — 개업일·법인 설립일·계약일·이사날 좋은 날 | 낙찰사주' },
  description: '개업일, 법인 설립일, 계약일, 사무실 이전, 입찰일. 건제십이신으로 앞으로 90일 중 결이 맞는 날을 가려 놓았습니다. 절기는 표가 아니라 태양 황경으로 직접 계산합니다.',
  keywords: ['택일', '개업일 택일', '법인 설립일', '계약일 택일', '이사 좋은 날', '사무실 이전 택일', '건제십이신', '좋은 날'],
  alternates: { canonical: '/taekil', languages: { 'ko-KR': '/taekil', 'en': '/en/date-picker' } },
  openGraph: {
    title: '택일 — 언제 시작할 것인가',
    description: '개업·설립·계약·이전·입찰. 앞으로 90일 중 결이 맞는 날.',
    url: BASE + '/taekil', type: 'website', locale: 'ko_KR', siteName: '낙찰사주',
  },
};

export default function TaekilHub() {
  const ld = {
    '@context': 'https://schema.org', '@type': 'CollectionPage',
    name: '택일 — 개업일·법인 설립일·계약일·이사날', url: BASE + '/taekil', inLanguage: 'ko',
    description: '건제십이신으로 앞으로 90일 중 그 일에 맞는 날을 가립니다.',
    hasPart: TAEKIL.map(t => ({ '@type': 'WebPage', name: t.kw, url: `${BASE}/taekil/${encodeURIComponent(t.slug)}` })),
  };
  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/reading" aria-label="오늘의 전망"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10" /></svg></Link>
      </div>

      <div style={{ padding: '18px 18px 4px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.28em', color: '#6f6a58', fontWeight: 700, marginBottom: 6 }}>擇 日</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 23, lineHeight: 1.4, color: 'var(--ink)', margin: '2px 0 8px' }}>언제 시작할 것인가</h1>
        <p style={{ fontSize: 14.5, lineHeight: 1.8, color: '#3a3630', fontWeight: 500, margin: '0 0 16px' }}>
          개업·법인 설립·계약·사무실 이전·입찰. 하는 일에 따라 좋은 날이 다릅니다. 건제십이신(建除十二神)으로
          앞으로 90일 중 결이 맞는 날을 가려 놓았습니다. 회원가입도 결제도 없습니다.
        </p>
      </div>

      <section style={{ padding: '0 18px' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          {TAEKIL.map(t => (
            <Link key={t.slug} href={`/taekil/${encodeURIComponent(t.slug)}`} style={card}>
              <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15.5, color: 'var(--navy)', marginBottom: 4 }}>{t.kw}</div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: '#3a3630' }}>{t.lead}</div>
              <div style={{ marginTop: 7, display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {t.good.map(o => (
                  <span key={o} style={pill}>{OFFICER_KO[o].hanja} {OFFICER_KO[o].name}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div style={{ padding: '18px 18px 0' }}>
        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 8 }}>바로 골라 보기</div>
      </div>
      <TaekilPick slug="개업일" showTabs />

      <section className="bz-read" style={{ padding: '0 18px 24px' }}>
        <h3>건제십이신이 무엇인가</h3>
        <p>하루에 한 칸씩 도는 열두 개의 이름표입니다 — 건·제·만·평·정·집·파·위·성·수·개·폐. 그날의 일지(日支)를
          그달의 월지(月支)에 견주어 어느 이름이 붙는지가 정해집니다. 동아시아 책력이 몇백 년째 날을 고를 때
          써 온 방식이고, 셈 자체는 단순합니다.</p>

        <h3>왜 절기를 직접 계산하는가</h3>
        <p>이름이 정해지려면 그 날이 어느 절기 구간에 들어 있는지를 알아야 합니다. 절기는 매년 같은 날짜에 들지
          않습니다 — 태양이 특정 황경에 닿는 순간이라 해마다 몇 시간씩 밀립니다. 표에서 읽어 오면 경계에 걸린
          날이 한 달 통째로 밀립니다. 그래서 직접 계산합니다.</p>

        <h3>손 없는 날과는 다릅니다</h3>
        <p>손 없는 날은 음력 끝자리가 아홉과 영인 날을 말하는 <b>별개의 계산</b>입니다. 여기 나오는 날은 절기로 나눈
          달과 그날의 일지로 정합니다. 두 결과는 겹칠 수도 갈릴 수도 있습니다. 어느 쪽이 옳다고 다투는 대신,
          무엇을 근거로 골랐는지 밝혀 두는 편이 낫다고 봅니다.</p>

        <h3>더 볼 것</h3>
        <p>사무실을 옮기실 것이라면 날짜와 함께 <Link href="/jari">방위와 거리</Link>를 같이 보십시오.
          용어가 낯설면 <Link href="/glossary">용어사전</Link>에 정리해 두었습니다.
          영어로 필요하시면 <Link href="/en/date-picker" hrefLang="en">Auspicious Date Picker</Link>가 같은 엔진으로 돕니다.</p>
      </section>
    </div>
  );
}

const card: React.CSSProperties = {
  display: 'block', background: '#fff', border: '1px solid var(--line)',
  borderRadius: 13, padding: '13px 15px', textDecoration: 'none',
};
const pill: React.CSSProperties = {
  fontSize: 11.5, fontWeight: 700, color: '#6f6a58',
  background: '#faf6ec', border: '1px solid #e2cd97', borderRadius: 999, padding: '3px 8px',
};


import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TYCOONS, tycoonSlug, tycoonBySlug } from '@/lib/tycoon';

const BASE = 'https://nakchal-saju.vercel.app';

export function generateStaticParams() {
  return TYCOONS.map((t) => ({ slug: tycoonSlug(t.name) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = tycoonBySlug(params.slug);
  if (!t) return { title: '나와 닮은 CEO · 낙찰사주' };
  const title = `${t.name} 사주 — 대표님과 닮은 세계적 CEO일까 | 낙찰사주`;
  const description = `${t.name}(${t.en}, ${t.co}, ${t.born.slice(0, 4)}년생) 사주 명식과 대표님 사주의 닮은 정도를 30초 무료로 확인. ${t.story}`;
  return {
    title, description,
    alternates: { canonical: `/ceo/${tycoonSlug(t.name)}` },
    openGraph: { title, description, url: `${BASE}/ceo/${tycoonSlug(t.name)}`, type: 'article', siteName: '낙찰사주' },
    keywords: [t.name, `${t.name} 사주`, `${t.name} 명식`, t.en, `나와 닮은 CEO`, '거장 사주', '사주 궁합', '낙찰사주'],
  };
}

export default function TycoonLanding({ params }: { params: { slug: string } }) {
  const t = tycoonBySlug(params.slug);
  if (!t) return notFound();
  const others = TYCOONS.filter((x) => x.name !== t.name).slice(0, 14);

  const ld = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: `${t.name} 사주 — 대표님과 닮은 CEO일까`, about: t.name, description: t.story, publisher: { '@type': 'Organization', name: '낙찰사주', url: BASE }, mainEntityOfPage: `${BASE}/ceo/${tycoonSlug(t.name)}` },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '나와 닮은 CEO', item: `${BASE}/ceo` },
      { '@type': 'ListItem', position: 2, name: t.name, item: `${BASE}/ceo/${tycoonSlug(t.name)}` },
    ] },
  ];

  return (
    <div className="app home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="topbar">
        <Link className="logo" href="/" style={{ textDecoration: 'none', color: 'inherit' }}><span className="s">士</span>낙찰사주</Link>
        <Link className="ic" href="/ceo" aria-label="나와 닮은 CEO"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /></svg></Link>
      </div>

      <div style={{ padding: '18px 18px 4px' }}>
        <nav aria-label="위치" style={{ fontSize: 12, color: '#8a806a', marginBottom: 10 }}>
          <Link href="/ceo" style={{ color: '#8a806a' }}>나와 닮은 CEO</Link> › {t.name}
        </nav>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 22, lineHeight: 1.35, color: 'var(--ink)', margin: '0 0 8px' }}>
          {t.name} 사주,<br />대표님과 닮았을까
        </h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0 16px' }}>
          <span style={tag}>{t.en}</span>
          <span style={tag}>{t.co}</span>
          <span style={tag}>{t.born.slice(0, 4)}년생</span>
        </div>

        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>어떤 그릇의 사람인가</div>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: '#33383f', margin: 0, fontWeight: 500 }}>{t.story}</p>
        </div>

        <div style={card}>
          <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 15, color: 'var(--navy)', marginBottom: 6 }}>나와 닮은 정도는?</div>
          <p style={{ fontSize: 14.5, lineHeight: 1.75, color: '#4a4636', margin: 0, fontWeight: 500 }}>
            낙찰사주는 대표님의 사주 명식을 <b>{t.name}</b>({t.born} 출생)의 명식과 구조적으로 비교해,
            거장 100인 중 대표님과 <b>가장 닮은 그릇</b>이 누구인지 짚어드립니다. {t.name}과(와) 얼마나 겹치는지도 함께요.
          </p>
        </div>

        <Link href="/ceo" style={cta}>
          나와 닮은 CEO 찾기 →
          <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.9 }}>생년월일만 · 30초 무료 · 거장 100인과 대조</span>
        </Link>

        <div style={{ fontFamily: 'var(--serif)', fontWeight: 800, fontSize: 14, color: 'var(--navy)', margin: '20px 0 10px' }}>다른 거장과도 비교해 보기</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {others.map((o) => (
            <Link key={o.name} href={`/ceo/${tycoonSlug(o.name)}`} style={chip}>{o.name}</Link>
          ))}
        </div>

        <p style={{ fontSize: 11.5, color: '#a99f88', lineHeight: 1.65, marginBottom: 20 }}>
          ※ 출생일은 공개 기록 기준, 생시 미상은 삼주(三柱)로 계산합니다. 유사도는 명식의 구조적 비교이며 해당 인물의 실제 운세 단정이 아닙니다. 명리 기반 참고·오락용 정보입니다.
        </p>
      </div>
    </div>
  );
}

const tag: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#6b6249', background: '#f3ead6', padding: '5px 11px', borderRadius: 999 };
const card: React.CSSProperties = { background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '15px 16px', marginBottom: 11 };
const cta: React.CSSProperties = { display: 'block', textAlign: 'center', background: 'linear-gradient(135deg,var(--red),#7f1a17)', color: '#fff', border: '1px solid var(--gold2)', borderRadius: 14, padding: '15px', fontFamily: 'var(--serif)', fontWeight: 900, fontSize: 16, textDecoration: 'none', marginTop: 6 };
const chip: React.CSSProperties = { fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', background: '#faf6ec', border: '1px solid #e2cd97', borderRadius: 999, padding: '7px 12px', textDecoration: 'none' };
